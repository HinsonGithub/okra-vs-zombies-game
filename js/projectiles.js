// 子彈類
class Projectile {
    constructor(x, y, row, damage = 20) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.damage = damage;
        this.speed = 5;
        this.radius = 8;
        this.active = true;
    }
    update() {
        this.x += this.speed;
        if (this.x > 900) this.active = false;
    }
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#90EE90';
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    checkCollision(zombie) {
        if (this.row !== zombie.row) return false;
        const dx = this.x - zombie.x;
        const dy = this.y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + 20);
    }
}
class Explosion {
    constructor(x, y, row) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.radius = 0;
        this.maxRadius = 100;
        this.damage = 180;
        this.active = true;
        this.frame = 0;
        this.maxFrames = 30;
    }
    update() {
        this.frame++;
        this.radius = (this.frame / this.maxFrames) * this.maxRadius;
        if (this.frame >= this.maxFrames) this.active = false;
    }
    draw(ctx) {
        const alpha = 1 - (this.frame / this.maxFrames);
        ctx.save();
        ctx.fillStyle = `rgba(255, 69, 0, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 140, 0, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    checkCollision(zombie) {
        if (Math.abs(this.row - zombie.row) > 1) return false;
        const dx = this.x - zombie.x;
        const dy = this.y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius;
    }
}