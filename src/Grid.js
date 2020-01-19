const blank = (width, height) => {
  return Array.from({ length: height })
    .fill(null)
    .map(() => Array.from({ length: width }).fill(0))
}

const map = (grid, fn) =>
  grid.map((row, i) =>
    row.map((cell, j) =>
      fn(cell, [i,j], row, grid)
    )
  )

const flatten = arr => arr.reduce((acc, item) =>
  Array.isArray(item) ? acc.concat(flatten(item)) : acc.concat(item),
  []
)

const reduce = (grid, fn) => flatten(grid).reduce(fn)

const forEveryNeighbour = ([_i, _j], grid, fn) => {
  for (let i = _i - 1; i <= _i + 1; i++) {
    for (let j = _j - 1; j <= _j + 1; j++) {
      if (i === _i && j === _j) continue
      const neighbour = grid[i] && grid[i][j]
      if (neighbour) fn(neighbour, i, j, grid)
    }
  }
}

const mapNeighbours = (indices, grid, fn) => {
  const map = []
  forEveryNeighbour(
    indices,
    grid,
    item => map.push(fn(item))
  )
  return map
}

const getNeighbours = (indices, grid) =>
  mapNeighbours(indices, grid, _ => _)

const countNeighbourValues = (indices, grid) =>
  getNeighbours(indices, grid).reduce((a, b) => a + b)

module.exports = {
  blank,
  flatten,
  forEveryNeighbour,
  map,
  mapNeighbours,
  countNeighbourValues,
  reduce,
}
