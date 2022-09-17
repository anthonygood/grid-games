const blank = (width, height, filler = 0) => {
  return Array.from({ length: height })
    .map(() => new Array(width).fill(filler))
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

const greatest = (a, b) =>
  a.length > b.length ? a : b

const union = (a, b, fill = 0) => {
  const { length: height } = greatest(a, b);
  const { length: width } = greatest(a[0], b[0]);

  return map(
    blank(width, height),
    (cell, [i,j], row, grid) =>
      a[i]?.[j] || b[i]?.[j] || fill
  )
}

module.exports = {
  union,
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
