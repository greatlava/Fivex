<template>
  <div class="slider-captcha" :class="{ 'is-loading': isLoading, 'is-success': isSuccess, 'is-fail': isFail }">
    <div class="captcha-container" v-if="!isVerified">
      <div class="captcha-header">
        <span class="captcha-title">请滑动完成验证</span>
        <button class="refresh-btn" @click="refresh" :disabled="isLoading">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <div class="captcha-track-wrapper">
        <div class="captcha-track">
          <div class="track-bg"></div>
          
          <div class="target-container" :style="{ left: targetPosition + 'px' }">
            <div class="target-triangle">
              <svg viewBox="0 0 40 40" width="40" height="40">
                <defs>
                  <linearGradient id="targetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#E07840;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#C87040;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <polygon points="20,5 35,35 5,35" fill="url(#targetGrad)" stroke="#B06030" stroke-width="1.5"/>
                <polygon points="20,10 30,32 10,32" fill="rgba(255,255,255,0.1)"/>
              </svg>
            </div>
          </div>
          
          <div 
            class="slider-container" 
            :style="{ left: sliderPosition + 'px', transform: sliderDragging ? 'scale(1.1)' : 'scale(1)' }"
            @mousedown="handleMouseDown"
            @touchstart="handleTouchStart"
          >
            <div class="slider-triangle">
              <svg viewBox="0 0 40 40" width="40" height="40">
                <defs>
                  <linearGradient id="sliderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" :style="'stop-color:' + (sliderDragging ? '#F08850' : '#E07840') + ';stop-opacity:1'" />
                    <stop offset="100%" :style="'stop-color:' + (sliderDragging ? '#D88045' : '#C87040') + ';stop-opacity:1'" />
                  </linearGradient>
                </defs>
                <polygon points="20,5 35,35 5,35" fill="url(#sliderGrad)" stroke="#B06030" stroke-width="1.5"/>
                <polygon points="20,10 30,32 10,32" fill="rgba(255,255,255,0.15)"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="slider-bar">
          <div class="bar-bg"></div>
          <div class="bar-progress" :style="{ width: (sliderPosition / trackWidth) * 100 + '%' }"></div>
          <div 
            class="bar-handle" 
            :style="{ left: sliderPosition + 'px' }"
            @mousedown="handleMouseDown"
            @touchstart="handleTouchStart"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="bar-text">{{ barText }}</span>
        </div>
      </div>
      
      <div class="captcha-tip" v-if="tipText">
        <span :class="{ 'success': tipType === 'success', 'error': tipType === 'error' }">{{ tipText }}</span>
      </div>
    </div>
    
    <div class="captcha-success" v-if="isVerified">
      <div class="success-icon">
        <svg viewBox="0 0 48 48" width="48" height="48">
          <circle cx="24" cy="24" r="22" fill="#66BB6A"/>
          <path d="M20 28L14 22M34 16L20 28" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <span class="success-text">验证成功</span>
      <button class="reverify-btn" @click="refresh">重新验证</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['verify', 'update:modelValue'])

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ captchaId: null, isVerified: false })
  }
})

const trackWidth = ref(260)
const sliderPosition = ref(0)
const targetPosition = ref(140)
const captchaId = ref(null)
const isLoading = ref(false)
const isSuccess = ref(false)
const isFail = ref(false)
const isVerified = ref(false)
const sliderDragging = ref(false)
const startX = ref(0)
const startSliderX = ref(0)
const tipText = ref('')
const tipType = ref('')

const barText = computed(() => {
  if (isLoading.value) return '加载中...'
  if (sliderDragging.value) return '松开完成验证'
  if (isSuccess.value) return '验证成功'
  if (isFail.value) return '验证失败，请重试'
  return '向右拖动完成验证'
})

const refresh = async () => {
  isLoading.value = true
  isSuccess.value = false
  isFail.value = false
  isVerified.value = false
  sliderPosition.value = 0
  tipText.value = ''
  
  emit('update:modelValue', { captchaId: null, isVerified: false })
  
  try {
    const { authApi } = await import('@/api/auth')
    const result = await authApi.generateCaptcha()
    if (result.success) {
      captchaId.value = result.data.captchaId
      targetPosition.value = Math.min(Math.max(result.data.targetPosition, 40), trackWidth.value - 60)
    }
  } catch (error) {
    console.error('[Captcha] 生成验证码失败:', error)
    targetPosition.value = Math.floor(Math.random() * (trackWidth.value - 100)) + 50
  } finally {
    isLoading.value = false
  }
}

const handleMouseDown = (e) => {
  if (isLoading.value || isVerified.value) return
  
  sliderDragging.value = true
  startX.value = e.clientX
  startSliderX.value = sliderPosition.value
  
  tipText.value = ''
}

const handleMouseMove = (e) => {
  if (!sliderDragging.value) return
  
  const deltaX = e.clientX - startX.value
  let newPosition = startSliderX.value + deltaX
  
  newPosition = Math.max(0, Math.min(newPosition, trackWidth.value))
  
  sliderPosition.value = newPosition
}

const handleMouseUp = async () => {
  if (!sliderDragging.value) return
  
  sliderDragging.value = false
  
  await verifyPosition()
}

const handleTouchStart = (e) => {
  if (isLoading.value || isVerified.value) return
  
  const touch = e.touches[0]
  sliderDragging.value = true
  startX.value = touch.clientX
  startSliderX.value = sliderPosition.value
  
  tipText.value = ''
}

const handleTouchMove = (e) => {
  if (!sliderDragging.value) return
  
  const touch = e.touches[0]
  const deltaX = touch.clientX - startX.value
  let newPosition = startSliderX.value + deltaX
  
  newPosition = Math.max(0, Math.min(newPosition, trackWidth.value))
  
  sliderPosition.value = newPosition
}

const handleTouchEnd = async () => {
  if (!sliderDragging.value) return
  
  sliderDragging.value = false
  
  await verifyPosition()
}

const verifyPosition = async () => {
  const tolerance = 8
  
  const positionDiff = Math.abs(sliderPosition.value - targetPosition.value)
  
  try {
    const { authApi } = await import('@/api/auth')
    const result = await authApi.verifyCaptcha(captchaId.value, sliderPosition.value)
    
    if (result.success && result.data.isVerified) {
      isSuccess.value = true
      isVerified.value = true
      tipText.value = '验证成功！'
      tipType.value = 'success'
      
      emit('update:modelValue', { 
        captchaId: captchaId.value, 
        isVerified: true 
      })
      emit('verify', { 
        success: true, 
        captchaId: captchaId.value 
      })
    } else {
      isFail.value = true
      tipText.value = '验证失败，请重试'
      tipType.value = 'error'
      
      emit('verify', { 
        success: false, 
        reason: '位置不匹配' 
      })
      
      setTimeout(() => {
        if (!isVerified.value) {
          sliderPosition.value = 0
          isFail.value = false
          refresh()
        }
      }, 1000)
    }
  } catch (error) {
    console.error('[Captcha] 验证失败:', error)
    
    if (positionDiff <= tolerance) {
      isSuccess.value = true
      isVerified.value = true
      tipText.value = '验证成功！'
      tipType.value = 'success'
      
      emit('update:modelValue', { 
        captchaId: captchaId.value, 
        isVerified: true 
      })
      emit('verify', { 
        success: true, 
        captchaId: captchaId.value 
      })
    } else {
      isFail.value = true
      tipText.value = '验证失败，请重试'
      tipType.value = 'error'
      
      emit('verify', { 
        success: false, 
        reason: '位置不匹配' 
      })
      
      setTimeout(() => {
        if (!isVerified.value) {
          sliderPosition.value = 0
          isFail.value = false
          refresh()
        }
      }, 1000)
    }
  }
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
  
  refresh()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<style scoped>
.slider-captcha {
  width: 100%;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-card);
  overflow: hidden;
}

.slider-captcha.is-loading {
  opacity: 0.7;
}

.slider-captcha.is-success .slider-bar {
  background: rgba(102, 187, 106, 0.1);
}

.slider-captcha.is-fail .slider-bar {
  background: rgba(239, 83, 80, 0.1);
}

.captcha-container {
  padding: 16px;
}

.captcha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.captcha-title {
  font-size: 13px;
  color: var(--txt-secondary);
  font-weight: 500;
}

.refresh-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--txt-muted);
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--bg-rp);
  color: var(--txt-secondary);
}

.refresh-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.captcha-track-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.captcha-track {
  position: relative;
  height: 60px;
  background: var(--bg-rp);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.track-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.02) 0px,
    rgba(0, 0, 0, 0.02) 2px,
    transparent 2px,
    transparent 10px
  );
}

.target-container {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: opacity 0.3s;
}

.target-triangle {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  opacity: 0.8;
}

.slider-container {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: grab;
  transition: transform 0.1s;
  z-index: 10;
}

.slider-container:active {
  cursor: grabbing;
}

.slider-triangle {
  filter: drop-shadow(0 2px 6px rgba(224, 120, 64, 0.4));
}

.slider-bar {
  position: relative;
  height: 40px;
  background: var(--bg-rp);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 44px 0 12px;
}

.bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid var(--border-card);
  border-radius: inherit;
}

.bar-progress {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(224, 120, 64, 0.15), rgba(224, 120, 64, 0.25));
  border-radius: inherit;
  transition: width 0.1s linear;
}

.bar-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 32px;
  background: var(--accent);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 2px 6px rgba(224, 120, 64, 0.3);
  color: white;
  transition: all 0.1s;
  margin-left: -18px;
}

.bar-handle:active {
  cursor: grabbing;
  transform: translateY(-50%) scale(1.1);
}

.bar-text {
  position: relative;
  font-size: 12px;
  color: var(--txt-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.captcha-tip {
  margin-top: 8px;
  text-align: center;
}

.captcha-tip span {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.captcha-tip span.success {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.captcha-tip span.error {
  color: #F44336;
  background: rgba(244, 67, 54, 0.1);
}

.captcha-success {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(102, 187, 106, 0.05);
}

.success-icon {
  flex-shrink: 0;
}

.success-text {
  flex: 1;
  font-size: 14px;
  color: #4CAF50;
  font-weight: 500;
}

.reverify-btn {
  flex-shrink: 0;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--txt-secondary);
  background: var(--bg-rp);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.reverify-btn:hover {
  background: var(--bg-card-empty);
}
</style>
