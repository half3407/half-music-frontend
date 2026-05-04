import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import PlaylistDetail from '../views/PlaylistDetail.vue'
import SongDetail from '../views/SongDetail.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminView from '../views/AdminView.vue'
import SongListView from '../views/SongListView.vue'
import UserListView from '../views/UserListView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/playlist/:id', name: 'playlist-detail', component: PlaylistDetail },
    { path: '/song/:id', name: 'song-detail', component: SongDetail },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/songs', name: 'songs', component: SongListView },
    { path: '/users', name: 'users', component: UserListView },
  ]
})

export default router