const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const timeEl = document.getElementById("time");
const restartBtn = document.getElementById("restartBtn");
const difficultySelect = document.getElementById("difficulty");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

/* Canvas scaling - FIXED for all devices */
function resizeCanvas() {
  const container = canvas.parentElement;
  const maxWidth = Math.min(800, window.innerWidth * 0.95);
  const ratio = 9 / 10;
  const width = Math.min(maxWidth, container.clientWidth);
  const height = width /ratio;
  
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
}
window.addEventListener("resize", resizeCanvas);

/* Game state */
let paddle, star, bomb, particles;
let keys = { left: false, right: false };
let touch = { left: false, right: false };
let isDragging = false;
let score = 0;
let best = Number(localStorage.getItem("catchStarBest") || 0);
let remaining = 60;
let lastTime = 0;
let timerId = null;
let difficulty = "easy";
let starSpeedY = 180;
let starSpeedX = 30;
let bombChance = 0.25;

/* Colors */
const colors = {
  paddle: "#ffd93b",
  star: "#fffb8f",
  starGlow: "rgba(255, 249, 196, 0.9)",
  bombGlow: "#ff4b4b",
  text: "#f7f7ff"
};

/* Helpers */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/* Entities */
function resetPaddle() {
  const w = canvas.width * 0.18;
  const h = canvas.height * 0.03;
  paddle = {
    w, h,
    x: (canvas.width - w) / 2,
    y: canvas.height - h * 2.4,
    speed: canvas.width * 1.1
  };
}

function resetStar(initialDrop = false) {
  const size = canvas.width * 0.065;
  star = {
    r: size / 2,
    x: rand(size, canvas.width - size),
    y: initialDrop ? rand(-canvas.height * 0.4, -size) : -size,
    vy: starSpeedY,
    vx: rand(-starSpeedX, starSpeedX)
  };
}

function resetBomb(initialDrop = false) {
  const size = canvas.width * 0.06;
  bomb = {
    r: size / 2,
    x: rand(size, canvas.width - size),
    y: initialDrop ? rand(-canvas.height * 0.6, -size) : -size,
    vy: starSpeedY * 1.05,
    vx: rand(-starSpeedX * 1.2, starSpeedX * 1.2)
  };
}

function spawnCatchParticles(px, py) {
  particles = [];
  const count = 16;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: px, y: py,
      vx: rand(-140, 140),
      vy: rand(-80, -220),
      life: 0.6, age: 0
    });
  }
}

function spawnBombParticles(px, py) {
  const count = 12;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: px, y: py,
      vx: rand(-200, 200),
      vy: rand(-150, 50),
      life: 0.8, age: 0,
      isBomb: true
    });
  }
}

function updateParticles(dt) {
  if (!particles) return;
  particles.forEach(p => {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 420 * dt;
  });
  particles = particles.filter(p => p.age < p.life);
}

/* Difficulty */
function applyDifficulty() {
  switch (difficulty) {
    case "medium":
      starSpeedY = 230; starSpeedX = 60; bombChance = 0.35; remaining = 50; break;
    case "hard":
      starSpeedY = 290; starSpeedX = 90; bombChance = 0.45; remaining = 40; break;
    default:
      starSpeedY = 180; starSpeedX = 40; bombChance = 0.25; remaining = 60;
  }
  timeEl.textContent = remaining.toString();
}

/* Reset game */
function resetGame() {
  resizeCanvas();
  applyDifficulty();
  resetPaddle();
  resetStar(true);
  resetBomb(true);
  particles = [];
  score = 0;
  scoreEl.textContent = score;
  bestEl.textContent = best;
  lastTime = 0;
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      remaining = 0;
      clearInterval(timerId);
    }
    timeEl.textContent = remaining.toString();
  }, 1000);
}

/* UNIVERSAL DRAG - Works on mobile touch AND laptop mouse [web:27][web:34] */
canvas.style.touchAction = "none";
canvas.style.cursor = "pointer";

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function movePaddleTo(x) {
  paddle.x = x - paddle.w / 2;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;
}

// Mouse events (laptop)
canvas.addEventListener("mousedown", e => {
  const pos = getCanvasPos(e);
  if (pos.y > paddle.y - paddle.h * 2) {
    isDragging = true;
    movePaddleTo(pos.x);
  }
});

canvas.addEventListener("mousemove", e => {
  if (isDragging) {
    const pos = getCanvasPos(e);
    movePaddleTo(pos.x);
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

// Touch events (mobile)
canvas.addEventListener("touchstart", e => {
  const pos = getCanvasPos(e);
  if (pos.y > paddle.y - paddle.h * 2) {
    isDragging = true;
    movePaddleTo(pos.x);
  }
  e.preventDefault();
});

canvas.addEventListener("touchmove", e => {
  if (isDragging) {
    const pos = getCanvasPos(e);
    movePaddleTo(pos.x);
    e.preventDefault();
  }
});

canvas.addEventListener("touchend", () => {
  isDragging = false;
});

/* Keyboard + Touch buttons (backup controls) */
window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
  if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
});

window.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
  if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
});

function bindTouchButton(btn, side) {
  btn.addEventListener("touchstart", e => { e.preventDefault(); touch[side] = true; });
  btn.addEventListener("touchend", e => { e.preventDefault(); touch[side] = false; });
  btn.addEventListener("touchcancel", e => { e.preventDefault(); touch[side] = false; });
}
bindTouchButton(leftBtn, "left");
bindTouchButton(rightBtn, "right");

/* Update logic */
function update(dt) {
  if (remaining <= 0) return;

  const moveLeft = keys.left || touch.left;
  const moveRight = keys.right || touch.right;

  if (moveLeft) paddle.x -= paddle.speed * dt;
  if (moveRight) paddle.x += paddle.speed * dt;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;

  // Star update
  star.y += star.vy * dt; star.x += star.vx * dt;
  if (star.x - star.r < 0 || star.x + star.r > canvas.width) star.vx *= -1;

  const sCenterX = star.x, sCenterY = star.y + star.r * 0.8;
  const sWithinX = sCenterX > paddle.x && sCenterX < paddle.x + paddle.w;
  const sTouchingY = sCenterY + star.r > paddle.y && sCenterY < paddle.y + paddle.h;

  if (sWithinX && sTouchingY && star.vy > 0) {
    score++; scoreEl.textContent = score;
    if (score > best) {
      best = score; bestEl.textContent = best;
      localStorage.setItem("catchStarBest", best.toString());
    }
    spawnCatchParticles(sCenterX, paddle.y);
    resetStar();
  } else if (star.y - star.r > canvas.height) {
    resetStar();
  }

  // Bomb update
  bomb.y += bomb.vy * dt; bomb.x += bomb.vx * dt;
  if (bomb.x - bomb.r < 0 || bomb.x + bomb.r > canvas.width) bomb.vx *= -1;

  const bCenterX = bomb.x, bCenterY = bomb.y + bomb.r * 0.8;
  const bWithinX = bCenterX > paddle.x && bCenterX < paddle.x + paddle.w;
  const bTouchingY = bCenterY + bomb.r > paddle.y && bCenterY < paddle.y + paddle.h;

  if (bWithinX && bTouchingY && bomb.vy > 0) {
    score = Math.max(0, score - 3);
    scoreEl.textContent = score;
    spawnBombParticles(bCenterX, paddle.y);
    resetBomb();
  } else if (bomb.y - bomb.r > canvas.height) {
    resetBomb();
  }

  updateParticles(dt);
}

/* Drawing functions (unchanged) */
function drawBackground() {
  const g = ctx.createRadialGradient(canvas.width/2, canvas.height*0.2, canvas.width*0.1, canvas.width/2, canvas.height*0.8, canvas.width);
  g.addColorStop(0, "#1c2541"); g.addColorStop(0.4, "#0b132b"); g.addColorStop(1, "#020010");
  ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.18)";
  for (let i = 0; i < 40; i++) {
    const x = (i * 67) % canvas.width;
    const y = (i * 123) % canvas.height;
    const r = (i % 3) + 0.4;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawPaddle() {
  ctx.save(); ctx.shadowColor = colors.paddle; ctx.shadowBlur = 18;
  const radius = paddle.h / 2, x = paddle.x, y = paddle.y, w = paddle.w, h = paddle.h;
  ctx.beginPath();
  ctx.moveTo(x + radius, y); ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius); ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h); ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius); ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y); ctx.closePath();

  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, "#ffe66d"); grad.addColorStop(1, "#f9a826");
  ctx.fillStyle = grad; ctx.fill(); ctx.restore();
}

function drawStar() {
  ctx.save(); ctx.translate(star.x, star.y); ctx.shadowColor = colors.starGlow; ctx.shadowBlur = 24;
  const spikes = 5, outerRadius = star.r, innerRadius = star.r * 0.45;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    const px = Math.cos(angle) * radius, py = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius);
  grad.addColorStop(0, "#fffbe0"); grad.addColorStop(0.5, colors.star); grad.addColorStop(1, "#ffb703");
  ctx.fillStyle = grad; ctx.fill(); ctx.restore();
}

function drawBomb() {
  ctx.save(); ctx.translate(bomb.x, bomb.y); ctx.shadowColor = colors.bombGlow; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(0, 0, bomb.r, 0, Math.PI * 2);
  const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bomb.r);
  bodyGrad.addColorStop(0, "#ffb3b3"); bodyGrad.addColorStop(0.4, "#ff4b4b"); bodyGrad.addColorStop(1, "#3b0000");
  ctx.fillStyle = bodyGrad; ctx.fill();

  ctx.strokeStyle = "#ffa600"; ctx.lineWidth = bomb.r * 0.18; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(bomb.r * 0.2, -bomb.r * 0.9);
  ctx.quadraticCurveTo(bomb.r * 0.9, -bomb.r * 1.3, bomb.r * 0.4, -bomb.r * 1.7); ctx.stroke();

  ctx.fillStyle = "#ffff66"; ctx.beginPath(); ctx.arc(bomb.r * 0.4, -bomb.r * 1.75, bomb.r * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawParticles() {
  if (!particles) return;
  particles.forEach(p => {
    const t = p.age / p.life, alpha = 1 - t;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = p.isBomb ? "#ff6b6b" : (t < 0.5 ? "#ffe66d" : "#ff6bcb");
    ctx.beginPath(); ctx.arc(p.x, p.y, 4 - t * 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
}

function render() {
  drawBackground(); drawPaddle(); drawStar(); drawBomb(); drawParticles();

  if (remaining <= 0) {
    ctx.save();
    ctx.fillStyle = "rgba(3, 7, 30, 0.7)";
    ctx.fillRect(0, canvas.height * 0.35, canvas.width, canvas.height * 0.3);

    ctx.fillStyle = colors.text; ctx.textAlign = "center";
    ctx.font = `${canvas.width * 0.065}px system-ui`;
    ctx.fillText("Time's Up!", canvas.width / 2, canvas.height * 0.47);

    ctx.font = `${canvas.width * 0.045}px system-ui`;
    ctx.fillStyle = colors.paddle;
    ctx.fillText(`Score: ${score}  •  Best: ${best}`, canvas.width / 2, canvas.height * 0.54);

    ctx.font = `${canvas.width * 0.035}px system-ui`;
    ctx.fillStyle = "#c7c9ff";
    ctx.fillText("Click Restart to play again", canvas.width / 2, canvas.height * 0.62);
    ctx.restore();
  }
}

/* Main loop */
function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;
  update(dt); render();
  requestAnimationFrame(loop);
}

/* Events */
restartBtn.addEventListener("click", resetGame);
difficultySelect.addEventListener("change", e => { difficulty = e.target.value; resetGame(); });

/* Init */
bestEl.textContent = best;
resizeCanvas(); // Fixed: call resize first
resetGame();
requestAnimationFrame(loop);