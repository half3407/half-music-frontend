<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { getImageUrl } from '@/utils/image'

interface Playlist {
  id: number
  name: string
  creater_id: string
  created_at: string
  collect_num: number
  songs_count: number
  cover_url?: string
}

const playlists = ref<Playlist[]>([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await request.post('/playlists/view_all', {}, {
      params: { page: 1, page_size: 12 }
    })
    playlists.value = data.map((item: any) => item.playlist)
  } catch (err: any) {
    error.value = err.response?.data?.detail || '获取歌单失败'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="playlist-container">
    <h2>🔥 热门歌单</h2>
    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="playlists.length === 0" class="status">暂无歌单</div>
    <div v-else class="playlist-grid">
      <router-link 
        v-for="playlist in playlists" 
        :key="playlist.id"
        :to="`/playlist/${playlist.id}`"
        class="playlist-card"
      >
        <div class="playlist-cover">
          <img v-if="playlist.cover_url" :src="getImageUrl(playlist.cover_url)" :alt="playlist.name" />
          <div v-else class="cover-placeholder">🎵</div>
        </div>
        <h3>{{ playlist.name }}</h3>
        <p class="meta">
          👤 {{ playlist.creater_id }} · 
          ❤️ {{ playlist.collect_num }} · 
          🎶 {{ playlist.songs_count }}首
        </p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.playlist-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.status { text-align: center; padding: 40px; color: #666; }
.error { color: #ff4757; }
.playlist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
.playlist-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-decoration: none; color: inherit; transition: transform 0.2s; }
.playlist-card:hover { transform: translateY(-4px); }
.playlist-cover { width: 100%; height: 150px; border-radius: 8px; overflow: hidden; }
.playlist-cover img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 48px; }
h3 { margin: 12px 0 8px; font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta { color: #666; font-size: 13px; }
</style>