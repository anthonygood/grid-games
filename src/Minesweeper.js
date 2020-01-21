const { blank, countNeighbourValues, forEveryNeighbour, map } = require('./Grid')

const EMPTY = 0
const MINE = 1

const randomIndex = arr => Math.floor(Math.random() * arr.length)

const withinRange = (val, lower, upper) => val >= lower && val <= upper

const withinRadius = ([i, j], indicesB) => {
  const [bI, bJ] = indicesB
  return withinRange(bI, i-1, i+1) && withinRange(bJ, j-1, j+1)
}

const newBoard = (
  width,
  height,
  mineCount = 0,
  keepClear = []
) => {
  width = Math.max(width, 3)
  height = Math.max(height, 3)

  const board = blank(width, height, EMPTY)
  let remainingToInsert = Math.min(mineCount, (width * height) - 9)

  while (remainingToInsert) {
    const i = randomIndex(board)
    const j = randomIndex(board[i])
    const cell = board[i][j]

    if (
      withinRadius(keepClear, [i, j]) ||
      cell === MINE
    ) continue

    board[i][j] = MINE
    remainingToInsert--
  }

  return board
}

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
  const counts = map(board, (_, indices) => countNeighbourValues(indices, board))

  return (i, j) => {
    if (board[i][j] === MINE) return null
    sweep(state, counts, i, j)
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

    if (this.board[i][j]) return false

    this.state = this.next(i, j)
    return true
  }
}

module.exports = {
  newBoard,
  nextState,
  Minesweeper
}
