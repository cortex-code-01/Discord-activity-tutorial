import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import WebSocket, {WebSocketServer} from "ws";
dotenv.config({ path: "../.env" });

const wss = new WebSocketServer({port: 8080, path: '/ws'})

const app = express();
const port = 3001;

// Allow express to parse JSON bodies
app.use(express.json());

app.post("/api/token", async (req, res) => {
  
  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json();

  // Return the access_token to our client as { access_token: "..."}
  res.send({access_token});
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});




let clickCount = 0; // The shared counter for all connected clients

// When a new client connects
wss.on('connection', (ws) => {
    // Send the current click count to the newly connected client
    ws.send(JSON.stringify({ type: 'update', count: clickCount }));

    // Listen for messages from clients
    ws.on('message', (message) => {
        console.log('hola')
        const data = JSON.parse(message);
        console.log(data)
        if (data.type === 'click') {
            clickCount += 1; // Increment the shared counter

            // Broadcast the updated count to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'update', count: clickCount }));
                }
            });
        }
    });

    // Optional: Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
