const WebSocket = require('ws');

async function sendMessage(username, message) {
  return new Promise((resolve) => {
    const ws = new WebSocket('ws://localhost:8001');
    ws.on('open', () => {
      ws.send(JSON.stringify({ method: 'join-room', room: 'demo-room', username }));
      setTimeout(() => {
        ws.send(JSON.stringify({ 
          method: 'send-message', 
          author: username, 
          message, 
          room: 'demo-room' 
        }));
        setTimeout(() => { ws.close(); resolve(); }, 500);
      }, 300);
    });
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.method === 'new-message') {
        console.log(`✅ ${username} sent: "${message}"`);
      }
    });
  });
}

async function joinAndCheckHistory(username) {
  return new Promise((resolve) => {
    const ws = new WebSocket('ws://localhost:8001');
    ws.on('open', () => {
      console.log(`\n👤 ${username} joining demo-room...`);
      ws.send(JSON.stringify({ method: 'join-room', room: 'demo-room', username }));
      setTimeout(() => { ws.close(); resolve(); }, 1500);
    });
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.method === 'message-history') {
        console.log(`📚 Received ${msg.count} messages:`);
        msg.messages.slice(-5).forEach(m => {
          console.log(`   - ${m.author}: ${m.message}`);
        });
      }
    });
  });
}

(async () => {
  console.log('🧪 Full Flow Test: Send messages, then join to see history\n');
  
  await sendMessage('alice', 'Hello everyone!');
  await sendMessage('bob', 'Hi Alice!');
  await sendMessage('alice', 'How are you doing?');
  
  await joinAndCheckHistory('charlie');
  
  console.log('\n✅ Test complete!');
  process.exit(0);
})();
