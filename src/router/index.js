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
    path: '/level/:id',
    name: 'LevelDetail',
    component: LevelDetail,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
