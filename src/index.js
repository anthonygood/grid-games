class GameOfLife {
  constructor(bitmap) {
    this.bitmap = bitmap
  }

  tick() {

  }
}

const countNeighbours = ([x, y], bitmap) => {
  let count = 0
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (i === x && j === y) continue
      const neighbour = bitmap[i] && bitmap[i][j]
      if (neighbour) count += neighbour
    }
  }
  return count
}

const willLive = (isAlive, neighbourCount) =>
  neighbourCount === 3 || isAlive && neighbourCount === 2

const liveOrDie = (isAlive, neighbourCount) => Number(willLive(isAlive, neighbourCount))

const tick = bitmap => bitmap.map(
  (row, i) => row.map(
    (aliveOrDead, j) => liveOrDie(aliveOrDead, countNeighbours([i,j], bitmap))
  )
)

module.exports = {
  countNeighbours,
  liveOrDie,
  tick
}
