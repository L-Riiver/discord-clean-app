export class TargetSpawner {
  constructor(width, height, difficulty) {
    this.width = width;
    this.height = height;
    this.targets = [];
    this.spawnTimer = 0;
    
    // Easy, Medium, Hard Configuration
    const diffConfig = {
      easy: { delay: 1200, shrinkRate: 15 },
      medium: { delay: 900, shrinkRate: 25 },
      hard: { delay: 600, shrinkRate: 40 }
    };
    
    this.config = { ...(diffConfig[difficulty] || diffConfig['easy']) };
  }

  update(deltaTime) {
    this.spawnTimer += deltaTime;
    
    // Create new target based on delay
    if (this.spawnTimer >= this.config.delay) {
      this.spawnTimer = 0;
      this.targets.push({
        x: Math.random() * (this.width - 100) + 50,
        y: Math.random() * (this.height - 100) + 50,
        radius: 40,
        missed: false
      });
      // The game progressively speeds up up to a cap
      this.config.delay = Math.max(300, this.config.delay - 15);
    }

    // Shrink targets
    this.targets.forEach(target => {
      target.radius -= (this.config.shrinkRate * deltaTime) / 1000;
      if (target.radius <= 0) {
        target.missed = true;
      }
    });
  }

  attemptHit(mouseX, mouseY) {
    let hit = false;
    this.targets = this.targets.filter(target => {
      const distance = Math.hypot(target.x - mouseX, target.y - mouseY);
      if (distance <= target.radius) {
         hit = true;
         return false; // Remove if hit
      }
      return true; // Keep otherwise
    });
    return hit;
  }

  getAndClearMisses() {
    const misses = this.targets.filter(t => t.missed).length;
    this.targets = this.targets.filter(t => !t.missed); // Remove missed from array
    return misses;
  }

  draw(ctx) {
    this.targets.forEach(t => {
      if (t.radius <= 0) return;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#eb4d4b"; 
      ctx.fill();
      ctx.closePath();
    });
  }
}
