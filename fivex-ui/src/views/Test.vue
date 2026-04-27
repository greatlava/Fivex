<template>
  <div class="test-container">
    <h2>系统连接状态测试</h2>
    
    <div class="status-section">
      <h3>数据库连接状态</h3>
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
    
    <div class="refresh-section">
      <button @click="refreshStatus" class="refresh-btn">刷新状态</button>
      <p class="timestamp">最后更新: {{ lastUpdate }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

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

const refreshStatus = async () => {
  try {
    const response = await axios.get('/api/test/status')
    const data = response.data
    
    mongoStatus.value = data.mongodb
    redisStatus.value = data.redis
    lastUpdate.value = new Date(data.timestamp).toLocaleString('zh-CN')
  } catch (error) {
    console.error('获取状态失败:', error)
  }
}

const testMongo = async () => {
  testingMongo.value = true
  mongoTestResult.value = null
  
  try {
    const response = await axios.get('/api/test/mongo-test')
    mongoTestResult.value = response.data
  } catch (error) {
    mongoTestResult.value = {
      success: false,
      message: error.response?.data?.message || '连接测试失败'
    }
  } finally {
    testingMongo.value = false
  }
}

const testRedis = async () => {
  testingRedis.value = true
  redisTestResult.value = null
  
  try {
    const response = await axios.get('/api/test/redis-test')
    redisTestResult.value = response.data
  } catch (error) {
    redisTestResult.value = {
      success: false,
      message: error.response?.data?.message || '连接测试失败'
    }
  } finally {
    testingRedis.value = false
  }
}

onMounted(() => {
  refreshStatus()
})
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.status-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .status-section {
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

.test-btn {
  margin-top: 15px;
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

.test-result {
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.test-result.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.test-result.error {
  background-color: #ffebee;
  color: #c62828;
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
