<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const audioRef = ref<HTMLAudioElement>()
const progress = ref(0)
const currentTime = ref('0:00')
const duration = ref('0:00')

// 波形数据（模拟）
const waveBars = ref<number[]>([])
const barCount = 60

function generateWave() {
  waveBars.value = Array.from({ length: barCount }, () => 
    Math.random() * 0.6 + 0.2
  )
}

// 播放时波形动画
let waveInterval: number
function startWaveAnimation() {
  generateWave()
  waveInterval = window.setInterval(() => {
    waveBars.value = waveBars.value.map(h => {
      const change = (Math.random() - 0.5) * 0.3
      return Math.max(0.1, Math.min(0.9, h + change))
    })
  }, 100)
}

function stopWaveAnimation() {
  clearInterval(waveInterval)
}

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

    audioRef.value.addEventListener('play', startWaveAnimation)
    audioRef.value.addEventListener('pause', stopWaveAnimation)
    audioRef.value.addEventListener('ended', stopWaveAnimation)
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

const activeBars = computed(() => {
  return Math.floor((progress.value / 100) * barCount)
})
</script>

<template>
  <div v-if="player.currentSong" class="player">
    <audio ref="audioRef" />

    <!-- 左侧：歌曲信息 -->
    <div class="player-left">
      <div class="cover">
        <img v-if="player.currentSong.cover_url" :src="player.currentSong.cover_url" />
        <span v-else>🎵</span>
      </div>
      <div class="info">
        <p class="name">{{ player.currentSong.name || player.currentSong.song_name }}</p>
        <p class="artist">{{ player.currentSong.singer || player.currentSong.song_singer }}</p>
      </div>
    </div>

    <!-- 中间：控制 + 波形 -->
    <div class="player-center">
      <div class="controls">
        <button class="ctrl-btn" @click="player.prev">⏮</button>
        <button class="play-btn" @click="player.toggle">
          {{ player.isPlaying ? '⏸' : '▶' }}
        </button>
        <button class="ctrl-btn" @click="player.next">⏭</button>
      </div>

      <!-- 波形进度条 -->
      <div class="wave-container" @click="seek">
        <div class="wave-bars">
          <div
            v-for="(h, i) in waveBars"
            :key="i"
            class="wave-bar"
            :class="{ active: i < activeBars }"
            :style="{ height: `${h * 100}%` }"
          />
        </div>
        <div class="time-overlay">
          <span>{{ currentTime }}</span>
          <span>{{ duration }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧：额外控制 -->
    <div class="player-right">
      <button class="icon-btn">🔀</button>
      <button class="icon-btn">🔁</button>
      <button class="icon-btn">🔊</button>
      <button class="icon-btn">📋</button>
    </div>
  </div>
</template>

<style scoped>
.player {
  position: fixed;
  bottom: 0;
  left: var(--sidebar-width);
  right: 0;
  height: var(--player-height);
  background: white;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 24px;
  z-index: 1000;
}

/* 左侧信息 */
.player-left {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
  flex-shrink: 0;
}

.cover {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  overflow: hidden;
}

.name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

/* 中间控制区 */
.player-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ctrl-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.ctrl-btn:hover {
  opacity: 1;
}

.play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--primary);
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.play-btn:hover {
  transform: scale(1.05);
}

/* 波形进度条 */
.wave-container {
  width: 100%;
  max-width: 500px;
  height: 32px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.wave-bars {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  height: 100%;
}

.wave-bar {
  flex: 1;
  background: #e5e7eb;
  border-radius: 2px;
  transition: height 0.1s ease, background 0.2s;
  min-height: 4px;
}

.wave-bar.active {
  background: linear-gradient(180deg, var(--primary-light), var(--primary));
}

.time-overlay {
  position: absolute;
  bottom: -18px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  pointer-events: none;
}

/* 右侧 */
.player-right {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 160px;
  justify-content: flex-end;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.icon-btn:hover {
  opacity: 1;
}
</style>