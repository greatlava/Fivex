import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('[API] 请求错误:', error)
    return Promise.reject(error)
  }
)

const authApi = {
  generateCaptcha: () => {
    return apiClient.post('/auth/captcha/generate')
  },

  verifyCaptcha: (captchaId, userPosition) => {
    return apiClient.post('/auth/captcha/verify', {
      captchaId,
      userPosition
    })
  },

  register: (userData) => {
    return apiClient.post('/auth/register', userData)
  },

  login: (username, password) => {
    return apiClient.post('/auth/login', { username, password })
  },

  logout: () => {
    return apiClient.post('/auth/logout')
  },

  getCurrentUser: () => {
    return apiClient.get('/auth/me')
  }
}

export { apiClient, authApi }
export default authApi
