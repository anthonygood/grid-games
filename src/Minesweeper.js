const { blank, countNeighbourValues, forEveryNeighbour, map } = require('./Grid')
const MINE = 'x'

const randomIndex = arr => Math.floor(Math.random() * arr.length)

const withinRange = (val, lower, upper) => val >= lower && val <= upper

const withinRadius = ([i, j], indicesB) => {
  const [bI, bJ] = indicesB
  return withinRange(bI, i-1, i+1) && withinRange(bJ, j-1, j+1)
}

// Returns 2D array where 1 represents mine and 0 represent clear
const gridWithMines = (
  width,
  height,
  mineCount = 0,
  keepClear = []
) => {
  const mine = 1
  const empty = 0
  width = Math.max(width, 3)
  height = Math.max(height, 3)

  const board = blank(width, height, empty)
  let remainingToInsert = Math.min(mineCount, (width * height) - 9)

  while (remainingToInsert) {
    const i = randomIndex(board)
    const j = randomIndex(board[i])
    const cell = board[i][j]

    if (
      withinRadius(keepClear, [i, j]) ||
      cell === mine
    ) continue

    board[i][j] = mine
    remainingToInsert--
  }

  return board
}

// Returns 2D array where:
//   mines are represented by 'x',
//   other values are the counts of adjacent mines
const newBoard = (
  width,
  height,
  mineCount = 0,
  keepClear = []
) => map(
  gridWithMines(width, height, mineCount, keepClear),
  (cell, indices, _row, board) => cell ? MINE : countNeighbourValues(indices, board)
)

const sweep = (state, counts, i, j) => {
  // No-op if this cell has been swept already
  if (state[i][j] !== -1) return

  const thisCount = counts[i][j]
  state[i][j] = thisCount

  if (thisCount < 1) {
    forEveryNeighbour([i, j], counts, (_count, i, j, counts) => {
      sweep(state, counts, i, j)
    })
  }
  return state
}

const nextState = board => {
  const state = map(board, () => -1)

  return (i, j) => {
    if (board[i][j] === MINE) return null
    sweep(state, board, i, j)
    return state
  }
}

class Minesweeper {
  constructor(width, height, mineCount) {
    this.width = width
    this.height = height
    this.mineCount = mineCount
    this.board = null
    this.state = null
    this.moves = []
  }

  move(i, j) {
    const { width, height, mineCount } = this
    this.moves.push([i, j])

    if (!this.board) {
      this.board = newBoard(width, height, mineCount, [i, j])
      this.next = nextState(this.board)
    }

    if (this.board[i][j] === MINE) return false

    this.state = this.next(i, j)
    return true
  }
}

module.exports = {
  newBoard,
  nextState,
  Minesweeper
}
