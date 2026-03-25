export class TargetSpawner {
  constructor(width, height, difficulty) {
    this.width = width;
    this.height = height;
    this.targets = [];
    this.spawnTimer = 0;
    this.topMargin = 120; // Safe zone for HUD

    // Easy, Medium, Hard Configuration
    // scaling: how much frequency (targets/sec) increases per target spawned
    const diffConfig = {
      easy: { delay: 1200, shrinkRate: 15, scaling: 0.015 },
      medium: { delay: 900, shrinkRate: 25, scaling: 0.02 },
      hard: { delay: 600, shrinkRate: 40, scaling: 0.03 }
    };

    this.config = { ...(diffConfig[difficulty] || diffConfig['easy']) };
    this.initialDelay = this.config.delay;
    this.targetsSpawned = 0;
  }

  getAppearingSpeed() {
    return (this.config.delay / 1000).toFixed(1) + 's';
  }

  update(deltaTime) {
    this.spawnTimer += deltaTime;

    // Create new target based on delay
    if (this.spawnTimer >= this.config.delay) {
      this.spawnTimer = 0;
      this.targetsSpawned++;

      this.targets.push({
        x: Math.random() * (this.width - 100) + 50,
        y: Math.random() * (this.height - this.topMargin - 100) + this.topMargin + 50,
        radius: 40,
        missed: false
      });

      // Calculate frequency increase linearly
      // Current Frequency (targets/sec) = Initial Frequency + (targetsSpawned * scaling)
      const initialFreq = 1000 / this.initialDelay;
      const currentFreq = initialFreq + (this.targetsSpawned * this.config.scaling);
      this.config.delay = Math.max(250, 1000 / currentFreq);
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
      // Euclidean distance for circular target detection
      const dx = target.x - mouseX;
      const dy = target.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
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

      ctx.save();

      // Outer glow and border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner border for extra detail
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });
  }
}
