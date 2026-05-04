<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { getImageUrl } from '@/utils/image'

interface Song {
  id: number
  name: string
  singer: string
  cover_url?: string
}

const songs = ref<Song[]>([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await request.post('/songs/view_all', {}, {
      params: { page: 1, page_size: 100 }
    })
    songs.value = data.songs
  } catch (err: any) {
    error.value = err.response?.data?.detail || '获取歌曲失败'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="songlist-container">
    <h2>🎵 全部歌曲</h2>
    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="songs.length === 0" class="status">暂无歌曲</div>
    <div v-else class="song-grid">
      <router-link
        v-for="song in songs"
        :key="song.id"
        :to="`/song/${song.id}`"
        class="song-card"
      >
        <div class="song-cover">
          <img v-if="song.cover_url" :src="getImageUrl(song.cover_url)" :alt="song.name" />
          <div v-else class="cover-placeholder">🎵</div>
        </div>
        <h3>{{ song.name }}</h3>
        <p class="singer">🎤 {{ song.singer }}</p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.songlist-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.status { text-align: center; padding: 40px; color: #666; }
.error { color: #ff4757; }
.song-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; margin-top: 20px; }
.song-card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-decoration: none; color: inherit; transition: transform 0.2s; }
.song-card:hover { transform: translateY(-4px); }
.song-cover { width: 100%; height: 150px; border-radius: 8px; overflow: hidden; }
.song-cover img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 48px; }
h3 { margin: 12px 0 6px; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.singer { margin: 0; color: #888; font-size: 13px; }
</style>