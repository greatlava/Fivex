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
  const timerRemaining = ref(600)
  const totalTime = ref(600)
  const hasBothPlayers = ref(false)
  const currentScore = ref({ player1: 0, player2: 0 })
  const undoRequested = ref(false)
  const undoRequestedBy = ref(null)

  const isMyTurn = computed(() => currentTurn.value === playerColor.value)
  const isBlackTurn = computed(() => currentTurn.value === 'black')
  const isWhiteTurn = computed(() => currentTurn.value === 'white')
  const formattedTime = computed(() => {
    const minutes = Math.floor(timerRemaining.value / 60)
    const seconds = timerRemaining.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  function resetGame() {
    roomId.value = null
    playerColor.value = null
    currentTurn.value = 'black'
    board.value = Array(15).fill(null).map(() => Array(15).fill(null))
    isGameOver.value = false
    winner.value = null
    moveCount.value = 0
    timerRemaining.value = totalTime.value
    hasBothPlayers.value = false
    currentScore.value = { player1: 0, player2: 0 }
    undoRequested.value = false
    undoRequestedBy.value = null
  }

  function makeMove(row, col, color) {
    if (board.value[row][col] !== null) return false
    board.value[row][col] = color
    moveCount.value++
    currentTurn.value = color === 'black' ? 'white' : 'black'
    return true
  }

  function undoMove(row, col) {
    if (board.value[row][col] === null) return false
    const color = board.value[row][col]
    board.value[row][col] = null
    moveCount.value = Math.max(0, moveCount.value - 1)
    currentTurn.value = color
    return true
  }

  function setGameOver(winnerColor) {
    isGameOver.value = true
    winner.value = winnerColor
    if (winnerColor === 'black') {
      currentScore.value.player1++
    } else if (winnerColor === 'white') {
      currentScore.value.player2++
    }
  }

  function requestUndo(playerId) {
    undoRequested.value = true
    undoRequestedBy.value = playerId
  }

  function cancelUndo() {
    undoRequested.value = false
    undoRequestedBy.value = null
  }

  function setTimer(seconds) {
    timerRemaining.value = seconds
  }

  function decrementTimer() {
    if (timerRemaining.value > 0) {
      timerRemaining.value--
    }
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
    totalTime,
    hasBothPlayers,
    currentScore,
    undoRequested,
    undoRequestedBy,
    isMyTurn,
    isBlackTurn,
    isWhiteTurn,
    formattedTime,
    resetGame,
    makeMove,
    undoMove,
    setGameOver,
    requestUndo,
    cancelUndo,
    setTimer,
    decrementTimer
  }
})
