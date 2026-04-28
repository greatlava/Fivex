<template>
  <div class="slider-captcha-wrapper">
    <Teleport to="body">
      <Transition name="captcha-modal">
        <div v-if="showModal" class="captcha-modal-overlay" @click.self="closeModal">
          <div class="captcha-modal" @click.stop>
            <div class="captcha-modal-header">
              <span class="captcha-modal-title">安全验证</span>
              <button class="captcha-close-btn" @click="closeModal">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            
            <div class="captcha-modal-body">
              <div class="captcha-tip-text">请完成以下验证</div>
              
              <div class="captcha-image-wrapper" :class="{ 'is-success': isSuccess, 'is-fail': isFail }">
                <div class="captcha-bg-layer">
                  <div class="captcha-pattern" v-for="i in 15" :key="i" :style="getPatternStyle(i)"></div>
                </div>
                
                <div class="distractor-block" v-for="(distractor, index) in distractors" :key="'distractor-' + index"
                  :style="{ left: distractor.left + 'px', top: distractor.top + 'px' }">
                  <svg viewBox="0 0 44 44" width="44" height="44">
                    <defs>
                      <linearGradient :id="'distractorGrad-' + index" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#9E9E9E;stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:#757575;stop-opacity:0.8" />
                      </linearGradient>
                    </defs>
                    <polygon points="22,4 40,36 4,36" :fill="'url(#distractorGrad-' + index + ')'" stroke="#616161" stroke-width="1.5"/>
                    <polygon points="22,9 35,33 9,33" fill="rgba(255,255,255,0.08)"/>
                  </svg>
                </div>
                
                <div class="target-block" :style="{ left: targetPosition + 'px', top: targetTop + 'px' }">
                  <svg viewBox="0 0 44 44" width="44" height="44">
                    <defs>
                      <linearGradient id="targetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#E07840;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#C87040;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <polygon points="22,4 40,36 4,36" fill="url(#targetGrad)" stroke="#B06030" stroke-width="1.5"/>
                    <polygon points="22,9 35,33 9,33" fill="rgba(255,255,255,0.1)"/>
                  </svg>
                </div>
                
                <div class="target-slot" :style="{ left: targetPosition + 'px', top: targetTop + 'px' }">
                  <svg viewBox="0 0 44 44" width="44" height="44">
                    <polygon points="22,4 40,36 4,36" fill="rgba(0,0,0,0.3)" stroke="rgba(0,0,0,0.4)" stroke-width="1.5" stroke-dasharray="4 2"/>
                  </svg>
                </div>
                
                <div class="slider-block" 
                  :class="{ 'is-dragging': sliderDragging }"
                  :style="{ left: sliderPosition + 'px', top: targetTop + 'px' }"
                  @mousedown="handleMouseDown"
                  @touchstart="handleTouchStart"
                >
                  <svg viewBox="0 0 44 44" width="44" height="44">
                    <defs>
                      <linearGradient id="sliderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop :offset="'0%'" :style="'stop-color:' + (sliderDragging ? '#F08850' : '#E07840') + ';stop-opacity:1'" />
                        <stop :offset="'100%'" :style="'stop-color:' + (sliderDragging ? '#D88045' : '#C87040') + ';stop-opacity:1'" />
                      </linearGradient>
                    </defs>
                    <polygon points="22,4 40,36 4,36" fill="url(#sliderGrad)" stroke="#B06030" stroke-width="1.5"/>
                    <polygon points="22,9 35,33 9,33" fill="rgba(255,255,255,0.15)"/>
                  </svg>
                </div>
              </div>
              
              <div class="slider-bar-wrapper">
                <div class="slider-bar" :class="{ 'is-success': isSuccess, 'is-fail': isFail }">
                  <div class="slider-bar-bg"></div>
                  <div class="slider-bar-progress" :style="{ width: (sliderPosition / maxSliderDistance) * 100 + '%' }"></div>
                  
                  <div 
                    class="slider-bar-handle" 
                    :class="{ 'is-dragging': sliderDragging, 'is-success': isSuccess, 'is-fail': isFail }"
                    :style="{ left: sliderPosition + 'px' }"
                    @mousedown="handleMouseDown"
                    @touchstart="handleTouchStart"
                  >
                    <svg v-if="!isSuccess && !isFail" viewBox="0 0 24 24" width="18" height="18">
                      <path d="M6.23 20.23L8 22l10-10L8 2 6.23 3.77 14.46 12z" fill="currentColor"/>
                      <path d="M9.5 8.5L13.5 12L9.5 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    </svg>
                    <svg v-else-if="isSuccess" viewBox="0 0 24 24" width="18" height="18">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="18" height="18">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  <span class="slider-bar-text">{{ barText }}</span>
                </div>
              </div>
              
              <div class="captcha-result" v-if="tipText">
                <span :class="{ 'success': tipType === 'success', 'error': tipType === 'error' }">
                  {{ tipText }}
                </span>
              </div>
            </div>
            
            <div class="captcha-modal-footer">
              <button class="refresh-btn" @click="refreshCaptcha" :disabled="isLoading">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                </svg>
                换一张
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <div class="captcha-trigger" @click="openModal">
      <div class="captcha-trigger-icon">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
      </div>
      <span class="captcha-trigger-text">{{ triggerText }}</span>
      <div class="captcha-status" v-if="isVerified">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <circle cx="12" cy="12" r="10" fill="#66BB6A"/>
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['verify', 'update:modelValue'])

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ captchaId: null, isVerified: false })
  }
})

const showModal = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)
const isFail = ref(false)
const isVerified = ref(props.modelValue?.isVerified || false)
const captchaId = ref(props.modelValue?.captchaId || null)

const imageWidth = ref(300)
const imageHeight = ref(150)
const targetPosition = ref(180)
const targetTop = ref(53)
const sliderPosition = ref(0)
const sliderDragging = ref(false)
const startX = ref(0)
const startSliderX = ref(0)
const tipText = ref('')
const tipType = ref('')

const maxSliderDistance = computed(() => imageWidth.value - 44)

const distractors = ref([])

const generateDistractors = () => {
  const list = []
  const count = Math.floor(Math.random() * 2) + 1
  const usedPositions = []
  
  for (let i = 0; i < count; i++) {
    let left, top
    let attempts = 0
    
    do {
      left = Math.floor(Math.random() * (imageWidth.value - 80)) + 20
      top = Math.floor(Math.random() * (imageHeight.value - 80)) + 20
      attempts++
    } while (
      attempts < 20 &&
      (Math.abs(left - targetPosition.value) < 60 ||
       usedPositions.some(p => Math.abs(p.left - left) < 60))
    )
    
    if (attempts < 20) {
      list.push({ left, top })
      usedPositions.push({ left, top })
    }
  }
  
  distractors.value = list
}

const triggerText = computed(() => {
  if (isVerified.value) return '已验证'
  return '点击完成安全验证'
})

const barText = computed(() => {
  if (isLoading.value) return '加载中...'
  if (isSuccess.value) return '验证成功'
  if (isFail.value) return '验证失败，请重试'
  if (sliderDragging.value) return '松开完成验证'
  return '拖动滑块完成验证'
})

const getPatternStyle = (index) => {
  const patterns = [
    { type: 'dot', size: 4, color: 'rgba(180, 160, 140, 0.15)' },
    { type: 'dot', size: 6, color: 'rgba(180, 160, 140, 0.1)' },
    { type: 'line', width: 1, color: 'rgba(180, 160, 140, 0.08)' }
  ]
  const pattern = patterns[index % patterns.length]
  const x = (index * 37) % imageWidth.value
  const y = (index * 23) % imageHeight.value
  
  if (pattern.type === 'dot') {
    return {
      position: 'absolute',
      left: x + 'px',
      top: y + 'px',
      width: pattern.size + 'px',
      height: pattern.size + 'px',
      borderRadius: '50%',
      background: pattern.color
    }
  }
  return {
    position: 'absolute',
    left: x + 'px',
    top: y + 'px',
    width: '30px',
    height: pattern.width + 'px',
    background: pattern.color,
    transform: `rotate(${index * 30}deg)`
  }
}

const openModal = () => {
  if (isVerified.value) return
  showModal.value = true
  refreshCaptcha()
}

const closeModal = () => {
  showModal.value = false
  if (!isVerified.value) {
    resetState()
  }
}

const resetState = () => {
  sliderPosition.value = 0
  isSuccess.value = false
  isFail.value = false
  tipText.value = ''
  tipType.value = ''
}

const refreshCaptcha = async () => {
  isLoading.value = true
  resetState()
  
  try {
    const { authApi } = await import('@/api/auth')
    const result = await authApi.generateCaptcha()
    if (result.success) {
      captchaId.value = result.data.captchaId
      targetPosition.value = Math.min(Math.max(result.data.targetPosition, 60), maxSliderDistance.value - 20)
    } else {
      targetPosition.value = Math.floor(Math.random() * (maxSliderDistance.value - 100)) + 60
    }
  } catch (error) {
    console.error('[Captcha] 生成验证码失败:', error)
    targetPosition.value = Math.floor(Math.random() * (maxSliderDistance.value - 100)) + 60
  }
  
  generateDistractors()
  isLoading.value = false
}

const handleMouseDown = (e) => {
  if (isLoading.value || isSuccess.value) return
  
  sliderDragging.value = true
  startX.value = e.clientX
  startSliderX.value = sliderPosition.value
  
  tipText.value = ''
}

const handleMouseMove = (e) => {
  if (!sliderDragging.value) return
  
  const deltaX = e.clientX - startX.value
  let newPosition = startSliderX.value + deltaX
  
  newPosition = Math.max(0, Math.min(newPosition, maxSliderDistance.value))
  
  sliderPosition.value = newPosition
}

const handleMouseUp = async () => {
  if (!sliderDragging.value) return
  
  sliderDragging.value = false
  
  await verifyPosition()
}

const handleTouchStart = (e) => {
  if (isLoading.value || isSuccess.value) return
  e.preventDefault()
  
  const touch = e.touches[0]
  sliderDragging.value = true
  startX.value = touch.clientX
  startSliderX.value = sliderPosition.value
  
  tipText.value = ''
}

const handleTouchMove = (e) => {
  if (!sliderDragging.value) return
  e.preventDefault()
  
  const touch = e.touches[0]
  const deltaX = touch.clientX - startX.value
  let newPosition = startSliderX.value + deltaX
  
  newPosition = Math.max(0, Math.min(newPosition, maxSliderDistance.value))
  
  sliderPosition.value = newPosition
}

const handleTouchEnd = async () => {
  if (!sliderDragging.value) return
  
  sliderDragging.value = false
  
  await verifyPosition()
}

const verifyPosition = async () => {
  const tolerance = 10
  
  const positionDiff = Math.abs(sliderPosition.value - targetPosition.value)
  const isMatch = positionDiff <= tolerance
  
  try {
    const { authApi } = await import('@/api/auth')
    const result = await authApi.verifyCaptcha(captchaId.value, sliderPosition.value)
    
    if (result.success && result.data.isVerified) {
      handleVerifySuccess()
    } else {
      handleVerifyFail()
    }
  } catch (error) {
    console.error('[Captcha] 验证失败:', error)
    
    if (isMatch) {
      handleVerifySuccess()
    } else {
      handleVerifyFail()
    }
  }
}

const handleVerifySuccess = () => {
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
  
  setTimeout(() => {
    closeModal()
  }, 800)
}

const handleVerifyFail = () => {
  isFail.value = true
  tipText.value = '验证失败，请重试'
  tipType.value = 'error'
  
  emit('verify', { 
    success: false, 
    reason: '位置不匹配' 
  })
  
  setTimeout(() => {
    if (!isVerified.value) {
      refreshCaptcha()
    }
  }, 1200)
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue.isVerified === false) {
      isVerified.value = false
      captchaId.value = null
      isSuccess.value = false
      isFail.value = false
      resetState()
    }
  },
  { deep: true }
)

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<style scoped>
.slider-captcha-wrapper {
  width: 100%;
}

.captcha-modal-enter-active,
.captcha-modal-leave-active {
  transition: opacity 0.2s ease;
}

.captcha-modal-enter-from,
.captcha-modal-leave-to {
  opacity: 0;
}

.captcha-modal-enter-active .captcha-modal,
.captcha-modal-leave-active .captcha-modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.captcha-modal-enter-from .captcha-modal,
.captcha-modal-leave-to .captcha-modal {
  transform: scale(0.9);
  opacity: 0;
}

.captcha-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.captcha-modal {
  width: 340px;
  background: #FAF8F4;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.captcha-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #E8DDD0;
  background: #F0EBE2;
}

.captcha-modal-title {
  font-size: 14px;
  font-weight: 600;
  color: #5A4030;
}

.captcha-close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #9A8878;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s;
}

.captcha-close-btn:hover {
  background: #E8E0D4;
  color: #5A4030;
}

.captcha-modal-body {
  padding: 16px;
}

.captcha-tip-text {
  font-size: 13px;
  color: #806858;
  text-align: center;
  margin-bottom: 12px;
}

.captcha-image-wrapper {
  position: relative;
  width: 100%;
  height: 150px;
  background: linear-gradient(135deg, #E8E0D4 0%, #D8D0C4 100%);
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #C8BFB0;
}

.captcha-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.captcha-pattern {
  pointer-events: none;
}

.target-slot {
  position: absolute;
  width: 44px;
  height: 44px;
  pointer-events: none;
}

.target-block {
  position: absolute;
  width: 44px;
  height: 44px;
  pointer-events: none;
  opacity: 0.3;
}

.distractor-block {
  position: absolute;
  width: 44px;
  height: 44px;
  pointer-events: none;
  opacity: 0.4;
}

.slider-block {
  position: absolute;
  width: 44px;
  height: 44px;
  cursor: grab;
  transition: transform 0.1s;
  filter: drop-shadow(0 2px 8px rgba(224, 120, 64, 0.5));
}

.slider-block.is-dragging {
  cursor: grabbing;
  transform: scale(1.05);
  filter: drop-shadow(0 4px 12px rgba(224, 120, 64, 0.6));
}

.slider-bar-wrapper {
  margin-top: 12px;
}

.slider-bar {
  position: relative;
  height: 38px;
  background: #F0EBE2;
  border-radius: 6px;
  border: 1px solid #D8CFC0;
  overflow: hidden;
}

.slider-bar.is-success {
  background: rgba(102, 187, 106, 0.1);
  border-color: rgba(102, 187, 106, 0.3);
}

.slider-bar.is-fail {
  background: rgba(239, 83, 80, 0.1);
  border-color: rgba(239, 83, 80, 0.3);
}

.slider-bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.slider-bar-progress {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(224, 120, 64, 0.2), rgba(224, 120, 64, 0.3));
  border-radius: 5px;
  transition: width 0.05s linear;
}

.slider-bar-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 30px;
  background: #E07840;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(224, 120, 64, 0.4);
  color: white;
  transition: all 0.1s;
  margin-left: 0;
}

.slider-bar-handle.is-dragging {
  cursor: grabbing;
  transform: translateY(-50%) scale(1.08);
  background: #F08850;
}

.slider-bar-handle.is-success {
  background: #66BB6A;
  box-shadow: 0 2px 8px rgba(102, 187, 106, 0.4);
}

.slider-bar-handle.is-fail {
  background: #EF5350;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.4);
}

.slider-bar-text {
  position: relative;
  text-align: center;
  line-height: 38px;
  font-size: 12px;
  color: #9A8878;
  pointer-events: none;
  padding-left: 20px;
}

.slider-bar.is-success .slider-bar-text {
  color: #66BB6A;
}

.slider-bar.is-fail .slider-bar-text {
  color: #EF5350;
}

.captcha-result {
  text-align: center;
  margin-top: 10px;
}

.captcha-result span {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
}

.captcha-result span.success {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.captcha-result span.error {
  color: #F44336;
  background: rgba(244, 67, 54, 0.1);
}

.captcha-modal-footer {
  padding: 10px 16px 16px;
  display: flex;
  justify-content: flex-end;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 12px;
  color: #806858;
  background: transparent;
  border: 1px solid #D8CFC0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #E8E0D4;
  border-color: #C8BFB0;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.captcha-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 12px;
  background: #FAF8F4;
  border: 1px solid #D8CFC0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.captcha-trigger:hover {
  border-color: #C8BFB0;
  background: #F5F0E8;
}

.captcha-trigger-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E07840;
}

.captcha-trigger-text {
  flex: 1;
  font-size: 13px;
  color: #806858;
}

.captcha-status {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
