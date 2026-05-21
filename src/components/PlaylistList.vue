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
  <div class="playlist-section">
    <div class="section-header">
      <h2>推荐歌单</h2>
      <router-link to="/" class="see-all">查看全部 →</router-link>
    </div>
    
    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="playlists.length === 0" class="status">暂无歌单</div>
    
    <div v-else class="card-grid">
      <router-link 
        v-for="playlist in playlists" 
        :key="playlist.id"
        :to="`/playlist/${playlist.id}`"
        class="card"
      >
        <div class="card-cover">
          <img v-if="playlist.cover_url" :src="getImageUrl(playlist.cover_url)" :alt="playlist.name" />
          <div v-else class="cover-fallback">🎵</div>
          <div class="card-overlay">
            <span class="play-icon">▶</span>
          </div>
        </div>
        <h3 class="card-title">{{ playlist.name }}</h3>
        <p class="card-meta">{{ playlist.songs_count }}首 · {{ playlist.collect_num }}收藏</p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.playlist-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 22px;
  font-weight: 700;
}

.see-all {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.see-all:hover {
  color: var(--primary);
}

.status {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.error {
  color: #ef4444;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

.card {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-4px);
}

.card:hover .card-overlay {
  opacity: 1;
}

.card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: var(--shadow);
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #c4b5fd, #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.play-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-muted);
}
</style>