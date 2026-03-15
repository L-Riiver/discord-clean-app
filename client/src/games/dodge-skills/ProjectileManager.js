export class ProjectileManager {
  constructor(width, height, difficulty) {
    this.width = width;
    this.height = height;
    this.difficulty = difficulty;

    this.projectiles = [];
    this.spawnTimer = 0;

    this.baseSpawnRate = this.getInitialSpawnRate(difficulty); // spawns per second
    this.currentSpawnRate = this.baseSpawnRate;
    this.speedMultiplier = 1;
  }

  getInitialSpawnRate(difficulty) {
    switch (difficulty) {
      case 'easy': return 1.5; // Every 2 seconds
      case 'medium': return 2.0; // Every 1 second
      case 'hard': return 2.5; // 2 per second
      default: return 1.5;
    }
  }

  updateDifficulty(timeSurvivedMs) {
    // Increase spawn rate and speed over time
    // For example, every 10 seconds, increase difficulty by a factor
    const factor = 1 + (timeSurvivedMs / 10000) * 0.2; // 20% harder every 10s
    this.currentSpawnRate = this.baseSpawnRate * factor;
    this.speedMultiplier = factor;
  }

  update(deltaTime, playerX, playerY, timeSurvivedMs) {
    this.updateDifficulty(timeSurvivedMs);

    // Spawn logic
    this.spawnTimer += deltaTime / 1000;
    const timeBetweenSpawns = 1 / this.currentSpawnRate;

    if (this.spawnTimer >= timeBetweenSpawns) {
      this.spawnTimer -= timeBetweenSpawns;
      this.spawnProjectile(playerX, playerY);
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let p = this.projectiles[i];

      const moveDistance = p.speed * this.speedMultiplier * (deltaTime / 1000);
      p.x += p.vx * moveDistance;
      p.y += p.vy * moveDistance;

      // Remove if completely off-screen
      if (p.x < -50 || p.x > this.width + 50 || p.y < -50 || p.y > this.height + 50) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  spawnProjectile(targetX, targetY) {
    // Spawn from one of the edges
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (edge) {
      case 0: x = Math.random() * this.width; y = -20; break;
      case 1: x = this.width + 20; y = Math.random() * this.height; break;
      case 2: x = Math.random() * this.width; y = this.height + 20; break;
      case 3: x = -20; y = Math.random() * this.height; break;
    }

    // Aim at player with some randomness, or straight at player
    let dx = targetX - x;
    let dy = targetY - y;

    // Add some random spread (-20 to 20 degrees maybe?)
    const angleOffset = (Math.random() - 0.5) * 0.5; // Approx -15 to +15 deg
    const angle = Math.atan2(dy, dx) + angleOffset;

    const speed = 150 + Math.random() * 100; // 150-250 base speed

    this.projectiles.push({
      x: x,
      y: y,
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      radius: 10 + Math.random() * 8, // 10-18 size
      speed: speed
    });
  }

  draw(ctx) {
    ctx.fillStyle = '#e84118'; // Reddish color for dangers
    for (const p of this.projectiles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }

  checkCollision(playerX, playerY, playerRadius) {
    for (const p of this.projectiles) {
      const dx = p.x - playerX;
      const dy = p.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < p.radius + playerRadius) {
        return true; // Collision detected
      }
    }
    return false;
  }
}
