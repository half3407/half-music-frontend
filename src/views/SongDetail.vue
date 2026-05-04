<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { getImageUrl } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const songId = Number(route.params.id)

const song = ref<any>(null)
const comments = ref<any[]>([])
const loading = ref(false)
const newComment = ref('')
const editing = ref(false)
const editForm = ref<any>({})

const isAdmin = computed(() => userStore.isAdmin)

onMounted(() => loadSong())

async function loadSong() {
  loading.value = true
  try {
    const { data: songData } = await request.post(`/songs/view_single/${songId}`)
    song.value = songData.song
    editForm.value = { ...songData.song }
    await loadComments()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function loadComments() {
  try {
    const { data: list } = await request.post(`/comments/view_all/${songId}`)
    if (list.length === 0) { comments.value = []; return }
    const promises = list.map((item: any) => request.post(`/comments/view/${item.comment_id}`).catch(() => null))
    const responses = await Promise.all(promises)
    comments.value = responses.filter(r => r && r.data).map(r => r.data)
  } catch (err) { console.error(err) }
}

async function submitComment() {
  if (!newComment.value.trim()) { alert('评论内容不能为空'); return }
  if (!userStore.isLoggedIn) { alert('请先登录！'); router.push('/login'); return }
  try {
    await request.post('/comments/create', { content: newComment.value, song_id: songId })
    newComment.value = ''
    await loadComments()
  } catch (err: any) { alert(err.response?.data?.detail || '评论失败') }
}

async function deleteComment(commentId: number) {
  if (!confirm('确定删除这条评论吗？')) return
  try {
    await request.post(`/comments/delete/${commentId}`)
    await loadComments()
  } catch (err: any) { alert(err.response?.data?.detail || '删除失败') }
}

function canDeleteComment(comment: any) {
  if (!userStore.isLoggedIn) return false
  if (userStore.isAdmin) return true
  return String(comment.creater_id) === String(userStore.userId)
}

async function updateSong() {
  try {
    await request.post(`/songs/update/${songId}`, {
      song_name: editForm.value.name,
      song_singer: editForm.value.singer,
      song_lyricist: editForm.value.lyricist,
      song_composer: editForm.value.composer,
      song_album: editForm.value.album,
      song_cover_url: editForm.value.cover_url,
      song_url: editForm.value.url
    })
    alert('更新成功')
    editing.value = false
    await loadSong()
  } catch (err: any) { alert(err.response?.data?.detail || '更新失败') }
}

async function deleteSong() {
  if (!confirm('确定删除这首歌曲吗？')) return
  try {
    await request.post(`/songs/delete/${songId}`)
    alert('删除成功')
    router.push('/songs')
  } catch (err: any) { alert(err.response?.data?.detail || '删除失败') }
}
</script>

<template>
  <div class="song-container">
    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="song" class="song-content">
      <div class="song-header">
        <div class="cover-box">
          <img v-if="song.cover_url" :src="getImageUrl(song.cover_url)" class="cover-img" />
          <div v-else class="cover-large">🎵</div>
        </div>
        <div class="song-info">
          <template v-if="editing">
            <input v-model="editForm.name" placeholder="歌名" />
            <input v-model="editForm.singer" placeholder="歌手" />
            <input v-model="editForm.lyricist" placeholder="作词" />
            <input v-model="editForm.composer" placeholder="作曲" />
            <input v-model="editForm.album" placeholder="专辑" />
            <div class="edit-actions">
              <button @click="updateSong">保存</button>
              <button class="cancel" @click="editing = false">取消</button>
            </div>
          </template>
          <template v-else>
            <h1>{{ song.name }}</h1>
            <p class="singer">🎤 {{ song.singer }}</p>
            <p class="meta" v-if="song.album">💿 {{ song.album }}</p>
            <p class="meta" v-if="song.lyricist">✍️ 作词：{{ song.lyricist }}</p>
            <p class="meta" v-if="song.composer">🎼 作曲：{{ song.composer }}</p>
            <div v-if="isAdmin" class="admin-actions">
              <button @click="editing = true">✏️ 编辑</button>
              <button class="danger" @click="deleteSong">🗑️ 删除</button>
            </div>
          </template>
        </div>
      </div>

      <div class="comment-section">
        <h3>💬 评论（{{ comments.length }}条）</h3>
        <div class="comment-form">
          <textarea v-model="newComment" placeholder="写下你的评论..." rows="3"></textarea>
          <button @click="submitComment">发表评论</button>
        </div>
        <div v-if="comments.length === 0" class="empty">暂无评论</div>
        <div v-else class="comment-list">
          <div v-for="comment in comments" :key="comment.comment_id" class="comment-item">
            <div class="comment-header">
              <span class="user">👤 用户 {{ comment.creater_id }}</span>
              <span class="time">{{ comment.created_at }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
            <button v-if="canDeleteComment(comment)" class="del-comment" @click="deleteComment(comment.comment_id)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.song-container { max-width: 800px; margin: 0 auto; padding: 20px; }
.status { text-align: center; padding: 60px; color: #666; }
.song-header { display: flex; gap: 30px; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 24px; }
.cover-box { width: 180px; height: 180px; border-radius: 12px; overflow: hidden; flex-shrink: 0; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.cover-large { width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 72px; }
.song-info { flex: 1; }
.song-info h1 { margin: 0 0 12px; font-size: 26px; }
.singer { font-size: 18px; color: #667eea; margin: 0 0 8px; }
.meta { margin: 4px 0; color: #666; font-size: 14px; }
.admin-actions { margin-top: 16px; display: flex; gap: 10px; }
.admin-actions button { padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; background: #667eea; color: white; }
.admin-actions .danger { background: #ff4757; }
.song-info input { width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
.edit-actions { display: flex; gap: 10px; }
.edit-actions button { padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; background: #667eea; color: white; }
.edit-actions .cancel { background: #999; }
.comment-section { background: white; padding: 24px 30px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.comment-section h3 { margin: 0 0 20px; }
.comment-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.comment-form textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; resize: vertical; box-sizing: border-box; }
.comment-form button { align-self: flex-end; padding: 8px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; }
.empty { text-align: center; color: #999; padding: 30px; }
.comment-list { display: flex; flex-direction: column; gap: 16px; }
.comment-item { padding: 16px; background: #f8f9fa; border-radius: 10px; position: relative; }
.comment-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
.user { color: #667eea; font-weight: 500; }
.time { color: #999; }
.comment-content { margin: 0; color: #333; line-height: 1.6; }
.del-comment { position: absolute; top: 12px; right: 12px; padding: 2px 8px; background: #ff4757; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
</style>