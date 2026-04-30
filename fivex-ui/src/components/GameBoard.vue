<template>
  <div ref="boardContainer" class="board-container-inner">
    <canvas ref="canvasRef" :width="boardSize" :height="boardSize"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useGameStore } from '@/stores/game'
import { Application, Graphics, Text, TextStyle } from 'pixi.js'

const props = defineProps({
  size: {
    type: Number,
    default: 560
  }
})

const emit = defineEmits(['move'])

const boardContainer = ref(null)
const canvasRef = ref(null)
const gameStore = useGameStore()

const boardSize = ref(props.size)
const gridSize = 15
const cellSize = ref(boardSize.value / gridSize)
const padding = ref(cellSize.value / 2)

let app = null
let boardLayer = null
let piecesLayer = null
let hoverIndicator = null
let lastHoverPos = null

const createBoard = async () => {
  if (!canvasRef.value) return

  app = new Application()
  
  await app.init({
    view: canvasRef.value,
    width: boardSize.value,
    height: boardSize.value,
    background: 0xE8D4A8,
    antialias: true
  })

  boardLayer = new Graphics()
  app.stage.addChild(boardLayer)

  piecesLayer = new Graphics()
  app.stage.addChild(piecesLayer)

  hoverIndicator = new Graphics()
  app.stage.addChild(hoverIndicator)

  drawBoard()
  drawStarPoints()
  setupInteraction()

  renderPieces()
}

const drawBoard = () => {
  if (!boardLayer) return

  boardLayer.clear()

  const lineColor = 0x5A4030
  const lineWidth = 1

  for (let i = 0; i < gridSize; i++) {
    boardLayer.moveTo(padding.value + i * cellSize.value, padding.value)
    boardLayer.lineTo(padding.value + i * cellSize.value, boardSize.value - padding.value)
    boardLayer.stroke({ width: lineWidth, color: lineColor })

    boardLayer.moveTo(padding.value, padding.value + i * cellSize.value)
    boardLayer.lineTo(boardSize.value - padding.value, padding.value + i * cellSize.value)
    boardLayer.stroke({ width: lineWidth, color: lineColor })
  }
}

const drawStarPoints = () => {
  if (!boardLayer) return

  const starPositions = [
    [3, 3], [3, 7], [3, 11],
    [7, 3], [7, 7], [7, 11],
    [11, 3], [11, 7], [11, 11]
  ]

  const starRadius = cellSize.value * 0.15
  const starColor = 0x5A4030

  starPositions.forEach(([row, col]) => {
    const x = padding.value + col * cellSize.value
    const y = padding.value + row * cellSize.value
    
    boardLayer.circle(x, y, starRadius)
    boardLayer.fill(starColor)
  })
}

const setupInteraction = () => {
  if (!app) return

  app.stage.eventMode = 'static'
  app.stage.hitArea = app.screen

  app.stage.on('pointermove', handlePointerMove)
  app.stage.on('pointerout', handlePointerOut)
  app.stage.on('pointerdown', handlePointerClick)
}

const handlePointerMove = (event) => {
  if (gameStore.isGameOver) return

  const pos = event.global
  const row = Math.round((pos.y - padding.value) / cellSize.value)
  const col = Math.round((pos.x - padding.value) / cellSize.value)

  if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
    hideHoverIndicator()
    return
  }

  if (gameStore.board[row][col] !== null) {
    hideHoverIndicator()
    return
  }

  showHoverIndicator(row, col)
}

const handlePointerOut = () => {
  hideHoverIndicator()
}

const handlePointerClick = (event) => {
  if (gameStore.isGameOver || !gameStore.isMyTurn) return

  const pos = event.global
  const row = Math.round((pos.y - padding.value) / cellSize.value)
  const col = Math.round((pos.x - padding.value) / cellSize.value)

  if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
    return
  }

  if (gameStore.board[row][col] !== null) {
    return
  }

  emit('move', { row, col })
}

const showHoverIndicator = (row, col) => {
  if (!hoverIndicator) return

  const x = padding.value + col * cellSize.value
  const y = padding.value + row * cellSize.value

  if (lastHoverPos && lastHoverPos.row === row && lastHoverPos.col === col) {
    return
  }

  lastHoverPos = { row, col }

  hoverIndicator.clear()
  
  const pieceRadius = cellSize.value * 0.4
  const color = gameStore.currentTurn === 'black' ? 0x1A1A1A : 0xF5F0E8
  const alpha = 0.5

  hoverIndicator.circle(x, y, pieceRadius)
  hoverIndicator.fill({ color, alpha })
}

const hideHoverIndicator = () => {
  if (!hoverIndicator) return
  hoverIndicator.clear()
  lastHoverPos = null
}

const renderPieces = () => {
  if (!piecesLayer) return

  piecesLayer.clear()

  const pieceRadius = cellSize.value * 0.4

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const piece = gameStore.board[row][col]
      if (piece) {
        const x = padding.value + col * cellSize.value
        const y = padding.value + row * cellSize.value

        const color = piece === 'black' ? 0x1A1A1A : 0xF5F0E8
        const shadowColor = piece === 'black' ? 0x000000 : 0xD0C5B5

        piecesLayer.circle(x + 1, y + 1, pieceRadius)
        piecesLayer.fill(shadowColor)

        piecesLayer.circle(x, y, pieceRadius)
        piecesLayer.fill(color)

        if (piece === 'white') {
          piecesLayer.circle(x, y, pieceRadius)
          piecesLayer.stroke({ width: 1, color: 0xD0C5B5 })
        }

        if (gameStore.moveCount > 0 && isLastMove(row, col)) {
          const indicatorSize = pieceRadius * 0.3
          const indicatorColor = piece === 'black' ? 0xFF5555 : 0xFF5555
          
          piecesLayer.circle(x, y, indicatorSize)
          piecesLayer.fill(indicatorColor)
        }
      }
    }
  }
}

const isLastMove = (row, col) => {
  let lastRow = -1, lastCol = -1
  let count = 0

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (gameStore.board[r][c]) {
        count++
        lastRow = r
        lastCol = c
      }
    }
  }

  return count === gameStore.moveCount && row === lastRow && col === lastCol
}

watch(
  () => gameStore.board,
  () => {
    nextTick(() => {
      renderPieces()
    })
  },
  { deep: true }
)

watch(
  () => gameStore.moveCount,
  () => {
    nextTick(() => {
      renderPieces()
    })
  }
)

onMounted(async () => {
  await nextTick()
  await createBoard()
})

onUnmounted(() => {
  if (app) {
    app.destroy(true, { children: true, texture: true })
    app = null
  }
})
</script>

<style scoped>
.board-container-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--bg-main);
}

.board-container-inner canvas {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  cursor: crosshair;
}
</style>