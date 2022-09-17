const { expect } = require('chai');
const { Tetris, Tetromino } = require('./Tetris');

describe.only('Tetris', () => {
  it('returns new empty grid to begin with, by default 10 * 20', () => {
    const emptyRow = Array.from({ length: 10 }).fill(0);
    const emptyGrid = Array.from({ length: 20 }).fill(emptyRow);

    const tetris = new Tetris();
    expect(tetris.board).to.deep.equal(emptyGrid);
  });
});

describe.only('Tetromino has', () => {
  it('T', () => {
    expect(Tetromino.T()).to.deep.equal([
      [1,1,1],
      [0,1,0],
    ]);
  });

  it('L', () => {
    expect(Tetromino.L()).to.deep.equal([
      [1,1,1],
      [1,0,0],
    ]);
  });

  it('L.reverse', () => {
    expect(Tetromino.L.reverse()).to.deep.equal([
      [1,1,1],
      [0,0,1],
    ]);
  });

  it('skew', () => {
    expect(Tetromino.skew()).to.deep.equal([
      [0,1,1],
      [1,1,0],
    ]);
  });

  it('skew.reverse', () => {
    expect(Tetromino.skew.reverse()).to.deep.equal([
      [1,1,0],
      [0,1,1],
    ]);
  });

  it('square', () => {
    expect(Tetromino.square()).to.deep.equal([
      [1,1],
      [1,1],
    ]);
  });

  it('straight', () => {
    expect(Tetromino.straight()).to.deep.equal([
      [1,1,1,1],
    ]);
  });

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
