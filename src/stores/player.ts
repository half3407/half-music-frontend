import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE = 'http://localhost:8000'

function fullUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref<any>(null)
  const isPlaying = ref(false)
  const playlist = ref<any[]>([])
  const currentIndex = ref(0)
  const audio = ref<HTMLAudioElement | null>(null)

  function play(song: any, list: any[] = []) {
    console.log('🎵 准备播放:', song)
    console.log('🎵 song.url:', song.url)
    console.log('🎵 song.song_url:', song.song_url)
    
    currentSong.value = song
    if (list.length > 0) {
      playlist.value = list
      currentIndex.value = list.findIndex(s => s.id === song.id)
    }

    const audioUrl = fullUrl(song.url || song.song_url)
    console.log('🎵 最终音频URL:', audioUrl)

    if (!audioUrl) {
      alert('该歌曲没有音频文件')
      return
    }

    isPlaying.value = true

    let attempts = 0
    const trySetAndPlay = () => {
      if (audio.value) {
        console.log('🎵 设置audio.src:', audioUrl)
        audio.value.src = audioUrl
        audio.value.load()  // 强制加载
        audio.value.play().catch((err) => {
          console.error('❌ 播放失败:', err)
          isPlaying.value = false
        })
      } else if (attempts < 10) {
        attempts++
        setTimeout(trySetAndPlay, 100)
      } else {
        console.error('❌ audio元素未绑定：重试失败')
        isPlaying.value = false
      }
    }

    // 异步执行一次尝试（组件渲染/绑定可能在本次事件循环之后）
    setTimeout(trySetAndPlay, 0)
  }

  function toggle() {
    if (!audio.value || !currentSong.value) return
    if (isPlaying.value) {
      audio.value.pause()
      isPlaying.value = false
    } else {
      audio.value.play().catch(() => {})
      isPlaying.value = true
    }
  }

  function next() {
    if (playlist.value.length === 0) return
    currentIndex.value = (currentIndex.value + 1) % playlist.value.length
    play(playlist.value[currentIndex.value], playlist.value)
  }

  function prev() {
    if (playlist.value.length === 0) return
    currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
    play(playlist.value[currentIndex.value], playlist.value)
  }

  function bindAudio(el: HTMLAudioElement) {
    console.log('🎵 audio元素已绑定')
    audio.value = el
    el.addEventListener('ended', () => next())
    el.addEventListener('error', (e) => {
      console.error('❌ 音频加载错误:', e)
    })
  }

  return {
    currentSong,
    isPlaying,
    playlist,
    currentIndex,
    play,
    toggle,
    next,
    prev,
    bindAudio
  }
})