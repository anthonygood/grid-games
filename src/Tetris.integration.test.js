const { expect } = require('chai');
const { Tetris } = require('./Tetris');
const { Tetromino } = Tetris

describe('Tetris', () => {
  it('can play a game of tetris', () => {
    const tetris = new Tetris()

    const cue = tetromino => tetris.randomTetromino = () => tetromino
    const eventRegister = {}
    const record = key => event => eventRegister[key] = (eventRegister[key] || []).push(event)
    tetris.on(Tetris.Events.GAME_OVER, record('gameover'))
    tetris.on(Tetris.Events.LINE_CLEAR, record('lineclear'))
    tetris.on(Tetris.Events.TETROMINO_LANDING, record('tetrominolanding'))

    cue(Tetromino.square())
    tetris.start()

    expect(tetris.compositeBoard()).to.deep.equal([
      [0,0,0,0,1,1,0,0,0,0],
      [0,0,0,0,1,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
    ])

    tetris.move.left()
    tetris.move.left()
    tetris.move.left()
    tetris.move.left()
    tetris.drop()

    expect(tetris.board).to.deep.equal([
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0,0],
    ])
  })
})
