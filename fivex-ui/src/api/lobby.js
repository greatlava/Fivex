import { apiClient } from './auth'

const lobbyApi = {
  getRooms: (region = '华东一区') => {
    return apiClient.get(`/lobby/rooms?region=${encodeURIComponent(region)}`)
  },

  getRoom: (roomNumber, region = '华东一区') => {
    return apiClient.get(`/lobby/rooms/${roomNumber}?region=${encodeURIComponent(region)}`)
  },

  getOnlinePlayers: () => {
    return apiClient.get('/lobby/online-players')
  },

  sitDown: (roomNumber, region = '华东一区') => {
    return apiClient.post('/lobby/sit-down', { roomNumber, region })
  },

  leaveRoom: (region = '华东一区') => {
    return apiClient.post('/lobby/leave-room', { region })
  },

  quickStart: (region = '华东一区') => {
    return apiClient.post('/lobby/quick-start', { region })
  }
}

export default lobbyApi
