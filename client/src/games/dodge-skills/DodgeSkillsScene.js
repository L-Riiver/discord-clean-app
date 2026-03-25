import { GameLoop } from '../../core/GameLoop.js';
import { MenuScene } from '../../scenes/MenuScene.js';
import { Player } from './Player.js';
import { ProjectileManager } from './ProjectileManager.js';

export class DodgeSkillsScene {
  constructor(container, sceneManager, props) {
    this.container = container;
    this.sceneManager = sceneManager;

    this.difficulty = props.difficulty || 'easy';
    this.timeSurvivedMs = 0;
    this.isGameOver = false;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.player = new Player(this.canvas.width / 2, this.canvas.height / 2, this.difficulty);
    this.projectileManager = new ProjectileManager(this.canvas.width, this.canvas.height, this.difficulty);

    this.loop = new GameLoop(this.update.bind(this), this.draw.bind(this));

    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.mouseX = this.canvas.width / 2;
    this.mouseY = this.canvas.height / 2;
  }

  init() {
    this.canvas.style.display = 'block';

    // Inherit cursor from document.body to match menu selection
    this.canvas.style.cursor = 'inherit';

    this.container.appendChild(this.canvas);

    // Disable right click context menu
    this.canvas.addEventListener('contextmenu', this.handleContextMenu);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.handleResize);

    this.loop.start();
  }

  handleContextMenu(event) {
    event.preventDefault(); // Prevent contextual menu on right click
  }

  handleMouseDown(event) {
    if (this.isGameOver) return;

    // Check for right click (button 2)
    if (event.button === 2) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.player.setTarget(x, y);
    }
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
  }

  handleKeyDown(event) {
    if (this.isGameOver) return;

    const key = event.key.toLowerCase();
    if (key === 'd' || key === 'f') {
      this.player.flash(this.mouseX, this.mouseY, this.timeSurvivedMs);
    }
  }

  update(deltaTime) {
    if (this.isGameOver) return;

    this.timeSurvivedMs += deltaTime;

    this.player.update(deltaTime);
    this.projectileManager.update(deltaTime, this.player.x, this.player.y, this.timeSurvivedMs);

    if (this.projectileManager.checkCollision(this.player.x, this.player.y, this.player.radius)) {
      this.handleGameOver();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid or background maybe?
    this.drawBackground();

    this.projectileManager.draw(this.ctx);
    this.player.draw(this.ctx, this.timeSurvivedMs);

    this.drawHUD();
  }

  drawBackground() {
    this.ctx.fillStyle = '#111214'; // Darker base like the reference image
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Subtle dark red/blue glow
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, this.canvas.width);
    gradient.addColorStop(0, 'rgba(40, 45, 55, 0.2)');
    gradient.addColorStop(1, 'rgba(10, 10, 15, 0.8)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = '#1e1f22'; // Subtle grid lines
    this.ctx.lineWidth = 1;
    const gridSize = 40;

    this.ctx.beginPath();
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
    }
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
    }
    this.ctx.stroke();
  }

  drawHUD() {
    // SURVIVED TIME
    const seconds = Math.floor(this.timeSurvivedMs / 1000);
    const milliseconds = Math.floor((this.timeSurvivedMs % 1000) / 10);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial, sans-serif';
    this.ctx.textAlign = 'center';

    // Draw white text with a dark outline for text clarity without a solid background
    const timeText = `⏱️ ${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(timeText, this.canvas.width / 2, 40);
    this.ctx.fillText(timeText, this.canvas.width / 2, 40);

    // FLASH CD BAR
    const flashRatio = this.player.getFlashCooldownRatio(this.timeSurvivedMs);
    const barWidth = 200;
    const barHeight = 20;
    const startX = this.canvas.width / 2 - barWidth / 2;
    const startY = this.canvas.height - 40;

    // Background of bar
    this.ctx.fillStyle = '#1e1e1e';
    this.ctx.fillRect(startX, startY, barWidth, barHeight);

    // Fill of bar
    if (flashRatio >= 1) {
      this.ctx.fillStyle = '#fbc531'; // Ready 
    } else {
      this.ctx.fillStyle = '#7f8fa6'; // Cooldown
    }
    this.ctx.fillRect(startX, startY, barWidth * flashRatio, barHeight);

    // Border of bar
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(startX, startY, barWidth, barHeight);

    // Text for flash
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial, sans-serif';
    this.ctx.fillText('Flash (D o F)', this.canvas.width / 2, startY + 15);
  }

  handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.projectileManager.width = this.canvas.width;
    this.projectileManager.height = this.canvas.height;
  }

  handleGameOver() {
    this.isGameOver = true;
    this.loop.stop();

    const seconds = (this.timeSurvivedMs / 1000).toFixed(2);
    const dodges = this.projectileManager.dodgedCount || 0;

    // Scoring formula: (Seconds * 1000) + (Dodges * 10)
    // Adjust by difficulty
    const diffMulti = this.difficulty === 'hard' ? 1.5 : (this.difficulty === 'medium' ? 1.2 : 1.0);
    const finalScore = Math.floor((this.timeSurvivedMs / 10 * diffMulti) + (dodges * 100 * diffMulti));

    // Save record by difficulty
    const storageKey = `dodgeBestScore_${this.difficulty}`;
    const currentBest = parseFloat(localStorage.getItem(storageKey) || '0');
    const isNewRecord = parseFloat(seconds) > currentBest;

    if (isNewRecord) {
      localStorage.setItem(storageKey, seconds);
    }

    const diffLabel = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);

    // Modal
    this.modal = document.createElement('div');
    this.modal.className = 'results-overlay';
    this.modal.innerHTML = `
      <div class="results-container">
        <div class="results-logo">
          <img src="../microlol-transparent.png" alt="Logo">
        </div>

        <h1 class="results-title">DODGE SKILLS - RESULTADOS</h1>

        <div class="results-grid">
          <div class="result-row">
            <div class="result-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div class="result-label">Tiempo Resistido</div>
            <div class="result-value">${seconds}s</div>
          </div>

          <div class="result-row">
            <div class="result-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="result-label">Aciertos/Esquives</div>
            <div class="result-value">${dodges}</div>
          </div>

          <div class="result-row">
            <div class="result-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.45.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7c0 3.31 2.69 6 6 6s6-2.69 6-6V2z"/>
              </svg>
            </div>
            <div class="result-label">Puntaje Final</div>
            <div class="result-value">${finalScore}</div>
          </div>
        </div>

        <div class="results-actions">
          <button id="btn-retry" class="action-btn primary">REINTENTAR</button>
          <button id="btn-menu" class="action-btn secondary">MENÚ PRINCIPAL</button>
        </div>
      </div>
    `;

    this.container.appendChild(this.modal);

    this.modal.querySelector('#btn-retry').addEventListener('click', () => {
      this.sceneManager.changeScene(this.constructor, { difficulty: this.difficulty });
    });

    this.modal.querySelector('#btn-menu').addEventListener('click', () => {
      this.sceneManager.changeScene(MenuScene);
    });
  }

  destroy() {
    this.loop.stop();
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.handleResize);
    this.canvas.remove();
  }
}
