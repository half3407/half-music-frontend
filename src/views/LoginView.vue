<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const router = useRouter()      // 用于跳转页面
const userStore = useUserStore()

const isRegister = ref(false)   // 切换登录/注册模式
const username = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function handleSubmit() {
  if (!username.value || !password.value) {
    errorMsg.value = '请填写用户名和密码'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const url = isRegister.value ? '/users/register' : '/users/login'
    const response = await request.post(url, {
      username: username.value,
      password: password.value,
      role: 'user'  // 注册时默认普通用户
    })

    if (isRegister.value) {
      // 注册成功，切换到登录模式
      alert('注册成功，请登录')
      isRegister.value = false
    } else {
      // 登录成功，保存用户信息
      userStore.login(response.data)
      alert(`欢迎回来，${response.data.username}！`)
      router.push('/')  // 跳回首页
    }
  } catch (err: any) {
    errorMsg.value = err.response?.data?.detail || '请求失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>{{ isRegister ? '注册账号' : '用户登录' }}</h2>

      <div class="form-item">
        <label>用户名</label>
        <input v-model="username" type="text" placeholder="请输入用户名" />
      </div>

      <div class="form-item">
        <label>密码</label>
        <input v-model="password" type="password" placeholder="请输入密码" />
      </div>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

      <button class="submit-btn" @click="handleSubmit" :disabled="loading">
        {{ loading ? '处理中...' : (isRegister ? '注册' : '登录') }}
      </button>

      <p class="toggle">
        {{ isRegister ? '已有账号？' : '还没有账号？' }}
        <a href="#" @click.prevent="isRegister = !isRegister">
          {{ isRegister ? '去登录' : '去注册' }}
        </a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 360px;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.form-item {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #666;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
}

.submit-btn:hover {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #ff4757;
  font-size: 14px;
  margin: 8px 0;
}

.toggle {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.toggle a {
  color: #667eea;
  text-decoration: none;
}
</style>