import express, { query } from 'express';
import path from 'path';
import { MongoClient } from 'mongodb';
import { createServer } from "http";
import http from 'http';
import { Server } from "socket.io";
import 'dotenv/config';

import JSONstat from "jsonstat-toolkit";
import * as EuroJSONstat from "jsonstat-euro"

const app = express();
const uri = process.env.MONGODB;
const mongo = new MongoClient(uri);
const database = mongo.db('how_is_earth');
const earthDB = database.collection('earthDB');

// =============================== REST Request ====================
const queryList = [
  // Population totals
  {
    "dataset": "demo_pjan",
    "filter": {
      age: "TOTAL",
      sex: "T"
    }
  },
  // Projected population totals
  {
    "dataset": "proj_19np",
    "filter": {
      age: "TOTAL",
      sex: "T",
      projection: "BSL",
    }
  },
  // GDP per capita
  {
    "dataset": "nama_10_pc",
    "filter": {
      unit: "CP_EUR_HAB",
      na_item: "BIGQ",
    }
  },
  // Total GDP
  {
    "dataset": "nama_10_gdp",
    "filter": {
      unit: "CP_MEUR",
      na_item: "BIGQ",
    }
  },
  // Timber reserves by forested area
  {
    "dataset": "for_area",
    "filter": {
      indic_fo: "FOR",
    }
  },
  // Timber by volume
  {
    "dataset": "for_vol",
    "filter": {
      indic_fo: "FOR",
    }
  },
  // Total greenhouse gas emissions per capita
  {
    "dataset": "sdg_13_10",
    "filter": {
      src_crf: "TOTXMEMONIA",
      unit: "T_HAB"
    }
  },
  // Greenhouse gas emissions per capita by source
  {
    "dataset": "env_ac_ainah_r2",
    "filter": {
      airpol: "GHG",
      nace_r2: "A",
      unit: "KG_HAB",
    }
  },
  {
    "dataset": "env_ac_ainah_r2",
    "filter": {
      airpol: "GHG",
      nace_r2: "B",
      unit: "KG_HAB",
    }
  },
  {
    "dataset": "env_ac_ainah_r2",
    "filter": {
      airpol: "GHG",
      nace_r2: "C",
      unit: "KG_HAB",
    }
  },
  {
    "dataset": "env_ac_ainah_r2",
    "filter": {
      airpol: "GHG",
      nace_r2: "D",
      unit: "KG_HAB",
    }
  },

  // Waste generation per capita
  {
    "dataset": "env_wasgen",
    "filter": {
      unit: "KG_HAB",
      hazard: "HAZ_NHAZ",
      nace_r2: "TOTAL_HH",
      waste: "W101",
    }
  },
  {
    "dataset": "env_wasgen",
    "filter": {
      unit: "KG_HAB",
      hazard: "HAZ_NHAZ",
      nace_r2: "TOTAL_HH",
      waste: "TOTAL",
    }
  },
  // Energy production capacity: Renewables
  {
    "dataset": "nrg_inf_epcrw",
    "filter": {
      siec: "RA100", // Hydro
    }
  },
  {
    "dataset": "nrg_inf_epcrw",
    "filter": {
      siec: "RA200", // Geothermal
    }
  },
  {
    "dataset": "nrg_inf_epcrw",
    "filter": {
      siec: "RA300", // Wind
    }
  },
  {
    "dataset": "nrg_inf_epcrw",
    "filter": {
      siec: "RA400", // Solar
    }
  },
  {
    "dataset": "nrg_inf_epcrw",
    "filter": {
      siec: "RA500", // Tide/wave/ocean
    }
  },
  {
    "dataset": "nrg_inf_epcrw",
    "filter": {
      siec: "W6000", //Waste
    }
  },
  // Share of energy from renewable sources
  {
    "dataset": "nrg_ind_ren",
    "filter": {
      nrg_bal: "REN",
    }
  },
  //Production of electricity and derived heat by type of fuel 
  {
    "dataset": "nrg_bal_peh",
    "filter": {
      nrg_bal: "GEP",
      siec: "C0000X0350-0370",
    }
  },
  {
    "dataset": "nrg_bal_peh",
    "filter": {
      nrg_bal: "GEP",
      siec: "C0350-0370",
    }
  },
  {
    "dataset": "nrg_bal_peh",
    "filter": {
      nrg_bal: "GEP",
      siec: "FE",
    }
  },
  {
    "dataset": "nrg_bal_peh",
    "filter": {
      nrg_bal: "GEP",
      siec: "N900H",
    }
  },
  {
    "dataset": "nrg_bal_peh",
    "filter": {
      nrg_bal: "GEP",
      siec: "TOTAL",
    }
  },
  {
    "dataset": "nrg_bal_peh",
    "filter": {
      nrg_bal: "GEP",
      siec: "O4000XBIO",
    }
  },
]

const saveDataset = async function (dataset, queryFilter) {
  // Function for updating a single dataset, processing it, and putting it in the database
  try {
    const geoSet = JSONstat(dataset).Data();
    const years = JSONstat(dataset).Dimension("time");
    const geo = JSONstat(dataset).Dimension("geo");

    var updateDoc = [];

    for (let i = 0; i < geo.length; i++) {
      // Loop for creating each database entry
      let jStat = JSONstat(dataset).Dimension("geo").id[i];

      for (let i = 0; i < years.length; i++) {
        // Loop for creating each entry for the data array
        updateDoc.push({
          time: years.id[i],
          value: geoSet[i].value,
          status: geoSet[i].status,
        });
      }

      const filter = {
        datasetId: JSONstat(dataset).extension.datasetId,
        geo: jStat,
        filter: queryFilter,
      }
      const update = {
        $set: {
          label: JSONstat(dataset).label,
          date: Date.now(),
          data: updateDoc,
          country: JSONstat(dataset).Dimension("geo").__tree__.category.label[jStat],
        }
      }
      earthDB.updateOne(filter, update, { upsert: true })
    }
  }
  catch (err) {
    console.log("saveDataset(): " + err)
    console.log("saveDataset(): " + JSON.stringify(queryFilter))
  }
  finally {
    console.log(JSONstat(dataset).label + " complete.")
    console.log("------------------------------------------------------")
  }
}
// saveDataset().catch(console.dir);

const euroJSONQuery = (query) => {
  EuroJSONstat.fetchDataset(query, saveDataset).then(ds => {
    if (ds.class === "dataset") {
      saveDataset(ds, query.filter);
    }
  })
}

// Update the full list of datasets at application launch

function run() {
  console.log("Function run")
  mongo.connect();
  for (let i = 0; i < queryList.length; i++) {
    euroJSONQuery(queryList[i], saveDataset);
  }
  mongo.close();
  console.log("============DB CONNECTION CLOSED===========")
  //     console.log(eq)
  //   }
  // })

  // EuroJSONstat.fetchDataset(queryList[i].filter).then(ds => {
  //   if (ds.class === "dataset") {
  //     dataset = ds
  //     console.log(ds.label)
  //   }
  // })
}
run();


// ============================== END REST Request =================s

// ============================= DB ==================================

// async function run() {
//   try {
//     await mongo.connect();

//     const datasetIDFilter = { label: "datasetIDList", data: [] };
//     const datasetIDListDB = await earthDB.findOne(datasetIDFilter);

//     const geoSet = JSONstat(dataset).Data();
//     const years = JSONstat(dataset).Dimension("time");
//     const geo = JSONstat(dataset).Dimension("geo");

//     var updateDoc = [];
//     var datasetIDList;


//     for (let i = 0; i < geo.length; i++) {
//       // Iterate through the "geo" dimensions (list of countries in the data),
//       let jStat = JSONstat(dataset).Dimension("geo").id[i];
//       updateDoc = [];

//       for (let i = 0; i < years.length; i++) {
//         // Iterate through the years 
//         // build an object with values relevant to Recharts
//         // push that object into an array
//         updateDoc.push({
//           time: years.id[i],
//           value: geoSet[i].value,
//           status: geoSet[i].status,
//         });
//         datasetIDList = JSONstat(dataset).extension.datasetId;
//       };

//       const filter = {
//         datasetId: JSONstat(dataset).extension.datasetId,
//         geo: jStat,
//         country: JSONstat(dataset).Dimension("geo").__tree__.category.label[jStat],
//         label: JSONstat(dataset).label,
//         data: updateDoc,
//       };

//       await earthDB.updateOne(filter, { $set: { data: updateDoc } }, { upsert: true });
//       if (datasetIDListDB.data.find(datasetIDList)) {
//         await earthDB.updateOne(datasetIDFilter, { $set: { data: [...datasetIDListDB.data, datasetIDList] } }, { upsert: true });
//       };
//     }
//     let log = await earthDB.findOne({ label: "datasetIDList" }).data.then(console.log(log.data));
//   } catch (error) {
//     console.log(error);
//   }

//   finally {
//     await mongo.close();
//     console.log("============= DB DISCONNECTED ================")
//   };
// };
// run().catch(console.dir);


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

const datasetIDQuery = () => {
  async function run() {
    try {
      await mongo.connect();
      const filter = { label: "datasetIDList" }

    } finally {
      await mongo.close();
    }
  }
}

io.on("connection", (socket) => {
  socket.on("data", () => {
    var result = {}
    var data = {}
    async function run() {
      try {
        await mongo.connect();
        const filter = { datasetId: "sdg_13_10", geo: "SE" }

        data = await earthDB.findOne(filter);
      } finally {
        socket.emit("data", data);
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