const expect = require('chai').expect
const { newBoard, nextState, Minesweeper } = require('./Minesweeper')
const { reduce } = require('./Grid')

describe('newBoard', () => {
  const board = newBoard(5, 8, 10)
  const rowLengths = board.map(row => row.length)

  it('returns a new board with correct width', () => {
    const [width] = rowLengths
    expect(width).to.equal(5)
  })

  it('returns a new board with correct height', () => {
    const height = rowLengths.length
    expect(height).to.equal(8)
  })

  it('grids have the correct number of mines', () => {
    expect(
      reduce(board, (acc, cell) => acc + cell)
    ).to.equal(10)
  })

  it('accepts keepClear argument', () => {
    const keepClear = [5,5]
    const board = newBoard(10, 10, 99, keepClear)
    const cell = board[5][5]

    expect(cell).to.equal(0)
  })

  it('cannot add more mines than n^2-1', () => {
    const board = newBoard(10, 10, 200)
    expect(
      reduce(board, (acc, cell) => acc + cell)
    ).to.equal(99)
  })
})

describe('nextState', () => {
  const next = nextState([
    [0,1,1],
    [1,0,0],
    [0,0,0]
  ])

  it('returns UI state for move', () => {
    expect(
      next(1, 1)
    ).to.deep.equal([
      [-1,-1,-1],
      [-1, 3,-1],
      [-1,-1,-1]
    ])

    expect(
      next(2, 2)
    ).to.deep.equal([
      [-1,-1,-1],
      [-1, 3, 2],
      [-1, 1, 0]
    ])

    expect(
      next(0, 0)
    ).to.deep.equal([
      [ 2,-1,-1],
      [-1, 3, 2],
      [-1, 1, 0]
    ])

    expect(
      next(0, 1)
    ).to.deep.equal(null)

    const otherBoard = [
      [1,0,0,1],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
    ]

    const otherNext = nextState(otherBoard)

    expect(
      otherNext(4, 3)
    ).to.deep.equal([
      [-1,-1,-1,-1],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
    ])
  })
})

describe('Minesweeper', () => {
  const board = [
    [0,1,1],
    [1,0,0],
    [0,0,0]
  ]

  const game = new Minesweeper(3, 3, 4)

  describe('move', () => {
    const result = game.move(1, 1)
    it('returns TRUE where the sweep is successful', () => {
      expect(result).to.be.true
    })

    it('updates the state', () => {
      game.board = board
      game.move(1, 1)
      expect(game.state).to.deep.equal([
        [-1,-1,-1],
        [-1, 3,-1],
        [-1,-1,-1]
      ])

      game.board = board
      game.move(2, 2)
      expect(game.state).to.deep.equal([
        [-1,-1,-1],
        [-1, 3, 2],
        [-1, 1, 0]
      ])
    })
  })
})
