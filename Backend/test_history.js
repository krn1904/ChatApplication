const WebSocket = require('ws');

console.log('Testing Message History\n');

const ws = new WebSocket('ws://localhost:8001');

ws.on('open', function() {
  console.log('Connected');
  ws.send(JSON.stringify({
    method: 'join-room',
    room: 'test-room',
    username: 'tester'
  }));
  setTimeout(() => ws.close(), 2000);
});

ws.on('message', function(data) {
  const msg = JSON.parse(data);
  if (msg.method === 'message-history') {
    console.log(`\nHistory: ${msg.count} messages`);
    msg.messages.forEach((m, i) => {
      console.log(`${i+1}. ${m.author}: ${m.message}`);
    });
  }
});

ws.on('close', () => {
  console.log('\nDone');
  process.exit(0);
});
