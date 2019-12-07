const inquirer = require('inquirer');
const { startGame } = require('./engine');

async function startCli() {
  const { start } = await inquirer.prompt([
    {
      name: 'start',
      message: 'Would you like to play Battleship?',
      default: 'yes',
    },
  ]);

  if (start.match(/y/)) {
    const { rows, cols } = await inquirer.prompt([
      {
        name: 'rows',
        message: 'How many rows?',
        default: '8',
      },
      {
        name: 'cols',
        message: 'How many cols?',
        default: '8',
      },
    ]);
    const game = startGame(Number(rows), Number(cols));
    return shoot(game);
  }
  if (!start.match(/n/)) {
    return startCli();
  }
}

async function shoot(game, message, prevHit) {
  console.log('\n');
  printBoard(game);
  if (message) {
    console.log(`That was invalid: ${message}`);
  } else {
    if (prevHit === true) {
      console.log('That was a hit!');
    }
    if (prevHit === false) {
      console.log('That was a miss!');
    }
  }
  const { shootRow, shootCol } = await inquirer.prompt([
    {
      name: 'shootRow',
      message: 'What row would you like to shoot?',
    },
    {
      name: 'shootCol',
      message: 'What col would you like to shoot?',
    },
  ]);

  if ([shootRow, shootCol].includes('stats')) {
    await inquirer.prompt([
      {
        name: 'stats',
        message: () =>
          console.table({
            count: {
              hit: game.hits(),
              miss: game.size() - game.hits(),
            },
          }),
      },
    ]);

    return shoot(game);
  }
  const errorMsg = game.valid(shootRow, shootCol);
  let hit;
  if (!errorMsg) {
    hit = game.shoot(shootRow, shootCol);
    if (game.winner()) {
      winner(game);
    }
  }
  shoot(game, errorMsg, hit);
}

async function winner(game) {
  console.table(game.unmask());
  const { playAgain } = await inquirer.prompt([
    { name: 'playAgain', message: 'You won! Play again?', default: 'yes' },
  ]);
  if (playAgain.match(/y/)) {
    startCli();
  }
}

function printBoard(game) {
  const board = game.board();
  console.log(
    board.reduce((str, row) => {
      return str + row.map(c => (c === ' ' ? '*' : c)).join(' ') + '\n';
    }, '')
  );
}

startCli();

module.exports = { cli: startCli };
