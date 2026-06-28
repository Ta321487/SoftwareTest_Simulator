import { createRouter, createWebHistory } from 'vue-router'
import LevelMap from '../views/LevelMap.vue'
import LevelDetail from '../views/LevelDetail.vue'
import Handbook from '../views/Handbook.vue'

const routes = [
  {
    path: '/',
    name: 'LevelMap',
    component: LevelMap,
  },
  {
    path: '/handbook',
    name: 'Handbook',
    component: Handbook,
  },
  {
    path: '/level/:id/sut/:dock',
    name: 'LevelSut',
    component: LevelDetail,
  },
  {
    path: '/level/:id',
    name: 'LevelDetail',
    component: LevelDetail,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
