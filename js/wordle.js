const WORDS = [
  "APPLE","BRAVE","CHAIR","DREAM","EAGLE",
  "FLAME","GIANT","HEART","ISLAND","JOKER",
  "KNIFE","LIGHT","MAGIC","NORTH","OCEAN",
  "PLANT","QUEEN","RIVER","SMILE","TRAIN",
  "URBAN","VIRUS","WORLD","XENON","YOUTH",
  "ZEBRA","STONE","CLOUD","LASER","ROBOT",
  "MANGO","PIXEL","GHOST","SUGAR","METAL",
  "SOUND","LEVEL","CRANE","BLAST","SPORT",
  "WATER","EARTH","MUSIC","SMOKE","SOLAR",
  "PLAZA","GAMER","TRACK","FAITH","TIGER"
];

const boardElem = document.getElementById("board");
const keyboardElem = document.getElementById("keyboard");
const statusElem = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

const ROWS = 6;
const COLS = 5;
const keyboardLayout = [
  "QWERTYUIOP",
  "ASDFGHJKL",
  "ENTERZXCVBNM⌫"
];

let solution = "";
let currentRow = 0;
let currentCol = 0;
let guesses = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
let gameOver = false;

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function createBoard() {
  boardElem.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let c = 0; c < COLS; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.id = `tile-${r}-${c}`;
      row.appendChild(tile);
    }
    boardElem.appendChild(row);
  }
}

function createKeyboard() {
  keyboardElem.innerHTML = "";
  keyboardLayout.forEach(rowStr => {
    const row = document.createElement("div");
    row.className = "kb-row";
    for (const ch of rowStr) {
      const key = document.createElement("button");
      key.className = "key";
      if (ch === "ENTER") continue;
      if (ch === "⌫") {
        key.textContent = "Del";
        key.classList.add("wide");
        key.dataset.key = "BACKSPACE";
      } else {
        key.textContent = ch;
        if (ch === "E" || ch === "R") key.style.flex = 1.1;
        key.dataset.key = ch;
      }
      key.addEventListener("click", () => handleKey(key.dataset.key));
      row.appendChild(key);
    }
    const enterKey = document.createElement("button");
    enterKey.className = "key wide";
    enterKey.textContent = "Enter";
    enterKey.dataset.key = "ENTER";
    enterKey.addEventListener("click", () => handleKey("ENTER"));
    if (!rowStr.includes("ENTER")) {
      if (rowStr.includes("A")) {
        row.insertBefore(enterKey, row.firstChild);
      } else {
        row.appendChild(enterKey);
      }
    }
    keyboardElem.appendChild(row);
  });
}

function setStatus(msg, type = "") {
  statusElem.innerHTML = "";
  if (!msg) return;
  const span = document.createElement("span");
  span.textContent = msg;
  if (type) span.classList.add(type);
  statusElem.appendChild(span);
}

function updateBoard() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = document.getElementById(`tile-${r}-${c}`);
      tile.textContent = guesses[r][c];
      tile.classList.toggle("filled", guesses[r][c] !== "");
    }
  }
}

function handleKey(key) {
  if (gameOver) return;
  if (/^[A-Z]$/.test(key)) {
    if (currentCol < COLS) {
      guesses[currentRow][currentCol] = key;
      const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
      tile.classList.remove("shake");
      tile.classList.add("pop");
      setTimeout(() => tile.classList.remove("pop"), 120);
      currentCol++;
      updateBoard();
      setStatus("");
    }
  } else if (key === "BACKSPACE") {
    if (currentCol > 0) {
      currentCol--;
      guesses[currentRow][currentCol] = "";
      updateBoard();
      setStatus("");
    }
  } else if (key === "ENTER") {
    if (currentCol < COLS) {
      shakeRow(currentRow);
      setStatus("Not enough letters.", "error");
      return;
    }
    submitGuess();
  }
}

function evaluateGuess(guess) {
  const result = Array(COLS).fill("absent");
  const solArr = solution.split("");
  const used = Array(COLS).fill(false);

  for (let i = 0; i < COLS; i++) {
    if (guess[i] === solArr[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

  for (let i = 0; i < COLS; i++) {
    if (result[i] === "correct") continue;
    const idx = solArr.findIndex((ch, j) => ch === guess[i] && !used[j]);
    if (idx !== -1) {
      result[i] = "present";
      used[idx] = true;
    }
  }

  return result;
}

function updateKeyboardColors(guess, evaluation) {
  for (let i = 0; i < COLS; i++) {
    const letter = guess[i];
    const state = evaluation[i];
    const keyBtn = keyboardElem.querySelector(`.key[data-key="${letter}"]`);
    if (!keyBtn) return;
    if (state === "correct") {
      keyBtn.classList.remove("present", "absent");
      keyBtn.classList.add("correct");
    } else if (state === "present") {
      if (!keyBtn.classList.contains("correct")) {
        keyBtn.classList.remove("absent");
        keyBtn.classList.add("present");
      }
    } else if (state === "absent") {
      if (!keyBtn.classList.contains("correct") && !keyBtn.classList.contains("present")) {
        keyBtn.classList.add("absent");
      }
    }
  }
}

function flipRow(rowIndex, evaluation, callback) {
  const guess = guesses[rowIndex];
  for (let c = 0; c < COLS; c++) {
    const tile = document.getElementById(`tile-${rowIndex}-${c}`);
    tile.classList.add("flip");
    setTimeout(() => {
      tile.classList.remove("flip");
      tile.classList.add(evaluation[c]);
      if (c === COLS - 1 && callback) callback();
    }, 250 + c * 120);
  }
  updateKeyboardColors(guess, evaluation);
}

function shakeRow(rowIndex) {
  for (let c = 0; c < COLS; c++) {
    const tile = document.getElementById(`tile-${rowIndex}-${c}`);
    tile.classList.remove("shake");
    void tile.offsetWidth;
    tile.classList.add("shake");
  }
}

function submitGuess() {
  const guess = guesses[currentRow].join("");
  const evaluation = evaluateGuess(guess);

  flipRow(currentRow, evaluation, () => {
    if (guess === solution) {
      setStatus(`Nice! You got "${solution}".`, "win");
      gameOver = true;
      return;
    }
    if (currentRow === ROWS - 1) {
      setStatus(`Out of tries. Word was "${solution}".`, "lose");
      gameOver = true;
      return;
    }
    currentRow++;
    currentCol = 0;
  });
}

function resetGame() {
  solution = randomWord();
  currentRow = 0;
  currentCol = 0;
  guesses = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
  gameOver = false;
  createBoard();
  updateBoard();
  keyboardElem.querySelectorAll(".key").forEach(k => {
    k.classList.remove("correct", "present", "absent");
  });
  setStatus("");
}

document.addEventListener("keydown", (e) => {
  const key = e.key;
  if (key === "Enter") {
    handleKey("ENTER");
  } else if (key === "Backspace") {
    handleKey("BACKSPACE");
  } else {
    const upper = key.toUpperCase();
    if (/^[A-Z]$/.test(upper)) {
      handleKey(upper);
    }
  }
});

restartBtn.addEventListener("click", resetGame);

createBoard();
createKeyboard();
resetGame();