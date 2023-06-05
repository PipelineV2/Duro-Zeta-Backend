// eslint-disable-next-line @typescript-eslint/no-var-requires
const WebSocket = require('ws');

// WebSocket server URL
const serverUrl = 'ws://localhost:9000';

// Create a WebSocket client
const client = new WebSocket(serverUrl);

// Listen for WebSocket connection open event
client.on('open', () => {
  console.log('Connected to WebSocket server');

  // Emit 'userAttended' event
  const userId = '123456';
  client.send(JSON.stringify({ event: 'userAttended', userId }));
});

// Listen for WebSocket message event
client.on('message', (message) => {
  console.log('Received message:', message);

  // Parse the received message
  const data = JSON.parse(message);

  // Check the event type
  if (data.event === 'queueUpdated') {
    const queue = data.queue;
    console.log('Updated queue:', queue);
  } else if (data.event === 'attendUserError') {
    const errorMessage = data.error;
    console.error('Error attending user:', errorMessage);
  }
});

// Listen for WebSocket error event
client.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Listen for WebSocket close event
client.on('close', () => {
  console.log('Disconnected from WebSocket server');
});
