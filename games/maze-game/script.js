const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const messageEl = document.getElementById("message");
const difficultyButtons = document.querySelectorAll('.difficulty button');

// Game settings
canvas.width = 600;
canvas.height = 600;
const rows = 10;
const cols = 10;
const cellSize = canvas.width / cols;

// Game state
let player = { x: 0, y: 0 };
let maze = [];
let exit = { x: 0, y: 0 };
let wins = 0;
let timer = 30;
let countdown;
let gameOver = false;
let difficulty = "medium";
let showExit = false;
let streak = 0;

// Initialize game
resetGame();

function createMaze() {
    maze = [];
    let wallProbability = 0.25;
    
    if (difficulty === "easy") wallProbability = 0.15;
    if (difficulty === "hard") wallProbability = 0.35;

    for (let y = 0; y < rows; y++) {
        maze[y] = [];
        for (let x = 0; x < cols; x++) {
            maze[y][x] = Math.random() < wallProbability ? 1 : 0;
        }
    }
    maze[0][0] = 0; // Ensure player start is open
    randomExit();
}

function randomExit() {
    do {
        exit.x = Math.floor(Math.random() * cols);
        exit.y = Math.floor(Math.random() * rows);
    } while (maze[exit.y][exit.x] === 1 || (exit.x === 0 && exit.y === 0));
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#16213e');
    bgGradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw walkable path
    ctx.fillStyle = '#222244';
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x] === 0) {
                ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
            }
        }
    }
    
    // Draw walls
    ctx.fillStyle = '#3a3a5a';
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x] === 1) {
                ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
            }
        }
    }

    // Draw exit
    if (showExit || timer <= 5) {
        const gradient = ctx.createRadialGradient(
            exit.x * cellSize + cellSize/2, exit.y * cellSize + cellSize/2, 0,
            exit.x * cellSize + cellSize/2, exit.y * cellSize + cellSize/2, cellSize/2
        );
        gradient.addColorStop(0, 'gold');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            exit.x * cellSize + cellSize/2,
            exit.y * cellSize + cellSize/2,
            cellSize/2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // Draw player
    ctx.shadowColor = 'rgba(100, 255, 100, 0.7)';
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(
        player.x * cellSize + cellSize/2,
        player.y * cellSize + cellSize/2,
        cellSize/2.5,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

function updateHUD() {
    const timerEl = document.getElementById("timer");
    const streakEl = document.getElementById("streak");
    
    timerEl.textContent = `Time: ${timer}`;
    timerEl.className = timer <= 5 ? "low-time" : "";
    
    document.getElementById("wins").textContent = `Wins: ${wins}`;
    streakEl.textContent = `Streak: ${streak}`;
    streakEl.className = streak >= 1 ? "hot" : "";
}

function updateTimer() {
    if (!gameOver) {
        timer--;
        updateHUD();
        if (timer <= 0) {
            gameOver = true;
            streak = 0;
            updateHUD();
            messageEl.textContent = "⏳ Time's up! New maze loading...";
            setTimeout(resetGame, 2000);
        }
        drawMaze();
    }
}

function resetGame() {
    player = { x: 0, y: 0 };
    createMaze();
    timer = 30;
    gameOver = false;
    showExit = false;
    messageEl.textContent = "";
    updateHUD();
    clearInterval(countdown);
    countdown = setInterval(updateTimer, 1000);
    drawMaze();
}

function setDifficulty(level) {
    difficulty = level;
    difficultyButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    resetGame();
}

function revealExit() {
    showExit = true;
    drawMaze();
    document.querySelector('.game-controls button:nth-child(2)').disabled = true;
    setTimeout(() => {
        showExit = false;
        document.querySelector('.game-controls button:nth-child(2)').disabled = false;
        drawMaze();
    }, 2000);
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
    if (gameOver) return;
    
    let nx = player.x;
    let ny = player.y;
    if (e.key === "ArrowUp") ny--;
    if (e.key === "ArrowDown") ny++;
    if (e.key === "ArrowLeft") nx--;
    if (e.key === "ArrowRight") nx++;

    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0) {
        player.x = nx;
        player.y = ny;
    }

    // Win condition
    if (!gameOver && player.x === exit.x && player.y === exit.y) {
        gameOver = true;
        wins++;
        streak++;
        messageEl.textContent = `🎉 Victory! (Streak: ${streak}) 🎉`;
        setTimeout(resetGame, 2000);
    }

    drawMaze();
});