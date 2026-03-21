import { GameLoop } from '../../core/GameLoop.js';
import { MenuScene } from '../../scenes/MenuScene.js';
import { TargetSpawner } from './TargetSpawner.js';

export class AimTrainerScene {
  constructor(container, sceneManager, props) {
    this.container = container;
    this.sceneManager = sceneManager;
    
    this.score = 0;
    this.misses = 0;
    this.maxMisses = 3;
    this.difficulty = props.difficulty || 'easy';
    this.startTime = Date.now();
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    this.spawner = new TargetSpawner(this.canvas.width, this.canvas.height, this.difficulty);
    this.loop = new GameLoop(this.update.bind(this), this.draw.bind(this));
    
    this.handleClick = this.handleClick.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    // Style the canvas dynamically to cover the screen
    this.canvas.style.display = 'block';
    this.canvas.style.backgroundColor = '#1b1b1b'; // Match deeper dark theme
    
    this.container.appendChild(this.canvas);
    
    // Create UI HUD
    this.uiContainer = document.createElement('div');
    this.uiContainer.className = 'aim-hud';
    
    const diffLabel = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
    
    this.uiContainer.innerHTML = `
      <div class="hud-left">
        <div class="hud-box">
          <div>Score: <span id="aim-score">0</span></div>
          <div>Fails: <span id="aim-fails">0</span> / ${this.maxMisses}</div>
        </div>
      </div>
      <div class="hud-center">
        <div class="hud-time"><span class="icon">🕒</span> Time: <span id="aim-time">00:00</span></div>
      </div>
      <div class="hud-right">
        <div class="hud-box">
          <div>Difficulty: <span id="aim-diff">${diffLabel}</span></div>
          <div>Appearing Speed: <span id="aim-speed"></span></div>
        </div>
      </div>
    `;
    this.container.appendChild(this.uiContainer);
    
    this.scoreElement = this.uiContainer.querySelector('#aim-score');
    this.failsElement = this.uiContainer.querySelector('#aim-fails');
    this.timeElement = this.uiContainer.querySelector('#aim-time');
    this.speedElement = this.uiContainer.querySelector('#aim-speed');

    this.canvas.addEventListener('mousedown', this.handleClick);
    window.addEventListener('resize', this.handleResize);

    this.startTime = Date.now();
    this.loop.start();
  }

  update(deltaTime) {
    this.spawner.update(deltaTime);
    
    // Update Time
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    
    if (this.timeElement) this.timeElement.textContent = `${mins}:${secs}`;
    if (this.speedElement) this.speedElement.textContent = this.spawner.getAppearingSpeed();
    if (this.scoreElement) this.scoreElement.textContent = this.score;
    if (this.failsElement) this.failsElement.textContent = this.misses;
    
    const missedTargetsCount = this.spawner.getAndClearMisses();
    if (missedTargetsCount > 0) {
      this.misses += missedTargetsCount;
      if (this.misses >= this.maxMisses) {
        this.handleGameOver();
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw grid background
    this.ctx.strokeStyle = '#ffffff08';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 40) {
      this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height); this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += 40) {
      this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.canvas.width, y); this.ctx.stroke();
    }

    this.spawner.draw(this.ctx);
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (this.spawner.attemptHit(x, y)) {
      this.score++;
    }
  }
  
  handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.spawner.width = this.canvas.width;
    this.spawner.height = this.canvas.height;
  }

  handleGameOver() {
    this.loop.stop();
    
    // Calculate final time
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    const timeString = `${mins}:${secs}`;
    
    // Record check
    const currentBest = parseInt(localStorage.getItem('aimBestScore') || '0', 10);
    const isNewRecord = this.score > currentBest;
    if (isNewRecord) {
      localStorage.setItem('aimBestScore', this.score);
    }
    
    const diffLabel = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
    
    // Build Modal
    this.modal = document.createElement('div');
    this.modal.className = 'aim-modal-overlay';
    this.modal.innerHTML = `
      <div class="aim-modal-header">
        <h2 class="modal-title">TRAINING COMPLETE</h2>
      </div>
      <div class="aim-modal">
        <div class="modal-content">
          ${isNewRecord ? '<div class="new-record-badge">NEW RECORD!</div>' : ''}
          <div class="stat-line">Final Score: ${this.score}</div>
          <div class="stat-line">Hits: ${this.score}</div>
          <div class="stat-line">Fails: ${this.misses}</div>
          <div class="stat-line">Total Time: ${timeString}</div>
          <div class="diff-badge">Difficulty: ${diffLabel}</div>
          
          <div class="modal-buttons">
            <button id="btn-retry" class="btn-dark">RETRY</button>
            <button id="btn-menu" class="btn-light">BACK TO MENU</button>
          </div>
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
    this.canvas.removeEventListener('mousedown', this.handleClick);
    window.removeEventListener('resize', this.handleResize);
    this.canvas.remove();
    if (this.uiContainer) this.uiContainer.remove();
    if (this.modal) this.modal.remove();
  }
}
