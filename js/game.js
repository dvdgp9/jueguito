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
    speed: 5, // Aumentada velocidad base
    distance: 0,
    levelLength: 5000, // Niveles más largos
    tilt: 0 // Para el efecto de inclinación
};

// ==================== PLAYER (ARMY) ====================
const player = {
    x: 0,
    y: 0,
    targetX: 0,
    soldiers: 10,
    soldierPositions: [],
    laneWidth: 0,
    color: '#4488ff',
    bobbing: 0 // Para la animación de correr
};

// ==================== GATES ====================
let gates = [];
const gateTypes = [
    { op: '+', values: [5, 10, 20, 50], color: '#00cc66' },
    { op: '×', values: [2, 3, 5], color: '#00aa44' },
    { op: '-', values: [10, 20, 50], color: '#cc3333' },
    { op: '÷', values: [2, 3], color: '#aa2222' }
];

// ==================== ENEMIES & OBSTACLES ====================
let obstacles = [];
const enemy = {
    x: 0,
    y: 0,
    soldiers: 0,
    soldierPositions: [],
    color: '#ff4444',
    active: false,
    distance: 0
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
    
    game.canvas.addEventListener('mousedown', onPointerDown);
    game.canvas.addEventListener('mousemove', onPointerMove);
    game.canvas.addEventListener('mouseup', onPointerUp);
    game.canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    game.canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    game.canvas.addEventListener('touchend', onPointerUp);
    
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    
    render();
}

function resizeCanvas() {
    game.width = window.innerWidth;
    game.height = window.innerHeight;
    game.canvas.width = game.width;
    game.canvas.height = game.height;
    
    player.laneWidth = Math.min(game.width * 0.8, 500);
    player.x = game.width / 2;
    player.targetX = game.width / 2;
    player.y = game.height * 0.85; // Jugador más abajo
    
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
    game.speed = 5 + (game.level - 1) * 0.5;
    game.levelLength = 5000 + (game.level - 1) * 1000;
    
    player.soldiers = 10;
    player.x = game.width / 2;
    player.targetX = game.width / 2;
    generateSoldierPositions(player);
    
    enemy.active = false;
    enemy.distance = game.levelLength;
    enemy.soldiers = 30 + game.level * 20;
    generateSoldierPositions(enemy);
    
    gates = [];
    obstacles = [];
    generateLevelContent();
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
        // game.level = 1; // Mantener nivel o reiniciar según prefieras
    }
}

// ==================== LEVEL GENERATION ====================
function generateLevelContent() {
    const spacing = 600;
    const numSteps = Math.floor((game.levelLength - 1000) / spacing);
    
    for (let i = 0; i < numSteps; i++) {
        const dist = 800 + i * spacing;
        
        // Alternar entre puertas y obstáculos/enemigos intermedios
        if (i % 2 === 0) {
            // Puertas
            const leftType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
            const rightType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
            
            const leftValue = leftType.values[Math.floor(Math.random() * leftType.values.length)];
            const rightValue = rightType.values[Math.floor(Math.random() * rightType.values.length)];
            
            gates.push({
                distance: dist,
                left: { op: leftType.op, value: leftValue, color: leftType.color },
                right: { op: rightType.op, value: rightValue, color: rightType.color },
                passed: false
            });
        } else {
            // Obstáculo o pequeño grupo enemigo
            if (Math.random() > 0.5) {
                obstacles.push({
                    distance: dist,
                    type: 'wall',
                    x: (Math.random() - 0.5) * player.laneWidth,
                    width: 100,
                    damage: 5 + Math.floor(Math.random() * 10),
                    hit: false
                });
            } else {
                obstacles.push({
                    distance: dist,
                    type: 'mid-enemy',
                    x: (Math.random() - 0.5) * player.laneWidth,
                    soldiers: 5 + Math.floor(Math.random() * 15),
                    hit: false
                });
            }
        }
    }
}

// ==================== SOLDIER POSITIONS ====================
function generateSoldierPositions(entity) {
    entity.soldierPositions = [];
    const count = Math.min(entity.soldiers, 150); // Límite visual
    
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Forma de círculo/enjambre
        const radius = Math.sqrt(Math.random()) * Math.min(20 + count * 0.8, 100);
        entity.soldierPositions.push({
            offsetX: Math.cos(angle) * radius,
            offsetY: Math.sin(angle) * radius * 0.6,
            phase: Math.random() * Math.PI * 2 // Para animación individual
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
        const deltaX = (e.clientX - input.mouseX) * 1.5;
        player.targetX = Math.max(
            game.width / 2 - player.laneWidth / 2,
            Math.min(game.width / 2 + player.laneWidth / 2, player.targetX + deltaX)
        );
        input.mouseX = e.clientX;
        
        // Efecto tilt
        game.tilt = (e.clientX - game.width/2) / (game.width/2) * 0.1;
    }
}

function onPointerUp() {
    input.isDown = false;
    game.tilt *= 0.5;
}

function onTouchStart(e) {
    e.preventDefault();
    input.isDown = true;
    input.mouseX = e.touches[0].clientX;
}

function onTouchMove(e) {
    e.preventDefault();
    if (input.isDown && game.running) {
        const deltaX = (e.touches[0].clientX - input.mouseX) * 1.5;
        player.targetX = Math.max(
            game.width / 2 - player.laneWidth / 2,
            Math.min(game.width / 2 + player.laneWidth / 2, player.targetX + deltaX)
        );
        input.mouseX = e.touches[0].clientX;
        game.tilt = (e.touches[0].clientX - game.width/2) / (game.width/2) * 0.1;
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
    player.x += (player.targetX - player.x) * 0.2;
    game.distance += game.speed;
    player.bobbing += 0.2;
    
    // Inclinación vuelve a 0 suavemente
    if (!input.isDown) game.tilt *= 0.9;
    
    checkCollisions();
    
    // Batalla final
    if (game.distance >= enemy.distance - 200) {
        enemy.active = true;
        enemy.x = game.width / 2;
        enemy.y = game.height * 0.2; // Aparece arriba
        
        if (game.distance >= enemy.distance) {
            doBattle();
        }
    }
    
    updateParticles();
    if (player.soldiers <= 0) endGame(false);
}

function checkCollisions() {
    // Puertas
    for (const gate of gates) {
        if (!gate.passed && Math.abs(game.distance - gate.distance) < 20) {
            gate.passed = true;
            const isLeft = player.x < game.width / 2;
            applyGateEffect(isLeft ? gate.left : gate.right);
        }
    }
    
    // Obstáculos
    for (const obs of obstacles) {
        if (!obs.hit && Math.abs(game.distance - obs.distance) < 30) {
            const playerRelX = player.x - game.width / 2;
            if (Math.abs(playerRelX - obs.x) < 60) {
                obs.hit = true;
                if (obs.type === 'wall') {
                    player.soldiers -= obs.damage;
                    spawnParticles(player.x, player.y, '#ff4444', 15);
                } else {
                    // mid-enemy: batalla rápida
                    const loss = Math.min(player.soldiers, obs.soldiers);
                    player.soldiers -= loss;
                    spawnParticles(player.x, player.y, '#ffaa00', 10);
                }
                player.soldiers = Math.max(0, player.soldiers);
                generateSoldierPositions(player);
                updateSoldierCount();
            }
        }
    }
}

function applyGateEffect(gate) {
    const oldCount = player.soldiers;
    switch (gate.op) {
        case '+': player.soldiers += gate.value; break;
        case '-': player.soldiers -= gate.value; break;
        case '×': player.soldiers *= gate.value; break;
        case '÷': player.soldiers = Math.floor(player.soldiers / gate.value); break;
    }
    player.soldiers = Math.max(0, player.soldiers);
    spawnParticles(player.x, player.y, player.soldiers > oldCount ? '#00ff88' : '#ff4444', 20);
    generateSoldierPositions(player);
    updateSoldierCount();
}

function doBattle() {
    const damage = 1;
    player.soldiers -= damage;
    enemy.soldiers -= damage;
    
    if (Math.random() > 0.7) spawnParticles(player.x, player.y - 50, '#ffaa00', 2);
    
    generateSoldierPositions(player);
    generateSoldierPositions(enemy);
    updateSoldierCount();
    
    if (enemy.soldiers <= 0) endGame(true);
    else if (player.soldiers <= 0) endGame(false);
}

// ==================== RENDERING ====================
function render() {
    const ctx = game.ctx;
    ctx.clearRect(0, 0, game.width, game.height);
    
    // Sky
    const grad = ctx.createLinearGradient(0, 0, 0, game.height);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(0.5, '#16213e');
    grad.addColorStop(1, '#0f3460');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, game.width, game.height);
    
    // Perspective Setup
    const horizonY = game.height * 0.3;
    
    drawTrack(ctx, horizonY);
    
    // Renderizado ordenado por distancia (Z-index manual)
    const objects = [
        ...gates.filter(g => !g.passed).map(g => ({ type: 'gate', obj: g, dist: g.distance })),
        ...obstacles.filter(o => !o.hit).map(o => ({ type: 'obstacle', obj: o, dist: o.distance }))
    ];
    
    // El enemigo final también es un objeto
    if (enemy.active) objects.push({ type: 'enemy', obj: enemy, dist: enemy.distance });
    
    // Dibujar objetos desde lejos a cerca
    objects.sort((a, b) => b.dist - a.dist);
    
    for (const item of objects) {
        const relDist = item.dist - game.distance;
        if (relDist < 0 || relDist > 2000) continue;
        
        const t = 1 - (relDist / 2000); // 0 en el horizonte, 1 en la cámara
        const y = horizonY + (game.height - horizonY) * t * t; // Curva parabólica para profundidad
        const scale = 0.1 + 0.9 * t * t;
        const x = game.width / 2 + (item.obj.x || 0) * scale;
        
        if (item.type === 'gate') drawGate(ctx, item.obj, y, scale);
        else if (item.type === 'obstacle') drawObstacle(ctx, item.obj, y, scale);
        else if (item.type === 'enemy') drawArmy(ctx, game.width/2, y, enemy, '#ff4444', scale);
    }
    
    // Player siempre al frente
    drawArmy(ctx, player.x, player.y, player, '#4488ff', 1);
    drawParticles(ctx);
}

function drawTrack(ctx, horizonY) {
    const centerX = game.width / 2;
    const trackWidth = player.laneWidth + 200;
    
    ctx.save();
    ctx.translate(centerX, 0);
    ctx.rotate(game.tilt);
    ctx.translate(-centerX, 0);
    
    // Pista
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(centerX - trackWidth/2, game.height);
    ctx.lineTo(centerX + trackWidth/2, game.height);
    ctx.lineTo(centerX + 20, horizonY);
    ctx.lineTo(centerX - 20, horizonY);
    ctx.fill();
    
    // Barreras
    const numMarkers = 20;
    for (let i = 0; i < numMarkers; i++) {
        const t = (i + (game.distance % 100) / 100) / numMarkers;
        const y = horizonY + (game.height - horizonY) * t * t;
        const scale = t * t;
        const xOffset = (trackWidth/2) * scale;
        
        ctx.fillStyle = i % 2 === 0 ? '#ffd700' : '#ffaa00';
        ctx.beginPath();
        ctx.arc(centerX - xOffset, y, 15 * scale, 0, Math.PI*2);
        ctx.arc(centerX + xOffset, y, 15 * scale, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.restore();
}

function drawGate(ctx, gate, y, scale) {
    const w = player.laneWidth * 0.4 * scale;
    const h = 120 * scale;
    const centerX = game.width / 2;
    
    // Left
    drawSingleGate(ctx, centerX - w - 5*scale, y, w, h, gate.left);
    // Right
    drawSingleGate(ctx, centerX + 5*scale, y, w, h, gate.right);
}

function drawSingleGate(ctx, x, y, w, h, data) {
    ctx.fillStyle = data.color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.roundRect(x, y - h, w, h, 10);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = 'white';
    ctx.font = `bold ${h * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(`${data.op}${data.value}`, x + w/2, y - h/2);
}

function drawObstacle(ctx, obs, y, scale) {
    const x = game.width / 2 + obs.x * scale;
    const w = obs.width * scale;
    const h = 50 * scale;
    
    ctx.fillStyle = obs.type === 'wall' ? '#555' : '#ff4444';
    ctx.beginPath();
    ctx.roundRect(x - w/2, y - h, w, h, 5);
    ctx.fill();
    
    if (obs.type === 'mid-enemy') {
        ctx.fillStyle = 'white';
        ctx.font = `bold ${h * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(obs.soldiers, x, y - h/2);
    }
}

function drawArmy(ctx, x, y, entity, color, scale) {
    const count = Math.min(entity.soldiers, entity.soldierPositions.length);
    const bob = Math.sin(player.bobbing) * 3 * scale;
    
    for (let i = 0; i < count; i++) {
        const p = entity.soldierPositions[i];
        const sBob = Math.sin(player.bobbing + p.phase) * 2 * scale;
        const sx = x + p.offsetX * scale;
        const sy = y + p.offsetY * scale + sBob;
        const size = 6 * scale;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(sx, sy - size, size * 0.6, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Count bubble
    if (entity.soldiers > 0) {
        ctx.fillStyle = 'white';
        ctx.font = `bold ${20 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(entity.soldiers, x, y - 50 * scale);
    }
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y, 
            vx: (Math.random() - 0.5) * 10, 
            vy: (Math.random() - 0.5) * 10,
            life: 1, color, size: 2 + Math.random() * 4
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.03;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles(ctx) {
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function updateSoldierCount() {
    document.getElementById('soldier-count').textContent = player.soldiers;
}

window.addEventListener('load', init);

