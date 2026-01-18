// ==================== GAME STATE ====================
const game = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    running: false,
    gameOver: false,
    victory: false,
    level: 1,
    speed: 3,
    distance: 0,
    levelLength: 3000
};

// ==================== PLAYER (ARMY) ====================
const player = {
    x: 0,
    y: 0,
    targetX: 0,
    soldiers: 10,
    soldierPositions: [],
    laneWidth: 0,
    color: '#4488ff'
};

// ==================== GATES ====================
let gates = [];
const gateTypes = [
    { op: '+', values: [5, 10, 15, 20], color: '#00cc66', textColor: '#ffffff' },
    { op: '×', values: [2, 3], color: '#00aa44', textColor: '#ffffff' },
    { op: '-', values: [5, 10, 15], color: '#cc3333', textColor: '#ffffff' },
    { op: '÷', values: [2, 3], color: '#aa2222', textColor: '#ffffff' }
];

// ==================== ENEMIES ====================
const enemy = {
    x: 0,
    y: 0,
    soldiers: 0,
    soldierPositions: [],
    color: '#ff4444',
    active: false
};

// ==================== PARTICLES ====================
let particles = [];

// ==================== INPUT ====================
const input = {
    mouseX: 0,
    isDown: false
};

// ==================== INITIALIZATION ====================
function init() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Mouse/Touch events
    game.canvas.addEventListener('mousedown', onPointerDown);
    game.canvas.addEventListener('mousemove', onPointerMove);
    game.canvas.addEventListener('mouseup', onPointerUp);
    game.canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    game.canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    game.canvas.addEventListener('touchend', onPointerUp);
    
    // Buttons
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    
    // Initial render
    render();
}

function resizeCanvas() {
    game.width = window.innerWidth;
    game.height = window.innerHeight;
    game.canvas.width = game.width;
    game.canvas.height = game.height;
    
    player.laneWidth = Math.min(game.width * 0.7, 400);
    player.x = game.width / 2;
    player.targetX = game.width / 2;
    player.y = game.height * 0.75;
    
    if (!game.running) render();
}

// ==================== GAME CONTROL ====================
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    
    game.running = true;
    game.gameOver = false;
    game.victory = false;
    game.distance = 0;
    game.speed = 3 + (game.level - 1) * 0.5;
    game.levelLength = 3000 + (game.level - 1) * 500;
    
    player.soldiers = 10;
    player.x = game.width / 2;
    player.targetX = game.width / 2;
    generateSoldierPositions(player);
    
    enemy.active = false;
    enemy.soldiers = 20 + game.level * 10;
    generateSoldierPositions(enemy);
    
    gates = [];
    generateGates();
    particles = [];
    
    updateSoldierCount();
    requestAnimationFrame(gameLoop);
}

function endGame(victory) {
    game.running = false;
    game.gameOver = true;
    game.victory = victory;
    
    const endScreen = document.getElementById('end-screen');
    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');
    
    endScreen.classList.remove('hidden', 'victory', 'defeat');
    
    if (victory) {
        endScreen.classList.add('victory');
        endTitle.textContent = '¡VICTORIA!';
        endMessage.textContent = `Nivel ${game.level} completado con ${player.soldiers} soldados`;
        game.level++;
    } else {
        endScreen.classList.add('defeat');
        endTitle.textContent = '¡DERROTA!';
        endMessage.textContent = 'Tu ejército ha sido destruido';
        game.level = 1;
    }
}

// ==================== GATE GENERATION ====================
function generateGates() {
    const gateSpacing = 400;
    const numGates = Math.floor((game.levelLength - 500) / gateSpacing);
    
    for (let i = 0; i < numGates; i++) {
        const distance = 500 + i * gateSpacing;
        const leftType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
        const rightType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
        
        // Ensure at least one good option most of the time
        const leftGood = leftType.op === '+' || leftType.op === '×';
        const rightGood = rightType.op === '+' || rightType.op === '×';
        
        let finalLeft = leftType;
        let finalRight = rightType;
        
        if (!leftGood && !rightGood && Math.random() > 0.3) {
            if (Math.random() > 0.5) {
                finalLeft = gateTypes[Math.floor(Math.random() * 2)];
            } else {
                finalRight = gateTypes[Math.floor(Math.random() * 2)];
            }
        }
        
        const leftValue = finalLeft.values[Math.floor(Math.random() * finalLeft.values.length)];
        const rightValue = finalRight.values[Math.floor(Math.random() * finalRight.values.length)];
        
        gates.push({
            distance: distance,
            left: { op: finalLeft.op, value: leftValue, color: finalLeft.color },
            right: { op: finalRight.op, value: rightValue, color: finalRight.color },
            passed: false
        });
    }
}

// ==================== SOLDIER POSITIONS ====================
function generateSoldierPositions(entity) {
    entity.soldierPositions = [];
    const count = Math.min(entity.soldiers, 200);
    
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.min(30 + count * 0.5, 80);
        entity.soldierPositions.push({
            offsetX: Math.cos(angle) * radius,
            offsetY: Math.sin(angle) * radius * 0.5
        });
    }
}

// ==================== INPUT HANDLERS ====================
function onPointerDown(e) {
    input.isDown = true;
    input.mouseX = e.clientX;
}

function onPointerMove(e) {
    if (input.isDown && game.running) {
        const deltaX = e.clientX - input.mouseX;
        player.targetX = Math.max(
            game.width / 2 - player.laneWidth / 2,
            Math.min(game.width / 2 + player.laneWidth / 2, player.targetX + deltaX)
        );
        input.mouseX = e.clientX;
    }
}

function onPointerUp() {
    input.isDown = false;
}

function onTouchStart(e) {
    e.preventDefault();
    input.isDown = true;
    input.mouseX = e.touches[0].clientX;
}

function onTouchMove(e) {
    e.preventDefault();
    if (input.isDown && game.running) {
        const deltaX = e.touches[0].clientX - input.mouseX;
        player.targetX = Math.max(
            game.width / 2 - player.laneWidth / 2,
            Math.min(game.width / 2 + player.laneWidth / 2, player.targetX + deltaX)
        );
        input.mouseX = e.touches[0].clientX;
    }
}

// ==================== GAME LOOP ====================
function gameLoop() {
    if (!game.running) return;
    
    update();
    render();
    
    requestAnimationFrame(gameLoop);
}

function update() {
    // Move player smoothly
    player.x += (player.targetX - player.x) * 0.15;
    
    // Progress through level
    game.distance += game.speed;
    
    // Check gate collisions
    checkGateCollisions();
    
    // Check if reached end of level
    if (game.distance >= game.levelLength && !enemy.active) {
        enemy.active = true;
        enemy.x = game.width / 2;
        enemy.y = -100;
    }
    
    // Enemy battle
    if (enemy.active) {
        enemy.y += 5;
        if (enemy.y >= player.y - 100) {
            doBattle();
        }
    }
    
    // Update particles
    updateParticles();
    
    // Check defeat
    if (player.soldiers <= 0) {
        endGame(false);
    }
}

function checkGateCollisions() {
    const playerProgress = game.distance;
    const gateZoneStart = player.y - 50;
    const gateZoneEnd = player.y + 50;
    
    for (const gate of gates) {
        if (gate.passed) continue;
        
        const gateScreenY = game.height - (gate.distance - playerProgress) * 0.5;
        
        if (gateScreenY > gateZoneStart && gateScreenY < gateZoneEnd) {
            gate.passed = true;
            
            // Determine which side player is on
            const isLeft = player.x < game.width / 2;
            const chosenGate = isLeft ? gate.left : gate.right;
            
            applyGateEffect(chosenGate);
        }
    }
}

function applyGateEffect(gate) {
    const oldCount = player.soldiers;
    
    switch (gate.op) {
        case '+':
            player.soldiers += gate.value;
            break;
        case '-':
            player.soldiers -= gate.value;
            break;
        case '×':
            player.soldiers = Math.floor(player.soldiers * gate.value);
            break;
        case '÷':
            player.soldiers = Math.floor(player.soldiers / gate.value);
            break;
    }
    
    player.soldiers = Math.max(0, player.soldiers);
    
    // Spawn particles
    const isPositive = player.soldiers > oldCount;
    spawnParticles(player.x, player.y, isPositive ? '#00ff88' : '#ff4444', 20);
    
    generateSoldierPositions(player);
    updateSoldierCount();
}

function doBattle() {
    // Both armies lose soldiers each frame
    const damage = Math.min(player.soldiers, enemy.soldiers, 1);
    player.soldiers -= damage;
    enemy.soldiers -= damage;
    
    if (enemy.soldiers > 0 && player.soldiers > 0) {
        spawnParticles(player.x, player.y - 50, '#ffaa00', 3);
    }
    
    generateSoldierPositions(player);
    generateSoldierPositions(enemy);
    updateSoldierCount();
    
    if (enemy.soldiers <= 0 && player.soldiers > 0) {
        spawnParticles(enemy.x, enemy.y, '#00ff88', 50);
        endGame(true);
    } else if (player.soldiers <= 0) {
        endGame(false);
    }
}

// ==================== PARTICLES ====================
function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 50,
            y: y + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 3,
            life: 1,
            color: color,
            size: 3 + Math.random() * 5
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.02;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// ==================== RENDERING ====================
function render() {
    const ctx = game.ctx;
    
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, game.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#4AA3DF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, game.width, game.height);
    
    // Draw track with perspective
    drawTrack(ctx);
    
    // Draw gates
    drawGates(ctx);
    
    // Draw enemy
    if (enemy.active) {
        drawArmy(ctx, enemy.x, enemy.y, enemy, '#ff4444', '#cc0000');
    }
    
    // Draw player army
    drawArmy(ctx, player.x, player.y, player, '#4488ff', '#2266cc');
    
    // Draw particles
    drawParticles(ctx);
}

function drawTrack(ctx) {
    const trackWidth = player.laneWidth + 100;
    const centerX = game.width / 2;
    
    // Track perspective points
    const nearWidth = trackWidth;
    const farWidth = trackWidth * 0.3;
    const horizonY = game.height * 0.2;
    
    // Main track
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.moveTo(centerX - nearWidth / 2, game.height);
    ctx.lineTo(centerX + nearWidth / 2, game.height);
    ctx.lineTo(centerX + farWidth / 2, horizonY);
    ctx.lineTo(centerX - farWidth / 2, horizonY);
    ctx.closePath();
    ctx.fill();
    
    // Track lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    
    // Left barrier (yellow balls like in the image)
    drawBarrier(ctx, centerX - trackWidth / 2, '#FFD700', -1);
    
    // Right barrier (blue like in the image)
    drawBarrier(ctx, centerX + trackWidth / 2, '#4444ff', 1);
    
    // Center divider
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(centerX, game.height);
    ctx.lineTo(centerX, horizonY);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawBarrier(ctx, baseX, color, side) {
    const horizonY = game.height * 0.2;
    const numBalls = 15;
    
    for (let i = 0; i < numBalls; i++) {
        const t = i / numBalls;
        const y = game.height - (game.height - horizonY) * t;
        const x = baseX + (game.width / 2 - baseX) * t * 0.7;
        const size = 20 * (1 - t * 0.7);
        
        // Ball with gradient for 3D effect
        const gradient = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, lightenColor(color, 50));
        gradient.addColorStop(1, color);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGates(ctx) {
    const playerProgress = game.distance;
    const horizonY = game.height * 0.2;
    
    for (const gate of gates) {
        if (gate.passed) continue;
        
        const relativeDistance = gate.distance - playerProgress;
        if (relativeDistance < 0 || relativeDistance > 1500) continue;
        
        const t = relativeDistance / 1500;
        const y = game.height - (game.height - horizonY) * (1 - t) * 0.8;
        const scale = 1 - t * 0.7;
        
        if (scale < 0.1) continue;
        
        const gateWidth = player.laneWidth * 0.45 * scale;
        const gateHeight = 80 * scale;
        const centerX = game.width / 2;
        
        // Left gate
        drawSingleGate(ctx, centerX - gateWidth - 10 * scale, y, gateWidth, gateHeight, gate.left);
        
        // Right gate
        drawSingleGate(ctx, centerX + 10 * scale, y, gateWidth, gateHeight, gate.right);
    }
}

function drawSingleGate(ctx, x, y, width, height, gateData) {
    // Gate background
    ctx.fillStyle = gateData.color;
    ctx.beginPath();
    ctx.roundRect(x, y - height, width, height, 10);
    ctx.fill();
    
    // Gate border
    ctx.strokeStyle = lightenColor(gateData.color, 30);
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Gate text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${height * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${gateData.op}${gateData.value}`, x + width / 2, y - height / 2);
}

function drawArmy(ctx, x, y, entity, color, darkColor) {
    const count = Math.min(entity.soldiers, entity.soldierPositions.length);
    
    for (let i = 0; i < count; i++) {
        const pos = entity.soldierPositions[i];
        const soldierX = x + pos.offsetX;
        const soldierY = y + pos.offsetY;
        const size = 8;
        
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(soldierX, soldierY, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(soldierX, soldierY - size * 0.8, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Army count bubble
    if (entity.soldiers > 0) {
        const bubbleY = y - 60;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.roundRect(x - 30, bubbleY - 15, 60, 30, 15);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(entity.soldiers.toString(), x, bubbleY);
    }
}

function drawParticles(ctx) {
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// ==================== UTILITIES ====================
function updateSoldierCount() {
    document.getElementById('soldier-count').textContent = player.soldiers;
}

function lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
    return `rgb(${r},${g},${b})`;
}

// ==================== START ====================
window.addEventListener('load', init);
