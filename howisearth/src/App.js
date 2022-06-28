import './App.css';
import RenderChart from './/components/StackedAreaChart.js';
import { useEffect, useState } from 'react';
import { SocketContext, socket } from "./components/context/socket";
import Button from "./components/UI/Button"

function App() {
  const [dataset, setDataset] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [dynamicProperty, setDynamicProperty] = useState([]);
  
  // A useState to keep track of which values are in the array and maybe their index/length
  //    This might look like [{geo:"SE", value:"2"}] but it should include all of the data not entered into the chart for use on the page

  // a useState to keep track of how many values are in the array
  const getDataHandler = (event) => {
    socket.emit("data")
  }

  // Use array.filter()

  useEffect(() => {
    socket.on("data", (event) => {
      // Use the states to pack in the data. 
      // First get the data points out
      let newDataset = dataset;

      // And now a zipper function to get it all in the chart dataset
      for (let i = 0; i < event.data.length; i++) {
        // If there is a matching data point in dataset
        //    add this data to that year
        console.log(event.data[i].time)
        if (dataset.find( ({time}) => time === event.data[i].time)) {
          console.log("Match")
        } else {
          // This is unacceptable: they need new dynamic values to exist in parallel with the others
          newDataset[i] = event.data[i];
        }
      }
      setDataset(newDataset)
      console.log(dataset)
      // newDataset.push(event.data);
      delete event.data;
      // setDataset(newDataset);

      // The put the secondary data in another state
      let newDisplayedData = displayedData;
      newDisplayedData.push(event);
      setDisplayedData(newDisplayedData)
      console.log(displayedData)


      // if (dataset.indexOf(event)) {
      //     let newDataset = dataset;
      //     newDataset.push(event.data);
      //     setDataset( newDataset );
      //     console.log(dataset[0])
      // }
    })
  }, [])

  return (
    <SocketContext.Provider value={socket} className="app" >
      <Button clickMe={getDataHandler} />
      <RenderChart chartData={dataset} />
    </SocketContext.Provider>
  );
}

export default App;