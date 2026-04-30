import { createRouter, createWebHistory } from 'vue-router'
import Lobby from '../views/Lobby.vue'
import Game from '../views/Game.vue'
import TestPage from '../views/Test.vue'

const routes = [
  {
    path: '/',
    redirect: '/lobby'
  },
  {
    path: '/lobby',
    name: 'Lobby',
    component: Lobby
  },
  {
    path: '/game/:tableNumber?',
    name: 'Game',
    component: Game,
    props: true
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
