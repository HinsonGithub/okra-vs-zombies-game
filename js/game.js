class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 900;
        this.canvas.height = 500;
        this.rows = 5;
        this.cols = 9;
        this.cellWidth = 100;
        this.cellHeight = 100;
        this.sun = 50;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.explosions = [];
        this.suns = [];
        this.images = {};
        this.selectedPlant = null;
        this.selectedPlantCost = 0;
        this.currentWave = 0;
        this.totalWaves = 5;
        this.zombiesPerWave = 5;
        this.waveInProgress = false;
        this.waveStartTime = 0;
        this.waveDelay = 30000;
        this.firstWaveDelay = 10000;
        this.gameStarted = false;
        this.gamePaused = false;
        this.gameEnded = false;
        this.lastSunDropTime = Date.now();
        this.sunDropInterval = 10000;
        this.initEventListeners();
        this.preloadImages({
            zombie: 'images/zombize.png',
            peashooter: 'images/orka.png'
        }).then(() => {
            this.showStartScreen();
        });
    }
    preloadImages(map) {
        const entries = Object.entries(map);
        const promises = entries.map(([key, src]) => {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => {
                    this.images[key] = img;
                    resolve({key, ok: true});
                };
                img.onerror = () => {
                    console.warn(`Image load failed: ${src}`);
                    resolve({key, ok: false});
                };
                img.src = src;
            });
        });
        return Promise.all(promises);
    }
    initEventListeners() {
        document.querySelectorAll('.plant-card').forEach(card => {
            card.addEventListener('click', () => {
                if (card.classList.contains('disabled')) return;
                const plantType = card.dataset.plant;
                const cost = parseInt(card.dataset.cost);
                if (this.sun >= cost) {
                    document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.selectedPlant = plantType;
                    this.selectedPlantCost = cost;
                    this.canvas.style.cursor = 'crosshair';
                }
            });
        });
        this.canvas.addEventListener('click', (e) => {
            if (!this.gameStarted || this.gamePaused || this.gameEnded) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (this.selectedPlant) this.placePlant(x, y);
            this.collectSun(x, y);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.cancelPlantSelection();
        });
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        document.getElementById('message-btn').addEventListener('click', () => {
            if (!this.gameStarted) this.startGame();
            else this.restartGame();
        });
    }
    placePlant(x, y) {
        const col = Math.floor(x / this.cellWidth);
        const row = Math.floor(y / this.cellHeight);
        if (col >= this.cols || row >= this.rows) return;
        const existingPlant = this.plants.find(p => p.row === row && p.col === col && p.active);
        if (existingPlant) {
            this.cancelPlantSelection();
            return;
        }
        const plantX = col * this.cellWidth + this.cellWidth / 2;
        const plantY = row * this.cellHeight + this.cellHeight / 2;
        let plant;
        switch (this.selectedPlant) {
            case 'sunflower': plant = new Sunflower(plantX, plantY, row, col); break;
            case 'peashooter': plant = new Peashooter(plantX, plantY, row, col); break;
            case 'wallnut': plant = new Wallnut(plantX, plantY, row, col); break;
            case 'cherrybomb': plant = new CherryBomb(plantX, plantY, row, col); break;
        }
        if (plant) {
            this.plants.push(plant);
            this.sun -= this.selectedPlantCost;
            this.updateSunDisplay();
            this.cancelPlantSelection();
        }
    }
    cancelPlantSelection() {
        this.selectedPlant = null;
        this.selectedPlantCost = 0;
        document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('selected'));
        this.canvas.style.cursor = 'default';
    }
    addProjectile(x, y, row) { this.projectiles.push(new Projectile(x, y, row)); }
    addExplosion(x, y, row) { this.explosions.push(new Explosion(x, y, row)); }
    addSun(amount, x, y) {
        this.suns.push({
            x: x || Math.random() * (this.canvas.width - 100) + 50,
            y: y || -30,
            targetY: (y || Math.random() * (this.canvas.height - 100) + 50),
            amount: amount,
            collected: false,
            speed: 2
        });
    }
    collectSun(x, y) {
        this.suns.forEach(sun => {
            if (!sun.collected) {
                const dx = x - sun.x;
                const dy = y - sun.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 30) {
                    sun.collected = true;
                    this.sun += sun.amount;
                    this.updateSunDisplay();
                }
            }
        });
    }
    spawnZombie() {
        const row = Math.floor(Math.random() * this.rows);
        const y = row * this.cellHeight + this.cellHeight / 2;
        this.zombies.push(new Zombie(this.canvas.width - 30, y, row));
    }
    startWave() {
        if (this.currentWave >= this.totalWaves) return;
        this.currentWave++;
        this.waveInProgress = true;
        this.waveStartTime = Date.now();
        this.updateWaveDisplay();
        const zombieCount = this.zombiesPerWave + Math.floor(this.currentWave / 2);
        for (let i = 0; i < zombieCount; i++) {
            setTimeout(() => {
                if (this.gameStarted && !this.gameEnded) this.spawnZombie();
            }, i * 3000);
        }
    }
    updateSunDisplay() {
        document.getElementById('sun-count').textContent = this.sun;
        document.querySelectorAll('.plant-card').forEach(card => {
            const cost = parseInt(card.dataset.cost);
            if (this.sun < cost) card.classList.add('disabled');
            else card.classList.remove('disabled');
        });
    }
    updateWaveDisplay() {
        document.getElementById('wave-count').textContent = `${this.currentWave}/${this.totalWaves}`;
    }
    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pause-btn').textContent = this.gamePaused ? '繼續' : '暫停';
    }
    showStartScreen() {
        document.getElementById('message-title').textContent = '植物大戰殭屍';
        document.getElementById('message-text').textContent = '種植植物保衛你的草坪!\n擊敗 5 波殭屍即可獲勝!';
        document.getElementById('message-btn').textContent = '開始遊戲';
        document.getElementById('game-message').classList.remove('hidden');
    }
    startGame() {
        this.gameStarted = true;
        document.getElementById('game-message').classList.add('hidden');
        this.waveStartTime = Date.now();
        this.gameLoop();
    }
    restartGame() {
        this.sun = 50;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.explosions = [];
        this.suns = [];
        this.currentWave = 0;
        this.waveInProgress = false;
        this.gameEnded = false;
        this.gamePaused = false;
        this.updateSunDisplay();
        this.updateWaveDisplay();
        document.getElementById('pause-btn').textContent = '暫停';
        document.getElementById('game-message').classList.add('hidden');
        this.waveStartTime = Date.now();
    }
    gameOver() {
        this.gameEnded = true;
        document.getElementById('message-title').textContent = '遊戲結束!';
        document.getElementById('message-text').textContent = '殭屍突破了你的防線!\n再試一次吧!';
        document.getElementById('message-btn').textContent = '重新開始';
        document.getElementById('game-message').classList.remove('hidden');
    }
    gameWin() {
        this.gameEnded = true;
        document.getElementById('message-title').textContent = '勝利! 🎉';
        document.getElementById('message-text').textContent = `你成功保衛了草坪!\n擊敗了 ${this.totalWaves} 波殭屍!`;
        document.getElementById('message-btn').textContent = '再玩一次';
        document.getElementById('game-message').classList.remove('hidden');
    }
    update() {
        if (this.gamePaused || this.gameEnded) return;
        const now = Date.now();
        if (!this.waveInProgress) {
            const delay = this.currentWave === 0 ? this.firstWaveDelay : this.waveDelay;
            if (now - this.waveStartTime >= delay && this.currentWave < this.totalWaves) {
                this.startWave();
            }
        } else {
            if (this.zombies.filter(z => z.active).length === 0) {
                this.waveInProgress = false;
                this.waveStartTime = now;
                if (this.currentWave >= this.totalWaves) {
                    this.gameWin();
                }
            }
        }
        if (now - this.lastSunDropTime >= this.sunDropInterval) {
            this.addSun(25);
            this.lastSunDropTime = now;
        }
        this.suns.forEach((sun, index) => {
            if (sun.collected) this.suns.splice(index, 1);
            else if (sun.y < sun.targetY) sun.y += sun.speed;
        });
        this.plants.forEach(plant => {
            if (plant.active) plant.update(this);
        });
        this.plants = this.plants.filter(p => p.active);
        this.zombies.forEach(zombie => {
            if (zombie.active) zombie.update(this);
        });
        this.projectiles.forEach(projectile => {
            if (projectile.active) {
                projectile.update();
                this.zombies.forEach(zombie => {
                    if (zombie.active && projectile.checkCollision(zombie)) {
                        zombie.takeDamage(projectile.damage);
                        projectile.active = false;
                    }
                });
            }
        });
        this.projectiles = this.projectiles.filter(p => p.active);
        this.explosions.forEach(explosion => {
            if (explosion.active) {
                explosion.update();
                if (explosion.frame === 15) {
                    this.zombies.forEach(zombie => {
                        if (zombie.active && explosion.checkCollision(zombie)) {
                            zombie.takeDamage(explosion.damage);
                        }
                    });
                }
            }
        });
        this.explosions = this.explosions.filter(e => e.active);
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.suns.forEach(sun => {
            this.ctx.save();
            this.ctx.fillStyle = '#FFD700';
            this.ctx.strokeStyle = '#FFA500';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(sun.x, sun.y, 25, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.fillStyle = '#FF8C00';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(sun.amount, sun.x, sun.y);
            this.ctx.restore();
        });
        this.plants.forEach(plant => plant.draw(this.ctx, this));
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        this.explosions.forEach(explosion => explosion.draw(this.ctx));
        this.zombies.forEach(zombie => zombie.draw(this.ctx, this));
        if (this.gamePaused) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('暫停', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.restore();
        }
    }
    drawGrid() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellHeight);
            this.ctx.lineTo(this.canvas.width, i * this.cellHeight);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellWidth, 0);
            this.ctx.lineTo(i * this.cellWidth, this.canvas.height);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    gameLoop() {
        if (!this.gameEnded) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}
let game;
window.addEventListener('load', () => {
    game = new Game();
});