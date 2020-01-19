const expect = require('chai').expect
const {
  countNeighbourValues,
  flatten,
  map,
  reduce
} = require('./Grid')

const small = [
  [0,1],
  [1,1]
]

const big = [
  [0,1,0,0],
  [0,1,1,1],
  [1,0,1,0],
  [0,1,0,1],
]

describe('map', () => {
  it('returns map of function', () => {
    expect(
      map(small, val => 1 ^ val)
    ).to.deep.equal([
      [1,0],
      [0,0]
    ])

    expect(
      map(big, Boolean)
    ).to.deep.equal([
      [false,true,false,false],
      [false,true,true,true],
      [true,false,true,false],
      [false,true,false,true],
    ])
  })
})

describe('flatten', () => {
  it('flattens 2D array', () => {
    expect(
      flatten(small)
    ).to.deep.equal([0,1,1,1])

    expect(
      flatten(big)
    ).to.deep.equal([0,1,0,0,0,1,1,1,1,0,1,0,0,1,0,1])
  })

  it('flattens 3D array (why not)', () => {
    expect(
      flatten([
        [[1,0],[0,1]],
        [[9,8],[0]]
      ])
    ).to.deep.equal([1,0,0,1,9,8,0])
  })
})

describe('reduce', () => {
  it('applies reducer to 2D grid', () => {
    expect(
      reduce(small, (acc, item) => acc + item)
    ).to.equal(3)

    expect(
      reduce(big, (acc, item) => acc + item)
    ).to.equal(8)
  })
})

describe('countNeighbourValues', () => {
  it('returns the number of living neighbours', () => {
    expect(
      map(small, (_cell, indices, _row, grid) => countNeighbourValues(indices, grid))
    ).to.deep.equal([
      [3,2],
      [2,2]
    ])

    expect(
      map(big, (_cell, indices, _row, grid) => countNeighbourValues(indices, grid))
    ).to.deep.equal([
      [2,2,4,2],
      [3,4,4,2],
      [2,5,5,4],
      [2,2,3,1]
    ])
  })
})
