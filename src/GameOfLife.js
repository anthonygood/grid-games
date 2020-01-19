const { countNeighbourValues, map } = require('./Grid')

const willLive = (isAlive, neighbourCount) =>
  neighbourCount === 3 || isAlive && neighbourCount === 2

const liveOrDie = (isAlive, neighbourCount) => Number(willLive(isAlive, neighbourCount))

const tickCell = (aliveOrDead, indices, _row, grid) => liveOrDie(aliveOrDead, countNeighbourValues(indices, grid))

const tick = grid => map(grid, tickCell)

module.exports = {
  countNeighbourValues,
  liveOrDie,
  tick
}
