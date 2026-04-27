<template>
  <div class="test-container">
    <h2>系统测试页面</h2>
    
    <div class="section">
      <h3>📊 数据库连接状态</h3>
      <div class="card-grid">
        <div class="status-card" :class="{ connected: mongoStatus.connected }">
          <div class="status-header">
            <span class="status-icon">{{ mongoStatus.connected ? '✓' : '✗' }}</span>
            <span class="status-text">MongoDB</span>
          </div>
          <div class="status-details">
            <p><strong>连接状态:</strong> {{ mongoStatus.connected ? '已连接' : '未连接' }}</p>
            <p><strong>URI:</strong> {{ mongoStatus.uri }}</p>
          </div>
          <button @click="testMongo" class="test-btn" :disabled="testingMongo">
            {{ testingMongo ? '测试中...' : '测试连接' }}
          </button>
          <div v-if="mongoTestResult" class="test-result" :class="{ success: mongoTestResult.success, error: !mongoTestResult.success }">
            {{ mongoTestResult.message }}
          </div>
        </div>
        
        <div class="status-card" :class="{ connected: redisStatus.connected }">
          <div class="status-header">
            <span class="status-icon">{{ redisStatus.connected ? '✓' : '✗' }}</span>
            <span class="status-text">Redis</span>
          </div>
          <div class="status-details">
            <p><strong>连接状态:</strong> {{ redisStatus.connected ? '已连接' : '未连接' }}</p>
            <p><strong>主机:</strong> {{ redisStatus.host }}</p>
            <p><strong>端口:</strong> {{ redisStatus.port }}</p>
          </div>
          <button @click="testRedis" class="test-btn" :disabled="testingRedis">
            {{ testingRedis ? '测试中...' : '测试连接' }}
          </button>
          <div v-if="redisTestResult" class="test-result" :class="{ success: redisTestResult.success, error: !redisTestResult.success }">
            {{ redisTestResult.message }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h3>👤 用户认证测试</h3>
      
      <div class="test-form">
        <div class="form-group">
          <label>测试用户名</label>
          <input v-model="testUsername" type="text" placeholder="请输入用户名 (3-20 字符)" />
        </div>
        <div class="form-group">
          <label>测试密码</label>
          <input v-model="testPassword" type="password" placeholder="请输入密码 (至少 6 字符)" />
        </div>
      </div>
      
      <div class="button-row">
        <button @click="testRegister" class="test-btn primary" :disabled="testingAuth">
          {{ testingAuth ? '测试中...' : '🔹 测试注册' }}
        </button>
        <button @click="testLogin" class="test-btn success" :disabled="testingAuth">
          {{ testingAuth ? '测试中...' : '🔹 测试登录' }}
        </button>
        <button @click="testGetUserInfo" class="test-btn info" :disabled="testingAuth || !token">
          {{ testingAuth ? '测试中...' : '🔹 获取用户信息' }}
        </button>
        <button @click="clearAuth" class="test-btn warning" :disabled="!token">
          🔹 清除登录状态
        </button>
      </div>
      
      <div v-if="authTestResult" class="result-card" :class="{ success: authTestResult.success, error: !authTestResult.success }">
        <h4>{{ authTestResult.success ? '✅ 成功' : '❌ 失败' }}</h4>
        <p>{{ authTestResult.message }}</p>
        <div v-if="authTestResult.data" class="json-preview">
          <pre>{{ JSON.stringify(authTestResult.data, null, 2) }}</pre>
        </div>
      </div>
      
      <div v-if="token" class="token-info">
        <p><strong>当前 Token:</strong></p>
        <div class="token-display">{{ token.substring(0, 50) }}...</div>
      </div>
    </div>
    
    <div class="section">
      <h3>🔌 Socket.io 连接测试</h3>
      
      <div class="socket-status">
        <div class="status-item" :class="{ connected: socketConnected }">
          <span class="dot"></span>
          <span>连接状态: {{ socketConnected ? '已连接' : '未连接' }}</span>
        </div>
        <div v-if="socketConnected" class="status-item">
          <span>Socket ID: {{ socketId }}</span>
        </div>
      </div>
      
      <div class="button-row">
        <button @click="testSocketConnect" class="test-btn primary" :disabled="socketConnected || testingSocket">
          {{ testingSocket ? '连接中...' : '🔹 连接 Socket' }}
        </button>
        <button @click="testSocketDisconnect" class="test-btn warning" :disabled="!socketConnected">
          🔹 断开 Socket
        </button>
        <button @click="testSocketReconnect" class="test-btn info" :disabled="!token">
          🔹 带 Token 重连
        </button>
      </div>
      
      <div v-if="socketTestResult" class="result-card" :class="{ success: socketTestResult.success, error: !socketTestResult.success }">
        <h4>{{ socketTestResult.success ? '✅ 成功' : '❌ 失败' }}</h4>
        <p>{{ socketTestResult.message }}</p>
      </div>
    </div>
    
    <div class="section">
      <h3>📋 测试记录</h3>
      <div class="test-log">
        <div v-if="testLogs.length === 0" class="empty-log">
          暂无测试记录
        </div>
        <div v-for="(log, index) in testLogs" :key="index" class="log-item" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <button @click="clearLogs" class="test-btn" style="margin-top: 15px;">
        🔹 清空日志
      </button>
    </div>
    
    <div class="refresh-section">
      <button @click="refreshStatus" class="refresh-btn">🔄 刷新连接状态</button>
      <p class="timestamp">最后更新: {{ lastUpdate }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { io } from 'socket.io-client'

const mongoStatus = ref({
  connected: false,
  uri: 'N/A'
})

const redisStatus = ref({
  connected: false,
  host: 'N/A',
  port: 'N/A'
})

const lastUpdate = ref('N/A')
const testingMongo = ref(false)
const testingRedis = ref(false)
const mongoTestResult = ref(null)
const redisTestResult = ref(null)

const testUsername = ref('testuser')
const testPassword = ref('password123')
const token = ref(localStorage.getItem('test_token') || '')
const testingAuth = ref(false)
const authTestResult = ref(null)

const socketConnected = ref(false)
const socketId = ref('')
const testingSocket = ref(false)
const socketTestResult = ref(null)
let socket = null

const testLogs = ref([])

const addLog = (message, type = 'info') => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  testLogs.value.unshift({
    time,
    message,
    type
  })
  if (testLogs.value.length > 50) {
    testLogs.value.pop()
  }
}

const clearLogs = () => {
  testLogs.value = []
}

const refreshStatus = async () => {
  try {
    const response = await axios.get('/api/test/status')
    const data = response.data
    
    mongoStatus.value = data.mongodb
    redisStatus.value = data.redis
    lastUpdate.value = new Date(data.timestamp).toLocaleString('zh-CN')
    
    addLog('刷新连接状态成功', 'success')
  } catch (error) {
    console.error('获取状态失败:', error)
    addLog('刷新连接状态失败', 'error')
  }
}

const testMongo = async () => {
  testingMongo.value = true
  mongoTestResult.value = null
  
  addLog('开始测试 MongoDB 连接...', 'info')
  
  try {
    const response = await axios.get('/api/test/mongo-test')
    mongoTestResult.value = response.data
    addLog(`MongoDB 测试: ${response.data.message}`, response.data.success ? 'success' : 'error')
  } catch (error) {
    mongoTestResult.value = {
      success: false,
      message: error.response?.data?.message || '连接测试失败'
    }
    addLog(`MongoDB 测试失败: ${error.message}`, 'error')
  } finally {
    testingMongo.value = false
  }
}

const testRedis = async () => {
  testingRedis.value = true
  redisTestResult.value = null
  
  addLog('开始测试 Redis 连接...', 'info')
  
  try {
    const response = await axios.get('/api/test/redis-test')
    redisTestResult.value = response.data
    addLog(`Redis 测试: ${response.data.message}`, response.data.success ? 'success' : 'error')
  } catch (error) {
    redisTestResult.value = {
      success: false,
      message: error.response?.data?.message || '连接测试失败'
    }
    addLog(`Redis 测试失败: ${error.message}`, 'error')
  } finally {
    testingRedis.value = false
  }
}

const testRegister = async () => {
  if (!testUsername.value || !testPassword.value) {
    authTestResult.value = {
      success: false,
      message: '请输入用户名和密码'
    }
    addLog('注册测试: 请输入用户名和密码', 'error')
    return
  }
  
  testingAuth.value = true
  authTestResult.value = null
  
  addLog(`开始测试注册: ${testUsername.value}`, 'info')
  
  try {
    const response = await axios.post('/api/auth/register', {
      username: testUsername.value,
      password: testPassword.value
    })
    authTestResult.value = response.data
    
    if (response.data.success) {
      token.value = response.data.data.token
      localStorage.setItem('test_token', token.value)
      addLog(`注册成功: ${testUsername.value}`, 'success')
    } else {
      addLog(`注册失败: ${response.data.message}`, 'error')
    }
  } catch (error) {
    authTestResult.value = {
      success: false,
      message: error.response?.data?.message || '注册失败'
    }
    addLog(`注册失败: ${error.response?.data?.message || error.message}`, 'error')
  } finally {
    testingAuth.value = false
  }
}

const testLogin = async () => {
  if (!testUsername.value || !testPassword.value) {
    authTestResult.value = {
      success: false,
      message: '请输入用户名和密码'
    }
    addLog('登录测试: 请输入用户名和密码', 'error')
    return
  }
  
  testingAuth.value = true
  authTestResult.value = null
  
  addLog(`开始测试登录: ${testUsername.value}`, 'info')
  
  try {
    const response = await axios.post('/api/auth/login', {
      username: testUsername.value,
      password: testPassword.value
    })
    authTestResult.value = response.data
    
    if (response.data.success) {
      token.value = response.data.data.token
      localStorage.setItem('test_token', token.value)
      addLog(`登录成功: ${testUsername.value}`, 'success')
    } else {
      addLog(`登录失败: ${response.data.message}`, 'error')
    }
  } catch (error) {
    authTestResult.value = {
      success: false,
      message: error.response?.data?.message || '登录失败'
    }
    addLog(`登录失败: ${error.response?.data?.message || error.message}`, 'error')
  } finally {
    testingAuth.value = false
  }
}

const testGetUserInfo = async () => {
  if (!token.value) {
    authTestResult.value = {
      success: false,
      message: '请先登录获取 Token'
    }
    addLog('获取用户信息: 请先登录', 'error')
    return
  }
  
  testingAuth.value = true
  authTestResult.value = null
  
  addLog('开始获取用户信息...', 'info')
  
  try {
    const response = await axios.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
    authTestResult.value = response.data
    
    if (response.data.success) {
      addLog(`获取用户信息成功: ${response.data.data.username}`, 'success')
    } else {
      addLog(`获取用户信息失败: ${response.data.message}`, 'error')
    }
  } catch (error) {
    authTestResult.value = {
      success: false,
      message: error.response?.data?.message || '获取用户信息失败'
    }
    addLog(`获取用户信息失败: ${error.response?.data?.message || error.message}`, 'error')
  } finally {
    testingAuth.value = false
  }
}

const clearAuth = () => {
  token.value = ''
  localStorage.removeItem('test_token')
  authTestResult.value = null
  addLog('已清除登录状态', 'info')
}

const testSocketConnect = async () => {
  testingSocket.value = true
  socketTestResult.value = null
  
  addLog('开始连接 Socket.io...', 'info')
  
  try {
    if (socket) {
      socket.disconnect()
    }
    
    const connectOptions = {
      transports: ['websocket', 'polling']
    }
    
    if (token.value) {
      connectOptions.auth = { token: token.value }
      addLog('使用 Token 连接 Socket...', 'info')
    }
    
    socket = io(connectOptions)
    
    socket.on('connect', () => {
      socketId.value = socket.id
      socketConnected.value = true
      socketTestResult.value = {
        success: true,
        message: `Socket 连接成功! ID: ${socket.id}`
      }
      addLog(`Socket 连接成功! ID: ${socket.id}`, 'success')
      testingSocket.value = false
    })
    
    socket.on('disconnect', (reason) => {
      socketConnected.value = false
      socketId.value = ''
      addLog(`Socket 断开连接: ${reason}`, 'info')
    })
    
    socket.on('connect_error', (error) => {
      socketTestResult.value = {
        success: false,
        message: `Socket 连接失败: ${error.message}`
      }
      addLog(`Socket 连接失败: ${error.message}`, 'error')
      testingSocket.value = false
    })
    
    setTimeout(() => {
      if (testingSocket.value) {
        testingSocket.value = false
        if (!socketConnected.value) {
          socketTestResult.value = {
            success: false,
            message: 'Socket 连接超时'
          }
          addLog('Socket 连接超时', 'error')
        }
      }
    }, 5000)
    
  } catch (error) {
    socketTestResult.value = {
      success: false,
      message: `Socket 连接异常: ${error.message}`
    }
    addLog(`Socket 连接异常: ${error.message}`, 'error')
    testingSocket.value = false
  }
}

const testSocketDisconnect = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
  socketConnected.value = false
  socketId.value = ''
  socketTestResult.value = {
    success: true,
    message: 'Socket 已断开连接'
  }
  addLog('Socket 已断开连接', 'info')
}

const testSocketReconnect = () => {
  if (!token.value) {
    socketTestResult.value = {
      success: false,
      message: '请先登录获取 Token'
    }
    addLog('Socket 重连: 请先登录', 'error')
    return
  }
  
  if (socket) {
    socket.disconnect()
  }
  
  testSocketConnect()
}

onMounted(() => {
  refreshStatus()
  if (token.value) {
    addLog('检测到已保存的 Token', 'info')
  }
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
})
</script>

<style scoped>
.test-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.section {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
}

.section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #444;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

.status-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.status-card.connected {
  border-color: #4CAF50;
}

.status-card:not(.connected) {
  border-color: #f44336;
}

.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  margin-right: 12px;
}

.status-card.connected .status-icon {
  background-color: #4CAF50;
  color: white;
}

.status-card:not(.connected) .status-icon {
  background-color: #f44336;
  color: white;
}

.status-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.status-details p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.test-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .test-form {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.form-group input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #2196F3;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.test-btn {
  padding: 10px 20px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.test-btn:hover:not(:disabled) {
  background-color: #1976D2;
}

.test-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.test-btn.primary {
  background-color: #2196F3;
}

.test-btn.primary:hover:not(:disabled) {
  background-color: #1976D2;
}

.test-btn.success {
  background-color: #4CAF50;
}

.test-btn.success:hover:not(:disabled) {
  background-color: #388E3C;
}

.test-btn.info {
  background-color: #00BCD4;
}

.test-btn.info:hover:not(:disabled) {
  background-color: #0097A7;
}

.test-btn.warning {
  background-color: #FF9800;
}

.test-btn.warning:hover:not(:disabled) {
  background-color: #F57C00;
}

.test-result, .result-card {
  margin-top: 10px;
  padding: 15px;
  border-radius: 4px;
  font-size: 14px;
}

.test-result.success, .result-card.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.test-result.error, .result-card.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.result-card h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.json-preview {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  overflow-x: auto;
}

.json-preview pre {
  margin: 0;
  font-size: 12px;
  color: #666;
  white-space: pre-wrap;
  word-break: break-all;
}

.token-info {
  margin-top: 15px;
  padding: 10px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.token-info p {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 14px;
}

.token-display {
  font-family: monospace;
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 5px;
  border-radius: 4px;
}

.socket-status {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.status-item.connected {
  color: #4CAF50;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ccc;
}

.status-item.connected .dot {
  background-color: #4CAF50;
}

.test-log {
  max-height: 300px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
}

.empty-log {
  text-align: center;
  color: #999;
  padding: 20px;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-item.success {
  color: #4CAF50;
}

.log-item.error {
  color: #f44336;
}

.log-item.info {
  color: #2196F3;
}

.log-time {
  color: #999;
  font-family: monospace;
  flex-shrink: 0;
}

.log-message {
  flex: 1;
}

.refresh-section {
  text-align: center;
  margin-top: 30px;
}

.refresh-btn {
  padding: 12px 30px;
  background-color: #9C27B0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.refresh-btn:hover {
  background-color: #7B1FA2;
}

.timestamp {
  margin-top: 15px;
  color: #888;
  font-size: 14px;
}
</style>
