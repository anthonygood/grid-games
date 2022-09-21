const Grid = require('./Grid')

Events = {}
Events.TETROMINO_LANDING = 'tetromino:landing'
Events.LINE_CLEAR = 'lineclear'
Events.GAME_OVER = 'gameover'

const rotateTetromino = (tetris, rotateFn) => () => {
  const prevWidth = Grid.width(tetris.tetromino)
  const prevCentre = tetris.centre(prevWidth)

  tetris.tetromino = rotateFn(tetris.tetromino)

  // rotate position
  const tetrominoWidth = Grid.width(tetris.tetromino)
  const centre = tetris.centre(tetrominoWidth)
  const [x, y] = tetris.tetrominoPosition

  const centreDifference = prevCentre - centre
  const newX = x + centreDifference

  // TODO: y?
  tetris.tetrominoPosition = [newX, y]
}

class Tetris {
  constructor(width = 10, height = 20) {
    this.board = Grid.blank(width, height)
    this.tetromino = null
    this.tetrominoPosition = null
    this.eventListeners = {
      [Events.TETROMINO_LANDING]: [],
      [Events.LINE_CLEAR]: [],
      [Events.GAME_OVER]: [],
    }
    this.rotate = rotateTetromino(this, Tetris.Tetromino.rotate)
    this.rotate.reverse = rotateTetromino(this, Tetris.Tetromino.rotate.reverse)
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

    const collisionDetected = this.detectCollisions(twoDArray, ...this.tetrominoPosition)
    if (collisionDetected) {
      this.tetrominoPosition = [tetrominoXOrigin, -1]
      this.board = this.compositeBoard({ crop: true })
      this.trigger(Events.GAME_OVER)
    }
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

  get move() {
    const that = this
    return {
      // TODO: bounds checking
      left() {
        const [x, y] = that.tetrominoPosition
        return that.tetrominoPosition = [x - 1, y]
      },
      right() {
        const [x, y] = that.tetrominoPosition
        return that.tetrominoPosition = [x + 1, y]
      },
      down() {
        return that.tetrominoPosition = that.gravity()
      }
    }
  }

  gravity() {
    const [x, y] = this.tetrominoPosition
    const newY = y + 1
    return [x, newY]
  }

  detectCollisions(tetromino, ...nextTetrominoPosition) {
    // Generate a superimposition of the tetromino on a blank board
    const blankBoard = Grid.blank(this.width(), this.height())
    const tetrominoBoard = Grid.superimpose(blankBoard, tetromino, ...nextTetrominoPosition)

    // Add the superimposed board and the current board together
    const collisionBoard = Grid.add(this.board, tetrominoBoard)
    return collisionBoard.flat().some(value => value > 1)
  }

  tetrominoHasLandedOnTerrain() {
    const {
      board,
      tetromino,
    } = this

    // Get the position of the tetromino for the next tick
    const nextTetrominoPosition = this.gravity()
    return this.detectCollisions(tetromino, ...nextTetrominoPosition)
  }

  tetrominoHasReachedBottom() {
    const [, y] = this.tetrominoPosition
    const bottomY = y + Grid.height(this.tetromino)
    return bottomY >= this.height()
  }

  clearLines() {
    const incompleteLines = this.board.filter(
      row => row.filter(Boolean).length !== this.width()
    )

    const totalClearedLines = this.height() - incompleteLines.length

    if (totalClearedLines) {
      this.trigger(Tetris.Events.LINE_CLEAR, { total: totalClearedLines })
    }

    const newBlankLines = Grid.blank(this.width(), totalClearedLines)
    this.board = newBlankLines.concat(incompleteLines)
  }

  compositeBoard({ crop = false } = {}) {
    if (!this.tetromino) {
      return this.board
    }

    return Grid.superimpose(this.board, this.tetromino, ...this.tetrominoPosition, { crop })
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

const reverse = arr => () =>
  arr.map(array => [...array].reverse())

const rotate = grid => Grid.rotateClockwise(grid)
rotate.reverse = Grid.rotateAntiClockwise

const TetrominoFactory = twoDArray => {
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

  rotate,
}

Tetris.Events = Events

module.exports = {
  Tetris,
}
