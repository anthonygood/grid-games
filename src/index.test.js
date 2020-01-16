
const expect = require('chai').expect
const { countNeighbours, liveOrDie, tick } = require('./')

describe('GameOfLife', () => {
  const bitmap = [
    [0,1],
    [1,1]
  ]

  const bigBitmap = [
    [0,1,0,0],
    [0,1,1,1],
    [1,0,1,0],
    [0,1,0,1],
  ]

  describe('countNeighbours', () => {
    const countNeighourMap = arr => arr.map(
      (row, i) => row.map(
        (_, j) => countNeighbours([i,j], arr)
      )
    )

    it('returns the number of living neighbours', () => {
      expect(
        countNeighourMap(bitmap)
      ).to.deep.equal([
        [3,2],
        [2,2]
      ])

      expect(
        countNeighourMap(bigBitmap)
      ).to.deep.equal([
        [2,2,4,2],
        [3,4,4,2],
        [2,5,5,4],
        [2,2,3,1]
      ])
    })
  })

  describe('liveOrDie', () => {
    it('returns correct state for living cells', () => {
      expect(
        [0,1,2,3,4,5,6].map(count => liveOrDie(1, count))
      ).to.deep.equal([
        0,0,1,1,0,0,0
      ])
    })

    it('returns correct state for dead cells', () => {
      expect(
        [0,1,2,3,4,5,6].map(count => liveOrDie(0, count))
      ).to.deep.equal([
        0,0,0,1,0,0,0
      ])
    })
  })

  describe('tick', () => {
    it('returns correct state for bitmap', () => {
      expect(
        tick(bitmap)
      ).to.deep.equal([
        [1,1],
        [1,1]
      ])

      expect(
        tick(bigBitmap)
      ).to.deep.equal([
        [0,1,0,0],
        [1,0,0,1],
        [1,0,0,0],
        [0,1,1,0],
      ])
    })
  })
})
