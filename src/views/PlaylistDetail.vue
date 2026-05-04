<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { getImageUrl } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const playlistId = Number(route.params.id)

const playlist = ref<any>(null)
const songs = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const collecting = ref(false)

const editing = ref(false)
const editName = ref('')
const editIntro = ref('')

const showAddPanel = ref(false)
const allSongs = ref<any[]>([])
const addSearch = ref('')

const isOwnerOrAdmin = computed(() => {
  if (!userStore.isLoggedIn || !playlist.value) return false
  const isOwner = String(playlist.value.creater_id) === String(userStore.userId)
  return isOwner || userStore.isAdmin
})

onMounted(() => loadPlaylist())

async function loadPlaylist() {
  loading.value = true
  try {
    const { data } = await request.post(`/playlists/view_single/${playlistId}`)
    playlist.value = data.playlist
    songs.value = data.playlist.songs || []
    editName.value = data.playlist.name
    editIntro.value = data.playlist.introduction || ''
  } catch (err: any) {
    error.value = err.response?.data?.detail || '获取失败'
  } finally {
    loading.value = false
  }
}

async function handleCollect() {
  if (!userStore.isLoggedIn) { alert('请先登录！'); router.push('/login'); return }
  collecting.value = true
  try {
    const { data } = await request.post(`/playlists/collect/${playlistId}`)
    alert(data.message)
    if (playlist.value) playlist.value.collect_num += 1
  } catch (err: any) {
    alert(err.response?.data?.detail || '收藏失败')
  } finally {
    collecting.value = false
  }
}

async function updatePlaylist() {
  try {
    await request.post(`/playlists/update/${playlistId}`, {
      playlist_name: editName.value,
      playlist_introduction: editIntro.value,
      playlist_cover_url: playlist.value.cover_url || ''
    })
    alert('更新成功')
    editing.value = false
    await loadPlaylist()
  } catch (err: any) {
    alert(err.response?.data?.detail || '更新失败')
  }
}

async function deletePlaylist() {
  if (!confirm('确定删除这个歌单吗？不可恢复！')) return
  try {
    await request.post(`/playlists/delete/${playlistId}`)
    alert('删除成功')
    router.push('/')
  } catch (err: any) {
    alert(err.response?.data?.detail || '删除失败')
  }
}

async function removeSong(songId: number) {
  if (!confirm('确定从歌单中移除这首歌曲吗？')) return
  try {
    await request.post(`/songs/delete_from_playlist/${songId}/${playlistId}`)
    alert('移除成功')
    await loadPlaylist()
  } catch (err: any) {
    alert(err.response?.data?.detail || '移除失败')
  }
}

async function loadAllSongs() {
  showAddPanel.value = !showAddPanel.value
  if (!showAddPanel.value) return
  
  try {
    const { data } = await request.post('/songs/view_all', {}, { 
      params: { page: 1, page_size: 100 }
    })
    
    const existingIds = new Set(songs.value.map((s: any) => s.id))
    allSongs.value = (data.songs || []).filter((s: any) => !existingIds.has(s.id))
  } catch (err: any) {
    console.error('加载歌曲失败:', err)
  }
}

async function addSongToPlaylist(songId: number) {
  try {
    await request.post(`/songs/add_to_playlist/${songId}/${playlistId}`)
    alert('添加成功')
    await loadPlaylist()
    showAddPanel.value = false
  } catch (err: any) {
    alert(err.response?.data?.detail || '添加失败')
  }
}
</script>

<template>
  <div class="detail-container">
    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>

    <div v-else-if="playlist" class="playlist-detail">
      <div class="detail-header">
        <div class="cover-box">
          <img v-if="playlist.cover_url" :src="getImageUrl(playlist.cover_url)" class="cover-img" />
          <div v-else class="cover-large">🎵</div>
        </div>

        <div class="info-box">
          <template v-if="editing">
            <input v-model="editName" class="edit-input" placeholder="歌单名称" />
            <textarea v-model="editIntro" class="edit-textarea" placeholder="简介" rows="3"></textarea>
            <div class="edit-actions">
              <button @click="updatePlaylist">保存</button>
              <button class="cancel" @click="editing = false">取消</button>
            </div>
          </template>

          <template v-else>
            <h1>{{ playlist.name }}</h1>
            <p class="intro">{{ playlist.introduction || '暂无简介' }}</p>
            <div class="stats">
              <span>👤 {{ playlist.creater_id }}</span>
              <span>❤️ {{ playlist.collect_num }}</span>
              <span>🎶 {{ playlist.songs_count }}首</span>
            </div>
            <div class="actions">
              <button class="collect-btn" @click="handleCollect" :disabled="collecting">{{ collecting ? '...' : '❤️ 收藏' }}</button>
              <template v-if="isOwnerOrAdmin">
                <button class="edit-btn" @click="editing = true">✏️ 编辑</button>
                <button class="delete-btn" @click="deletePlaylist">🗑️ 删除</button>
                <button class="add-btn" @click="loadAllSongs">➕ 添加歌曲</button>
              </template>
            </div>
          </template>
        </div>
      </div>

      <div v-if="showAddPanel" class="add-panel">
        <h4>选择要添加的歌曲</h4>
        <input v-model="addSearch" placeholder="筛选..." class="filter-input" />
        <div class="add-list">
          <div v-for="song in allSongs.filter(s => s.name.includes(addSearch))" :key="song.id" class="add-item">
            <span>{{ song.name }} - {{ song.singer }}</span>
            <button @click="addSongToPlaylist(song.id)">添加</button>
          </div>
          <div v-if="allSongs.length === 0" class="empty">没有可添加的歌曲</div>
        </div>
      </div>

      <div class="songs-section">
        <h3>🎼 歌曲列表</h3>
        <div v-if="songs.length === 0" class="empty">暂无歌曲</div>
        <div v-else class="song-list">
          <div v-for="(song, index) in songs" :key="song.id" class="song-item">
            <span class="song-index">{{ index + 1 }}</span>
            <div class="song-info">
              <router-link :to="`/song/${song.id}`" class="song-name">{{ song.name }}</router-link>
              <p class="song-singer">{{ song.singer }}</p>
            </div>
            <button v-if="isOwnerOrAdmin" class="remove-btn" @click="removeSong(song.id)">移除</button>
            <router-link :to="`/song/${song.id}`" class="play-btn">▶</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-container { max-width: 900px; margin: 0 auto; padding: 20px; }
.status { text-align: center; padding: 60px; color: #666; }
.error { color: #ff4757; }
.detail-header { display: flex; gap: 30px; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 24px; }
.cover-box { flex-shrink: 0; width: 200px; height: 200px; border-radius: 12px; overflow: hidden; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.cover-large { width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 80px; }
.info-box { flex: 1; }
.info-box h1 { margin: 0 0 12px; font-size: 28px; }
.intro { color: #666; margin: 0 0 16px; line-height: 1.6; }
.stats { display: flex; gap: 20px; color: #888; font-size: 14px; margin-bottom: 20px; }
.actions { display: flex; gap: 10px; flex-wrap: wrap; }
.collect-btn, .edit-btn, .delete-btn, .add-btn { padding: 8px 18px; border: none; border-radius: 20px; cursor: pointer; font-size: 14px; }
.collect-btn { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; }
.edit-btn { background: #667eea; color: white; }
.delete-btn { background: #ff4757; color: white; }
.add-btn { background: #2ed573; color: white; }
.edit-input, .edit-textarea { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
.edit-actions { display: flex; gap: 10px; }
.edit-actions button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; background: #667eea; color: white; }
.edit-actions .cancel { background: #999; }
.add-panel { background: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.add-panel h4 { margin: 0 0 12px; }
.filter-input { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 12px; box-sizing: border-box; }
.add-list { max-height: 240px; overflow-y: auto; }
.add-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.add-item button { padding: 4px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
.songs-section { background: white; padding: 24px 30px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.songs-section h3 { margin: 0 0 16px; }
.empty { text-align: center; color: #999; padding: 30px; }
.song-list { display: flex; flex-direction: column; gap: 8px; }
.song-item { display: flex; align-items: center; padding: 12px 16px; border-radius: 10px; transition: background 0.2s; }
.song-item:hover { background: #f5f5f5; }
.song-index { width: 32px; color: #999; }
.song-info { flex: 1; }
.song-name { text-decoration: none; color: #333; font-weight: 500; }
.song-name:hover { color: #667eea; }
.song-singer { margin: 4px 0 0; font-size: 13px; color: #888; }
.remove-btn { padding: 4px 10px; background: #ff4757; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 8px; }
.play-btn { width: 32px; height: 32px; border-radius: 50%; background: #667eea; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; font-size: 12px; }
</style>