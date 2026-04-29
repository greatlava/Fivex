import { io } from 'socket.io-client'

let socket = null
let isConnecting = false

const socketService = {
  getSocket() {
    return socket
  },

  isConnected() {
    return socket && socket.connected
  },

  async connect(token) {
    if (isConnecting) return
    if (socket && socket.connected) return

    if (!token) {
      console.log('[Socket] 未提供 token，跳过连接')
      return
    }

    isConnecting = true
    console.log('[Socket] 开始连接...')

    try {
      if (socket) {
        socket.disconnect()
        socket = null
      }

      const connectOptions = {
        transports: ['websocket', 'polling'],
        auth: { token }
      }

      socket = io(connectOptions)

      socket.on('connect', () => {
        console.log(`[Socket] 连接成功! ID: ${socket.id}`)
        isConnecting = false
      })

      socket.on('disconnect', (reason) => {
        console.log(`[Socket] 断开连接: ${reason}`)
        isConnecting = false
      })

      socket.on('connect_error', (error) => {
        console.error(`[Socket] 连接失败: ${error.message}`)
        isConnecting = false
      })

      socket.on('player:online', (data) => {
        console.log('[Socket] 玩家上线:', data)
      })

      socket.on('player:offline', (data) => {
        console.log('[Socket] 玩家下线:', data)
      })

    } catch (error) {
      console.error('[Socket] 连接异常:', error)
      isConnecting = false
    }
  },

  disconnect() {
    if (socket) {
      console.log('[Socket] 手动断开连接')
      socket.disconnect()
      socket = null
    }
    isConnecting = false
  },

  reconnect(token) {
    this.disconnect()
    this.connect(token)
  }
}

export default socketService
