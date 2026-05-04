<script setup lang="ts">
import { ref } from 'vue'
import request from '@/utils/request'

interface User {
  id: number
  username: string
  role: string
}

const users = ref<User[]>([])
const keyword = ref('')
const loading = ref(false)

async function search() {
  loading.value = true
  try {
    let data
    if (!keyword.value.trim()) {
      const res = await request.post('/users/view_all_user', {}, { params: { page: 1, page_size: 100 } })
      data = res.data
    } else {
      const res = await request.post('/users/search_user', {}, { params: { username: keyword.value } })
      data = res.data
    }
    users.value = data.users
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="userlist-container">
    <h2>👥 用户列表</h2>
    <div class="search-bar">
      <input v-model="keyword" @keydown.enter="search" placeholder="搜索用户名，留空查全部..." />
      <button @click="search">搜索</button>
    </div>
    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="users.length === 0" class="status">暂无用户</div>
    <div v-else class="user-list">
      <div v-for="user in users" :key="user.id" class="user-item">
        <span class="username">👤 {{ user.username }}</span>
        <span class="role" :class="user.role">{{ user.role === 'admin' ? '管理员' : '用户' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.userlist-container { max-width: 800px; margin: 0 auto; padding: 20px; }
.search-bar { display: flex; gap: 10px; margin-bottom: 20px; }
.search-bar input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; }
.search-bar button { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; }
.status { text-align: center; padding: 40px; color: #666; }
.user-list { display: flex; flex-direction: column; gap: 10px; }
.user-item { display: flex; justify-content: space-between; align-items: center; background: white; padding: 14px 20px; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.username { font-weight: 500; }
.role { padding: 4px 10px; border-radius: 12px; font-size: 12px; background: #f0f0f0; color: #666; }
.role.admin { background: #fff3cd; color: #856404; }
</style>