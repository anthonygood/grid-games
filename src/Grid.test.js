const expect = require('chai').expect
const {
  add,
  blank,
  countNeighbourValues,
  findIndex,
  flatten,
  intersection,
  map,
  superimpose,
  reduce,
  union,
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

describe('blank', () => {
  const width = 2
  const height = 4
  const grid = blank(width, height)

  it('returns 2D square grid of correct height and width', () => {
    expect(grid.length).to.equal(height)
    grid.forEach(row => expect(row.length).to.equal(width))
  })

  it('by default fills grid with zeros', () => {
    grid.forEach(row => row.forEach(cell =>
      expect(cell).to.equal(0)
    ))
  })

  it('can fill grid with a different value', () => {
    const filler = 'foo'
    const grid = blank(width, height, filler)
    grid.forEach(row => row.forEach(cell =>
      expect(cell).to.equal(filler)
    ))
  })
})

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

  describe('findIndex', () => {
    it('returns tuple of indices where value passes predicate', () => {
      expect(
        findIndex([
          [0,1],
          [0,0]
        ], value => value)
      ).to.deep.equal([0,1])

      expect(
        findIndex([
          [0,0,0],
          [0,1,'foo']
        ], value => typeof value === 'string')
      ).to.deep.equal([1,2])
    })
  })
})

describe('union', () => {
  it('returns the union of two grids', () => {
    expect(
      union(
        [
          [1,0,0],
          [0,0,1],
        ],
        [
          [0,1],
          [0,1],
        ]
      )
    ).to.deep.equal([
      [1,1,0],
      [0,1,1],
    ])
  })
})

describe('add', () => {
  it('returns the two grids added together', () => {
    expect(
      add(
        [
          [1,0,0],
          [0,0,1],
        ],
        [
          [1,1],
          [0,1],
        ]
      )
    ).to.deep.equal([
      [2,1,0],
      [0,1,1],
    ])
  })
})

describe('intersection', () => {
  it('returns the intersection of two grids', () => {
    expect(
      intersection(
        [
          [1,0,0],
          [0,0,1],
        ],
        [
          [1,1],
          [0,1],
        ]
      )
    ).to.deep.equal([
      [1,0,0],
      [0,0,0],
    ])
  })
})

describe('superimpose', () => {
  it('returns one grid superimposed on the other at given position', () => {
    const imposed = [
      [1,1],
      [1,0],
    ]

    const grid = blank(5, 5)

    // Add a single value just to check it's preserved by superimposition
    grid[4][4] = 2

    expect(
      superimpose(
        grid,
        imposed,
        2, 1,
      )
    ).to.deep.equal([
      [0,0,0,0,0],
      [0,0,1,1,0],
      [0,0,1,0,0],
      [0,0,0,0,0],
      [0,0,0,0,2],
    ])
  })

  it('throws if imposed grid would be out of bounds', () => {
    expect(() => {
      superimpose(blank(3, 3), [[1]], 0, 5)
    }).to.throw('Superimposed grid would be out of bounds')
  });
})
