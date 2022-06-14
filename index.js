import express from 'express';
import path from 'path';
import { MongoClient } from 'mongodb';
import { createServer } from "http";
import { Server } from "socket.io";
import 'dotenv/config';

const app = express();


// ============================= DB ==================================
const uri = process.env.MONGODB;
const mongo = new MongoClient(uri);

async function run() {
  try {
    await mongo.connect();
    const database = mongo.db('how_is_earth')
    const earthDB = database.collection('earthDB')

    const query = { test: 1 };
    const movie = await earthDB.findOne(query)
    console.log("============= DB CONNECTED ================")
    console.log(movie)
  } catch (error) {
    console.log(error)
  }
    finally {
    await mongo.close()
    console.log("============= DB DISCONNECTED ================")
  }
}
run().catch(console.dir)

// =============================== END DB ==========================
app.use(express.static('howisearth/build/'))

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:4003", "http://localhost:4000"],
  }
});

const hostname = '127.0.0.1';
const port = 4000;


httpServer.listen(4003);
app.listen(4000, () => {
  console.log('App running on localhost:4000');
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('./howisearth/build/', 'index.html'));
});