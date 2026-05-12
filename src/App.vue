<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import MusicPlayer from '@/components/MusicPlayer.vue'

const userStore = useUserStore()
const router = useRouter()

function logout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-brand" @click="router.push('/')">🎧 Half Music</div>
      <div class="nav-menu">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/songs" class="nav-link">全部歌曲</router-link>
        <router-link to="/users" class="nav-link">用户</router-link>
        
        <template v-if="userStore.isLoggedIn">
          <router-link to="/profile" class="nav-link">个人中心</router-link>
          <router-link v-if="userStore.isAdmin" to="/admin" class="nav-link">管理后台</router-link>
          <span class="user-info">👤 {{ userStore.username }}</span>
          <button class="logout-btn" @click="logout">退出</button>
        </template>
        
        <router-link v-else to="/login" class="nav-link login-link">登录</router-link>
      </div>
    </nav>

    <!-- 页面内容在这里切换 -->
    <main>
      <router-view />
    </main>
    <MusicPlayer />
  </div>
</template>

<style>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 60px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
  cursor: pointer;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-size: 15px;
}

.nav-link:hover {
  color: #667eea;
}

.login-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  padding: 6px 16px;
  border-radius: 20px;
}

.user-info {
  color: #333;
  font-size: 14px;
}

.logout-btn {
  background: #ff4757;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 13px;
}

.logout-btn:hover {
  background: #ff3742;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
}
</style>