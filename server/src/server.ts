import express from "express";
import { WebSocketServer, WebSocket } from "ws";
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

// List of active WebSocket connections and their associated user IDs
const clients: Record<string, WebSocket> = {};
const users: Record<string, string> = {}; // Optional if storing additional user info

// Serve a basic HTTP response
app.get("/", (req, res) => {
  res.send("Node.js Server with WebSocket");
});

// Start the HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Set up WebSocket server
const wss = new WebSocketServer({ server });

/**
 * Handle WebSocket disconnection
 * @param userId - The ID of the disconnected user
 */
function handleWebSocketDisconnect(userId: string, code, reason) {
  console.log(`${userId} Connection closed: Code ${code}, Reason ${reason}`);

  // 1000: Normal closure.
  // 1001: Going away (e.g., server shutdown or client going offline).
  // 1002: Protocol error.
  // 1003: Unsupported data type.
  // 1006: Abnormal closure (e.g., connection dropped unexpectedly).
  // 1011: Internal server error.
  const connection = clients[userId];
  if (connection && connection.readyState === WebSocket.OPEN) {
    console.log("connection was open");
    connection.close(1000, "Normal closure");
  }

  broadcastWebsocketMessage(userId, `${userId} connection dropped`);

  // Clean up user data if stored
  delete clients[userId];
  delete users[userId];
}

/**
 * Broadcast a message to all connected clients except the sender
 * @param senderId - The ID of the sender
 * @param message - The message to broadcast
 */
function broadcastWebsocketMessage(senderId: string, message: string) {
  Object.entries(clients).forEach(([userId, client]) => {
    if (userId !== senderId && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Handle WebSocket connections
wss.on("connection", (connection) => {
  console.log("New WebSocket connection");

  // Generate a unique ID for the user
  const userId = uuidv4();
  clients[userId] = connection;

  console.log(`User connected: ${userId}`);

  // Handle incoming messages
  connection.on("message", (message) => {
    const msgString = message.toString();
    console.log(`Message from ${userId}: ${msgString}`);

    // Echo the message back to the sender
    connection.send(`You said: ${msgString} (Your ID: ${userId})`);

    // Broadcast the message to other clients
    broadcastWebsocketMessage(userId, `${userId} says: ${msgString}`);
  });

  // Handle WebSocket disconnection
  connection.on("close", (code, reason) =>
    handleWebSocketDisconnect(userId, code, reason)
  );
});

console.log(`WebSocket server is listening on ws://localhost:${PORT}`);
