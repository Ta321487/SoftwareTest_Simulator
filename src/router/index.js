import { createRouter, createWebHistory } from 'vue-router'
import LevelMap from '../views/LevelMap.vue'

const routes = [
  {
    path: '/',
    name: 'LevelMap',
    component: LevelMap,
  },
  {
    path: '/handbook',
    name: 'Handbook',
    component: () => import('../views/Handbook.vue'),
  },
  {
    path: '/level/:id/sut/:dock',
    name: 'LevelSut',
    component: () => import('../views/LevelDetail.vue'),
  },
  {
    path: '/level/:id',
    name: 'LevelDetail',
    component: () => import('../views/LevelDetail.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
