// File: server/server.js

// Imports
import express from "express";
import path from "path";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import apiRoutes from './api/index.js';


// Define __dirname in ES modules
const __dirname = path.resolve();

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// Port and Discord settings
const PORT = process.env.PORT || 3001;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const APPLICATION_ID = process.env.DISCORD_CLIENT_ID;

// Add CSP Middleware
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://unpkg.com; object-src 'none';"
  );
  next();
});

// Log initialization
console.log("Initializing server...");
console.log(`Environment variables loaded. PORT: ${PORT}`);

// Serve Static Files with Proper MIME Type
app.use(
  express.static(path.join(__dirname, "client/dist"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);
console.log("Serving static files from client/dist...");

// Root Endpoint `/`
app.get("/", (req, res) => {
  const frontendFilePath = path.join(__dirname, "client/dist/index.html");
  console.log("Root endpoint accessed: Serving index.html");
  res.sendFile(frontendFilePath, (err) => {
    if (err) {
      console.error("Error serving index.html for root endpoint:", err);
      res.status(500).send("Error loading the frontend application.");
    }
  });
});

//API file endpoint `/api`
app.use('/api', apiRoutes);

// API Status Endpoint `/api/status`
app.get("/api/status", (req, res) => {
  console.log("API status endpoint accessed");
  res.json({
    message: "Pomodoro Activity Server is running successfully. 🚀(API)",
  });
});

// SPA Fallback for React App (Catch-All)
app.get("*", (req, res) => {
  const frontendFilePath = path.join(__dirname, "client/dist/index.html");
  console.log("Catch-All route triggered: Serving index.html");
  res.sendFile(frontendFilePath, (err) => {
    if (err) {
      console.error("Error serving index.html for catch-all route:", err);
      res.status(500).send("Error loading the frontend application.");
    }
  });
});

// WebSocket Server Setup
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const wss = new WebSocketServer({ server });
console.log("WebSocket Server initialized.");

// Initialize Discord Client
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
  ],
  partials: ["CHANNEL"], // Enable DM handling
});

discordClient.once("ready", () => {
  console.log(`
===================================================
Discord Bot Status: RUNNING SUCCESSFULLY
Bot Username: ${discordClient.user.tag}
Application ID: ${discordClient.application?.id || "Unavailable"}
Listening on WebSocket Server: ws://localhost:${PORT}
HTTP Server: http://localhost:${PORT}
===================================================
`);
});

discordClient.login(DISCORD_BOT_TOKEN).catch((error) => {
  console.error("Failed to login to Discord:", error);
});

// WebSocket Handlers
wss.on("connection", (ws) => {
  console.log("New WebSocket connection established.");
  ws.on("message", (message) => {
    try {
      console.log("Received WebSocket message:", message);
      const data = JSON.parse(message);

      switch (data.type) {
        case "CREATE_SESSION":
          handleCreateSession(data);
          break;
        case "JOIN_SESSION":
          handleJoinSession(data);
          break;
        case "END_SESSION":
          handleEndSession(data);
          break;
        default:
          console.error("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  });
});

// Placeholder Session Storage
const sessions = {};

// Session Management Functions
function handleCreateSession(data) {
  const sessionId = Date.now();
  sessions[sessionId] = { ...data, sessionId };
  console.log("Session created:", sessions[sessionId]);
}

function handleJoinSession(data) {
  if (sessions[data.sessionId]) {
    sessions[data.sessionId].members.push(data.username);
    console.log(`${data.username} joined session ${data.sessionId}`);
  }
}

function handleEndSession(data) {
  if (sessions[data.sessionId]) {
    console.log(`Session ended: ${data.sessionId}`);
    delete sessions[data.sessionId];
  }
}

// Exporting for Potential External Use
export { registerCommands };

// Function to Register Discord Commands
async function registerCommands() {
  console.log("Registering commands...");

  const commands = [
    {
      name: "launch",
      description: "Launch the Pomodoro Group Activity in a voice channel",
      type: 4,
    },
  ];

  const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

  try {
    const endpoint = Routes.applicationCommands(APPLICATION_ID);
    const response = await rest.put(endpoint, { body: commands });
    console.log(`Successfully registered ${response.length} commands.`);
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

registerCommands();
