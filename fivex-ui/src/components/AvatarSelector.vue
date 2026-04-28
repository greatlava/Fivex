<template>
  <div class="avatar-selector" :class="{ disabled: disabled }">
    <div class="avatar-list" v-if="!disabled">
      <div
        v-for="avatar in avatars"
        :key="avatar.id"
        class="avatar-item"
        :class="{ selected: selectedAvatar === avatar.id }"
        @click="selectAvatar(avatar.id)"
      >
        <div class="avatar-preview" :style="avatar.style">
          <svg :viewBox="avatar.svgData.viewBox" class="avatar-svg">
            <defs>
              <linearGradient v-if="avatar.svgData.gradient" :id="'grad-' + avatar.id" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :style="'stop-color:' + avatar.svgData.gradient.start" />
                <stop offset="100%" :style="'stop-color:' + avatar.svgData.gradient.end" />
              </linearGradient>
            </defs>
            <path
              v-for="(path, index) in avatar.svgData.paths"
              :key="index"
              :d="path.d"
              :fill="path.fill || ('url(#grad-' + avatar.id + ')')"
              :stroke="path.stroke"
              :stroke-width="path.strokeWidth || 0"
            />
            <circle
              v-for="(circle, index) in avatar.svgData.circles"
              :key="'circle-' + index"
              :cx="circle.cx"
              :cy="circle.cy"
              :r="circle.r"
              :fill="circle.fill"
            />
          </svg>
        </div>
        <div class="check-mark" v-if="selectedAvatar === avatar.id">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
          </svg>
        </div>
      </div>
    </div>
    <div class="avatar-preview-large" v-if="selectedAvatar">
      <div class="large-avatar" :style="currentAvatarStyle">
        <svg :viewBox="currentAvatarSvg.viewBox" class="large-avatar-svg">
          <defs>
            <linearGradient v-if="currentAvatarSvg.gradient" id="large-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" :style="'stop-color:' + currentAvatarSvg.gradient.start" />
              <stop offset="100%" :style="'stop-color:' + currentAvatarSvg.gradient.end" />
            </linearGradient>
          </defs>
          <path
            v-for="(path, index) in currentAvatarSvg.paths"
            :key="index"
            :d="path.d"
            :fill="path.fill || 'url(#large-grad)'"
            :stroke="path.stroke"
            :stroke-width="path.strokeWidth || 0"
          />
          <circle
            v-for="(circle, index) in currentAvatarSvg.circles"
            :key="'circle-' + index"
            :cx="circle.cx"
            :cy="circle.cy"
            :r="circle.r"
            :fill="circle.fill"
          />
        </svg>
      </div>
      <span class="avatar-name">{{ currentAvatarName }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'avatar-1'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const avatars = [
  {
    id: 'avatar-1',
    name: '小猫',
    style: { backgroundColor: '#FFE4E1' },
    svgData: {
      viewBox: '0 0 100 100',
      gradient: { start: '#FF9A9E', end: '#FECFEF' },
      paths: [
        { d: 'M50 20 C30 20 15 40 15 65 C15 85 30 95 50 95 C70 95 85 85 85 65 C85 40 70 20 50 20 Z', fill: null, stroke: '#FFB6C1', strokeWidth: 2 },
        { d: 'M15 25 L25 45 L10 45 Z', fill: '#FF9A9E' },
        { d: 'M85 25 L75 45 L90 45 Z', fill: '#FF9A9E' }
      ],
      circles: [
        { cx: 35, cy: 55, r: 4, fill: '#4A4A4A' },
        { cx: 65, cy: 55, r: 4, fill: '#4A4A4A' },
        { cx: 50, cy: 70, r: 3, fill: '#FF6B9D' },
        { cx: 25, cy: 65, r: 4, fill: '#FFB6C1', opacity: 0.6 },
        { cx: 75, cy: 65, r: 4, fill: '#FFB6C1', opacity: 0.6 }
      ]
    }
  },
  {
    id: 'avatar-2',
    name: '小狗',
    style: { backgroundColor: '#FFF3E0' },
    svgData: {
      viewBox: '0 0 100 100',
      gradient: { start: '#FFD93D', end: '#FFB347' },
      paths: [
        { d: 'M50 25 C35 25 20 40 20 60 C20 80 35 92 50 92 C65 92 80 80 80 60 C80 40 65 25 50 25 Z', fill: null, stroke: '#D4A574', strokeWidth: 2 },
        { d: 'M20 35 C10 30 5 50 15 65 L25 55 Z', fill: '#FFD93D' },
        { d: 'M80 35 C90 30 95 50 85 65 L75 55 Z', fill: '#FFD93D' }
      ],
      circles: [
        { cx: 38, cy: 50, r: 4, fill: '#2C2C2C' },
        { cx: 62, cy: 50, r: 4, fill: '#2C2C2C' },
        { cx: 50, cy: 65, r: 4, fill: '#3D2B1F' },
        { cx: 50, cy: 75, r: 2, fill: '#3D2B1F' }
      ]
    }
  },
  {
    id: 'avatar-3',
    name: '熊猫',
    style: { backgroundColor: '#F5F5F5' },
    svgData: {
      viewBox: '0 0 100 100',
      gradient: { start: '#FFFFFF', end: '#E8E8E8' },
      paths: [
        { d: 'M50 20 C30 20 15 40 15 62 C15 85 30 95 50 95 C70 95 85 85 85 62 C85 40 70 20 50 20 Z', fill: 'white', stroke: '#CCCCCC', strokeWidth: 2 },
        { d: 'M22 25 C12 20 10 35 18 45 L28 35 Z', fill: '#1A1A1A' },
        { d: 'M78 25 C88 20 90 35 82 45 L72 35 Z', fill: '#1A1A1A' },
        { d: 'M30 48 C25 55 28 68 35 70 C40 71 42 62 42 55 C42 50 38 47 30 48 Z', fill: '#1A1A1A' },
        { d: 'M70 48 C75 55 72 68 65 70 C60 71 58 62 58 55 C58 50 62 47 70 48 Z', fill: '#1A1A1A' }
      ],
      circles: [
        { cx: 35, cy: 58, r: 3, fill: 'white' },
        { cx: 65, cy: 58, r: 3, fill: 'white' },
        { cx: 50, cy: 70, r: 4, fill: '#1A1A1A' },
        { cx: 36, cy: 57, r: 1, fill: '#1A1A1A' },
        { cx: 66, cy: 57, r: 1, fill: '#1A1A1A' }
      ]
    }
  },
  {
    id: 'avatar-4',
    name: '兔子',
    style: { backgroundColor: '#FFF0F5' },
    svgData: {
      viewBox: '0 0 100 100',
      gradient: { start: '#FFF0F5', end: '#FFE4E8' },
      paths: [
        { d: 'M50 30 C32 30 18 48 18 68 C18 86 32 98 50 98 C68 98 82 86 82 68 C82 48 68 30 50 30 Z', fill: null, stroke: '#FFB6C1', strokeWidth: 2 },
        { d: 'M35 30 C30 5 20 0 22 20 C24 35 32 35 35 30 Z', fill: '#FFE4E8' },
        { d: 'M65 30 C70 5 80 0 78 20 C76 35 68 35 65 30 Z', fill: '#FFE4E8' },
        { d: 'M35 30 C32 15 25 8 24 18 C23 28 30 32 35 30 Z', fill: '#FFB6C1' },
        { d: 'M65 30 C68 15 75 8 76 18 C77 28 70 32 65 30 Z', fill: '#FFB6C1' }
      ],
      circles: [
        { cx: 38, cy: 55, r: 3, fill: '#E74C3C' },
        { cx: 62, cy: 55, r: 3, fill: '#E74C3C' },
        { cx: 50, cy: 68, r: 3, fill: '#FF69B4' },
        { cx: 28, cy: 65, r: 3, fill: '#FFB6C1', opacity: 0.5 },
        { cx: 72, cy: 65, r: 3, fill: '#FFB6C1', opacity: 0.5 }
      ]
    }
  },
  {
    id: 'avatar-5',
    name: '大象',
    style: { backgroundColor: '#E8E8E8' },
    svgData: {
      viewBox: '0 0 100 100',
      gradient: { start: '#808080', end: '#606060' },
      paths: [
        { d: 'M50 20 C30 20 15 40 15 62 C15 82 30 92 50 92 C70 92 85 82 85 62 C85 40 70 20 50 20 Z', fill: null, stroke: '#505050', strokeWidth: 2 },
        { d: 'M20 40 C10 45 5 60 8 75 L18 65 Z', fill: '#808080' },
        { d: 'M80 40 C90 45 95 60 92 75 L82 65 Z', fill: '#808080' },
        { d: 'M50 55 C45 55 42 60 42 68 C42 75 45 80 50 80 C55 80 58 75 58 68 C58 60 55 55 50 55 Z', fill: '#505050' },
        { d: 'M50 80 L50 92', stroke: '#505050', strokeWidth: 3 }
      ],
      circles: [
        { cx: 38, cy: 48, r: 5, fill: '#FFFFFF' },
        { cx: 62, cy: 48, r: 5, fill: '#FFFFFF' },
        { cx: 38, cy: 48, r: 2, fill: '#1A1A1A' },
        { cx: 62, cy: 48, r: 2, fill: '#1A1A1A' },
        { cx: 38, cy: 47, r: 1, fill: 'white' },
        { cx: 62, cy: 47, r: 1, fill: 'white' }
      ]
    }
  },
  {
    id: 'avatar-6',
    name: '企鹅',
    style: { backgroundColor: '#E8F4FD' },
    svgData: {
      viewBox: '0 0 100 100',
      gradient: { start: '#2C3E50', end: '#1A252F' },
      paths: [
        { d: 'M50 20 C35 20 22 38 20 60 C18 82 32 95 50 95 C68 95 82 82 80 60 C78 38 65 20 50 20 Z', fill: '#2C3E50', stroke: '#1A252F', strokeWidth: 2 },
        { d: 'M35 45 C32 65 38 82 50 85 C62 82 68 65 65 45 C60 38 40 38 35 45 Z', fill: 'white' },
        { d: 'M20 55 C5 50 0 70 15 75 L25 65 Z', fill: '#E74C3C' },
        { d: 'M80 55 C95 50 100 70 85 75 L75 65 Z', fill: '#E74C3C' },
        { d: 'M40 88 C45 95 55 95 60 88 C55 92 45 92 40 88 Z', fill: '#FFD93D' }
      ],
      circles: [
        { cx: 40, cy: 40, r: 4, fill: 'white' },
        { cx: 60, cy: 40, r: 4, fill: 'white' },
        { cx: 40, cy: 40, r: 2, fill: '#1A1A1A' },
        { cx: 60, cy: 40, r: 2, fill: '#1A1A1A' }
      ]
    }
  },
  {
    id: 'avatar-7',
    name: '卡皮巴拉',
    style: { backgroundColor: '#F5E6D3' },
    svgData: {
      viewBox: '0 0 100 100',
      gradient: { start: '#D2B48C', end: '#A0826D' },
      paths: [
        { d: 'M50 25 C32 25 18 42 18 62 C18 82 32 92 50 92 C68 92 82 82 82 62 C82 42 68 25 50 25 Z', fill: null, stroke: '#8B7355', strokeWidth: 2 },
        { d: 'M25 35 C20 30 12 35 15 45 L22 40 Z', fill: '#D2B48C' },
        { d: 'M75 35 C80 30 88 35 85 45 L78 40 Z', fill: '#D2B48C' },
        { d: 'M45 60 Q50 65 55 60 Q50 68 45 60 Z', fill: '#5D4037' },
        { d: 'M38 50 C35 52 35 55 38 57 C41 55 41 52 38 50 Z', fill: '#8B7355' },
        { d: 'M62 50 C65 52 65 55 62 57 C59 55 59 52 62 50 Z', fill: '#8B7355' }
      ],
      circles: [
        { cx: 38, cy: 45, r: 4, fill: '#2C1810' },
        { cx: 62, cy: 45, r: 4, fill: '#2C1810' },
        { cx: 37, cy: 44, r: 1, fill: 'white' },
        { cx: 61, cy: 44, r: 1, fill: 'white' },
        { cx: 50, cy: 62, r: 2, fill: '#3E2723' }
      ]
    }
  },
  {
    id: 'avatar-8',
    name: '海豚',
    style: { backgroundColor: '#E3F2FD' },
    svgData: {
      viewBox: '0 0 100 100',
      gradient: { start: '#64B5F6', end: '#2196F3' },
      paths: [
        { d: 'M50 25 C35 25 20 45 22 65 C24 85 40 92 50 92 C60 92 76 85 78 65 C80 45 65 25 50 25 Z', fill: null, stroke: '#1976D2', strokeWidth: 2 },
        { d: 'M75 65 C90 55 95 70 80 75 L75 70 Z', fill: '#64B5F6' },
        { d: 'M50 45 Q65 50 70 65 Q65 70 50 70 Q35 70 30 65 Q35 50 50 45 Z', fill: 'white' },
        { d: 'M45 80 Q50 85 55 80 Q50 82 45 80 Z', fill: '#2196F3' }
      ],
      circles: [
        { cx: 38, cy: 45, r: 4, fill: '#1A1A1A' },
        { cx: 37, cy: 44, r: 1, fill: 'white' }
      ]
    }
  },
  {
    id: 'avatar-9',
    name: '狮子',
    style: { backgroundColor: '#FFF3E0' },
    svgData: {
      viewBox: '0 0 100 100',
      gradient: { start: '#D4A574', end: '#C19A6B' },
      paths: [
        { d: 'M50 25 C35 25 20 42 20 60 C20 80 35 90 50 90 C65 90 80 80 80 60 C80 42 65 25 50 25 Z', fill: null, stroke: '#8B4513', strokeWidth: 2 },
        { d: 'M50 10 C30 10 15 25 15 45 C15 35 25 25 50 25 C75 25 85 35 85 45 C85 25 70 10 50 10 Z', fill: '#D4A574' },
        { d: 'M50 10 C40 10 30 18 30 30 C30 22 38 18 50 18 C62 18 70 22 70 30 C70 18 60 10 50 10 Z', fill: '#C19A6B' }
      ],
      circles: [
        { cx: 38, cy: 50, r: 4, fill: '#5D4037' },
        { cx: 62, cy: 50, r: 4, fill: '#5D4037' },
        { cx: 50, cy: 68, r: 5, fill: '#3E2723' },
        { cx: 37, cy: 49, r: 1, fill: 'white' },
        { cx: 61, cy: 49, r: 1, fill: 'white' }
      ]
    }
  },
  {
    id: 'avatar-10',
    name: '独角兽',
    style: { backgroundColor: '#FCE4EC' },
    svgData: {
      viewBox: '0 0 100 100',
      gradient: { start: '#FFFFFF', end: '#FCE4EC' },
      paths: [
        { d: 'M50 30 C35 30 20 48 20 68 C20 85 35 95 50 95 C65 95 80 85 80 68 C80 48 65 30 50 30 Z', fill: 'white', stroke: '#E1BEE7', strokeWidth: 2 },
        { d: 'M50 5 L55 25 L45 25 Z', fill: '#FFD700' },
        { d: 'M35 20 C30 10 25 5 28 18 C30 28 33 25 35 20 Z', fill: '#E91E63' },
        { d: 'M65 20 C70 10 75 5 72 18 C70 28 67 25 65 20 Z', fill: '#9C27B0' },
        { d: 'M38 22 C34 15 30 10 32 20 C33 28 36 26 38 22 Z', fill: '#FF9800' },
        { d: 'M62 22 C66 15 70 10 68 20 C67 28 64 26 62 22 Z', fill: '#2196F3' }
      ],
      circles: [
        { cx: 38, cy: 52, r: 3, fill: '#E91E63' },
        { cx: 62, cy: 52, r: 3, fill: '#9C27B0' },
        { cx: 50, cy: 65, r: 2, fill: '#FF9800' },
        { cx: 28, cy: 62, r: 3, fill: '#F8BBD9', opacity: 0.6 },
        { cx: 72, cy: 62, r: 3, fill: '#F8BBD9', opacity: 0.6 }
      ]
    }
  }
]

const selectedAvatar = computed(() => props.modelValue)

const currentAvatar = computed(() => {
  return avatars.find(a => a.id === selectedAvatar.value) || avatars[0]
})

const currentAvatarStyle = computed(() => currentAvatar.value.style)
const currentAvatarSvg = computed(() => currentAvatar.value.svgData)
const currentAvatarName = computed(() => currentAvatar.value.name)

const selectAvatar = (avatarId) => {
  if (!props.disabled) {
    emit('update:modelValue', avatarId)
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (!avatars.find(a => a.id === newValue)) {
      emit('update:modelValue', 'avatar-1')
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.avatar-selector {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.avatar-selector.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.avatar-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 280px;
}

.avatar-item {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-item:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-item.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.avatar-svg {
  width: 100%;
  height: 100%;
}

.check-mark {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 20px;
  height: 20px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.avatar-preview-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.large-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--border-card);
  box-shadow: var(--shadow-md);
}

.large-avatar-svg {
  width: 100%;
  height: 100%;
}

.avatar-name {
  font-size: 13px;
  color: var(--txt-secondary);
  font-weight: 500;
}
</style>
