<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <div class="modal-tabs">
              <button 
                class="tab-btn" 
                :class="{ active: currentTab === 'login' }"
                @click="switchTab('login')"
              >
                登录
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: currentTab === 'register' }"
                @click="switchTab('register')"
              >
                注册
              </button>
            </div>
            <button class="close-btn" @click="close">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div v-show="currentTab === 'login'" class="form-content">
                <div class="form-group">
                  <label class="form-label">用户名</label>
                  <input 
                    v-model="loginForm.username"
                    type="text"
                    class="form-input"
                    placeholder="请输入用户名"
                    autocomplete="username"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">密码</label>
                  <div class="input-wrapper">
                    <input 
                      v-model="loginForm.password"
                      :type="showLoginPassword ? 'text' : 'password'"
                      class="form-input"
                      placeholder="请输入密码"
                      autocomplete="current-password"
                    />
                    <button 
                      type="button" 
                      class="password-toggle"
                      @click="showLoginPassword = !showLoginPassword"
                    >
                      <svg v-if="!showLoginPassword" viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-show="currentTab === 'register'" class="form-content">
                <div class="form-group">
                  <label class="form-label">用户名</label>
                  <input 
                    v-model="registerForm.username"
                    type="text"
                    class="form-input"
                    placeholder="3-20个字符"
                    autocomplete="username"
                  />
                  <div class="form-tip" v-if="usernameError">{{ usernameError }}</div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">昵称</label>
                  <input 
                    v-model="registerForm.nickname"
                    type="text"
                    class="form-input"
                    placeholder="2-20个字符，显示给其他玩家看"
                  />
                  <div class="form-tip" v-if="nicknameError">{{ nicknameError }}</div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">密码</label>
                  <div class="input-wrapper">
                    <input 
                      v-model="registerForm.password"
                      :type="showRegisterPassword ? 'text' : 'password'"
                      class="form-input"
                      placeholder="至少6个字符"
                      autocomplete="new-password"
                    />
                    <button 
                      type="button" 
                      class="password-toggle"
                      @click="showRegisterPassword = !showRegisterPassword"
                    >
                      <svg v-if="!showRegisterPassword" viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                  <div class="form-tip" v-if="passwordError">{{ passwordError }}</div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">选择头像</label>
                  <AvatarSelector v-model="registerForm.avatar" />
                </div>
                
                <div class="form-group">
                  <label class="form-label">验证码</label>
                  <SliderCaptcha 
                    v-model="captchaData"
                    @verify="handleCaptchaVerify"
                  />
                  <div class="form-tip" v-if="captchaError">{{ captchaError }}</div>
                </div>
              </div>
              
              <div class="form-error" v-if="errorMessage">
                {{ errorMessage }}
              </div>
              
              <button 
                type="submit" 
                class="submit-btn"
                :disabled="isSubmitting"
              >
                <span v-if="!isSubmitting">{{ currentTab === 'login' ? '登录' : '注册' }}</span>
                <span v-else class="loading-spinner"></span>
              </button>
            </form>
            
            <div class="quick-login" v-if="currentTab === 'register'">
              <span>已有账号？</span>
              <button class="link-btn" @click="switchTab('login')">立即登录</button>
            </div>
            
            <div class="quick-login" v-if="currentTab === 'login'">
              <span>还没有账号？</span>
              <button class="link-btn" @click="switchTab('register')">立即注册</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import authApi from '@/api/auth'
import AvatarSelector from './AvatarSelector.vue'
import SliderCaptcha from './SliderCaptcha.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  initialTab: {
    type: String,
    default: 'login'
  },
  pendingAction: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'login-success', 'register-success'])

const userStore = useUserStore()

const currentTab = ref(props.initialTab)
const isSubmitting = ref(false)
const errorMessage = ref('')

const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)

const usernameError = ref('')
const nicknameError = ref('')
const passwordError = ref('')
const captchaError = ref('')

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  nickname: '',
  password: '',
  avatar: 'avatar-1'
})

const captchaData = ref({
  captchaId: null,
  isVerified: false
})

watch(
  () => props.visible,
  (newValue) => {
    if (!newValue) {
      resetForm()
    }
  }
)

watch(
  () => props.initialTab,
  (newValue) => {
    if (newValue === 'login' || newValue === 'register') {
      currentTab.value = newValue
    }
  }
)

const switchTab = (tab) => {
  currentTab.value = tab
  errorMessage.value = ''
  clearErrors()
}

const clearErrors = () => {
  usernameError.value = ''
  nicknameError.value = ''
  passwordError.value = ''
  captchaError.value = ''
}

const resetForm = () => {
  loginForm.value = { username: '', password: '' }
  registerForm.value = {
    username: '',
    nickname: '',
    password: '',
    avatar: 'avatar-1'
  }
  captchaData.value = { captchaId: null, isVerified: false }
  errorMessage.value = ''
  clearErrors()
  showLoginPassword.value = false
  showRegisterPassword.value = false
}

const validateRegisterForm = () => {
  let isValid = true
  clearErrors()
  
  if (!registerForm.value.username) {
    usernameError.value = '请输入用户名'
    isValid = false
  } else if (registerForm.value.username.length < 3 || registerForm.value.username.length > 20) {
    usernameError.value = '用户名长度必须在 3-20 个字符之间'
    isValid = false
  }
  
  if (!registerForm.value.nickname) {
    nicknameError.value = '请输入昵称'
    isValid = false
  } else if (registerForm.value.nickname.length < 2 || registerForm.value.nickname.length > 20) {
    nicknameError.value = '昵称长度必须在 2-20 个字符之间'
    isValid = false
  }
  
  if (!registerForm.value.password) {
    passwordError.value = '请输入密码'
    isValid = false
  } else if (registerForm.value.password.length < 6) {
    passwordError.value = '密码长度不能少于 6 个字符'
    isValid = false
  }
  
  if (!captchaData.value.isVerified) {
    captchaError.value = '请完成验证码验证'
    isValid = false
  }
  
  return isValid
}

const handleCaptchaVerify = (result) => {
  if (result.success) {
    captchaError.value = ''
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  
  if (currentTab.value === 'login') {
    if (!loginForm.value.username || !loginForm.value.password) {
      errorMessage.value = '请输入用户名和密码'
      return
    }
    
    await handleLogin()
  } else {
    if (!validateRegisterForm()) {
      return
    }
    
    await handleRegister()
  }
}

const handleLogin = async () => {
  isSubmitting.value = true
  
  try {
    const result = await authApi.login(loginForm.value.username, loginForm.value.password)
    
    if (result.success) {
      userStore.setToken(result.data.token)
      userStore.setUserInfo(result.data.user)
      
      emit('login-success', {
        user: result.data.user,
        pendingAction: props.pendingAction
      })
      
      emit('update:visible', false)
    } else {
      errorMessage.value = result.message || '登录失败'
    }
  } catch (error) {
    console.error('[AuthModal] 登录错误:', error)
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = '登录失败，请稍后重试'
    }
  } finally {
    isSubmitting.value = false
  }
}

const resetCaptcha = () => {
  captchaData.value = { captchaId: null, isVerified: false }
}

const handleRegister = async () => {
  isSubmitting.value = true
  
  try {
    const result = await authApi.register({
      username: registerForm.value.username,
      password: registerForm.value.password,
      nickname: registerForm.value.nickname,
      avatar: registerForm.value.avatar,
      captchaId: captchaData.value.captchaId
    })
    
    if (result.success) {
      userStore.setToken(result.data.token)
      userStore.setUserInfo(result.data.user)
      
      emit('register-success', {
        user: result.data.user,
        pendingAction: props.pendingAction
      })
      
      emit('update:visible', false)
    } else {
      errorMessage.value = result.message || '注册失败'
      resetCaptcha()
    }
  } catch (error) {
    console.error('[AuthModal] 注册错误:', error)
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = '注册失败，请稍后重试'
    }
    resetCaptcha()
  } finally {
    isSubmitting.value = false
  }
}

const close = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop);
  padding: 16px;
}

.modal-container {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-card);
  background: var(--bg-page);
}

.modal-tabs {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--txt-muted);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--bg-rp);
  color: var(--txt-secondary);
}

.tab-btn.active {
  background: var(--accent);
  color: white;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--txt-muted);
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
}

.close-btn:hover {
  background: var(--bg-rp);
  color: var(--txt-secondary);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  color: var(--txt-secondary);
  font-weight: 500;
}

.form-input {
  height: 44px;
  padding: 0 36px 0 12px;
  font-size: 14px;
  color: var(--txt-primary);
  background: var(--bg-main);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-md);
  outline: none;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(224, 120, 64, 0.1);
}

.form-input::placeholder {
  color: var(--txt-faint);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--txt-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.password-toggle:hover {
  color: var(--txt-secondary);
}

.form-tip {
  font-size: 12px;
  color: var(--color-error);
  margin-top: 2px;
}

.form-error {
  padding: 10px 12px;
  background: rgba(239, 83, 80, 0.1);
  border: 1px solid rgba(239, 83, 80, 0.3);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-error);
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
  height: 46px;
  margin-top: 8px;
  font-size: 15px;
  font-weight: 500;
  color: white;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-light);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.quick-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 20px;
  font-size: 13px;
  color: var(--txt-muted);
}

.link-btn {
  background: transparent;
  border: none;
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
}
</style>
