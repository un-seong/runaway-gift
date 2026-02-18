const card = document.getElementById("card");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const message = document.getElementById("message");

let locked = false;
let yesX = 24;
let yesY = 24;
let targetX = 24;
let targetY = 24;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function getViewportLimits() {
  const btnWidth = yesBtn.offsetWidth;
  const btnHeight = yesBtn.offsetHeight;
  const padding = 12;

  return {
    minX: padding,
    minY: padding,
    maxX: window.innerWidth - btnWidth - padding,
    maxY: window.innerHeight - btnHeight - padding,
    btnWidth,
    btnHeight,
  };
}

function renderYesButton() {
  yesBtn.style.left = `${yesX}px`;
  yesBtn.style.top = `${yesY}px`;
}

function setYesTarget(x, y, immediate = false) {
  const limits = getViewportLimits();

  targetX = clamp(x, limits.minX, limits.maxX);
  targetY = clamp(y, limits.minY, limits.maxY);

  if (immediate) {
    yesX = targetX;
    yesY = targetY;
    renderYesButton();
  }
}

function animateYesButton() {
  yesX += (targetX - yesX) * 0.18;
  yesY += (targetY - yesY) * 0.18;

  if (Math.abs(targetX - yesX) < 0.2) yesX = targetX;
  if (Math.abs(targetY - yesY) < 0.2) yesY = targetY;

  renderYesButton();
  window.requestAnimationFrame(animateYesButton);
}

function dodgeFrom(pointerX, pointerY) {
  if (locked) return;

  const limits = getViewportLimits();
  const centerX = yesX + limits.btnWidth / 2;
  const centerY = yesY + limits.btnHeight / 2;

  const dx = centerX - pointerX;
  const dy = centerY - pointerY;
  const distance = Math.hypot(dx, dy) || 1;

  const push = 180 + randomInRange(70, 140);
  const nextX = yesX + (dx / distance) * push;
  const nextY = yesY + (dy / distance) * push;

  setYesTarget(nextX, nextY);

  yesBtn.style.transform = `scale(${randomInRange(0.97, 1.04)}) rotate(${randomInRange(-5, 5)}deg)`;
  yesBtn.style.filter = "brightness(1.03) saturate(1.12)";

  window.clearTimeout(yesBtn._fxTimer);
  yesBtn._fxTimer = window.setTimeout(() => {
    yesBtn.style.transform = "";
    yesBtn.style.filter = "";
  }, 170);
}

function jumpToFarthestSpot(pointerX, pointerY) {
  if (locked) return;

  const limits = getViewportLimits();
  const spots = [
    { x: limits.minX, y: limits.minY },
    { x: limits.maxX, y: limits.minY },
    { x: limits.minX, y: limits.maxY },
    { x: limits.maxX, y: limits.maxY },
    { x: randomInRange(limits.minX, limits.maxX), y: randomInRange(limits.minY, limits.maxY) },
  ];

  let best = spots[0];
  let bestDistance = -1;

  for (const spot of spots) {
    const d = Math.hypot(pointerX - spot.x, pointerY - spot.y);
    if (d > bestDistance) {
      bestDistance = d;
      best = spot;
    }
  }

  setYesTarget(best.x, best.y);
}

function teleportYesButton() {
  const limits = getViewportLimits();
  setYesTarget(
    randomInRange(limits.minX, limits.maxX),
    randomInRange(limits.minY, limits.maxY)
  );
}

function releaseConfetti() {
  const colors = ["#ff7b72", "#ffd166", "#06d6a0", "#4cc9f0", "#f15bb5"];

  for (let i = 0; i < 30; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.background = colors[i % colors.length];

    piece.style.setProperty("--tx", `${randomInRange(-180, 180)}px`);
    piece.style.setProperty("--ty", `${randomInRange(-170, 160)}px`);
    piece.style.setProperty("--rot", `${randomInRange(120, 680)}deg`);

    card.appendChild(piece);
    window.setTimeout(() => piece.remove(), 900);
  }
}

document.addEventListener("mousemove", (event) => {
  const limits = getViewportLimits();
  const distance = Math.hypot(
    event.clientX - (yesX + limits.btnWidth / 2),
    event.clientY - (yesY + limits.btnHeight / 2)
  );

  if (distance < 180) {
    dodgeFrom(event.clientX, event.clientY);
  }
});

document.addEventListener("pointerdown", (event) => {
  const limits = getViewportLimits();
  const distance = Math.hypot(
    event.clientX - (yesX + limits.btnWidth / 2),
    event.clientY - (yesY + limits.btnHeight / 2)
  );

  if (!locked && distance < 220) {
    jumpToFarthestSpot(event.clientX, event.clientY);
    message.textContent = "예 버튼은 절대 클릭되지 않습니다.";
  }
});

noBtn.addEventListener("click", () => {
  locked = true;
  card.classList.add("is-confirmed");
  message.textContent = "선택 완료: 아니오를 고르셨습니다.";
  releaseConfetti();
});

teleportYesButton();
animateYesButton();

window.addEventListener("resize", () => {
  setYesTarget(yesX, yesY, true);
});
