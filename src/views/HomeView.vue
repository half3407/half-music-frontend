<script setup lang="ts">
import PlaylistList from '@/components/PlaylistList.vue'
</script>

<template>
  <div class="home">
    <!-- Hero Banner -->
    <div class="hero">
      <div class="hero-content">
        <span class="tag">🔥 热门推荐</span>
        <h1 class="hero-title">发现你的<br/>专属音乐</h1>
        <p class="hero-desc">海量歌单，随心播放</p>
        <button class="hero-btn" @click="$router.push('/songs')">
          立即播放 →
        </button>
      </div>
      <div class="hero-visual">🎧</div>
    </div>

    <!-- 推荐歌单 -->
    <PlaylistList />
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  padding: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.tag {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 42px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 12px;
}

.hero-desc {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 24px;
}

.hero-btn {
  padding: 12px 28px;
  background: white;
  color: var(--primary);
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.hero-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.hero-visual {
  font-size: 120px;
  opacity: 0.3;
  position: relative;
  z-index: 1;
}
</style>