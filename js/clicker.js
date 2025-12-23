// ================================
// GALACTIC CLICKER - script.js
// ================================

// 1. Initial State
let score = 0;
let clickValue = 1;
let autoValue = 0;
let multPrice = 10;
let autoPrice = 50;

// 2. Elements
const scoreDisplay = document.getElementById("score");
const autoRateDisplay = document.getElementById("auto-rate");
const clickBtn = document.getElementById("click-btn");
const multBtn = document.getElementById("buy-multiplier");
const autoBtn = document.getElementById("buy-auto");
const resetBtn = document.getElementById("reset-btn");

// 3. UI Update
function updateUI() {
    scoreDisplay.innerText = Math.floor(score);
    autoRateDisplay.innerText = `Income: ${autoValue}/sec`;

    document.getElementById("mult-cost").innerText = multPrice;
    document.getElementById("auto-cost").innerText = autoPrice;

    multBtn.disabled = score < multPrice;
    autoBtn.disabled = score < autoPrice;
}

// 4. Floating Text Effect
function createFloatingText(x, y, value) {
    const float = document.createElement("div");
    float.className = "floaty-text";
    float.innerText = `+${value}`;
    float.style.left = `${x}px`;
    float.style.top = `${y}px`;

    document.body.appendChild(float);

    setTimeout(() => {
        float.remove();
    }, 800);
}

// 5. Click Handler (Desktop + Mobile Safe)
clickBtn.addEventListener("click", (e) => {
    score += clickValue;

    const rect = clickBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    createFloatingText(x, y, clickValue);
    updateUI();
});

// 6. Buy Multiplier
multBtn.addEventListener("click", () => {
    if (score >= multPrice) {
        score -= multPrice;
        clickValue += 1;
        multPrice = Math.round(multPrice * 1.6);
        updateUI();
    }
});

// 7. Buy Auto Income
autoBtn.addEventListener("click", () => {
    if (score >= autoPrice) {
        score -= autoPrice;
        autoValue += 1;
        autoPrice = Math.round(autoPrice * 1.8);
        updateUI();
    }
});

// 8. Auto Income Loop
setInterval(() => {
    if (autoValue > 0) {
        score += autoValue;
        updateUI();
    }
}, 1000);

// 9. Reset Game
resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset your mission?")) {
        location.reload();
    }
});

// 10. Start Game
updateUI();