<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { getImageUrl } from '@/utils/image'
import { usePlayerStore } from '@/stores/player'

interface Song {
  id: number
  name: string
  singer: string
  cover_url?: string
  url?: string
}

const songs = ref<Song[]>([])
const loading = ref(false)
const error = ref('')
const player = usePlayerStore()

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

function handlePlay(song: Song) {
  if (song.url) {
    player.play(song, songs.value)
  } else {
    alert('暂无音频')
  }
}
</script>

<template>
  <div class="songlist-page">
    <h1 class="page-title">🎵 全部歌曲</h1>
    
    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    
    <div v-else class="track-list">
      <div
        v-for="(song, index) in songs"
        :key="song.id"
        class="track-item"
        @click="handlePlay(song)"
      >
        <span class="track-num">{{ String(index + 1).padStart(2, '0') }}</span>
        <button class="track-add">+</button>
        <div class="track-cover">
          <img v-if="song.cover_url" :src="getImageUrl(song.cover_url)" />
          <span v-else>🎵</span>
        </div>
        <div class="track-info">
          <p class="track-name">{{ song.name }}</p>
          <p class="track-artist">{{ song.singer }}</p>
        </div>
        <span class="track-album">-</span>
        <span class="track-time">3:45</span>
        <router-link :to="`/song/${song.id}`" class="track-more" @click.stop>⋮</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.songlist-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
}

.status {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.track-item:hover {
  background: white;
  box-shadow: var(--shadow);
}

.track-num {
  width: 28px;
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.track-add {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.2s;
}

.track-item:hover .track-add {
  opacity: 1;
}

.track-add:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.track-cover {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: linear-gradient(135deg, #c4b5fd, #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.track-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.track-album {
  font-size: 13px;
  color: var(--text-muted);
  width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-time {
  font-size: 13px;
  color: var(--text-muted);
  width: 40px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.track-more {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 18px;
  padding: 4px;
}
</style>