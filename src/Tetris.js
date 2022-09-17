const { blank, forEach } = require('./Grid');

class Tetris {
  constructor(width = 10, height = 20) {
    this.board = blank(width, height);
  }
}

const reverse = (arr) => () =>
  arr.map(array => array.reverse());

// Swapping height with width results in counter-clockwise transformation
const rotate = (twoDArray) => {
  const originalHeight = twoDArray.length;
  const originalWidth = twoDArray[0].length;

  const newHeight = originalWidth;
  const newWidth = originalHeight;

  const newGrid = blank(newWidth, newHeight);

  forEach(twoDArray, (cell, [i, j], row, grid) => {
    newGrid[j][i] = cell;
  });

  return newGrid;
};

const rotateClockwise = (twoDArray) => reverse(rotate(twoDArray))();
rotateClockwise.reverse = rotate;

const TetrominoFactory = (twoDArray) => {
  fn = () => twoDArray;
  fn.reverse = reverse(twoDArray);
  return fn;
}

const T = TetrominoFactory([
  [1,1,1],
  [0,1,0],
]);

const L = TetrominoFactory([
  [1,1,1],
  [1,0,0],
]);

const skew = TetrominoFactory([
  [0,1,1],
  [1,1,0],
]);

const square = TetrominoFactory([
  [1,1],
  [1,1],
]);

const straight = TetrominoFactory([
  [1,1,1,1],
]);

const Tetromino = {
  T,
  L,
  skew,
  square,
  straight,

  rotate: rotateClockwise,
}

module.exports = {
  Tetris,
  Tetromino,
};
