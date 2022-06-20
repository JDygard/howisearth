import express from 'express';
import path from 'path';
import { MongoClient } from 'mongodb';
import { createServer } from "http";
import http from 'http';
import { Server } from "socket.io";
import 'dotenv/config';

import JSONstat from "jsonstat-toolkit";
import * as EuroJSONstat from "jsonstat-euro"

const app = express();

// =============================== Sockets
// =============================== Sockets END

// =============================== REST Request ====================
const query = {
  "dataset": "sdg_13_10",
  "filter": {
    src_crf: "TOTXMEMONIA",
    unit: "T_HAB",
  }
}
var dataset = {};
EuroJSONstat.fetchQuery(query, false).then(eq=> {
  if (eq.class === "error")
  console.log(eq)
})

EuroJSONstat.fetchDataset(query).then(ds=>{
  if(ds.class==="dataset"){
    dataset = ds
    console.log(ds.label)
    console.log(JSONstat(dataset).Data({"geo" : "SE"}))
  }
})
// ============================== END REST Request =================s

// ============================= DB ==================================
const uri = process.env.MONGODB;
const mongo = new MongoClient(uri);

async function run() {
  try {
    await mongo.connect();
    const database = mongo.db('how_is_earth')
    const earthDB = database.collection('earthDB')
    const filter = {"dataset": "sdg_13_10"}

    const updateDoc = {
      $set: {
        "sdg_13_10": dataset,
      },
    };
    const result = await earthDB.updateOne(filter, updateDoc)

  } catch (error) {
    console.log(error)
  }
    finally {
    await mongo.close()
    console.log("============= DB DISCONNECTED ================")
  }
}
run().catch(console.dir)


// =============================== Get data from DB and check for freshness
// =============================== Optionally refresh DB data
// =============================== Prepare collected or freshened data
// =============================== Socket the data out

// =============================== END DB ==========================

app.use(express.static('howisearth/build/'));

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