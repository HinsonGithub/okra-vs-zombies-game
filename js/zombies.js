class Zombie {
    constructor(x, y, row) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.hp = 100;
        this.maxHp = 100;
        this.speed = 0.3;
        this.damage = 10;
        this.active = true;
        this.width = 40;
        this.height = 60;
        this.attacking = false;
        this.lastAttackTime = Date.now();
        this.attackInterval = 1000;
        this.walkFrame = 0;
    }
    update(game) {
        if (!this.active) return;
        const plantInFront = game.plants.find(plant =>
            plant.row === this.row &&
            plant.active &&
            Math.abs(plant.x - this.x) < 40 &&
            plant.x < this.x
        );
        if (plantInFront) {
            this.attacking = true;
            const now = Date.now();
            if (now - this.lastAttackTime >= this.attackInterval) {
                plantInFront.takeDamage(this.damage);
                this.lastAttackTime = now;
            }
        } else {
            this.attacking = false;
            this.x -= this.speed;
            this.walkFrame += 0.1;
        }
        if (this.x < 0) game.gameOver();
    }
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.active = false;
        }
    }
    draw(ctx, game) {
        if (!this.active) return;
        ctx.save();
        const bobOffset = this.attacking ? 0 : Math.sin(this.walkFrame) * 3;
        if (game && game.images && game.images.zombie && game.images.zombie.complete) {
            const img = game.images.zombie;
            const imgW = 80;
            const imgH = 120;
            ctx.drawImage(img, this.x - imgW / 2, this.y - imgH / 2 + 10 + bobOffset, imgW, imgH);
        } else {
            ctx.fillStyle = '#7cb47c';
            ctx.fillRect(this.x - 15, this.y - 20 + bobOffset, 30, 40);
            ctx.fillStyle = '#8fbc8f';
            ctx.beginPath();
            ctx.arc(this.x, this.y - 35 + bobOffset, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(this.x - 7, this.y - 38 + bobOffset, 4, 0, Math.PI * 2);
            ctx.arc(this.x + 7, this.y - 38 + bobOffset, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y - 30 + bobOffset, 8, 0, Math.PI);
            ctx.stroke();
            if (this.attacking) {
                ctx.strokeStyle = '#7cb47c';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(this.x - 15, this.y - 15);
                ctx.lineTo(this.x - 30, this.y - 10);
                ctx.stroke();
            } else {
                const armSwing = Math.sin(this.walkFrame) * 10;
                ctx.strokeStyle = '#7cb47c';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(this.x - 15, this.y - 15);
                ctx.lineTo(this.x - 20, this.y + armSwing);
                ctx.stroke();
            }
        }
        this.drawHealthBar(ctx, bobOffset);
        ctx.restore();
    }
    drawHealthBar(ctx, offset = 0) {
        if (this.hp < this.maxHp) {
            const barWidth = 40;
            const barHeight = 5;
            const barX = this.x - barWidth / 2;
            const barY = this.y - 50 + offset;
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            const hpPercent = this.hp / this.maxHp;
            ctx.fillStyle = '#F44336';
            ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
        }
    }
}