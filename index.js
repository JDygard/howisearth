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

// =============================== Get data from DB and check for freshness
// =============================== Optionally refresh DB data
// =============================== Prepare collected or freshened data
// =============================== Socket the data in

// =============================== END DB ==========================

// =============================== REST Request ====================
// var APIBase = "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/"
// var APILanguage = "en/"
// var APIDataset = "sdg_13_10?"
// var APIFilter = "airpol=GHG&precision=1&src_crf=TOTX4_MEMONIA&unit=T_HAB"
// var url = APIBase + APILanguage + APIDataset + APIFilter
// console.log(url)
// // "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/nama_10_gdp?geo=EU28&precision=1&na_item=B1GQ&unit=CP_MEUR&time=2010&time=2011"
// var request = http.get(url, function (response) {
//   var buffer = "",
//       data,
//       output;

//   response.on("data", function (chunk) {
//     buffer += chunk;
//   });

//   response.on("end", function (err) {
//     console.log(buffer);
//     console.log("\n");
//     data = JSON.parse(buffer);
//     output = data.label;
//     console.log("Label:" + output)
//   })
// })

// ============================== END REST Request =================s

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