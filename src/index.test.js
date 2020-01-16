
const expect = require('chai').expect
const GameOfLife = require('./')

describe('GameOfLife', () => {
  it('can be instantiated', () => {
    const game = new GameOfLife([])
    expect(game instanceof GameOfLife).to.be.true
  })
})
