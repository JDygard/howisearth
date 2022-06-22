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
    // console.log(JSONstat(dataset).Data({"geo" : "SE"}))
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
    const filter = {"dataset": "eurostat"}

    console.log(JSONstat(dataset).extension.datasetId)
    var updateDoc = []
    const geoSet = JSONstat(dataset).Data()
    const years = JSONstat(dataset).Dimension("time")
    const geo = JSONstat(dataset).Dimension("geo")

    
    for (let i = 0;i<geo.length;i++) {
      // Iterate through the "geo" dimensions (list of countries in the data),
      let jStat = JSONstat(dataset).Dimension("geo").id[i]

      updateDoc[i] = {
        datasetId: JSONstat(dataset).extension.datasetId,
        geo: jStat,
        country: JSONstat(dataset).Dimension("geo").__tree__.category.label[jStat],
        label: JSONstat(dataset).label
      }

      let doc = updateDoc[i]
      doc.data = []

      for (let i = 0; i < years.length; i++) {
        // Iterate through the years 
        // build an object with values relevant to the charts
        // push that object into an array
        doc.data.push({
          time: years.id[i],
          value: geoSet[i].value,
          status: geoSet[i].status,
        })
      }

    }
    
    const result = await earthDB.updateOne(filter, {$set: {EU:updateDoc}}, {upsert: true})

    const reveal = await earthDB.findOne({ dataset: "eurostat" })
    console.log(reveal)

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

io.on("connection", (socket) => {
  socket.on("data", () => {
    var result = {}
    var data = {}
    async function run() {
      try {
        await mongo.connect();
        const database = mongo.db('how_is_earth');
        const earthDB = database.collection('earthDB');
        const filter = {"dataset": "sdg_13_10"}

        data = await earthDB.findOne(filter);
      } finally {
        result = {
          "values": JSONstat(data.sdg_13_10).Data({"geo" : "SE"}),
          "labels": JSONstat(data.sdg_13_10).Dimension("time"),
        }
        socket.emit("data", result);
        await mongo.close();
      }
    }
    run().catch(console.dir)

  })
})

const hostname = '127.0.0.1';
const port = 4000;

httpServer.listen(4003);
app.listen(4000, () => {
  console.log('App running on localhost:4000');
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('./howisearth/build/', 'index.html'));
});