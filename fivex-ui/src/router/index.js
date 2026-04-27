import { createRouter, createWebHistory } from 'vue-router'
import TestPage from '../views/Test.vue'

const routes = [
  {
    path: '/',
    redirect: '/test'
  },
  {
    path: '/test',
    name: 'Test',
    component: TestPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
