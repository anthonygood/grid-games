const debug = (grid, stringify = false) => {
  const valueFn = arr => stringify ? arr.join(',') : arr
  grid.map(valueFn).forEach(val => console.log(val))
}

const blank = (width, height, filler = 0) => {
  return Array.from({ length: height })
    .map(() => new Array(width).fill(filler))
}

const height = grid => grid.length
const width = grid => grid[0]?.length

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

// For rotation, the transformation we need is:
// [1,1,1], => [1,1],
// [1,0,0], => [0,1],
//          => [0,1],
// Or:
// [1,1,1], => [1,0],
// [1,0,0], => [1,0],
//          => [1,1],
// Simply flipping the indexes ([y][x] => [x][y]) gets us close:
// [1,1,1], => [1,1],
// [1,0,0], => [1,0],
//          => [1,0],
// ie. swapping first (height) index with second (width) results in counter-clockwise + vertically flipped transformation
// (or you can consider it clockwise + horizontally flipped transformation).
// So depending on the transformation, we need to 'count backwards' on either the first or second index.
const rotation = transformIndicesFn => twoDArray => {
  // Swap height/width
  const newHeight = width(twoDArray)
  const newWidth = height(twoDArray)
  const rotatedGrid = blank(newWidth, newHeight)

  forEach(twoDArray, (cell, [i, j], _row, _grid) => {
    const [index0, index1] = transformIndicesFn(i, j, newHeight, newWidth)
    rotatedGrid[index0][index1] = cell
  })

  return rotatedGrid
}

const clockwiseIndexTransform = (i, j, _height, width) =>
  [
    j,
    width - 1 - i
  ]

const antiClockwiseIndexTransform = (i, j, height, _width) =>
  [
    height - 1 - j,
    i
  ]

const rotateClockwise = rotation(clockwiseIndexTransform)
const rotateAntiClockwise = rotation(antiClockwiseIndexTransform)

const combineGrids = combineFn => (a, b, fill = 0) => {
  const { length: height } = greatest(a, b);
  const { length: width } = greatest(a[0], b[0]);

  return map(
    blank(width, height),
    (_cell, [i,j], _row, _grid) => combineFn(a[i]?.[j], b[i]?.[j], fill)
  )
}

const union = combineGrids((a, b, fill) => a || b || fill);
const add = combineGrids((a = 0, b = 0) => a + b);

// NB. the returned grid is the size of the union of grids, but values are intersection
const intersection = combineGrids((a = 0, b = 0) => a && b);

const superimpose = (main, imposed, x, y, { crop } = {}) => {
  const w = width(main)
  const h = height(main)
  const imposedGrid = blank(w, h)

  forEach(imposed, (cell, [i, j], _row, _grid) => {
    const yIndex = i + y;
    const xIndex = j + x;

    if (yIndex >= h || xIndex >= w || yIndex < 0 || xIndex < 0) {
      if (crop) return
      throw new Error('Superimposed grid would be out of bounds')
    }
    imposedGrid[yIndex][xIndex] = cell;
  })

  return union(main, imposedGrid);
}

module.exports = {
  add,
  blank,
  countNeighbourValues,
  debug,
  forEach,
  findIndex,
  flatten,
  forEveryNeighbour,
  height,
  intersection,
  map,
  mapNeighbours,
  superimpose,
  reduce,
  rotateAntiClockwise,
  rotateClockwise,
  union,
  width,
}
