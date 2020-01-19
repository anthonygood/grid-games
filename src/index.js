const { countNeighbourValues } = require('./gridLogic')

const willLive = (isAlive, neighbourCount) =>
  neighbourCount === 3 || isAlive && neighbourCount === 2

const liveOrDie = (isAlive, neighbourCount) => Number(willLive(isAlive, neighbourCount))

const tick = bitmap => bitmap.map(
  (row, i) => row.map(
    (aliveOrDead, j) => liveOrDie(aliveOrDead, countNeighbourValues([i,j], bitmap))
  )
)

module.exports = {
  countNeighbourValues,
  liveOrDie,
  tick
}
