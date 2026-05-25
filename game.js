const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const COLORS = {
  I: "#22d3ee",
  J: "#60a5fa",
  L: "#f59e0b",
  O: "#facc15",
  S: "#34d399",
  T: "#c084fc",
  Z: "#fb7185"
};

const SHAPES = {
  I: [[1, 1, 1, 1]],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ]
};

const boardCanvas = document.querySelector("#board");
const boardContext = boardCanvas.getContext("2d");
const nextCanvas = document.querySelector("#next");
const nextContext = nextCanvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const linesElement = document.querySelector("#lines");
const levelElement = document.querySelector("#level");
const overlay = document.querySelector("#overlay");
const overlayTitle = document.querySelector("#overlayTitle");
const overlayText = document.querySelector("#overlayText");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");

let board;
let current;
let nextPiece;
let score;
let lines;
let level;
let dropCounter;
let dropInterval;
let lastTime;
let running;
let paused;
let gameOver;

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece() {
  const types = Object.keys(SHAPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const matrix = SHAPES[type].map((row) => [...row]);
  return {
    type,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: 0
  };
}

function resetGame() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  dropCounter = 0;
  dropInterval = 900;
  lastTime = 0;
  running = true;
  paused = false;
  gameOver = false;
  current = randomPiece();
  nextPiece = randomPiece();
  updateStats();
  hideOverlay();
  draw();
  requestAnimationFrame(update);
}

function collide(piece, offsetX = 0, offsetY = 0, matrix = piece.matrix) {
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (!matrix[y][x]) continue;
      const nextX = piece.x + x + offsetX;
      const nextY = piece.y + y + offsetY;
      if (nextX < 0 || nextX >= COLS || nextY >= ROWS) return true;
      if (nextY >= 0 && board[nextY][nextX]) return true;
    }
  }
  return false;
}

function mergePiece() {
  current.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        board[current.y + y][current.x + x] = current.type;
      }
    });
  });
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }

  if (cleared > 0) {
    const lineScores = [0, 100, 300, 500, 800];
    score += lineScores[cleared] * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(120, 900 - (level - 1) * 75);
    updateStats();
  }
}

function spawnPiece() {
  current = nextPiece;
  current.x = Math.floor((COLS - current.matrix[0].length) / 2);
  current.y = 0;
  nextPiece = randomPiece();

  if (collide(current)) {
    running = false;
    gameOver = true;
    showOverlay("Game Over", "Press Start to play again");
  }
}

function drop() {
  if (!running || paused) return;
  if (!collide(current, 0, 1)) {
    current.y += 1;
  } else {
    mergePiece();
    clearLines();
    spawnPiece();
  }
  dropCounter = 0;
}

function softDrop() {
  if (!running || paused) return;
  drop();
  score += 1;
  updateStats();
}

function hardDrop() {
  if (!running || paused) return;
  let distance = 0;
  while (!collide(current, 0, 1)) {
    current.y += 1;
    distance += 1;
  }
  score += distance * 2;
  updateStats();
  drop();
}

function move(offset) {
  if (!running || paused || collide(current, offset, 0)) return;
  current.x += offset;
}

function rotate(matrix) {
  return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
}

function rotatePiece() {
  if (!running || paused || current.type === "O") return;
  const rotated = rotate(current.matrix);
  const originalX = current.x;
  const kicks = [0, -1, 1, -2, 2];

  for (const kick of kicks) {
    current.x = originalX + kick;
    if (!collide(current, 0, 0, rotated)) {
      current.matrix = rotated;
      return;
    }
  }

  current.x = originalX;
}

function togglePause() {
  if (!running || gameOver) return;
  paused = !paused;
  pauseButton.textContent = paused ? "Resume" : "Pause";
  if (paused) {
    showOverlay("Paused", "Press P to resume");
  } else {
    hideOverlay();
    lastTime = performance.now();
    requestAnimationFrame(update);
  }
}

function drawCell(context, x, y, color, size = BLOCK) {
  const px = x * size;
  const py = y * size;
  context.fillStyle = color;
  context.fillRect(px + 1, py + 1, size - 2, size - 2);
  context.fillStyle = "rgba(255, 255, 255, 0.18)";
  context.fillRect(px + 2, py + 2, size - 4, 4);
  context.fillStyle = "rgba(0, 0, 0, 0.18)";
  context.fillRect(px + 2, py + size - 6, size - 4, 4);
}

function drawBoard() {
  boardContext.fillStyle = "#0b0d11";
  boardContext.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  boardContext.strokeStyle = "#252c36";
  boardContext.lineWidth = 1;

  for (let x = 0; x <= COLS; x += 1) {
    boardContext.beginPath();
    boardContext.moveTo(x * BLOCK + 0.5, 0);
    boardContext.lineTo(x * BLOCK + 0.5, boardCanvas.height);
    boardContext.stroke();
  }

  for (let y = 0; y <= ROWS; y += 1) {
    boardContext.beginPath();
    boardContext.moveTo(0, y * BLOCK + 0.5);
    boardContext.lineTo(boardCanvas.width, y * BLOCK + 0.5);
    boardContext.stroke();
  }

  board.forEach((row, y) => {
    row.forEach((type, x) => {
      if (type) drawCell(boardContext, x, y, COLORS[type]);
    });
  });
}

function drawPiece(piece, context = boardContext, size = BLOCK, offsetX = 0, offsetY = 0) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawCell(context, piece.x + x + offsetX, piece.y + y + offsetY, COLORS[piece.type], size);
      }
    });
  });
}

function drawNext() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  nextContext.fillStyle = "#161b22";
  nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  const size = 24;
  const width = nextPiece.matrix[0].length;
  const height = nextPiece.matrix.length;
  const preview = {
    ...nextPiece,
    x: Math.floor((nextCanvas.width / size - width) / 2),
    y: Math.floor((nextCanvas.height / size - height) / 2)
  };
  drawPiece(preview, nextContext, size);
}

function draw() {
  drawBoard();
  if (current && !gameOver) drawPiece(current);
  if (nextPiece) drawNext();
}

function update(time = 0) {
  if (!running || paused) {
    draw();
    return;
  }

  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if (dropCounter > dropInterval) drop();
  draw();
  requestAnimationFrame(update);
}

function updateStats() {
  scoreElement.textContent = score;
  linesElement.textContent = lines;
  levelElement.textContent = level;
}

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
  pauseButton.textContent = "Pause";
}

document.addEventListener("keydown", (event) => {
  if (event.repeat && event.code === "Space") return;

  const handledKeys = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space", "KeyX", "KeyP"];
  if (handledKeys.includes(event.code)) event.preventDefault();

  if (event.code === "ArrowLeft") move(-1);
  if (event.code === "ArrowRight") move(1);
  if (event.code === "ArrowDown") softDrop();
  if (event.code === "ArrowUp" || event.code === "KeyX") rotatePiece();
  if (event.code === "Space") hardDrop();
  if (event.code === "KeyP") togglePause();
  draw();
});

startButton.addEventListener("click", resetGame);
pauseButton.addEventListener("click", togglePause);

board = createBoard();
score = 0;
lines = 0;
level = 1;
running = false;
paused = false;
gameOver = false;
current = randomPiece();
nextPiece = randomPiece();
updateStats();
showOverlay("Tetris", "Press Start to play");
draw();
