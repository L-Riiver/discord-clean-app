export class ProjectileManager {
  constructor(width, height, difficulty) {
    this.width = width;
    this.height = height;
    this.difficulty = difficulty;

    this.projectiles = [];
    this.spawnTimer = 0;

    this.baseSpawnRate = this.getInitialSpawnRate(difficulty);
    this.currentSpawnRate = this.baseSpawnRate;
    this.speedMultiplier = 1;
    this.dodgedCount = 0;
  }

  getInitialSpawnRate(difficulty) {
    switch (difficulty) {
      case 'easy': return 1.5;
      case 'medium': return 2.0;
      case 'hard': return 2.5;
      default: return 1.5;
    }
  }

  updateDifficulty(timeSurvivedMs) {
    const factor = 1 + (timeSurvivedMs / 10000) * 0.2;
    this.currentSpawnRate = this.baseSpawnRate * factor;
    this.speedMultiplier = 1;
  }

  update(deltaTime, playerX, playerY, timeSurvivedMs) {
    this.updateDifficulty(timeSurvivedMs);

    this.spawnTimer += deltaTime / 1000;
    const timeBetweenSpawns = 1 / this.currentSpawnRate;

    if (this.spawnTimer >= timeBetweenSpawns) {
      this.spawnTimer -= timeBetweenSpawns;
      this.spawnProjectile(playerX, playerY);
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let p = this.projectiles[i];

      const moveDistance = p.speed * this.speedMultiplier * (deltaTime / 1000);
      p.x += p.vx * moveDistance;
      p.y += p.vy * moveDistance;

      if (p.x < -100 || p.x > this.width + 100 || p.y < -100 || p.y > this.height + 100) {
        this.projectiles.splice(i, 1);
        this.dodgedCount++;
      }
    }
  }

  spawnProjectile(targetX, targetY) {
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    switch (edge) {
      case 0: x = Math.random() * this.width; y = -50; break;
      case 1: x = this.width + 50; y = Math.random() * this.height; break;
      case 2: x = Math.random() * this.width; y = this.height + 50; break;
      case 3: x = -50; y = Math.random() * this.height; break;
    }

    let dx = targetX - x;
    let dy = targetY - y;
    const angleOffset = (Math.random() - 0.5) * 0.5;
    const angle = Math.atan2(dy, dx) + angleOffset;

    const rand = Math.random();
    let type = 'orb';
    let speed, radius, width, height;

    if (rand < 0.4) {
      type = 'spear';
      speed = 750;
      width = 70;
      height = 14;
      radius = height / 2;

    } else if (rand < 0.7) {
      type = 'arrow';
      speed = 450;
      width = 90;
      height = 20;
      radius = height / 2;

    } else {
      type = 'orb';
      speed = 550;
      radius = 15;
      width = radius * 2;
      height = radius * 2;
    }

    this.projectiles.push({
      x,
      y,
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      angle,
      type,
      radius,
      width,
      height,
      speed
    });
  }

  // =========================
  // 🧠 HELPERS DE COLISIÓN
  // =========================

  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  collidesRotatedRectCircle(p, px, py, pr) {
    const dx = px - p.x;
    const dy = py - p.y;

    const cos = Math.cos(-p.angle);
    const sin = Math.sin(-p.angle);

    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    const hw = p.width / 2;
    const hh = p.height / 2;

    const cx = this.clamp(localX, -hw, hw);
    const cy = this.clamp(localY, -hh, hh);

    const distX = localX - cx;
    const distY = localY - cy;

    return (distX * distX + distY * distY) <= pr * pr;
  }

  collidesCapsuleCircle(p, px, py, pr) {
    const dx = px - p.x;
    const dy = py - p.y;

    const cos = Math.cos(-p.angle);
    const sin = Math.sin(-p.angle);

    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    const r = p.height / 2;
    const half = Math.max(0, p.width / 2 - r);

    const cx = this.clamp(localX, -half, half);

    const distX = localX - cx;
    const distY = localY;

    const combined = r + pr;
    return (distX * distX + distY * distY) <= combined * combined;
  }

  // =========================
  // 🎨 DIBUJO
  // =========================

  drawCapsule(ctx, length, radius) {
    const half = Math.max(0, length / 2 - radius);

    ctx.beginPath();
    ctx.moveTo(-half, -radius);
    ctx.lineTo(half, -radius);
    ctx.arc(half, 0, radius, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(-half, radius);
    ctx.arc(-half, 0, radius, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
  }

  draw(ctx) {
    for (const p of this.projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      if (p.type === 'spear') {
        const hw = p.width / 2;
        const hh = p.height / 2;

        ctx.fillStyle = '#0aaeb0';
        ctx.fillRect(-hw, -hh, p.width, p.height);

        ctx.strokeStyle = '#066';
        ctx.lineWidth = 2;
        ctx.strokeRect(-hw, -hh, p.width, p.height);

        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(-hw + 4, -hh / 3, p.width - 8, hh * 0.6);

      } else if (p.type === 'arrow') {
        const r = p.height / 2;


        this.drawCapsule(ctx, p.width, r);
        ctx.fillStyle = '#ff9f43';
        ctx.fill();

        ctx.strokeStyle = '#c97a2b';
        ctx.lineWidth = 2;
        ctx.stroke();

        this.drawCapsule(ctx, p.width - 8, Math.max(2, r - 4));
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fill();

      } else {
        ctx.fillStyle = '#ff4757';
        ctx.strokeStyle = '#ff6b81';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // =========================
  // 💥 COLISIONES
  // =========================

  checkCollision(playerX, playerY, playerRadius) {
    for (const p of this.projectiles) {
      if (p.type === 'spear') {
        if (this.collidesRotatedRectCircle(p, playerX, playerY, playerRadius)) {
          return true;
        }
      } else if (p.type === 'arrow') {
        if (this.collidesCapsuleCircle(p, playerX, playerY, playerRadius)) {
          return true;
        }
      } else {
        const dx = p.x - playerX;
        const dy = p.y - playerY;
        const distSq = dx * dx + dy * dy;
        const threshold = p.radius + playerRadius;

        if (distSq < threshold * threshold) {
          return true;
        }
      }
    }
    return false;
  }
}