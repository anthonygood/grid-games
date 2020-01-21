const expect = require('chai').expect
const { newBoard, nextState, Minesweeper } = require('./Minesweeper')
const { countNeighbourValues, findIndex, reduce } = require('./Grid')

describe('newBoard', () => {
  const board = newBoard(5, 8, 10, [3,4])
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

  it('accepts keepClear argument which ensures cell has zero mines adjacent', () => {
    const keepClear = [5,5]
    const board = newBoard(10, 10, 99, keepClear)
    const cell = board[5][5]
    const surroundingMines = countNeighbourValues([5,5], board)

    expect(cell).to.equal(0)
    expect(surroundingMines).to.equal(0)
  })

  it('cannot add more mines than hw-9', () => {
    const board = newBoard(10, 10, 200)
    expect(
      reduce(board, (acc, cell) => acc + cell)
    ).to.equal(91)
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
  const game = new Minesweeper(6, 6, 12)

  describe('move', () => {
    it('returns TRUE where the sweep is successful', () => {
      expect(
        game.move(1, 1)
      ).to.be.true
    })

    it('returns FALSE when a mine is hit', () => {
      const [x, y] = findIndex(game.board, val => val)

      expect(
        game.move(x, y)
      ).to.be.false
    })
  })
})
