const { expect } = require('chai');
const { blank, superimpose, debug } = require('./Grid');
const { Tetris } = require('./Tetris');
const { Tetromino } = Tetris

describe('Tetris', () => {
  it('returns new empty grid to begin with, by default 10 * 20', () => {
    const tetris = new Tetris()
    expect(tetris.board).to.deep.equal(blank(10, 20))
  })

  it('can return custom-sized grid', () => {
    const tetris = new Tetris(3, 6)
    expect(tetris.board).to.deep.equal(blank(3, 6))
  })

  it('can spawn a new tetromino at top of board', () => {
    const tetris = new Tetris(4, 6)
    tetris.spawn(Tetromino.skew())

    expect(tetris.compositeBoard()).to.deep.equal([
      [0,0,1,1],
      [0,1,1,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
    ])
  })

  describe('rotation', () => {
    it('can rotate tetromino', () => {
      const tetris = new Tetris(4, 6)
      tetris.spawn(Tetromino.straight())
      expect(tetris.compositeBoard()).to.deep.equal([
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
      ])

      tetris.rotate()
      expect(tetris.compositeBoard()).to.deep.equal([
        [0,0,1,0],
        [0,0,1,0],
        [0,0,1,0],
        [0,0,1,0],
        [0,0,0,0],
        [0,0,0,0],
      ])

      tetris.rotate()
      expect(tetris.compositeBoard()).to.deep.equal([
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
      ])
    })

    it('can reverse rotate tetromino', () => {
      const tetris = new Tetris(4, 4)
      tetris.spawn(Tetromino.L())
      expect(tetris.compositeBoard()).to.deep.equal([
        [0,1,1,1],
        [0,1,0,0],
        [0,0,0,0],
        [0,0,0,0],
      ])

      tetris.rotate.reverse()
      expect(tetris.compositeBoard()).to.deep.equal([
        [0,1,0,0],
        [0,1,0,0],
        [0,1,1,0],
        [0,0,0,0],
      ])

      tetris.rotate.reverse()
      expect(tetris.compositeBoard()).to.deep.equal([
        [0,0,0,1],
        [0,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
      ])

      tetris.rotate.reverse()
      expect(tetris.compositeBoard()).to.deep.equal([
        [0,1,1,0],
        [0,0,1,0],
        [0,0,1,0],
        [0,0,0,0],
      ])

      tetris.rotate.reverse()
      expect(tetris.compositeBoard()).to.deep.equal([
        [0,1,1,1],
        [0,1,0,0],
        [0,0,0,0],
        [0,0,0,0],
      ])
    })
  })

  // describe('moving', () => {
  //   it('can move tetromino left', () => {
  //     const tetris = new Tetris(4, 4)
  //     tetris.spawn(Tetromino.L.reverse())

  //     expect(tetris.compositeBoard()).to.deep.equal([
  //       [0,1,1,1],
  //       [0,0,0,1],
  //       [0,0,0,0],
  //       [0,0,0,0],
  //     ])

  //     tetris.move.left()

  //     expect(tetris.compositeBoard()).to.deep.equal([
  //       [1,1,1,0],
  //       [0,0,1,0],
  //       [0,0,0,0],
  //       [0,0,0,0],
  //     ])
  //   })

  //   it('can move tetromino right', () => {
  //     const tetris = new Tetris(5, 4)
  //     tetris.spawn(Tetromino.skew.reverse())

  //     expect(tetris.compositeBoard()).to.deep.equal([
  //       [0,1,1,0,0],
  //       [0,0,1,1,0],
  //       [0,0,0,0,0],
  //       [0,0,0,0,0],
  //     ])

  //     tetris.move.right()

  //     expect(tetris.compositeBoard()).to.deep.equal([
  //       [0,0,1,1,0],
  //       [0,0,0,1,1],
  //       [0,0,0,0,0],
  //       [0,0,0,0,0],
  //     ])
  //   })

  //   it('can move tetromino down', () => {
  //     const tetris = new Tetris(4, 4)
  //     tetris.spawn(Tetromino.square())

  //     expect(tetris.compositeBoard()).to.deep.equal([
  //       [0,1,1,0],
  //       [0,1,1,0],
  //       [0,0,0,0],
  //       [0,0,0,0],
  //     ])

  //     tetris.move.down()

  //     expect(tetris.compositeBoard()).to.deep.equal([
  //       [0,0,0,0],
  //       [0,1,1,0],
  //       [0,1,1,0],
  //       [0,0,0,0],
  //     ])
  //   })

  //   it('does not move tetromino out of bounds', () => {
  //     const tetris = new Tetris(4, 4)
  //     tetris.spawn(Tetromino.L.reverse())

  //     const boardStart = [
  //       [0,1,1,1],
  //       [0,0,0,1],
  //       [0,0,0,0],
  //       [0,0,0,0],
  //     ]

  //     expect(tetris.compositeBoard()).to.deep.equal(boardStart)

  //     tetris.move.right()

  //     expect(tetris.compositeBoard()).to.deep.equal(boardStart)

  //     tetris.move.left()
  //     tetris.move.left()

  //     expect(tetris.compositeBoard()).to.deep.equal([
  //       [1,1,1,0],
  //       [0,0,1,0],
  //       [0,0,0,0],
  //       [0,0,0,0],
  //     ])
  //   })
  // })

  describe('blocks fall', () => {
    it('ticks enact gravity, causing tetromino to fall by one cell', () => {
      const tetris = new Tetris(4, 5)
      tetris.spawn(Tetromino.T())

      expect(tetris.compositeBoard()).to.deep.equal([
        [0,1,1,1],
        [0,0,1,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
      ])

      tetris.tick()

      expect(tetris.compositeBoard()).to.deep.equal([
        [0,0,0,0],
        [0,1,1,1],
        [0,0,1,0],
        [0,0,0,0],
        [0,0,0,0],
      ])
    })

    describe('when a tetromino lands at the bottom of the board', () => {
      it('emits an event', () => {
        const tetris = new Tetris(4, 4)

        let resolved = false
        tetris.on('tetromino:landing', () => resolved = true)

        tetris.spawn(Tetromino.L())
        expect(tetris.compositeBoard()).to.deep.equal([
          [0,1,1,1],
          [0,1,0,0],
          [0,0,0,0],
          [0,0,0,0],
        ])
        expect(resolved).to.equal(false)

        tetris.tick()
        expect(tetris.compositeBoard()).to.deep.equal([
          [0,0,0,0],
          [0,1,1,1],
          [0,1,0,0],
          [0,0,0,0],
        ])
        expect(resolved).to.equal(false)

        tetris.tick()
        expect(tetris.compositeBoard()).to.deep.equal([
          [0,0,0,0],
          [0,0,0,0],
          [0,1,1,1],
          [0,1,0,0],
        ])
        expect(resolved).to.equal(false)

        // The tetromino should 'land' on the next tick after touching down
        tetris.tick()
        expect(tetris.compositeBoard()).to.deep.equal([
          [0,0,0,0],
          [0,0,0,0],
          [0,1,1,1],
          [0,1,0,0],
        ])
        expect(resolved).to.equal(true)
      })

      it('updates the grid to incorporate the tetromino\'s final position', () => {
        const tetris = new Tetris(4, 4)

        tetris.spawn(Tetromino.square())
        expect(tetris.compositeBoard()).to.deep.equal([
          [0,1,1,0],
          [0,1,1,0],
          [0,0,0,0],
          [0,0,0,0],
        ])

        tetris.tick()
        expect(tetris.compositeBoard()).to.deep.equal([
          [0,0,0,0],
          [0,1,1,0],
          [0,1,1,0],
          [0,0,0,0],
        ])

        tetris.tick()
        const expectedBoard = [
          [0,0,0,0],
          [0,0,0,0],
          [0,1,1,0],
          [0,1,1,0],
        ]

        // The tetromino should 'land' on the next tick after touching down
        expect(tetris.compositeBoard()).to.deep.equal(expectedBoard)
        expect(tetris.board).to.deep.equal(blank(4, 4))

        tetris.tick()

        expect(tetris.compositeBoard()).to.deep.equal(expectedBoard)
        expect(tetris.board).to.deep.equal(expectedBoard)
      })
    })

    describe('when a tetromino lands on a block on the board', () => {
      it('emits an event', () => {
        const tetris = new Tetris(4, 4)

        let resolved = false
        tetris.on('tetromino:landing', () => resolved = true)

        const terrain = [
          [1,0],
          [1,1],
        ]
        tetris.board = superimpose(tetris.board, terrain, 1, 2)
        tetris.spawn(Tetromino.L.reverse())
        expect(tetris.compositeBoard()).to.deep.equal([
          [0,1,1,1],
          [0,0,0,1],
          [0,1,0,0],
          [0,1,1,0],
        ])
        expect(resolved).to.equal(false)

        tetris.tick()
        expect(tetris.compositeBoard()).to.deep.equal([
          [0,0,0,0],
          [0,1,1,1],
          [0,1,0,1],
          [0,1,1,0],
        ])

        // The tetromino should 'land' on the next tick after touching down
        expect(resolved).to.equal(false)

        tetris.tick()
        expect(tetris.compositeBoard()).to.deep.equal([
          [0,0,0,0],
          [0,1,1,1],
          [0,1,0,1],
          [0,1,1,0],
        ])
        expect(resolved).to.equal(true)
      })

      it('updates the grid to incorporate the tetromino\'s final position', () => {
        const tetris = new Tetris(4, 4)
        const terrain = [
          [1,0],
          [1,1],
        ]
        tetris.board = superimpose(tetris.board, terrain, 1, 2)
        tetris.spawn(Tetromino.skew.reverse())
        expect(tetris.compositeBoard()).to.deep.equal([
          [0,1,1,0],
          [0,0,1,1],
          [0,1,0,0],
          [0,1,1,0],
        ])

        tetris.tick()
        expect(tetris.compositeBoard()).to.deep.equal([
          [0,0,0,0],
          [0,1,1,0],
          [0,1,1,1],
          [0,1,1,0],
        ])

        // The tetromino should 'land' on the next tick after touching down
        tetris.tick()

        const expectedBoard = [
          [0,0,0,0],
          [0,1,1,0],
          [0,1,1,1],
          [0,1,1,0],
        ]
        expect(tetris.compositeBoard()).to.deep.equal(expectedBoard)
        expect(tetris.board).to.deep.equal(expectedBoard)
      })
    })
  })

  describe('clearing lines', () => {
    it('does nothing with blank board', () => {
      const tetris = new Tetris(4, 5)
      tetris.clearLines()

      expect(tetris.compositeBoard()).to.deep.equal([
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
      ])
    })

    it('does nothing with broken-up terrain', () => {
      const tetris = new Tetris(4, 5)

      const board = tetris.board = [
        [0,0,0,0],
        [0,0,0,0],
        [0,1,0,0],
        [1,1,0,1],
        [0,1,1,0],
      ]

      tetris.clearLines()

      expect(tetris.compositeBoard()).to.deep.equal(board)
    })

    describe('with complete horizontal lines', () => {
      it('clears a single line', () => {
        const tetris = new Tetris(4, 5)

        tetris.board = [
          [0,0,0,0],
          [0,0,0,0],
          [0,1,0,0],
          [1,1,1,1],
          [1,1,1,0],
        ]

        tetris.clearLines()

        expect(tetris.compositeBoard()).to.deep.equal([
          [0,0,0,0],
          [0,0,0,0],
          [0,0,0,0],
          [0,1,0,0],
          [1,1,1,0],
        ])
      })

      it('emits a lineclear event for a single line', () => {
        const tetris = new Tetris(4, 5)
        let lineCount = null
        tetris.on('lineclear', ({ total }) => {
          lineCount = total
        })

        tetris.board = [
          [0,0,0,0],
          [0,0,0,0],
          [0,1,0,0],
          [1,1,1,1],
          [1,1,1,0],
        ]

        tetris.clearLines()
        expect(lineCount).to.equal(1)
      })

      it('clears multiple lines', () => {
        const tetris = new Tetris(4, 5)

        tetris.board = [
          [1,0,1,0],
          [1,1,1,1],
          [1,1,1,1],
          [1,1,1,1],
          [1,1,1,1],
        ]

        tetris.clearLines()

        expect(tetris.compositeBoard()).to.deep.equal([
          [0,0,0,0],
          [0,0,0,0],
          [0,0,0,0],
          [0,0,0,0],
          [1,0,1,0],
        ])
      })

      it('emits an event for multiple lines', () => {
        it('clears multiple lines', () => {
          const tetris = new Tetris(4, 5)
          let lineCount = null
          tetris.on('lineclear', ({ total }) => {
            lineCount = total
          })

          tetris.board = [
            [1,0,1,0],
            [1,1,1,1],
            [1,1,1,1],
            [1,1,1,1],
            [1,1,1,1],
          ]

          tetris.clearLines()
          expect(lineCount).to.equal(4)
        })
      })
    })
  })
  describe('when there is no space for a tetromino to spawn', () => {
    it('emits a gameover event', () => {
      const tetris = new Tetris(3, 4)
      let gameover = false
      tetris.on('gameover', () => gameover = true)

      tetris.board = [
        [0,0,0,0],
        [1,1,0,1],
        [1,1,0,1],
      ]

      tetris.spawn(Tetromino.square())

      expect(gameover).to.equal(true)
    })

    it('neatly crops overflowing spawned tetromino', () => {
      const tetris = new Tetris(3, 4)

      tetris.board = [
        [0,0,0,0],
        [1,1,0,1],
        [1,1,0,1],
      ]

      tetris.spawn(Tetromino.square())

      expect(tetris.board).to.deep.equal([
        [0,1,1,0],
        [1,1,0,1],
        [1,1,0,1],
      ])
    })
  })
})

describe('Tetris.Tetromino has tetrominoes', () => {
  it('T', () => {
    expect(Tetromino.T()).to.deep.equal([
      [1,1,1],
      [0,1,0],
    ])
  })

  it('L', () => {
    expect(Tetromino.L()).to.deep.equal([
      [1,1,1],
      [1,0,0],
    ])
  })

  it('L.reverse', () => {
    expect(Tetromino.L.reverse()).to.deep.equal([
      [1,1,1],
      [0,0,1],
    ])
  })

  it('skew', () => {
    expect(Tetromino.skew()).to.deep.equal([
      [0,1,1],
      [1,1,0],
    ])
  })

  it('skew.reverse', () => {
    expect(Tetromino.skew.reverse()).to.deep.equal([
      [1,1,0],
      [0,1,1],
    ])
  })

  it('square', () => {
    expect(Tetromino.square()).to.deep.equal([
      [1,1],
      [1,1],
    ])
  })

  it('straight', () => {
    expect(Tetromino.straight()).to.deep.equal([
      [1,1,1,1],
    ])
  })

  describe('and can rotate', () => {
    it('T', () => {
      expect(
        Tetromino.rotate(
          Tetromino.T()
        )
      ).to.deep.equal([
        [0,1],
        [1,1],
        [0,1],
      ])

      expect(
        Tetromino.rotate(
          Tetromino.rotate(
            Tetromino.T()
          )
        )
      ).to.deep.equal([
        [0,1,0],
        [1,1,1],
      ])
    })

    it('straight', () => {
      expect(
        Tetromino.rotate(
          Tetromino.straight()
        )
      ).to.deep.equal([
        [1],
        [1],
        [1],
        [1],
      ])
    })

    it('L', () => {
      expect(
        Tetromino.rotate(
          Tetromino.L()
        )
      ).to.deep.equal([
        [1,1],
        [0,1],
        [0,1],
      ])
    })

    it('skew', () => {
      expect(
        Tetromino.rotate(
          Tetromino.skew()
        )
      ).to.deep.equal([
        [1,0],
        [1,1],
        [0,1],
      ])
    })
  })

  describe('and can reverse rotate', () => {
    it('L', () => {
      expect(
        Tetromino.rotate.reverse(
          Tetromino.L()
        )
      ).to.deep.equal([
        [1,0],
        [1,0],
        [1,1],
      ])
    })

    it('skew', () => {
      expect(
        Tetromino.rotate.reverse(
          Tetromino.skew()
        )
      ).to.deep.equal([
        [1,0],
        [1,1],
        [0,1],
      ])
    })

    it('T', () => {
      expect(
        Tetromino.rotate.reverse(
          Tetromino.T()
        )
      ).to.deep.equal([
        [1,0],
        [1,1],
        [1,0],
      ])
    })
  });
});
