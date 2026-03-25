import { AimTrainerScene } from '../games/aim-trainer/AimTrainerScene.js';
import { DodgeSkillsScene } from '../games/dodge-skills/DodgeSkillsScene.js';
import { audioManager } from '../services/AudioManager.js';

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

    this.showSettings = false;

    this.handlePlayClick = this.handlePlayClick.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
  }

  applyCursor(cursorClass) {
    document.body.classList.remove('cursor-default', 'cursor-custom-1', 'cursor-custom-2', 'cursor-custom-3');
    document.body.classList.add(cursorClass);
  }

  init() {
    this.render();
    this.setupEventListeners();

    // Play Menu Music - You can replace the URL with a local file path like './audio/menu-music.mp3'
    audioManager.stopMusic();
    audioManager.stopAllSounds();
    audioManager.playMusic('./audio/menu-music.mp3');

    // Resume audio on any click in case browser blocked it
    document.addEventListener('mousedown', () => audioManager.resumeAudio(), { once: true });
  }

  render() {
    this.container.innerHTML = `
      <div class="menu-container">
        <button id="btn-open-settings" class="settings-trigger-btn">
          <span class="icon">⚙️</span> AJUSTES
        </button>
        <!-- Logo Section -->
        <div class="logo-section">
          <img src="../microlol-transparent.png" alt="Logo">
          
        </div>
        
        <!-- Settings Overlay -->
        <div id="settings-overlay" class="settings-overlay ${this.showSettings ? 'active' : ''}">
          <div class="settings-modal">
            <div class="settings-header">
              <h2>AJUSTES</h2>
              <button id="btn-close-settings" class="close-btn">&times;</button>
            </div>
            
            <div class="settings-content">
              <div class="setting-item">
                <label>APARIENCIA DEL CURSOR</label>
                <div class="cursor-grid">
                  <div class="cursor-opt ${this.selectedCursor === 'cursor-default' ? 'selected' : ''}" data-cursor="cursor-default">
                    <div class="cursor-preview default"></div>
                    <span>Default</span>
                  </div>
                  <div class="cursor-opt ${this.selectedCursor === 'cursor-custom-1' ? 'selected' : ''}" data-cursor="cursor-custom-1">
                    <div class="cursor-preview crosshair"></div>
                    <span>Cruz</span>
                  </div>
                  <div class="cursor-opt ${this.selectedCursor === 'cursor-custom-2' ? 'selected' : ''}" data-cursor="cursor-custom-2">
                    <div class="cursor-preview pointer"></div>
                    <span>Mano</span>
                  </div>
                  <div class="cursor-opt ${this.selectedCursor === 'cursor-custom-3' ? 'selected' : ''}" data-cursor="cursor-custom-3">
                    <div class="cursor-preview lol"></div>
                    <span>MicroLoL</span>
                  </div>
                </div>
              </div>
              
              <!-- Placeholder for future settings -->
              <div class="setting-item">
                <label>VOLUMEN</label>
                <div class="volume-control">
                  <span class="volume-icon">🔊</span>
                  <input type="range" id="volume-slider" min="0" max="100" value="${Math.round(audioManager.volume * 100)}" class="volume-slider">
                  <span id="volume-val" class="volume-val">${Math.round(audioManager.volume * 100)}%</span>
                </div>
              </div>
            </div>
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

        <div class="results-section">
          <h3 class="results-header">Récords</h3>
          <table class="results-table">
            <thead>
              <tr>
                <th colspan="2">Aim Faster</th>
                <th colspan="2">Dodge Skills</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="diff-cat">Fácil</td>
                <td id="score-aim-easy" class="score-val">0</td>
                <td class="diff-cat">Fácil</td>
                <td id="score-dodge-easy" class="score-val">0</td>
              </tr>
              <tr>
                <td class="diff-cat">Medio</td>
                <td id="score-aim-medium" class="score-val">0</td>
                <td class="diff-cat">Medio</td>
                <td id="score-dodge-medium" class="score-val">0</td>
              </tr>
              <tr>
                <td class="diff-cat">Difícil</td>
                <td id="score-aim-hard" class="score-val">0</td>
                <td class="diff-cat">Difícil</td>
                <td id="score-dodge-hard" class="score-val">0</td>
              </tr>
            </tbody>
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

    const btnOpenSettings = this.container.querySelector('#btn-open-settings');
    if (btnOpenSettings) {
      btnOpenSettings.addEventListener('click', () => this.toggleSettings(true));
    }

    const btnCloseSettings = this.container.querySelector('#btn-close-settings');
    if (btnCloseSettings) {
      btnCloseSettings.addEventListener('click', () => this.toggleSettings(false));
    }

    // Cursor selection in settings
    this.container.querySelectorAll('.cursor-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        const newCursor = opt.dataset.cursor;
        this.selectedCursor = newCursor;
        localStorage.setItem('selectedCursor', newCursor);
        this.applyCursor(newCursor);

        // Update UI
        this.container.querySelectorAll('.cursor-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    // Volume Slider listener
    const volumeSlider = this.container.querySelector('#volume-slider');
    const volumeVal = this.container.querySelector('#volume-val');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        audioManager.setVolume(val / 100);
        if (volumeVal) volumeVal.textContent = `${val}%`;
      });
    }
  }

  toggleSettings(show) {
    this.showSettings = show;
    const overlay = this.container.querySelector('#settings-overlay');
    if (overlay) {
      if (show) {
        overlay.classList.add('active');
      } else {
        overlay.classList.remove('active');
      }
    }
  }

  saveDifficulty(game, diff) {
    this.difficulties[game] = diff;
    localStorage.setItem(`${game}Difficulty`, diff);
  }

  loadBestScores() {
    ['easy', 'medium', 'hard'].forEach(diff => {
      const aimScore = localStorage.getItem(`aimBestScore_${diff}`) || 0;
      const dodgeScore = localStorage.getItem(`dodgeBestScore_${diff}`) || 0;

      const aimEl = this.container.querySelector(`#score-aim-${diff}`);
      const dodgeEl = this.container.querySelector(`#score-dodge-${diff}`);

      if (aimEl) aimEl.textContent = aimScore;
      if (dodgeEl) dodgeEl.textContent = dodgeScore;
    });
  }

  handlePlayClick(difficulty, SceneClass) {
    this.sceneManager.changeScene(SceneClass, { difficulty });
  }

  destroy() { }
}

