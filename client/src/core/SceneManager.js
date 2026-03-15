export class SceneManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentScene = null;
  }

  changeScene(SceneClass, props = {}) {
    if (this.currentScene) {
      this.currentScene.destroy();
    }
    
    this.container.innerHTML = '';
    this.currentScene = new SceneClass(this.container, this, props);
    this.currentScene.init();
  }
}
