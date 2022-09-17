const Grid = require('./Grid')

Events = {}
Events.TETROMINO_LANDING = 'tetromino:landing'

class Tetris {
  constructor(width = 10, height = 20) {
    this.board = Grid.blank(width, height)
    this.tetromino = null
    this.tetrominoPosition = null
    this.eventListeners = {
      [Events.TETROMINO_LANDING]: []
    }
  }

  on(event, fn) {
    const subscribers = this.eventListeners[event]

    if (!subscribers) {
      throw new Error(`Event '${event}' not supported`)
    }

    subscribers.push(fn)
  }

  trigger(event, payload) {
    const subscribers = this.eventListeners[event]

    if (!subscribers) {
      throw new Error(`Event '${event}' not supported`)
    }

    subscribers.forEach(subscriber => subscriber(payload))
  }

  spawn(twoDArray) {
    if (!twoDArray || !twoDArray.length || !twoDArray[0].length) {
      throw new TypeError('Must provide two dimensional array representing tetromino to spawn')
    }

    // TODO: More validations
    this.tetromino = twoDArray

    const tetrominoWidth = Grid.width(twoDArray)
    const tetrominoXOrigin = this.centre() - this.centre(tetrominoWidth)
    this.tetrominoPosition = [tetrominoXOrigin, 0]
  }

  rotate() {
    const prevWidth = Grid.width(this.tetromino)
    const prevCentre = this.centre(prevWidth)

    this.tetromino = Tetris.Tetromino.rotate(this.tetromino)

    // rotate position
    const tetrominoWidth = Grid.width(this.tetromino)
    const centre = this.centre(tetrominoWidth)
    const [x, y] = this.tetrominoPosition

    const centreDifference = prevCentre - centre
    const newX = x + centreDifference

    // TODO: y?
    this.tetrominoPosition = [newX, y]
  }

  gravity() {
    const [x, y] = this.tetrominoPosition
    const newY = y + 1
    const bottomY = newY + Grid.height(this.tetromino)
    this.tetrominoPosition = [x, newY]

    if (bottomY >= this.height()) {
      this.trigger(Events.TETROMINO_LANDING)
      this.board = this.compositeBoard()
      // this.tetromino = null
    }
  }

  compositeBoard() {
    const [x, y] = this.tetrominoPosition
    return Grid.superimpose(this.board, this.tetromino, x, y)
  }


  height() {
    return Grid.height(this.board)
  }

  width() {
    return Grid.width(this.board)
  }

  centre(width = this.width()) {
    return Math.floor(width / 2)
  }
}

const reverse = (arr) => () =>
  arr.map(array => array.reverse())

const rotate = (twoDArray) => {
  // Swapping height with width results in counter-clockwise transformation
  const newHeight = Grid.width(twoDArray)
  const newWidth = Grid.height(twoDArray)

  const newGrid = Grid.blank(newWidth, newHeight)

  Grid.forEach(twoDArray, (cell, [i, j], row, grid) => {
    newGrid[j][i] = cell
  })

  return newGrid
};

const rotateClockwise = (twoDArray) =>
  reverse(
    rotate(twoDArray)
  )()

rotateClockwise.reverse = rotate

const TetrominoFactory = (twoDArray) => {
  fn = () => twoDArray
  fn.reverse = reverse(twoDArray)
  return fn
}

const T = TetrominoFactory([
  [1,1,1],
  [0,1,0],
])

const L = TetrominoFactory([
  [1,1,1],
  [1,0,0],
])

const skew = TetrominoFactory([
  [0,1,1],
  [1,1,0],
])

const square = TetrominoFactory([
  [1,1],
  [1,1],
])

const straight = TetrominoFactory([
  [1,1,1,1],
])

Tetris.Tetromino = {
  T,
  L,
  skew,
  square,
  straight,

  rotate: rotateClockwise,
}

Tetris.Events = Events

module.exports = {
  Tetris,
}
