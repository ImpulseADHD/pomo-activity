// client/src/main.js

import { DiscordSDK } from "@discord/embedded-app-sdk";
import App from "./App.js";
import './styles.css';

// Load environment variables
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);

// Initialize the Discord SDK and set up WebSocket connection
const initApp = async () => {
  try {
    console.log("Starting application initialization...");

    // Initialize Discord SDK
    console.log("Initializing Discord SDK..."); 
    await discordSdk.init({ clientId: DISCORD_CLIENT_ID });
    console.log("Discord SDK initialized successfully.");

    // Establish WebSocket connection
    const socket = createWebSocketConnection(WEBSOCKET_URL);

    // Attach the main App component to the DOM
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.appendChild(App(socket));
      console.log("App component attached to DOM.");
    } else {
      throw new Error("Failed to find 'app' element in DOM.");
    }
  } catch (error) {
    console.error("Error initializing app:", error);
  }
};

// Set up WebSocket connection and event handlers
function createWebSocketConnection(url) {
  console.log("Attempting WebSocket connection to:", url);

  try {
    const socket = new WebSocket(url);

    // WebSocket event handlers
    socket.onopen = () => console.log("WebSocket connection opened.");
    socket.onmessage = (event) => handleWebSocketMessage(event);
    socket.onerror = (error) => console.error("WebSocket error occurred:", error);
    socket.onclose = () => console.log("WebSocket connection closed.");

    return socket;
  } catch (error) {
    console.error("Failed to create WebSocket connection:", error);
    throw error;
  }
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(event) {
  console.log("Received WebSocket message:", event.data);

  try {
    const data = JSON.parse(event.data);

    if (data.type === 'SESSIONS_UPDATE') {
      App.updateSessions(data.sessions);
      console.log("Session data updated.");
    } else if (data.type === 'ERROR') {
      console.error("Server sent an error:", data.message);
    } else {
      console.warn("Unknown message type received from WebSocket:", data.type);
    }
  } catch (error) {
    console.error("Error processing WebSocket message:", error);
  }
}

initApp();
