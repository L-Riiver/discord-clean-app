import { DiscordSDK } from "@discord/embedded-app-sdk";

export const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
export let auth;
let authPromise = null;

export async function setupDiscordSdk() {
  if (authPromise) return authPromise;

  authPromise = (async () => {
    await discordSdk.ready();
    console.log("Discord SDK is ready");

    // Check if we already have an access_token in sessionStorage
    let access_token = sessionStorage.getItem('discord_access_token');

    if (!access_token) {
      // Authorize with Discord Client
      const { code } = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
        response_type: "code",
        state: "",
        prompt: "none",
        scope: [
          "identify",
          "guilds",
          "applications.commands"
        ],
      });

      // Retrieve an access_token from your activity's server
      const response = await fetch("/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      });
      
      const data = await response.json();
      access_token = data.access_token;
      
      // Cache the token
      sessionStorage.setItem('discord_access_token', access_token);
    }

    try {
      // Authenticate with Discord client
      auth = await discordSdk.commands.authenticate({
        access_token,
      });

      if (auth == null) {
        throw new Error("Authenticate command failed");
      }
    } catch (err) {
      // If we are already authenticated, we can just ignore this error
      if (err.message && err.message.includes("Already authenticated")) {
        console.warn("Discord SDK already authenticated.");
        return auth; 
      }
      // If it failed for other reasons, clear cache and re-throw
      sessionStorage.removeItem('discord_access_token');
      authPromise = null;
      throw err;
    }
    
    console.log("Discord SDK is authenticated");
    return auth;
  })();

  return authPromise;
}
