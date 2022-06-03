import express from 'express';
import path from 'path';
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

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