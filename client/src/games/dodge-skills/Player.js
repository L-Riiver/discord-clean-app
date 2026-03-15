export class Player {
  constructor(x, y, difficulty) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.radius = 15;
    this.speed = 300; // pixels per second

    // Flash settings
    this.flashDistance = 150;
    this.flashCooldown = this.getFlashCooldown(difficulty);
    this.lastFlashTime = -this.flashCooldown; // allowed to flash immediately
  }

  getFlashCooldown(difficulty) {
    switch (difficulty) {
      case 'easy': return 15000; // 15 seconds
      case 'medium': return 15000;
      case 'hard': return 30000;
      default: return 15000;
    }
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  flash(mouseX, mouseY, currentTime) {
    if (currentTime - this.lastFlashTime >= this.flashCooldown) {
      // Calculate direction to mouse
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length > 0) {
        const nx = dx / length;
        const ny = dy / length;

        // Move towards mouse by flashDistance
        this.x += nx * this.flashDistance;
        this.y += ny * this.flashDistance;

        // Also update target so we don't snap back or keep moving to old target
        this.targetX = this.x;
        this.targetY = this.y;

        this.lastFlashTime = currentTime;
        return true; // Flash successful
      }
    }
    return false; // Flash on cooldown
  }

  update(deltaTime) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
      // Move towards target
      const moveDistance = this.speed * (deltaTime / 1000);
      if (distance <= moveDistance) {
        this.x = this.targetX;
        this.y = this.targetY;
      } else {
        const nx = dx / distance;
        const ny = dy / distance;
        this.x += nx * moveDistance;
        this.y += ny * moveDistance;
      }
    }
  }

  draw(ctx, currentTime) {
    // Draw player
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00a8ff'; // Blueish color
    ctx.fill();
    ctx.closePath();

    // Draw click target indicator if we are moving
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      // Small visual indicator for right click destination
      ctx.beginPath();
      ctx.arc(this.targetX, this.targetY, 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 168, 255, 0.5)';
      ctx.stroke();
      ctx.closePath();
    }
  }

  getFlashCooldownRatio(currentTime) {
    const timeSinceFlash = currentTime - this.lastFlashTime;
    return Math.min(timeSinceFlash / this.flashCooldown, 1);
  }
}
