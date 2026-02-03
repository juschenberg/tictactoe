const board = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.getElementById("status");
const resetButton = document.getElementById("reset");
const difficultySelect = document.getElementById("difficulty");

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let currentPlayer = "X";
let state = Array(9).fill("");
let gameActive = true;
let botThinking = false;

function updateStatus(message) {
  statusText.textContent = message;
}

function handleMove(event) {
  const cell = event.target;
  const index = Number(cell.dataset.index);

  if (!gameActive || botThinking || state[index] !== "") {
    return;
  }

  // Mensch spielt immer X
  if (currentPlayer !== "X") {
    return;
  }

  state[index] = currentPlayer;
  cell.textContent = currentPlayer;

  if (finishIfGameOver()) {
    return;
  }

  currentPlayer = "O";
  updateStatus("Bot denkt...");
  botThinking = true;

  setTimeout(() => {
    botMove();
    botThinking = false;
  }, 350);
}

function checkWinner(stateToCheck = state) {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (
      stateToCheck[a] &&
      stateToCheck[a] === stateToCheck[b] &&
      stateToCheck[a] === stateToCheck[c]
    ) {
      return line;
    }
  }
  return null;
}

function finishIfGameOver() {
  const winnerLine = checkWinner();
  if (winnerLine) {
    gameActive = false;
    highlightWinner(winnerLine);
    updateStatus(`${currentPlayer} gewinnt!`);
    return true;
  }

  if (!state.includes("")) {
    gameActive = false;
    updateStatus("Unentschieden!");
    return true;
  }

  return false;
}

function highlightWinner(line) {
  line.forEach((index) => cells[index].classList.add("winner"));
}

function botMove() {
  if (!gameActive) {
    return;
  }

  const move = chooseBestMove(difficultySelect.value);
  if (move === null) {
    return;
  }

  state[move] = "O";
  cells[move].textContent = "O";

  if (finishIfGameOver()) {
    return;
  }

  currentPlayer = "X";
  updateStatus("X ist am Zug");
}

function chooseBestMove(difficulty) {
  if (difficulty === "easy") {
    return chooseRandomMove();
  }

  if (difficulty === "hard") {
    return chooseMinimaxMove();
  }

  return chooseMediumMove();
}

function chooseMediumMove() {
  const empty = getEmptyIndices();

  // 1. Gewinnzug für O
  const win = findWinningMove("O");
  if (win !== null) return win;

  // 2. Blockiere X
  const block = findWinningMove("X");
  if (block !== null) return block;

  // 3. Mitte
  if (state[4] === "") return 4;

  // 4. Ecke
  const corners = [0, 2, 6, 8].filter((i) => state[i] === "");
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  // 5. Irgendein freies Feld
  if (empty.length) return empty[Math.floor(Math.random() * empty.length)];

  return null;
}

function chooseRandomMove() {
  const empty = getEmptyIndices();
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

function chooseMinimaxMove() {
  let bestScore = -Infinity;
  let bestMove = null;

  getEmptyIndices().forEach((index) => {
    state[index] = "O";
    const score = minimax(state, 0, false);
    state[index] = "";
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  });

  return bestMove;
}

function minimax(boardState, depth, isMaximizing) {
  const winnerLine = checkWinner(boardState);
  if (winnerLine) {
    const winner = boardState[winnerLine[0]];
    return winner === "O" ? 10 - depth : depth - 10;
  }

  if (!boardState.includes("")) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    getEmptyIndices(boardState).forEach((index) => {
      boardState[index] = "O";
      const score = minimax(boardState, depth + 1, false);
      boardState[index] = "";
      bestScore = Math.max(bestScore, score);
    });
    return bestScore;
  }

  let bestScore = Infinity;
  getEmptyIndices(boardState).forEach((index) => {
    boardState[index] = "X";
    const score = minimax(boardState, depth + 1, true);
    boardState[index] = "";
    bestScore = Math.min(bestScore, score);
  });
  return bestScore;
}

function findWinningMove(player) {
  for (const line of winningLines) {
    const [a, b, c] = line;
    const lineValues = [state[a], state[b], state[c]];
    const emptyIndex = line.find((i) => state[i] === "");
    const countPlayer = lineValues.filter((v) => v === player).length;

    if (countPlayer === 2 && emptyIndex !== undefined) {
      return emptyIndex;
    }
  }
  return null;
}

function getEmptyIndices(stateToCheck = state) {
  return stateToCheck
    .map((value, index) => (value === "" ? index : null))
    .filter((value) => value !== null);
}

function resetGame() {
  state = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  botThinking = false;
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("winner");
  });
  updateStatus("X ist am Zug");
}

board.addEventListener("click", (event) => {
  if (event.target.classList.contains("cell")) {
    handleMove(event);
  }
});

resetButton.addEventListener("click", resetGame);
