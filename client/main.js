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
    // Check if we have a session to avoid the "Connecting..." flicker
    const hasSession = !!sessionStorage.getItem('discord_access_token');
    if (!hasSession) {
      container.innerHTML = `<div class="loading-full"><p>Conectando con Discord...</p></div>`;
    }
    
    // Auth & Setup Discord
    await setupDiscordSdk();
    
    // Load Menu Scene
    sceneManager.changeScene(MenuScene);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="error-msg"><p style="color:red;">Error de conexión con Discord: ${err.message}</p></div>`;
  }
}

initApp();

if (import.meta.hot) {
  import.meta.hot.accept();
}