import { createRouter, createWebHistory } from 'vue-router'
import { useAccountStore } from '@/stores/account'

import ChatPage from '@/pages/chatPage.vue'
import AuthPage from '@/pages/authPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ChatPage,
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthPage,
    },
  ],
})

router.beforeEach((to) => {
  const account = useAccountStore()

  if (!account.user.isAuthenticated && !account.user.userAccessToken && to.name !== 'auth')
    return { name: 'auth' }
})

export default router
