<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

// 权限检查
onMounted(() => {
  if (!userStore.isAdmin) {
    alert('无权访问')
    router.push('/')
  }
})

// ========== 创建歌单 ==========
const plName = ref('')
const plIntro = ref('')
const plCoverFile = ref<File | null>(null)
const plCoverUrl = ref('')

function onPlCoverChange(e: Event) {
  const t = e.target as HTMLInputElement
  if (t.files?.[0]) plCoverFile.value = t.files[0]
}

// 上传歌单封面
async function uploadPlCover() {
  if (!plCoverFile.value) return alert('请选择封面')
  const fd = new FormData()
  fd.append('file', plCoverFile.value)
  try {
    const { data } = await request.post('/files/cover', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    plCoverUrl.value = data.data.file_url
    alert('封面上传成功！')
  } catch (err: any) {
    alert(err.response?.data?.detail || '封面上传失败')
    console.error('封面上传失败:', err.response?.data)
  }
}

async function createPlaylist() {
  if (!plName.value) return alert('请输入歌单名')
  try {
    await request.post('/playlists/create', {
      playlist_name: plName.value,
      playlist_introduction: plIntro.value,
      playlist_cover_url: plCoverUrl.value
    })
    alert('歌单创建成功！')
    plName.value = ''
    plIntro.value = ''
    plCoverUrl.value = ''
    plCoverFile.value = null
  } catch (err: any) {
    alert(err.response?.data?.detail || '创建失败')
  }
}

// ========== 创建歌曲 ==========
const sName = ref('')
const sSinger = ref('')
const sLyricist = ref('')
const sComposer = ref('')
const sAlbum = ref('')
const sAudioFile = ref<File | null>(null)
const sCoverFile = ref<File | null>(null)
const sAudioUrl = ref('')
const sCoverUrl = ref('')

function onAudioChange(e: Event) {
  const t = e.target as HTMLInputElement
  if (t.files?.[0]) sAudioFile.value = t.files[0]
}
function onSongCoverChange(e: Event) {
  const t = e.target as HTMLInputElement
  if (t.files?.[0]) sCoverFile.value = t.files[0]
}

// 上传音频
async function uploadAudio() {
  if (!sAudioFile.value) return alert('请选择音频')
  const fd = new FormData()
  fd.append('file', sAudioFile.value)
  try {
    const { data } = await request.post('/files/song', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    sAudioUrl.value = data.data.file_url
    alert('音频上传成功！')
  } catch (err: any) {
    alert(err.response?.data?.detail || '音频上传失败')
    console.error('音频上传失败:', err.response?.data)
  }
}

// 上传歌曲封面
async function uploadSongCover() {
  if (!sCoverFile.value) return alert('请选择封面')
  const fd = new FormData()
  fd.append('file', sCoverFile.value)
  try {
    const { data } = await request.post('/files/cover', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    sCoverUrl.value = data.data.file_url
    alert('封面上传成功！')
  } catch (err: any) {
    alert(err.response?.data?.detail || '封面上传失败')
    console.error('封面上传失败:', err.response?.data)
  }
}

async function createSong() {
  if (!sName.value || !sSinger.value) return alert('歌名和歌手必填')
  if (!sAudioUrl.value) return alert('请先上传音频文件')
  try {
    await request.post('/songs/create', {
      song_name: sName.value,
      song_singer: sSinger.value,
      song_lyricist: sLyricist.value,
      song_composer: sComposer.value,
      song_album: sAlbum.value,
      song_cover_url: sCoverUrl.value,
      song_url: sAudioUrl.value
    })
    alert('歌曲创建成功！')
    // 清空
    sName.value = sSinger.value = sLyricist.value = sComposer.value = sAlbum.value = ''
    sAudioUrl.value = sCoverUrl.value = ''
    sAudioFile.value = sCoverFile.value = null
  } catch (err: any) {
    alert(err.response?.data?.detail || '创建失败')
  }
}
</script>

<template>
  <div class="admin-container">
    <h1>⚙️ 管理后台</h1>

    <div class="admin-grid">
      <!-- 创建歌单 -->
      <div class="admin-card">
        <h2>📁 创建歌单</h2>
        <input v-model="plName" placeholder="歌单名称" />
        <textarea v-model="plIntro" placeholder="歌单简介" rows="3"></textarea>
        
        <div class="file-row">
          <input type="file" accept="image/*" @change="onPlCoverChange" />
          <button @click="uploadPlCover">上传封面</button>
        </div>
        <p v-if="plCoverUrl" class="file-hint">✅ 封面已上传</p>
        
        <button class="submit" @click="createPlaylist">创建歌单</button>
      </div>

      <!-- 创建歌曲 -->
      <div class="admin-card">
        <h2>🎵 创建歌曲</h2>
        <input v-model="sName" placeholder="歌曲名称 *" />
        <input v-model="sSinger" placeholder="歌手 *" />
        <input v-model="sLyricist" placeholder="作词" />
        <input v-model="sComposer" placeholder="作曲" />
        <input v-model="sAlbum" placeholder="专辑" />
        
        <div class="file-row">
          <input type="file" accept="audio/*" @change="onAudioChange" />
          <button @click="uploadAudio">上传音频</button>
        </div>
        <p v-if="sAudioUrl" class="file-hint">✅ 音频已上传</p>

        <div class="file-row">
          <input type="file" accept="image/*" @change="onSongCoverChange" />
          <button @click="uploadSongCover">上传封面</button>
        </div>
        <p v-if="sCoverUrl" class="file-hint">✅ 封面已上传</p>

        <button class="submit" @click="createSong">创建歌曲</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 24px;
}

.admin-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.admin-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.admin-card h2 {
  margin: 0 0 16px;
  font-size: 18px;
}

.admin-card input,
.admin-card textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  font-family: inherit;
}

.file-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  align-items: center;
}

.file-row button {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.file-hint {
  font-size: 13px;
  color: #52c41a;
  margin: 0 0 12px;
}

.submit {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .admin-grid {
    grid-template-columns: 1fr;
  }
}
</style>