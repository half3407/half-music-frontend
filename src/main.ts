import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/vars.css'

const app = createApp(App)
app.use(createPinia())  // 启用 Pinia
app.use(router)         // 启用 Router
app.mount('#app')