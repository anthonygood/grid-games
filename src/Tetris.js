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

  getSubscribers(event) {
    const subscribers = this.eventListeners[event]

    if (!subscribers) {
      throw new Error(`Event '${event}' not supported`)
    }

    return subscribers
  }

  on(event, fn) {
    const subscribers = this.getSubscribers(event)
    subscribers.push(fn)
  }

  trigger(event, payload) {
    const subscribers = this.getSubscribers(event)
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

  tick() {
    if (
      this.tetrominoHasReachedBottom() ||
      this.tetrominoHasLandedOnTerrain()
    ) {
      this.trigger(Events.TETROMINO_LANDING)
      this.board = this.compositeBoard()
      return
    }

    this.tetrominoPosition = this.gravity()
  }

  gravity() {
    const [x, y] = this.tetrominoPosition
    const newY = y + 1
    return [x, newY]
  }

  tetrominoHasLandedOnTerrain() {
    const {
      board,
      tetromino,
    } = this

    // Get the position of the tetromino for the next tick
    const nextTetrominoPosition = this.gravity()

    // Generate a superimposition of the tetromino on a blank board
    const blankBoard = Grid.blank(this.width(), this.height())
    const tetrominoBoard = Grid.superimpose(blankBoard, tetromino, ...nextTetrominoPosition)

    // Add the superimposed board and the current board together
    const collisionBoard = Grid.add(board, tetrominoBoard)

    // If there are any values above 1, it means those cells would overlap on the next tick
    return collisionBoard.flat().some(value => value > 1)
  }

  tetrominoHasReachedBottom() {
    const [, y] = this.tetrominoPosition
    const bottomY = y + Grid.height(this.tetromino)
    return bottomY >= this.height()
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
  arr.map(array => [...array].reverse())

// For rotation, the transformation we need is:
// [1,1,1], => [1,1],
// [1,0,0], => [0,1],
//          => [0,1],
// Or:
// [1,1,1], => [1,0],
// [1,0,0], => [1,0],
//          => [1,1],
// Simply flipping the indexes ([y][x] => [x][y]) gets us close:
// [1,1,1], => [1,1],
// [1,0,0], => [1,0],
//          => [1,0],
// ie. swapping first (height) index with second (width) results in counter-clockwise + vertically flipped transformation
// (or you can consider it clockwise + horizontally flipped transformation).
// So depending on the transformation, we need to 'count backwards' on either the first or second index.
const rotation = transformIndicesFn => twoDArray => {
  // Swap height/width
  const newHeight = Grid.width(twoDArray)
  const newWidth = Grid.height(twoDArray)
  const rotatedGrid = Grid.blank(newWidth, newHeight)

  Grid.forEach(twoDArray, (cell, [i, j], _row, _grid) => {
    const [index0, index1] = transformIndicesFn(i, j, newHeight, newWidth)
    rotatedGrid[index0][index1] = cell
  })

  return rotatedGrid
}

const clockwiseIndexTransform = (i, j, _height, width) =>
  [
    j,
    width - 1 - i
  ]

const counterClockwiseIndexTransform = (i, j, height, _width) =>
  [
    height - 1 - j,
    i
  ]

const clockwise = rotation(clockwiseIndexTransform)
clockwise.reverse = rotation(counterClockwiseIndexTransform)

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

  rotate: clockwise,
}

Tetris.Events = Events

module.exports = {
  Tetris,
}
