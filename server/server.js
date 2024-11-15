// server/server.js

import express from 'express';
import path from 'path';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import fetch from 'node-fetch'
import { Client, GatewayIntentBits } from 'discord.js';

// Define __dirname in ES modules
const __dirname = path.resolve(); // Ensures __dirname works in ES modules

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const APPLICATION_ID = process.env.DISCORD_CLIENT_ID;

// Initialize Discord Client with required intents
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// Log in to Discord and notify when the bot is ready
discordClient.once('ready', () => {
  console.log(`Discord bot logged in as ${discordClient.user.tag}`);
});


discordClient.login(DISCORD_BOT_TOKEN).catch(error => {
  console.error("Failed to login to Discord:", error);
});


// Retrieve Ngrok URL
async function getNgrokUrl() {
  try {
    const response = await fetch('http://127.0.0.1:4040/api/tunnels');
    const json = await response.json();
    const publicUrl = json.tunnels.find(tunnel => tunnel.public_url.includes('https')).public_url;
    console.log("Ngrok URL fetched:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error fetching Ngrok URL:", error);
    return null;
  }
}

// Update Discord URL mappings
async function updateDiscordUrl(newUrl) {
  const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/activity-url-mappings`;
  const headers = {
    "Authorization": `Bearer ${DISCORD_BOT_TOKEN}`,
    "Content-Type": "application/json"
  };
  const body = JSON.stringify({ url: newUrl });

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update Discord URLs: ${response.status} ${response.statusText} - ${errorText}`);
    }
    console.log("Discord URLs updated successfully.");
  } catch (error) {
    console.error("Error updating Discord URLs:", error);
  }
}


// Function to initialize Ngrok and update Discord URL mappings
async function initializeNgrokAndDiscord() {
  const ngrokUrl = await getNgrokUrl();
  if (ngrokUrl) {
    await updateDiscordUrl(ngrokUrl);
  } else {
    console.error("Ngrok URL could not be retrieved. Ensure Ngrok is running.");
  }
}

// Call this function to initialize Ngrok and update Discord URLs
initializeNgrokAndDiscord();


// Session storage to keep track of Pomodoro sessions by VC ID
const sessions = {};

// Serve a basic message on the root URL to confirm the server is running
app.get('/', (req, res) => {
  res.send("Welcome to the Pomodoro Group Activity Server! This is running at localhost:3001.");
});

// Serve static files from the frontend's dist directory
app.use(express.static(path.join(__dirname, 'client')));

// Catch-all route to serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Start HTTP server for WebSocket communication
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Set up WebSocket server on top of the HTTP server
const wss = new WebSocketServer({ server });
console.log("WebSocket Server initialized.");

// Handle WebSocket Connection handler
wss.on('connection', (ws) => {
  
  console.log("New WebSocket connection established");
  
  // When a WebSocket client sends a message
  ws.on('message', (message) => { handleWebSocketMessage(message, ws); });
    

});

// handleWebSocketMessage
function handleWebSocketMessage(message, ws) {
  console.log("WebSocket message received:", message);
  try {
    const data = JSON.parse(message);
    switch (data.type) {
      case 'CREATE_SESSION':
        handleCreateSession(data);
        break;
      case 'JOIN_SESSION':
        handleJoinSession(data);
        break;
      case 'LEAVE_SESSION':
        handleLeaveSession(data);
        break;
      case 'END_SESSION':
        handleEndSession(data);
        break;
      default:
        console.error(`Unknown message type: ${data.type}`);
        ws.send(JSON.stringify({ type: 'ERROR', message: `Unknown message type: ${data.type}` }));
    }
  } catch (error) {
    console.error("Error parsing WebSocket message:", error);
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid message format.' }));
  }
}


// Function to handle creating a new Pomodoro session
function handleCreateSession(data, ws) {
  const session = {
    id: Date.now(),
    name: data.name,
    focusDuration: data.focusDuration,
    breakDuration: data.breakDuration,
    reps: data.reps,
    vcId: data.vcId,  // Store associated VC ID
    textChannelId: data.textChannelId, // Associated Text Channel ID for notifications
    members: [],
  };
  sessions[session.id] = session;

  // Broadcast the updated session list to all clients
  broadcastSessionsUpdate();
}

// Function to handle joining an existing Pomodoro session
function handleJoinSession(data, ws) {
  const session = sessions[data.sessionId];
  if (session) {
    session.members.push(data.username);

    // Send a message to the associated VC's text channel
    const channel = discordClient.channels.cache.get(session.textChannelId);
    if (channel) {
      channel.send(`${data.username} has joined the Pomodoro session in VC: ${session.vcId}`);
    }

    // Move the user to the specified voice channel if possible
    const guild = discordClient.guilds.cache.get(data.guildId);
    const member = guild?.members.cache.get(data.userId);
    if (member && member.voice.channelId !== session.vcId) {
      member.voice.setChannel(session.vcId)
        .then(() => console.log(`Moved ${data.username} to VC ${session.vcId}`))
        .catch((error) => console.error(`Error moving ${data.username}: ${error}`));
    }

    // Broadcast the updated session data to all WebSocket clients
    broadcastSessionsUpdate();
  }
}

// Function to handle leaving a session
function handleLeaveSession(data, ws) {
  const session = sessions[data.sessionId];
  if (session) {
    // Remove the user from the session's member list
    session.members = session.members.filter((username) => username !== data.username);

    // Broadcast the updated session data to all clients
    broadcastSessionsUpdate();
  }
}

// Function to handle ending a session
function handleEndSession(data, ws) {
  const session = sessions[data.sessionId];
  if (session) {
    // Notify members in the associated text channel that the session has ended
    const channel = discordClient.channels.cache.get(session.textChannelId);
    if (channel) {
      channel.send(`The Pomodoro session in VC: ${session.vcId} has ended.`);
    }

    // Remove the session from the sessions list
    delete sessions[data.sessionId];

    // Broadcast the updated session list to all clients
    broadcastSessionsUpdate();
  }
}

// Utility function to broadcast updated sessions data to all connected WebSocket clients
function broadcastSessionsUpdate() {
  const sessionsData = Object.values(sessions);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocketServer.OPEN) {
      client.send(JSON.stringify({ type: 'SESSIONS_UPDATE', sessions: sessionsData }));
    }
  });
}
