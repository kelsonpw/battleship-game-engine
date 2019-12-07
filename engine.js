function indexArray(start, end) {
  let i = start;
  let arr = [];
  while (i <= end) {
    arr.push(i);
    i++;
  }
  return arr;
}

function isRowValid(matrix, start, end, col) {
  const min = Math.min(start, end);
  const max = Math.max(start, end);

  return indexArray(min, max).reduce((res, row) => {
    if (!matrix[row] || matrix[row][col] !== ' ') {
      return false;
    }
    return res;
  }, true);
}

function isColValid(matrix, start, end, row) {
  const min = Math.min(start, end);
  const max = Math.max(start, end);

  return indexArray(min, max).reduce((res, col) => {
    if (!matrix[row] || matrix[row][col] !== ' ') {
      return false;
    }
    return res;
  }, true);
}

function randomSquare(matrix) {
  const row = Math.floor(matrix.length * Math.random());
  const column = Math.floor(matrix[0].length * Math.random());

  if (['O', 'X', 'S'].includes(matrix[row][column])) {
    return randomSquare(matrix);
  }
  return [row, column];
}

function fillShip(gameMatrix, startRow, startCol, endRow, endCol) {
  if (startRow === endRow) {
    if (startCol < endCol) {
      let currCol = startCol;
      while (currCol < endCol) {
        gameMatrix[startRow][currCol] = 'S';
        currCol += 1;
      }
    } else {
      let currCol = startCol;
      while (currCol > endCol) {
        gameMatrix[startRow][currCol] = 'S';
        currCol -= 1;
      }
    }
  } else {
    if (startRow < endRow) {
      let currRow = startRow;
      while (currRow < endRow) {
        gameMatrix[currRow][startCol] = 'S';
        currRow += 1;
      }
    } else {
      let currRow = startRow;
      while (currRow > endRow) {
        gameMatrix[currRow][startCol] = 'S';
        currRow -= 1;
      }
    }
  }
  return gameMatrix;
}

function placeShip(gameMatrix, shipLength) {
  const [startingRow, startingCol] = randomSquare(gameMatrix);
  const direction = ['up', 'down', 'left', 'right'][
    Math.floor(Math.random() * 4)
  ];

  if (direction === 'left' || direction === 'right') {
    const endCol =
      startingCol + (direction === 'left' ? -1 * shipLength : shipLength);
    const isValid = isColValid(gameMatrix, startingCol, endCol, startingRow);
    if (isValid) {
      return fillShip(
        gameMatrix,
        startingRow,
        startingCol,
        startingRow,
        endCol
      );
    }
  }
  if (direction === 'up' || direction === 'down') {
    const endRow =
      startingRow + (direction === 'up' ? -1 * shipLength : shipLength);
    const isValid = isRowValid(gameMatrix, startingRow, endRow, startingCol);
    if (isValid) {
      return fillShip(
        gameMatrix,
        startingRow,
        startingCol,
        endRow,
        startingCol
      );
    }
  }
  return placeShip(gameMatrix, shipLength);
}

function createGameMatrix(ships, rows, cols) {
  const startingMatrix = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ' ')
  );
  return ships.reduce((matrix, ship) => {
    return placeShip(matrix, ship);
  }, startingMatrix);
}

function startGame(rows = 8, cols = 8) {
  const ships = [2, 3, 4];

  let currentMatrix = createGameMatrix(ships, rows, cols);
  let attempts = [];
  let hits = 0;
  return {
    unmask() {
      return currentMatrix;
    },
    board() {
      return currentMatrix.map(row =>
        row.map(col => (col === 'S' ? ' ' : col))
      );
    },
    shoot(row, col) {
      const rowN = Number(row);
      const colN = Number(col);
      const hit = currentMatrix[rowN][colN] === 'S';
      currentMatrix[rowN][colN] = hit ? 'X' : 'O';
      hit && hits++;
      return hit;
    },
    valid(row, col) {
      const attempt = [Number(row), Number(col)];
      const inRange = Number(row) < rows && Number(col) < cols;
      const attempted = attempts.find(
        a => a[0] === attempt[0] && a[1] === attempt[1]
      );
      if (attempted) {
        return 'already attempted';
      }
      if (!inRange) {
        return 'out of range';
      }
      attempts.push(attempt);
      return null;
    },
    winner() {
      const shipTotal = ships.reduce((total, ship) => total + ship, 0);
      return (
        currentMatrix.reduce((total, matrixRow) => {
          return matrixRow.reduce((innerTotal, col) => {
            return innerTotal + (col === 'X' ? 1 : 0);
          }, total);
        }, 0) === shipTotal
      );
    },
    hits() {
      return hits;
    },
    size() {
      return rows * cols;
    },
  };
}

function startMultiplayerGame(players = 2, rows = 8, cols = 8) {
  return indexArray(0, players).reduce((acc, player) => {
    return {
      ...acc,
      [`player${player + 1}`]: startGame(rows, cols),
    };
  }, {});
}

module.exports = { startGame, startMultiplayerGame };
