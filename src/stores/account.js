import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import * as sdk from 'matrix-js-sdk'

export const useAccountStore = defineStore('account', () => {
  const router = useRouter()
  const serverTypes = ['matrix.org']

  const user = reactive({
    userId: localStorage.getItem('userId') || null,
    userAccessToken: localStorage.getItem('userAccessToken') || null,
    userServerType: localStorage.getItem('userServerType') || null,
    rooms: null,
    isLoading: false,
    isAuthenticated: false,
    error: '',
  })

  let client = null;

  async function login(loginValues) {
    user.isLoading = true
    user.error = ''

    try {
      client = sdk.createClient({
        baseUrl: `https://${loginValues.serverType}`,
      })

      const response = await client.login('m.login.password', {
        user: `@${loginValues.username}:${loginValues.serverType}`,
        password: loginValues.password,
      })

      user.userId = response.user_id
      user.userAccessToken = response.access_token
      user.userServerType = loginValues.serverType

      await matrixStart(user.userAccessToken)

    } catch (error) {
      clearUserInfo()
      user.error = 'Не удалось войти в аккаунт'
      console.error('Не удалось войти в аккаунт', error)
    }
  }

  async function logout() {
    user.isLoading = true

    try {
      await client.logout();
      client.stopClient();

      clearUserInfo()

      router.push({ name: 'auth' })
    } catch (err) {
      console.log('Не удалось выйти из аккаунта', err)
    }
  }

  async function matrixStart(accessToken) {
    client.setAccessToken(accessToken)

    await client.startClient({ initialSyncLimit: 1000 })

    client.once('sync', (state) => {
      if (state === 'PREPARED') {
        const rooms = client.getRooms()

        user.rooms = rooms.map(({ roomId }) => {
          return getRoomInfo(roomId)
        })

        user.rooms.sort((a, b) => {
          if (!a.date || !b.date) return !a.date ? 1 : -1

          if (a.date !== b.date) return b.date - a.date

          return a.name.localeCompare(b.name)
        })

        user.isLoading = false
        user.isAuthenticated = true

        localStorage.setItem('userId', user.userId)
        localStorage.setItem('userAccessToken', user.userAccessToken)
        localStorage.setItem('userServerType', user.userServerType)

        router.push({ name: 'home' })
      } else {
        clearUserInfo()
        user.error = 'Синхронизация не успешна'
        console.error('Синхронизация не успешна')
      }
    })
  }

  function clearUserInfo() {
    user.userId = ''
    user.userAccessToken = null
    user.isAuthenticated = false
    user.isLoading = false

    client.setAccessToken(null)

    localStorage.removeItem('userId')
    localStorage.removeItem('userAccessToken')
    localStorage.removeItem('userServerType')
  }

  function getRoomInfo(roomId) {
    const room = client.getRoom(roomId)

    if (!room) {
      console.error('Комната не найдена:', roomId)
      return
    }

    const events = room.getLiveTimeline().getEvents()

    if (!events.length) {
      console.log('Сообщений в комнате нет.')
      return
    }

    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i]
      if (event.getType() === 'm.room.message') {
        room.lastMessage = event.getContent().body
        room.date = event.getTs()

        break
      }
    }

    room.unreadCount = room.getUnreadNotificationCount('total')

    return {
      name: room.name,
      date: room.date,
      lastMessage: room.lastMessage,
      unreadCount: room.unreadCount,
    }
  }

  const sortingTypes = reactive({
    date: 'asc',
    alphabet: 'asc',
    unreadMessage: 'asc',
  })

  function sorting(type) {
    user.rooms.sort((a, b) => {
      if (type === 'date') {
        if (!a.date || !b.date) return !a.date ? 1 : -1
        return sortingTypes.date === 'asc' ? a.date - b.date : b.date - a.date
      }

      if (type === 'alphabet') {
        return sortingTypes.alphabet === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }

      if (type === 'unreadMessage') {
        return sortingTypes.unreadMessage === 'asc'
          ? a.unreadCount - b.unreadCount
          : b.unreadCount - a.unreadCount
      }

      return 0
    })

    sortingTypes[type] = sortingTypes[type] === 'asc' ? 'desc' : 'asc'
  }

  async function hasUserAuthorized() {
    const accessToken = user.userAccessToken

    if (accessToken) {

      client = sdk.createClient({
        baseUrl: `https://${user.userServerType}`,
        accessToken: user.userAccessToken,
        userId: user.userId,
      })

      router.push({ name: 'home' })

      await matrixStart(accessToken)
      return
    }

    router.push({ name: 'auth' })
  }
  hasUserAuthorized()

  return {
    user,
    serverTypes,
    sortingTypes,
    login,
    logout,
    sorting,
  }
})
