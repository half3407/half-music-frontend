<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import MusicPlayer from '@/components/MusicPlayer.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const navItems = [
  { name: '首页', icon: '🏠', path: '/' },
  { name: '全部歌曲', icon: '🎵', path: '/songs' },
  { name: '用户', icon: '👥', path: '/users' },
]

const userItems = [
  { name: '个人中心', icon: '👤', path: '/profile' },
]

function logout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-layout">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="logo" @click="router.push('/')">
        <span class="logo-icon">🎧</span>
        <span class="logo-text">Half Music</span>
      </div>

      <nav class="nav-section">
        <p class="nav-label">浏览</p>
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>

      <nav class="nav-section" v-if="userStore.isLoggedIn">
        <p class="nav-label">我的</p>
        <router-link
          v-for="item in userItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </router-link>
        <div class="nav-item" @click="logout">
          <span class="nav-icon">🚪</span>
          <span>退出</span>
        </div>
      </nav>

      <nav class="nav-section" v-if="userStore.isAdmin">
        <p class="nav-label">管理</p>
        <router-link to="/admin" class="nav-item" :class="{ active: route.path === '/admin' }">
          <span class="nav-icon">⚙️</span>
          <span>后台</span>
        </router-link>
      </nav>

      <!-- 底部用户信息 -->
      <div class="sidebar-footer" v-if="userStore.isLoggedIn">
        <div class="user-avatar">
          <img v-if="userStore.avatarUrl" :src="userStore.avatarUrl" />
          <span v-else>👤</span>
        </div>
        <div class="user-name">{{ userStore.username }}</div>
      </div>
      <div class="sidebar-footer" v-else>
        <router-link to="/login" class="login-btn">登录</router-link>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部栏 -->
      <header class="top-bar">
  <div class="nav-arrows">
    <button @click="router.back()">←</button>
    <button @click="router.forward()">→</button>
  </div>
  
  <div class="search-box">
    <span class="search-icon">🔍</span>
    <input type="text" placeholder="搜索..." />
  </div>
  
  <!-- 右侧区域：通知 + 头像 -->
  <div class="top-actions">
    <span class="notif">🔔</span>
    <div 
      class="top-avatar" 
      @click="userStore.isLoggedIn ? router.push('/profile') : router.push('/login')"
      style="cursor: pointer;"
    >
      <img v-if="userStore.avatarUrl" :src="userStore.avatarUrl" />
      <span v-else>👤</span>
    </div>
  </div>
</header>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </main>

    <!-- 底部播放器 -->
    <MusicPlayer />
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg-main);
  color: var(--text-main);
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏 */
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: var(--player-height);
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  cursor: pointer;
  padding: 0 8px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.nav-section {
  margin-bottom: 24px;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0 12px;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f3f4f6;
  color: var(--text-main);
}

.nav-item.active {
  background: var(--primary);
  color: white;
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px 12px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.login-btn {
  width: 100%;
  padding: 10px;
  background: var(--primary);
  color: white;
  text-align: center;
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-size: 14px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  margin-bottom: var(--player-height);
  min-height: 100vh;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 32px;
  background: rgba(243, 244, 246, 0.8);
  backdrop-filter: blur(12px);
}

.nav-arrows {
  display: flex;
  gap: 8px;
}

.nav-arrows button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: white;
  color: var(--text-secondary);
  cursor: pointer;
  box-shadow: var(--shadow);
}

.search-box {
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: var(--shadow);
}

.search-box input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 100%;
  background: transparent;
}

.search-icon {
  color: var(--text-muted);
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notif {
  font-size: 20px;
  cursor: pointer;
}

.top-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  cursor: pointer;
}

.top-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-content {
  padding: 24px 32px;
}
.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;  /* ← 关键：把右侧内容推到最右边 */
}

.top-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: transform 0.2s;
}

.top-avatar:hover {
  transform: scale(1.1);
}

.top-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>