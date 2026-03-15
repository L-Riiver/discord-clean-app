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
    this.canvas.style.backgroundColor = '#2c2f33'; // Discord-like dark theme
    
    this.container.appendChild(this.canvas);
    
    this.canvas.addEventListener('mousedown', this.handleClick);
    window.addEventListener('resize', this.handleResize);

    this.loop.start();
  }

  update(deltaTime) {
    this.spawner.update(deltaTime);
    
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
    
    this.spawner.draw(this.ctx);
    
    // Draw UI HUD
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial, sans-serif';
    this.ctx.fillText(`Score: ${this.score}`, 30, 50);
    this.ctx.fillText(`Fails: ${this.misses} / ${this.maxMisses}`, 30, 90);
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
    // In a full application, this could be a GameOverScene
    alert(`¡Game Over! Puntaje Final: ${this.score}`); 
    this.sceneManager.changeScene(MenuScene); 
  }

  destroy() {
    this.loop.stop();
    this.canvas.removeEventListener('mousedown', this.handleClick);
    window.removeEventListener('resize', this.handleResize);
    this.canvas.remove();
  }
}
