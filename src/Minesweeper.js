const { blank, countNeighbourValues, forEveryNeighbour, map } = require('./Grid')

const EMPTY = 0
const MINE = 1

const randomIndex = arr => Math.floor(Math.random() * arr.length)

const newBoard = (
  width,
  height,
  mineCount = 0,
  keepClear = []
) => {
  const [clearI, clearJ] = keepClear
  const board = blank(width, height, EMPTY)
  let remainingToInsert = Math.min(mineCount, width * height - 1)

  while (remainingToInsert) {
    const i = randomIndex(board)
    const j = randomIndex(board[i])
    const cell = board[i][j]

    if (
      (i === clearI && j === clearJ) ||
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
      this.board = newBoard(width, height, mineCount, [i, j]) // NB coords are swapped as indices
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
