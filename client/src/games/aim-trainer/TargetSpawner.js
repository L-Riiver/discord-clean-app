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

  getAppearingSpeed() {
    return (this.config.delay / 1000).toFixed(1) + 's';
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
      // Manhattan distance for exact diamond click detection
      const manhattanDistance = Math.abs(target.x - mouseX) + Math.abs(target.y - mouseY);
      if (manhattanDistance <= target.radius) {
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
      
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(Math.PI / 4); // Rotate 45 degrees
      
      const r = t.radius / Math.SQRT2; // Half-side of the square inscribed in target.radius

      // Outer glow and border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 15;
      
      ctx.strokeRect(-r, -r, r * 2, r * 2);
      
      // Inner border for extra detail
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.strokeRect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2);
      
      ctx.restore();
    });
  }
}
