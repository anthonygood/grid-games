const blank = (width, height, filler = 0) => {
  return Array.from({ length: height })
    .map(() => Array.from({ length: width }).fill(filler))
}

const forEach = (grid, fn) =>
  grid.forEach((row, i) =>
    row.forEach((cell, j) =>
      fn(cell, [i, j], row, grid)
    )
  )

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

const reduce = (grid, ...args) => flatten(grid).reduce(...args)

const forEveryNeighbour = ([_i, _j], grid, fn) => {
  for (let i = _i - 1; i <= _i + 1; i++) {
    for (let j = _j - 1; j <= _j + 1; j++) {
      if (i === _i && j === _j) continue
      const neighbour = grid[i] && grid[i][j]
      if (neighbour !== undefined) fn(neighbour, i, j, grid)
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
  getNeighbours(indices, grid).reduce((a, b) => a + b, 0)

const findIndex = (grid, predicateFn) => {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (predicateFn(
        grid[i][j],
        [i, j],
        grid[i],
        grid
      )) return [i, j]
    }
  }
}

module.exports = {
  blank,
  countNeighbourValues,
  forEach,
  findIndex,
  flatten,
  forEveryNeighbour,
  map,
  mapNeighbours,
  reduce,
}
