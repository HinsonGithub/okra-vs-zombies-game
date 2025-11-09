class Plant {
    constructor(x, y, row, col) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.col = col;
        this.hp = 100;
        this.maxHp = 100;
        this.active = true;
        this.width = 60;
        this.height = 60;
    }
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.active = false;
        }
    }
    drawHealthBar(ctx) {
        if (this.hp < this.maxHp) {
            const barWidth = this.width;
            const barHeight = 5;
            const barX = this.x - this.width / 2;
            const barY = this.y - this.height / 2 - 10;
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            const hpPercent = this.hp / this.maxHp;
            ctx.fillStyle = hpPercent > 0.5 ? '#4CAF50' : (hpPercent > 0.25 ? '#FFC107' : '#F44336');
            ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
        }
    }
    update(game) {}
    draw(ctx, game) {}
}

class Sunflower extends Plant {
    constructor(x, y, row, col) {
        super(x, y, row, col);
        this.hp = 100;
        this.maxHp = 100;
        this.sunProduceInterval = 10000;
        this.lastSunTime = Date.now();
    }
    update(game) {
        const now = Date.now();
        if (now - this.lastSunTime >= this.sunProduceInterval) {
            game.addSun(25, this.x, this.y);
            this.lastSunTime = now;
        }
    }
    draw(ctx, game) {
        ctx.save();
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x - 5, this.y - 10, 10, 30);
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const petalX = this.x + Math.cos(angle) * 20;
            const petalY = this.y - 20 + Math.sin(angle) * 20;
            ctx.beginPath();
            ctx.arc(petalX, petalY, 12, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 20, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

class Peashooter extends Plant {
    constructor(x, y, row, col) {
        super(x, y, row, col);
        this.hp = 100;
        this.maxHp = 100;
        this.shootInterval = 1500;
        this.lastShootTime = Date.now();
    }
    update(game) {
        const now = Date.now();
        const hasZombieInRow = game.zombies.some(zombie =>
            zombie.row === this.row && zombie.x > this.x && zombie.active
        );
        if (hasZombieInRow && now - this.lastShootTime >= this.shootInterval) {
            game.addProjectile(this.x + 30, this.y, this.row);
            this.lastShootTime = now;
        }
    }
    draw(ctx, game) {
        ctx.save();
        if (game && game.images && game.images.peashooter && game.images.peashooter.complete) {
            const img = game.images.peashooter;
            const imgW = 60;
            const imgH = 80;
            ctx.drawImage(img, this.x - imgW / 2, this.y - imgH / 2, imgW, imgH);
        } else {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x - 5, this.y - 10, 10, 30);
            ctx.fillStyle = '#8BC34A';
            ctx.fillRect(this.x - 20, this.y - 25, 40, 30);
            ctx.fillStyle = '#7CB342';
            ctx.beginPath();
            ctx.ellipse(this.x + 20, this.y - 10, 15, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x - 5, this.y - 15, 3, 0, Math.PI * 2);
            ctx.arc(this.x + 5, this.y - 15, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

class Wallnut extends Plant {
    constructor(x, y, row, col) {
        super(x, y, row, col);
        this.hp = 300;
        this.maxHp = 300;
    }
    draw(ctx, game) {
        ctx.save();
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = hpPercent > 0.6 ? '#8B4513' : (hpPercent > 0.3 ? '#A0522D' : '#654321');
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(this.x - 25, this.y - 25, 50, 50, 10);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - 15, this.y - 20);
        ctx.lineTo(this.x - 15, this.y + 20);
        ctx.moveTo(this.x, this.y - 20);
        ctx.lineTo(this.x, this.y + 20);
        ctx.moveTo(this.x + 15, this.y - 20);
        ctx.lineTo(this.x + 15, this.y + 20);
        ctx.stroke();
        ctx.fillStyle = '#000';
        if (hpPercent > 0.6) {
            ctx.beginPath();
            ctx.arc(this.x - 10, this.y - 5, 2, 0, Math.PI * 2);
            ctx.arc(this.x + 10, this.y - 5, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x, this.y + 5, 10, 0, Math.PI);
            ctx.stroke();
        } else if (hpPercent > 0.3) {
            ctx.beginPath();
            ctx.arc(this.x - 10, this.y - 5, 2, 0, Math.PI * 2);
            ctx.arc(this.x + 10, this.y - 5, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(this.x - 10, this.y + 10);
            ctx.lineTo(this.x + 10, this.y + 10);
            ctx.stroke();
        } else {
            ctx.font = '20px Arial';
            ctx.fillText('X', this.x - 15, this.y);
            ctx.fillText('X', this.x + 5, this.y);
        }
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

class CherryBomb extends Plant {
    constructor(x, y, row, col) {
        super(x, y, row, col);
        this.hp = 300;
        this.maxHp = 300;
        this.explodeTime = 3000;
        this.plantTime = Date.now();
        this.blinkRate = 200;
    }
    update(game) {
        const now = Date.now();
        if (now - this.plantTime >= this.explodeTime) {
            game.addExplosion(this.x, this.y, this.row);
            this.active = false;
        }
    }
    draw(ctx, game) {
        ctx.save();
        const elapsed = Date.now() - this.plantTime;
        const timeLeft = this.explodeTime - elapsed;
        const shouldBlink = Math.floor(elapsed / this.blinkRate) % 2 === 0;
        if (shouldBlink || timeLeft > 1000) {
            ctx.fillStyle = '#DC143C';
            ctx.beginPath();
            ctx.arc(this.x - 15, this.y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + 15, this.y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x - 15, this.y - 20);
            ctx.quadraticCurveTo(this.x, this.y - 30, this.x + 15, this.y - 20);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(this.x - 18, this.y - 5, 6, 0, Math.PI * 2);
            ctx.arc(this.x + 12, this.y - 5, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(timeLeft / 1000), this.x, this.y + 40);
        ctx.restore();
    }
}