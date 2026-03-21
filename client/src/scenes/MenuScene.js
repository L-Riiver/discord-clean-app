import { AimTrainerScene } from '../games/aim-trainer/AimTrainerScene.js';
import { DodgeSkillsScene } from '../games/dodge-skills/DodgeSkillsScene.js';

export class MenuScene {
  constructor(container, sceneManager) {
    this.container = container;
    this.sceneManager = sceneManager;

    this.difficulties = {
      aim: localStorage.getItem('aimDifficulty') || 'medium',
      dodge: localStorage.getItem('dodgeDifficulty') || 'medium'
    };

    this.selectedCursor = localStorage.getItem('selectedCursor') || 'cursor-default';
    this.applyCursor(this.selectedCursor);

    this.handlePlayClick = this.handlePlayClick.bind(this);
  }

  applyCursor(cursorClass) {
    document.body.classList.remove('cursor-default', 'cursor-custom-1', 'cursor-custom-2', 'cursor-custom-3');
    document.body.classList.add(cursorClass);
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="menu-container">
        <!-- Logo Section -->
        <div class="logo-section">
          <img src="../microlol-transparent.png" alt="Logo">
          
          <div class="cursor-select-container" style="margin-top: 20px; text-align: center;">
            <label style="font-weight: bold; margin-right: 10px;">CURSOR:</label>
            <select id="cursor-select" style="background: black; color: white; border: 2px solid white; padding: 5px 10px; font-weight: bold; font-family: inherit; cursor: pointer;">
              <option value="cursor-default" ${this.selectedCursor === 'cursor-default' ? 'selected' : ''}>Default</option>
              <option value="cursor-custom-1" ${this.selectedCursor === 'cursor-custom-1' ? 'selected' : ''}>Cruz</option>
              <option value="cursor-custom-2" ${this.selectedCursor === 'cursor-custom-2' ? 'selected' : ''}>Mano</option>
              <option value="cursor-custom-3" ${this.selectedCursor === 'cursor-custom-3' ? 'selected' : ''}>Cursor Lol</option>
            </select>
          </div>
        </div>
        
        <!-- Games Section -->
        <div class="games-container">
          <!-- Aim Faster -->
          <div class="game-card" id="card-aim" data-game="aim">
            <div class="game-info">
              <span class="icon">🗡️</span>
              <h2>Aim Faster</h2>
            </div>
            <div class="game-difficulty-trigger">
              <span class="diff-label">Dificultad:</span>
              <div class="diff-selected">
                <span id="label-aim">${this.getDifficultyLabel(this.difficulties.aim)}</span>
                <span class="diff-arrow">▲</span>
              </div>
              
              <div class="difficulty-dropdown">
                <div class="diff-opt ${this.difficulties.aim === 'easy' ? 'current' : ''}" data-diff="easy">Fácil</div>
                <div class="diff-opt ${this.difficulties.aim === 'medium' ? 'current' : ''}" data-diff="medium">Medio</div>
                <div class="diff-opt ${this.difficulties.aim === 'hard' ? 'current' : ''}" data-diff="hard">Difícil</div>
              </div>
            </div>
          </div>

          <!-- Dodge Skills -->
          <div class="game-card" id="card-dodge" data-game="dodge">
            <div class="game-info">
              <span class="icon">🛡️</span>
              <h2>Dodge Skills</h2>
            </div>
            <div class="game-difficulty-trigger">
              <span class="diff-label">Dificultad:</span>
              <div class="diff-selected">
                <span id="label-dodge">${this.getDifficultyLabel(this.difficulties.dodge)}</span>
                <span class="diff-arrow">▼</span>
              </div>
              
              <div class="difficulty-dropdown">
                <div class="diff-opt ${this.difficulties.dodge === 'easy' ? 'current' : ''}" data-diff="easy">Fácil</div>
                <div class="diff-opt ${this.difficulties.dodge === 'medium' ? 'current' : ''}" data-diff="medium">Medio</div>
                <div class="diff-opt ${this.difficulties.dodge === 'hard' ? 'current' : ''}" data-diff="hard">Difícil</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div class="results-section">
          <h3 class="results-header">Resultados</h3>
          <table class="results-table">
            <thead>
              <tr>
                <th>Aim Faster</th>
                <td id="score-aim">0</td>
                <th>Dodge Skills</th>
                <td id="score-dodge">0</td>
              </tr>
            </thead>
          </table>
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
    this.container.querySelectorAll('.game-card').forEach(card => {
      const game = card.dataset.game;
      const info = card.querySelector('.game-info');
      const trigger = card.querySelector('.game-difficulty-trigger');

      // Click on info starts game immediately
      info.addEventListener('click', (e) => {
        e.stopPropagation();
        const SceneClass = game === 'aim' ? AimTrainerScene : DodgeSkillsScene;
        this.handlePlayClick(this.difficulties[game], SceneClass);
      });

      // Hover shows dropdown
      card.addEventListener('mouseenter', () => card.classList.add('active'));
      card.addEventListener('mouseleave', () => card.classList.remove('active'));

      // Dropdown selection
      card.querySelectorAll('.diff-opt').forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const diff = opt.dataset.diff;
          this.saveDifficulty(game, diff);

          // Update UI label
          card.querySelector(`#label-${game}`).textContent = this.getDifficultyLabel(diff);

          // Close dropdown and play
          card.classList.remove('active');
          const SceneClass = game === 'aim' ? AimTrainerScene : DodgeSkillsScene;
          this.handlePlayClick(diff, SceneClass);
        });
      });
    });

    const cursorSelect = this.container.querySelector('#cursor-select');
    if (cursorSelect) {
      cursorSelect.addEventListener('change', (e) => {
        const newCursor = e.target.value;
        this.selectedCursor = newCursor;
        localStorage.setItem('selectedCursor', newCursor);
        this.applyCursor(newCursor);
      });
    }
  }

  saveDifficulty(game, diff) {
    this.difficulties[game] = diff;
    localStorage.setItem(`${game}Difficulty`, diff);
  }

  loadBestScores() {
    const aimBest = localStorage.getItem('aimBestScore') || 0;
    const dodgeBest = localStorage.getItem('dodgeBestScore') || 0;

    this.container.querySelector('#score-aim').textContent = aimBest;
    this.container.querySelector('#score-dodge').textContent = dodgeBest;
  }

  handlePlayClick(difficulty, SceneClass) {
    this.sceneManager.changeScene(SceneClass, { difficulty });
  }

  destroy() { }
}

