const Grid = require('./Grid')

Events = {}
Events.TETROMINO_SPAWN = 'tetromino:spawn'
Events.TETROMINO_LANDING = 'tetromino:landing'
Events.TICK = 'tick'
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
    this.ticks = 0
    this.eventListeners = {
      [Events.TICK]: [],
      [Events.TETROMINO_SPAWN]: [],
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

  start() {
    this.spawn()
  }

  spawn(twoDArray = this.randomTetromino()) {
    if (!twoDArray || !twoDArray.length || !twoDArray[0].length) {
      throw new TypeError('Must provide two dimensional array representing tetromino to spawn')
    }

    // TODO: More validations
    this.tetromino = twoDArray
    this.trigger(Events.TETROMINO_SPAWN, { tetromino: twoDArray })

    const tetrominoWidth = Grid.width(twoDArray)
    const tetrominoXOrigin = this.centre() - this.centre(tetrominoWidth)
    this.tetrominoPosition = [tetrominoXOrigin, 0]

    const collisionDetected = this.detectCollisions(twoDArray, ...this.tetrominoPosition)
    if (collisionDetected) {
      this.tetrominoPosition = [tetrominoXOrigin, -1]
      this.board = this.compositeBoard({ crop: true })
      this.trigger(Events.GAME_OVER, { board: this.board, ticks: this.ticks })
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
    this.trigger(Events.TICK, { board: this.board, ticks: ++this.ticks })
  }

  _move(...position) {
    const collides = this.detectCollisions(this.tetromino, ...position)

    if (this.detectCollisions(this.tetromino, ...position)) {
      return false
    }

    this.tetrominoPosition = position
    return true
  }

  get move() {
    const that = this
    return {
      // TODO: bounds checking
      left() {
        const [x, y] = that.tetrominoPosition
        return that._move(x - 1, y)
      },
      right() {
        const [x, y] = that.tetrominoPosition
        return that._move(x + 1, y)
      },
      down() {
        return that._move(...that.gravity())
      }
    }
  }

  drop() {
    while (this.move.down()) {}
    this.tick()
  }

  gravity() {
    const [x, y] = this.tetrominoPosition
    const newY = y + 1
    return [x, newY]
  }

  detectCollisions(tetromino, ...nextTetrominoPosition) {
    // Generate a superimposition of the tetromino on a blank board
    const blankBoard = Grid.blank(this.width(), this.height())

    let tetrominoBoard
    try {
      tetrominoBoard = Grid.superimpose(blankBoard, tetromino, ...nextTetrominoPosition)
    } catch (err) {
      // Out of bounds is considered a collision
      return true
    }


    // Add the superimposed board and the current board together
    const collisionBoard = Grid.add(this.board, tetrominoBoard)
    return collisionBoard.flat().some(value => value > 1)
  }

  randomTetromino() {
    const { Tetromino } = Tetris
    const tetrominoes = [
      Tetromino.L,
      Tetromino.T,
      Tetromino.skew,
      Tetromino.square,
      Tetromino.straight,
    ]
    const selected = Math.floor(Math.random() * tetrominoes.length)
    const reverse = !!Math.floor(Math.random() * 2)

    const tetromino = tetrominoes[selected]
    return reverse ? tetromino.reverse() : tetromino()
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
      row => row.some(cell => cell === 0)
    )

    if (!incompleteLines.length === this.height()) return

    const metadata = this.board.reduce((data, row, currentIndex) => {
      const lineclear = row.filter(Boolean).length === this.width()
      if (lineclear) {
        data.total += 1
        data.indices.push(currentIndex)
      }
      return data
    }, {
      ticks: this.ticks,
      total: 0,
      indices: [],
      board: {
        before: [...this.board],
      }
    })

    metadata.board.completedLines = this.board.map((_row, index) => {
      const isClear = metadata.indices.includes(index)
      const filler = isClear ? 1 : 0
      return new Array(this.width()).fill(filler)
    })

    // metadata.board.completedLines = this.board.map(row => row.filter(Boolean).length)
    const newBlankLines = Grid.blank(this.width(), metadata.total)
    this.board = metadata.board.after = newBlankLines.concat(incompleteLines)
    this.trigger(
      Tetris.Events.LINE_CLEAR,
      metadata
    )
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
