import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  const roomId = ref(null)
  const playerColor = ref(null)
  const currentTurn = ref('black')
  const board = ref(Array(15).fill(null).map(() => Array(15).fill(null)))
  const isGameOver = ref(false)
  const winner = ref(null)
  const moveCount = ref(0)
  const timerRemaining = ref(30)

  const isMyTurn = computed(() => currentTurn.value === playerColor.value)

  function resetGame() {
    roomId.value = null
    playerColor.value = null
    currentTurn.value = 'black'
    board.value = Array(15).fill(null).map(() => Array(15).fill(null))
    isGameOver.value = false
    winner.value = null
    moveCount.value = 0
    timerRemaining.value = 30
  }

  function makeMove(row, col, color) {
    if (board.value[row][col] !== null) return false
    board.value[row][col] = color
    moveCount.value++
    currentTurn.value = color === 'black' ? 'white' : 'black'
    return true
  }

  function setGameOver(winnerColor) {
    isGameOver.value = true
    winner.value = winnerColor
  }

  return {
    roomId,
    playerColor,
    currentTurn,
    board,
    isGameOver,
    winner,
    moveCount,
    timerRemaining,
    isMyTurn,
    resetGame,
    makeMove,
    setGameOver
  }
})
