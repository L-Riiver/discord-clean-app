import { AimTrainerScene } from '../games/aim-trainer/AimTrainerScene.js';
import { DodgeSkillsScene } from '../games/dodge-skills/DodgeSkillsScene.js';

export class MenuScene {
  constructor(container, sceneManager) {
    this.container = container;
    this.sceneManager = sceneManager;

    // Load saved difficulties or defaults
    this.difficulties = {
      aim: localStorage.getItem('aimDifficulty') || 'medium',
      dodge: localStorage.getItem('dodgeDifficulty') || 'medium'
    };

    this.handlePlayClick = this.handlePlayClick.bind(this);
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="menu-container">
        <h1>MicroLoL Academy</h1>
        <h2>Selecciona un juego:</h2>
        
        <div class="games-container" id="games-container">
          <!-- Aim Faster -->
          <div class="game-container" id="container-aim">
            <div class="game-header" id="header-aim">
              <h2 class="game-title">Aim Faster</h2>
              <span class="difficulty-label">Dificultad: <strong id="label-aim">${this.getDifficultyLabel(this.difficulties.aim)}</strong></span>
            </div>
            <div class="game-options collapsible" id="options-aim">
                <button class="diff-btn ${this.difficulties.aim === 'easy' ? 'active' : ''}" data-game="aim" data-diff="easy" id="btn-aim-easy">Fácil</button>
                <button class="diff-btn ${this.difficulties.aim === 'medium' ? 'active' : ''}" data-game="aim" data-diff="medium" id="btn-aim-medium">Medio</button>
                <button class="diff-btn ${this.difficulties.aim === 'hard' ? 'active' : ''}" data-game="aim" data-diff="hard" id="btn-aim-hard">Difícil</button>
            </div>
          </div>

          <!-- Dodge Skills -->
          <div class="game-container" id="container-dodge">
            <div class="game-header" id="header-dodge">
              <h2 class="game-title">Dodge Skills</h2>
              <span class="difficulty-label">Dificultad: <strong id="label-dodge">${this.getDifficultyLabel(this.difficulties.dodge)}</strong></span>
            </div>
            <div class="game-options collapsible" id="options-dodge">
                <button class="diff-btn ${this.difficulties.dodge === 'easy' ? 'active' : ''}" data-game="dodge" data-diff="easy" id="btn-dodge-easy">Fácil</button>
                <button class="diff-btn ${this.difficulties.dodge === 'medium' ? 'active' : ''}" data-game="dodge" data-diff="medium" id="btn-dodge-medium">Medio</button>
                <button class="diff-btn ${this.difficulties.dodge === 'hard' ? 'active' : ''}" data-game="dodge" data-diff="hard" id="btn-dodge-hard">Difícil</button>
            </div>
          </div>
        </div>

        <div class="results-container">
          <h2>Resultados</h2>
          <div class="results">
            <div class="result">
              <h3>Aim Faster</h3>
              <p class="score" id="score-aim">0</p><span class="difficulty" id="best-diff-aim">-</span>
            </div>
            <div class="result">
              <h3>Dodge Skills</h3>
              <p class="score" id="score-dodge">0</p><span class="difficulty" id="best-diff-dodge">-</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.loadBestScores();
  }

  getDifficultyLabel(diff) {
    const labels = {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil'
    };
    return labels[diff] || 'Fácil';
  }

  setupEventListeners() {
    // Hover logic for Aim Faster
    const containerAim = this.container.querySelector('#container-aim');
    const optionsAim = this.container.querySelector('#options-aim');
    containerAim.addEventListener('mouseenter', () => {
      optionsAim.style.height = optionsAim.scrollHeight + 'px';
    });
    containerAim.addEventListener('mouseleave', () => {
      optionsAim.style.height = '0';
    });

    // Hover logic for Dodge Skills
    const containerDodge = this.container.querySelector('#container-dodge');
    const optionsDodge = this.container.querySelector('#options-dodge');
    containerDodge.addEventListener('mouseenter', () => {
      optionsDodge.style.height = optionsDodge.scrollHeight + 'px';
    });
    containerDodge.addEventListener('mouseleave', () => {
      optionsDodge.style.height = '0';
    });

    // Click on Game Header (Starts with default difficulty)
    this.container.querySelector('#header-aim').addEventListener('click', () => {
      this.handlePlayClick(this.difficulties.aim, AimTrainerScene);
    });
    this.container.querySelector('#header-dodge').addEventListener('click', () => {
      this.handlePlayClick(this.difficulties.dodge, DodgeSkillsScene);
    });

    // Click on Difficulty Buttons
    this.container.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the header click
        const game = btn.dataset.game;
        const diff = btn.dataset.diff;
        this.saveDifficulty(game, diff);
        const SceneClass = game === 'aim' ? AimTrainerScene : DodgeSkillsScene;
        this.handlePlayClick(diff, SceneClass);
      });
    });
  }

  saveDifficulty(game, diff) {
    this.difficulties[game] = diff;
    localStorage.setItem(`${game}Difficulty`, diff);
  }

  loadBestScores() {
    // Basic implementation for showing best scores if they exist
    const aimBest = localStorage.getItem('aimBestScore') || 0;
    const dodgeBest = localStorage.getItem('dodgeBestScore') || 0;
    const aimBestDiff = localStorage.getItem('aimBestDiff') || '-';
    const dodgeBestDiff = localStorage.getItem('dodgeBestDiff') || '-';

    this.container.querySelector('#score-aim').textContent = aimBest;
    this.container.querySelector('#score-dodge').textContent = dodgeBest;
    this.container.querySelector('#best-diff-aim').textContent = aimBestDiff;
    this.container.querySelector('#best-diff-dodge').textContent = dodgeBestDiff;
  }

  handlePlayClick(difficulty, SceneClass) {
    this.sceneManager.changeScene(SceneClass, { difficulty });
  }

  destroy() {
    // cleanup listeners if necessary, though innerHTML = '' handles most cases
  }
}

