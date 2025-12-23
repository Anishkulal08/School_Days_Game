const board = document.getElementById("board");
const statusText = document.getElementById("status");
let cells = Array(9).fill("");
let current = "X";

function drawBoard() {
  board.innerHTML = "";
  cells.forEach((cell, i) => {
    const div = document.createElement("div");
    div.className = "cell";
    div.innerText = cell;
    div.onclick = () => play(i);
    board.appendChild(div);
  });
}

function play(i) {
  if (cells[i]) return;
  cells[i] = current;
  if (checkWin()) {
    statusText.innerText = current + " wins!";
    return;
  }
  current = current === "X" ? "O" : "X";
  drawBoard();
}

function checkWin() {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(p => p.every(i => cells[i] === current));
}

function reset() {
  cells = Array(9).fill("");
  current = "X";
  statusText.innerText = "";
  drawBoard();
}

drawBoard();
