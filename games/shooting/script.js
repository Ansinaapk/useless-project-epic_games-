const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = { x: 400, y: 450, width: 30, height: 30, speed: 5 };
let bullets = [];
let enemies = [];
let gameTime = 30;
let survivedTime = 0;
let gameActive = true;
let countdown;

document.addEventListener("keydown", movePlayer);
document.addEventListener("keyup", shootBullet);

function movePlayer(e) {
  if (!gameActive) return;
  if (e.key === "ArrowLeft" && player.x > 0) player.x -= player.speed;
  if (e.key === "ArrowRight" && player.x < canvas.width - player.width) player.x += player.speed;
}

function shootBullet(e) {
  if (!gameActive) return;
  if (e.code === "Space") {
    let randomAngle = Math.random() * Math.PI * 2; 
    let speed = 5;
    bullets.push({
      x: player.x + player.width / 2,
      y: player.y,
      dx: Math.cos(randomAngle) * speed,
      dy: Math.sin(randomAngle) * speed,
      width: 5,
      height: 5
    });
  }
}

function spawnEnemy() {
  if (!gameActive) return;
  let x = Math.random() * (canvas.width - 30);
  enemies.push({ x, y: 0, width: 30, height: 30, speed: 2 });
}

function checkCollisions() {
  // Bullet-Enemy collisions
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        // Remove both bullet and enemy
        enemies.splice(eIndex, 1);
        bullets.splice(bIndex, 1);
      }
    });
  });

  // Player-Enemy collisions
  enemies.forEach((enemy) => {
    if (
      enemy.x < player.x + player.width &&
      enemy.x + enemy.width > player.x &&
      enemy.y < player.y + player.height &&
      enemy.y + enemy.height > player.y
    ) {
      endGame(false);
    }
  });
}

function update() {
  if (!gameActive) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Bullets
  ctx.fillStyle = "yellow";
  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;
    ctx.fillRect(b.x, b.y, b.width, b.height);

    // Remove if off screen
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  });

  // Enemies
  ctx.fillStyle = "red";
  enemies.forEach((en, i) => {
    en.y += en.speed;
    ctx.fillRect(en.x, en.y, en.width, en.height);
  });

  checkCollisions();
}

function updateTimer() {
  if (!gameActive) return;
  
  gameTime--;
  survivedTime++;
  document.getElementById("timer").textContent = `Time: ${gameTime}`;
  document.getElementById("score").textContent = `Survived: ${survivedTime}s`;

  if (gameTime <= 0) {
    endGame(true);
  }
}

function endGame(win) {
  gameActive = false;
  clearInterval(countdown);
  
  if (win) {
    alert(`YOU WIN! 🎉 You survived for ${survivedTime} seconds without getting hit!`);
  } else {
    alert(`GAME OVER! 😂 You survived ${survivedTime}s (but couldn't hit anything anyway)`);
  }
  
  // Reset game
  setTimeout(() => {
    gameTime = 30;
    survivedTime = 0;
    gameActive = true;
    enemies = [];
    bullets = [];
    player.x = 400;
    document.getElementById("timer").textContent = `Time: ${gameTime}`;
    document.getElementById("score").textContent = `Survived: ${survivedTime}s`;
    countdown = setInterval(updateTimer, 1000);
  }, 2000);
}

// Start game loops
setInterval(update, 1000 / 60); // 60 FPS
setInterval(spawnEnemy, 1500); // Spawn enemy every 1.5s
countdown = setInterval(updateTimer, 1000); // 1 second timer