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
    this.canvas.style.backgroundColor = '#2c2f33'; 
    this.canvas.style.cursor = 'crosshair'; // Better indication for right click targeting
    
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
    this.ctx.fillStyle = '#23272a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawHUD() {
    // SURVIVED TIME
    const seconds = Math.floor(this.timeSurvivedMs / 1000);
    const milliseconds = Math.floor((this.timeSurvivedMs % 1000) / 10);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Tiempo: ${seconds}.${milliseconds.toString().padStart(2, '0')}s`, this.canvas.width / 2, 40);

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
    alert(`¡Has sido impactado!\nResististe: ${seconds} segundos.\nDificultad: ${this.difficulty}`);
    
    this.sceneManager.changeScene(MenuScene);
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
