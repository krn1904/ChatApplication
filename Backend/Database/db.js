const { MongoClient, ServerApiVersion } = require('mongodb');
const config = require('../config');

// Connection URI
const uri = config.MongoDb_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    // const db = client.db('chatApp'); // replace with your database name
    const db = client.db("chatapp"); 
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}

module.exports = { connect };