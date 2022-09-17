const { expect } = require('chai');
const { blank, debug } = require('./Grid');
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

  it('can enact gravity', () => {
    const tetris = new Tetris(4, 5)
    tetris.spawn(Tetromino.T())

    expect(tetris.compositeBoard()).to.deep.equal([
      [0,1,1,1],
      [0,0,1,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
    ])

    tetris.gravity()

    expect(tetris.compositeBoard()).to.deep.equal([
      [0,0,0,0],
      [0,1,1,1],
      [0,0,1,0],
      [0,0,0,0],
      [0,0,0,0],
    ])
  })

  describe('when a tetromino lands', () => {
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

      tetris.gravity()
      expect(tetris.compositeBoard()).to.deep.equal([
        [0,0,0,0],
        [0,1,1,1],
        [0,1,0,0],
        [0,0,0,0],
      ])
      expect(resolved).to.equal(false)

      tetris.gravity()
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

      tetris.gravity()
      expect(tetris.compositeBoard()).to.deep.equal([
        [0,0,0,0],
        [0,1,1,0],
        [0,1,1,0],
        [0,0,0,0],
      ])

      tetris.gravity()
      const expectedBoard = [
        [0,0,0,0],
        [0,0,0,0],
        [0,1,1,0],
        [0,1,1,0],
      ]
      expect(tetris.compositeBoard()).to.deep.equal(expectedBoard)
      expect(tetris.board).to.deep.equal(expectedBoard)
    })
  })
})

describe('Tetromino has', () => {
  it('T', () => {
    expect(Tetromino.T()).to.deep.equal([
      [1,1,1],
      [0,1,0],
    ]);
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
    ]);
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
    ]);
  })

  it('square', () => {
    expect(Tetromino.square()).to.deep.equal([
      [1,1],
      [1,1],
    ]);
  })

  it('straight', () => {
    expect(Tetromino.straight()).to.deep.equal([
      [1,1,1,1],
    ]);
  })

  describe('can rotate', () => {
    it('T', () => {
      expect(
        Tetromino.rotate(
          Tetromino.T()
        )
      ).to.deep.equal([
        [0,1],
        [1,1],
        [0,1],
      ]);

      expect(
        Tetromino.rotate(
          Tetromino.rotate(
            Tetromino.T()
          )
        )
      ).to.deep.equal([
        [0,1,0],
        [1,1,1],
      ]);
    });

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
      ]);
    });
  });

  describe('can reverse rotate', () => {
    it('L', () => {
      expect(
        Tetromino.rotate.reverse(
          Tetromino.L()
        )
      ).to.deep.equal([
        [1,0],
        [1,0],
        [1,1],
      ]);
    });
  });
});
