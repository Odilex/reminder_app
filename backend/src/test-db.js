import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Starting MongoDB test...');
console.log('MongoDB URI is set:', !!uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged deployment. MongoDB is responsive.");
    
  } catch (err) {
    console.error('Connection error details:');
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    if (err.code) console.error('Code:', err.code);
    if (err.cause) console.error('Cause:', err.cause);
  } finally {
    await client.close();
    process.exit(0);
  }
}

run().catch(console.dir); 