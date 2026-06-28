import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/pages/HomePage.vue') },
  { path: '/saat', component: () => import('@/pages/ClockPage.vue') },
  { path: '/vakitler', component: () => import('@/pages/PrayerTimesPage.vue') },
  { path: '/takvim', component: () => import('@/pages/CalendarPage.vue') },
  { path: '/ayarlar', component: () => import('@/pages/SettingsPage.vue') },
  { path: '/hakkinda', component: () => import('@/pages/AboutPage.vue') },
  { path: '/saatuzerine', component: () => import('@/pages/BlogPage.vue'), props: { page: 'saatuzerine' } },
  { path: '/yenilikler', component: () => import('@/pages/BlogPage.vue'), props: { page: 'yenilikler' } },
  { path: '/detay/:page/:id', component: () => import('@/pages/BlogDetailPage.vue') },
  { path: '/amentu', component: () => import('@/pages/AmentuPage.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('@/pages/NotFoundPage.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
