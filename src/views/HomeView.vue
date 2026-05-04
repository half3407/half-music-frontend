<script setup lang="ts">
import { ref } from 'vue'
import PlaylistList from '@/components/PlaylistList.vue'
import request from '@/utils/request'

const searchKeyword = ref('')
const searchType = ref<'playlist' | 'song'>('playlist')
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const searchLoading = ref(false)

async function handleSearch() {
  if (!searchKeyword.value.trim()) return
  searchLoading.value = true
  isSearching.value = true

  try {
    if (searchType.value === 'playlist') {
      // 搜索歌单
      const { data } = await request.post('/playlists/search_playlist', {}, {
        params: { playlist_name: searchKeyword.value }
      })
      searchResults.value = data.map((item: any) => ({
        id: item.playlist.id,
        name: item.playlist.name,
        collect_num: item.playlist.collect_num,
        type: 'playlist' as const
      }))
    } else {
      // 搜索歌曲
      const { data } = await request.post('/songs/search_song', {}, {
        params: { keyword: searchKeyword.value }
      })
      searchResults.value = data.songs.map((song: any) => ({
        id: song.id,
        name: song.name,
        singer: song.singer,
        type: 'song' as const
      }))
    }
  } catch (err) {
    console.error('搜索失败', err)
  } finally {
    searchLoading.value = false
  }
}

function clearSearch() {
  isSearching.value = false
  searchKeyword.value = ''
  searchResults.value = []
}
</script>

<template>
  <div class="home">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <select v-model="searchType" class="search-select">
        <option value="playlist">歌单</option>
        <option value="song">歌曲</option>
      </select>
      <input
        v-model="searchKeyword"
        @keydown.enter="handleSearch"
        class="search-input"
        placeholder="输入关键词搜索..."
      />
      <button class="search-btn" @click="handleSearch">🔍 搜索</button>
      <button v-if="isSearching" class="clear-btn" @click="clearSearch">清除</button>
    </div>

    <!-- 搜索结果 -->
    <div v-if="isSearching" class="search-results">
      <h2>
        🔍 "{{ searchKeyword }}" 的{{ searchType === 'playlist' ? '歌单' : '歌曲' }}结果
      </h2>

      <div v-if="searchLoading" class="status">搜索中...</div>
      <div v-else-if="searchResults.length === 0" class="status">没有找到相关结果</div>

      <div v-else class="result-grid">
        <router-link
          v-for="item in searchResults"
          :key="item.id"
          :to="item.type === 'playlist' ? `/playlist/${item.id}` : `/song/${item.id}`"
          class="result-card"
        >
          <div class="cover-box">
            <div class="cover-placeholder">🎵</div>
          </div>
          <h3>{{ item.name }}</h3>
          <p class="meta" v-if="item.type === 'song'">🎤 {{ item.singer }}</p>
          <p class="meta" v-else>❤️ {{ item.collect_num }} 收藏</p>
        </router-link>
      </div>
    </div>

    <!-- 默认展示热门歌单 -->
    <PlaylistList v-else />
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  gap: 10px;
  max-width: 600px;
  margin: 20px auto;
  padding: 0 20px;
}

.search-select {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 14px;
}

.search-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-btn, .clear-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.clear-btn {
  background: #f1f1f1;
  color: #666;
}

.status {
  text-align: center;
  padding: 40px;
  color: #666;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.result-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
}

.result-card:hover {
  transform: translateY(-4px);
}

.cover-box {
  width: 100%;
  height: 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin-bottom: 12px;
}

h3 {
  margin: 0 0 8px;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  margin: 0;
  color: #888;
  font-size: 13px;
}
</style>