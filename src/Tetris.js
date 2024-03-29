const Grid = require('./Grid')

Events = {}
Events.TETROMINO_SPAWN = 'tetromino:spawn'
Events.TETROMINO_LANDING = 'tetromino:landing'
Events.TICK = 'tick'
Events.LINE_CLEAR = 'lineclear'
Events.GAME_OVER = 'gameover'

const clamp = (min, max, x) =>
  Math.max(
    Math.min(
      x,
      max,
    ),
    min
  )

class Buffer {
  constructor(length, getValFn) {
    this.values = []
    this.length = length
    this.getValFn = getValFn
  }

  init() {
    const { values, getValFn, length } = this
    while (values.length < length) {
      this.values.unshift(getValFn())
    }
  }

  peek() {
    return this.values[this.length - 1]
  }

  pop() {
    const { values, getValFn } = this
    const popped = values.pop()
    this.values.unshift(getValFn())
    return popped
  }
}

// For controlling, Tetromino's origin should be center,
// but we draw from the top left
const getTetrominoTopLeftFromOrigin = (
  tetris,
  tetromino = tetris.tetromino,
  tetrominoPosition = tetris.tetrominoPosition,
  collideWithBottom = false
) => {
  const [originX, originY] = tetrominoPosition
  const width = Grid.width(tetromino)
  const height = Grid.height(tetromino)
  const x = originX - tetris.centre(width)
  const y = originY - tetris.centre(height)

  const collisionAdd = collideWithBottom ? 1 : 0

  return [
    clamp(0, tetris.width() - width, x),
    // Add 1 to height calc to allow collision with bottom
    clamp(0, tetris.height() - height + collisionAdd, y)
  ]
}

const rotateTetromino = (tetris, rotateFn) => () => {
  const rotated = rotateFn(tetris.tetromino)
  const collides = tetris.detectCollisions(rotated, ...tetris.tetrominoPosition)
  if (collides) {
    return false
  }
  tetris.tetromino = rotated
  return true
}

// Buffer for spawning
const Y_BUFFER = 2

class Tetris {
  constructor(
    width = 10,
    height = 20,
    gravity = true,
    tetrominoBufferSize = 5
  ) {
    this.board = Grid.blank(width, height)
    this.gravityEnabled = gravity
    this.tetromino = null
    this.tetrominoPosition = null
    this.ticks = 0
    this.buffer = new Buffer(tetrominoBufferSize, this.randomTetromino)
    this.bufferSize = tetrominoBufferSize
    this.eventListeners = {
      [Events.TICK]: [],
      [Events.TETROMINO_SPAWN]: [],
      [Events.TETROMINO_LANDING]: [],
      [Events.LINE_CLEAR]: [],
      [Events.GAME_OVER]: [],
    }

    this.rotate = rotateTetromino(this, Tetris.Tetromino.rotate)
    this.rotate.reverse = rotateTetromino(this, Tetris.Tetromino.rotate.reverse)
    this.clamp = {
      x: clamp.bind(null, 0, width - 1),
      y: clamp.bind(null, 0, height - 1),
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

  start() {
    this.buffer.init()
    this.spawn()
  }

  spawn(twoDArray = this.buffer.pop()) {
    if (!twoDArray || !twoDArray.length || !twoDArray[0].length) {
      throw new TypeError('Must provide two dimensional array representing tetromino to spawn')
    }

    // TODO: More validations
    this.tetromino = twoDArray
    this.trigger(Events.TETROMINO_SPAWN, { tetromino: twoDArray })

    // Spawns in buffer zone
    this.tetrominoPosition = [this.centre(), Y_BUFFER]

    let collisionDetected = this.detectCollisions(twoDArray, ...this.tetrominoPosition)

    if (!collisionDetected) return

    let count = 0
    while (this.detectCollisions(twoDArray, ...this.tetrominoPosition)) {
      this.tetrominoPosition[1]--
      count++
      if (count > 10) {
        throw new Error(`Spawn failure: ${this.tetrominoPosition}`)
      }
    }

    this.board = this.compositeBoard()
    this.trigger(Events.GAME_OVER, { board: this.board, ticks: this.ticks })
  }

  tick() {
    if (this.clearLines()) return

    // Handle landings
    if (
      this.tetrominoHasReachedBottom() ||
      this.tetrominoHasLandedOnTerrain()
    ) {
      this.trigger(
        Events.TETROMINO_LANDING,
        {
          ticks: this.ticks,
          tetromino: this.tetromino,
          position: this.tetrominoPosition,
          projectedPosition: getTetrominoTopLeftFromOrigin(this)
        }
      )
      this.board = this.compositeBoard()
      this.tetromino = null
      return
    }

    // Handle spawning or gravity
    if (!this.tetromino) {
      this.spawn()
    } else {
      this.gravityEnabled && (this.tetrominoPosition = this.gravity())
    }

    // Tick event
    this.trigger(Events.TICK, { board: this.board, ticks: ++this.ticks })
  }

  _move(x, y, collidBottom = false) {
    if (this.detectCollisions(this.tetromino, x, y, collidBottom)) {
      return false
    }

    this.tetrominoPosition = [
      this.clamp.x(x),
      this.clamp.y(y),
    ]
    return true
  }

  get move() {
    const that = this
    return {
      left() {
        const [x, y] = that.tetrominoPosition
        return that._move(x - 1, y)
      },
      right() {
        const [x, y] = that.tetrominoPosition
        return that._move(x + 1, y)
      },
      down() {
        return that._move(...that.gravity(), true)
      }
    }
  }

  fallPosition() {
    const { tetromino, tetrominoPosition } = this
    const [x] = tetrominoPosition
    let [, y] = tetrominoPosition

    while (
      !this.detectCollisions(tetromino, x, y + 1, true)
    ) {
      y++
    }

    return [x, y]
  }

  drop() {
    this.tetrominoPosition = this.fallPosition()
    this.tick()
  }

  tetrominoGhost() {
    return this.compositeBoard(
      Grid.blank(
        this.width(),
        this.height()
      ),
      this.tetromino,
      this.fallPosition()
    )
  }

  gravity() {
    const [x, y] = this.tetrominoPosition
    const newY = y + 1
    return [x, newY]
  }

  detectCollisions(tetromino, x, y, collideBottom = false) {
    // Generate a superimposition of the tetromino on a blank board
    const blankBoard = Grid.blank(this.width(), this.height())

    let tetrominoBoard
    try {
      const projection = getTetrominoTopLeftFromOrigin(this, tetromino, [x, y], collideBottom)
      tetrominoBoard = Grid.superimpose(blankBoard, tetromino, ...projection)
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
    const { tetromino } = this
    if (!tetromino) return false

    // Get the position of the tetromino for the next tick
    const nextTetrominoPosition = this.gravity()
    return this.detectCollisions(tetromino, ...nextTetrominoPosition, true)
  }

  tetrominoHasReachedBottom(
    tetromino = this.tetromino,
    tetrominoPosition = this.tetrominoPosition
  ) {
    if (!tetromino) return false
    const collideWithbottom = true
    const [, y] = getTetrominoTopLeftFromOrigin(
      this,
      tetromino,
      tetrominoPosition,
      collideWithbottom
    )

    const bottomY = y + Grid.height(tetromino) - 1
    return bottomY >= this.height()
  }

  clearLines() {
    const incompleteLines = this.board.filter(
      row => row.some(cell => cell === 0)
    )

    if (incompleteLines.length === this.height()) return false

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
    return true
  }

  compositeBoard(
    board = this.board,
    tetromino = this.tetromino,
    tetrominoPosition = this.tetrominoPosition
  ) {
    if (!tetromino) {
      return board
    }

    const projection = getTetrominoTopLeftFromOrigin(this, tetromino, tetrominoPosition)
    return Grid.superimpose(board, tetromino, ...projection)
  }

  height() {
    return Grid.height(this.board)
  }

  width() {
    return Grid.width(this.board)
  }

  centre(length = this.width()) {
    return Math.floor(length / 2)
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
