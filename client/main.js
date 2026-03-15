import "./style.css";
import { setupDiscordSdk } from "./src/services/discord.js";
import { SceneManager } from "./src/core/SceneManager.js";
import { MenuScene } from "./src/scenes/MenuScene.js";

// Initialize the Game App
async function initApp() {
  const container = document.querySelector('#app');
  
  // Create SceneManager
  const sceneManager = new SceneManager(container);
  
  try {
    // Optionally show a loading state
    container.innerHTML = `<p>Conectando con Discord...</p>`;
    
    // Auth & Setup Discord
    await setupDiscordSdk();
    
    // Load Menu Scene
    sceneManager.changeScene(MenuScene);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:red;">Error de conexión con Discord: ${err.message}</p>`;
  }
}

initApp();