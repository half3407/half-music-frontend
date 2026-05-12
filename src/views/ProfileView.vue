<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { getImageUrl } from '@/utils/image'

const router = useRouter()
const userStore = useUserStore()

const userInfo = ref<any>(null)
const collectedPlaylists = ref<any[]>([])
const loading = ref(false)

// 修改信息
const newUsername = ref('')
const newPassword = ref('')
const updating = ref(false)

// 头像上传
const avatarFile = ref<File | null>(null)

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  await loadUserData()
})

async function loadUserData() {
  loading.value = true
  try {
    const { data } = await request.post(`/users/view_single_user/${userStore.userId}`)
    userInfo.value = data.user
    newUsername.value = data.user.username

    // 解析收藏的歌单ID（逗号分隔）
    const ids = data.user.collected_playlists
      ? data.user.collected_playlists.split(',').filter((id: string) => id)
      : []

    if (ids.length > 0) {
      // 并行获取每个歌单详情
      const promises = ids.map((id: string) =>
        request.post(`/playlists/view_single/${id}`).catch(() => null)
      )
      const results = await Promise.all(promises)
      collectedPlaylists.value = results
        .filter(r => r && r.data)
        .map(r => r.data.playlist)
    }
  } catch (err) {
    console.error('加载失败', err)
  } finally {
    loading.value = false
  }
}

// 修改用户信息
async function updateProfile() {
  if (!newPassword.value) {
    alert('请输入新密码')
    return
  }
  updating.value = true
  try {
    await request.post(`/users/update_user/${userStore.userId}`, {
      username: newUsername.value,
      password: newPassword.value,
      role: userStore.role
    })
    alert('信息更新成功，请重新登录')
    userStore.logout()
    router.push('/login')
  } catch (err: any) {
    alert(err.response?.data?.detail || '更新失败')
  } finally {
    updating.value = false
  }
}

// 选择头像文件
function onAvatarChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    avatarFile.value = target.files[0]
  }
}

// 上传头像
async function uploadAvatar() {
  if (!avatarFile.value) {
    alert('请选择图片')
    return
  }
  const formData = new FormData()
  formData.append('file', avatarFile.value)

  try {
    const { data } = await request.post('/files/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    userStore.setAvatar(data.data.avatar_url)
    alert('头像更新成功！')
    avatarFile.value = null
  } catch (err: any) {
    alert(err.response?.data?.detail || '上传失败')
  }
}
// 注销账号
async function deleteAccount() {
  if (!confirm('确定注销账号吗？此操作不可恢复，你的歌单也会被删除！')) return
  try {
    await request.post(`/users/delete_user/${userStore.userId}`)
    alert('账号已注销')
    userStore.logout()
    router.push('/')
  } catch (err: any) {
    alert(err.response?.data?.detail || '注销失败')
  }
}

</script>

<template>
  <div class="profile-container">
    <div v-if="loading" class="status">加载中...</div>

    <div v-else-if="userInfo" class="profile-content">
      <!-- 左侧：用户信息 -->
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar">
            <!-- 关键：src 必须用 getImageUrl 包裹 -->
            <img 
              v-if="userStore.avatarUrl" 
              :src="getImageUrl(userStore.avatarUrl)" 
              alt="avatar"
              @error="userStore.avatarUrl = ''"
            />
            <span v-else>👤</span>
          </div>
          <div class="avatar-upload">
            <input type="file" accept="image/*" @change="onAvatarChange" />
            <button @click="uploadAvatar">更新头像</button>
          </div>
        </div>
        <div class="danger-section">
          <h3>⚠️ 危险操作</h3>
          <button class="delete-account" @click="deleteAccount">注销账号</button>
        </div>
        <div class="info-section">
          <h2>基本信息</h2>
          <p>ID: {{ userInfo.id }}</p>
          <p>角色: {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
          <p>注册时间: {{ userInfo.created_at }}</p>
        </div>

        <div class="edit-section">
          <h3>修改信息</h3>
          <input v-model="newUsername" placeholder="用户名" />
          <input v-model="newPassword" type="password" placeholder="新密码" />
          <button @click="updateProfile" :disabled="updating">
            {{ updating ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </div>

      <!-- 右侧：收藏的歌单 -->
      <div class="collections-card">
        <h2>❤️ 我的收藏</h2>
        <div v-if="collectedPlaylists.length === 0" class="empty">还没有收藏任何歌单</div>
        <div v-else class="playlist-list">
          <router-link
            v-for="pl in collectedPlaylists"
            :key="pl.id"
            :to="`/playlist/${pl.id}`"
            class="mini-playlist"
          >
            <div class="mini-cover">🎵</div>
            <div class="mini-info">
              <p class="name">{{ pl.name }}</p>
              <p class="count">{{ pl.songs_count }}首</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.status {
  text-align: center;
  padding: 60px;
}

.profile-content {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
}

.profile-card, .collections-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.avatar-section {
  text-align: center;
  margin-bottom: 24px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f0f0f0;
  margin: 0 auto 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.avatar-upload button {
  padding: 6px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.info-section h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.info-section p {
  margin: 6px 0;
  color: #666;
  font-size: 14px;
}

.edit-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.edit-section h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.edit-section input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
}

.edit-section button {
  width: 100%;
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.collections-card h2 {
  margin: 0 0 16px;
  font-size: 18px;
}

.empty {
  color: #999;
  text-align: center;
  padding: 20px;
}

.mini-playlist {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;
}

.mini-playlist:hover {
  background: #f5f5f5;
}

.mini-cover {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.danger-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #ff4757;
}

.danger-section h3 {
  color: #ff4757;
  margin: 0 0 12px;
}

.delete-account {
  width: 100%;
  padding: 10px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.mini-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name {
  margin: 0;
  font-weight: 500;
}

.count {
  margin: 4px 0 0;
  font-size: 13px;
  color: #888;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}
</style>