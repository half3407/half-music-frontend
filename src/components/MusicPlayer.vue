<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const audioRef = ref<HTMLAudioElement | null>(null)
const progress = ref(0)
const currentTime = ref('0:00')
const duration = ref('0:00')

onMounted(() => {
  if (audioRef.value) {
    player.bindAudio(audioRef.value)

    audioRef.value.addEventListener('timeupdate', () => {
      if (!audioRef.value) return
      const pct = (audioRef.value.currentTime / audioRef.value.duration) * 100
      progress.value = isFinite(pct) ? pct : 0
      currentTime.value = fmt(audioRef.value.currentTime)
      duration.value = fmt(audioRef.value.duration || 0)
    })
  }
})

function fmt(sec: number): string {
  if (!isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function seek(e: MouseEvent) {
  const bar = e.currentTarget as HTMLDivElement
  const rect = bar.getBoundingClientRect()
  const pct = (e.clientX - rect.left) / rect.width
  if (audioRef.value && isFinite(audioRef.value.duration)) {
    audioRef.value.currentTime = pct * audioRef.value.duration
  }
}
</script>

<template>
  <div>
    <audio ref="audioRef" />

    <div v-if="player.currentSong" class="player">
      <!-- 歌曲信息 -->
      <div class="info">
        <div class="cover">🎵</div>
        <div class="meta">
          <p class="name">{{ player.currentSong.name || player.currentSong.song_name }}</p>
          <p class="singer">{{ player.currentSong.singer || player.currentSong.song_singer }}</p>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <button @click="player.prev">⏮</button>
        <button class="big" @click="player.toggle">
          {{ player.isPlaying ? '⏸' : '▶' }}
        </button>
        <button @click="player.next">⏭</button>
      </div>

      <!-- 进度条 -->
      <div class="progress-wrap" @click="seek">
        <span class="time">{{ currentTime }}</span>
        <div class="bar">
          <div class="fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="time">{{ duration }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 20px;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
}

.info {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 180px;
  flex-shrink: 0;
}

.cover {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.meta {
  overflow: hidden;
}

.name {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.singer {
  margin: 3px 0 0;
  font-size: 11px;
  color: #aaa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.controls button {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.2s;
}

.controls button:hover {
  opacity: 1;
}

.controls .big {
  font-size: 26px;
}

.progress-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.bar {
  flex: 1;
  height: 3px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.1s;
}

.time {
  font-size: 11px;
  color: #aaa;
  min-width: 32px;
  text-align: center;
}
</style>