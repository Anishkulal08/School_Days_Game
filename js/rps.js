// moves and helpers
const moves = ["rock", "paper", "scissors"];

function randomMove() {
  const idx = Math.floor(Math.random() * moves.length);
  return moves[idx];
}

// simple counter AI for hard mode: tries to beat player last move
function counterMove(lastPlayerMove) {
  if (!lastPlayerMove) return randomMove();
  if (lastPlayerMove === "rock") return "paper";
  if (lastPlayerMove === "paper") return "scissors";
  return "rock";
}

function beats(a, b) {
  return (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  );
}

// DOM elements
const difficultySelect = document.getElementById("difficulty");
const targetSelect = document.getElementById("target-points");
const resetBtn = document.getElementById("reset-btn");
const playAgainBtn = document.getElementById("play-again");

const statusLabel = document.getElementById("status-label");
const roundResult = document.getElementById("round-result");
const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const lastPlayerEl = document.getElementById("last-player");
const lastComputerEl = document.getElementById("last-computer");
const choiceButtons = Array.from(document.querySelectorAll(".choice"));

let targetScore = parseInt(targetSelect.value, 10);
let difficulty = difficultySelect.value;
let playerScore = 0;
let computerScore = 0;
let lastPlayerMove = null;
let gameOver = false;

function updateStatusLabel() {
  statusLabel.textContent = `First to ${targetScore} wins • ${difficulty.toUpperCase()}`;
}

function resetMatch() {
  playerScore = 0;
  computerScore = 0;
  lastPlayerMove = null;
  gameOver = false;
  playerScoreEl.textContent = "0";
  computerScoreEl.textContent = "0";
  lastPlayerEl.textContent = "—";
  lastComputerEl.textContent = "—";
  roundResult.textContent = "Make your move!";
  playAgainBtn.hidden = true;
  choiceButtons.forEach(btn => btn.classList.remove("disabled"));
  updateStatusLabel();
}

function lockGame() {
  gameOver = true;
  choiceButtons.forEach(btn => btn.classList.add("disabled"));
  playAgainBtn.hidden = false;
}

function decideComputerMove() {
  if (difficulty === "easy") {
    // 70% random, 30% intentionally losing
    const roll = Math.random();
    if (roll < 0.7 || !lastPlayerMove) {
      return randomMove();
    }
    // choose a move player would beat
    if (lastPlayerMove === "rock") return "scissors";
    if (lastPlayerMove === "paper") return "rock";
    return "paper";
  }

  if (difficulty === "medium") {
    return randomMove();
  }

  // hard mode
  const roll = Math.random();
  if (roll < 0.75) {
    return counterMove(lastPlayerMove);
  }
  return randomMove();
}

function handleRound(playerMove) {
  if (gameOver) return;

  const computerMove = decideComputerMove();
  lastPlayerMove = playerMove;

  lastPlayerEl.textContent = playerMove;
  lastComputerEl.textContent = computerMove;

  choiceButtons.forEach(btn => btn.classList.remove("selected"));
  const pressed = choiceButtons.find(
    btn => btn.dataset.move === playerMove
  );
  if (pressed) pressed.classList.add("selected");

  let message = "";
  if (playerMove === computerMove) {
    message = "It's a draw.";
  } else if (beats(playerMove, computerMove)) {
    playerScore++;
    playerScoreEl.textContent = playerScore;
    playerScoreEl.classList.add("win-pulse");
    setTimeout(() => playerScoreEl.classList.remove("win-pulse"), 250);
    message = "You win this round!";
  } else {
    computerScore++;
    computerScoreEl.textContent = computerScore;
    computerScoreEl.classList.add("win-pulse");
    setTimeout(() => computerScoreEl.classList.remove("win-pulse"), 250);
    message = "Bot wins this round.";
  }

  roundResult.textContent = message;

  if (playerScore >= targetScore || computerScore >= targetScore) {
    if (playerScore > computerScore) {
      roundResult.textContent = "You won the match! 🎉";
    } else {
      roundResult.textContent = "Bot won the match! 🤖";
    }
    lockGame();
  }
}

// events
choiceButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const move = btn.dataset.move;
    handleRound(move);
  });
});

difficultySelect.addEventListener("change", () => {
  difficulty = difficultySelect.value;
  resetMatch();
});

targetSelect.addEventListener("change", () => {
  targetScore = parseInt(targetSelect.value, 10);
  resetMatch();
});

resetBtn.addEventListener("click", resetMatch);
playAgainBtn.addEventListener("click", resetMatch);

// init
updateStatusLabel();
