import './App.css';
import RenderChart from './/components/StackedAreaChart.js';
import { useEffect, useState } from 'react';
import { SocketContext, socket } from "./components/context/socket";
import Button from "./components/UI/Button"

function App() {
  const [dataset, setDataset] = useState([])
  const getDataHandler = (event) => {
    socket.emit("data")
    console.log("sending")
  }

  useEffect(() => {
      socket.on("data", (event) => {
          if (dataset.indexOf(event)) {
              let newDataset = dataset;
              newDataset.push(event.data);
              setDataset( newDataset );
              console.log(dataset[0])
          }
      })
  }, [])

  return (
    <SocketContext.Provider value={socket} className="app" >
      <Button clickMe={getDataHandler} />
      <RenderChart chartData={dataset}/>
    </SocketContext.Provider>
  );
}

export default App;