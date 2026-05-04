import axios from 'axios'
import { useUserStore } from '@/stores/user'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8000/api/v1',  // 以后不用写完整地址了
  timeout: 10000
})

// 请求拦截器：每次发请求前，自动给 Header 加上 Token
request.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

export default request