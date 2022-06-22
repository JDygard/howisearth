import './App.css';
import RenderChart from './/components/StackedAreaChart.js';
import { useEffect, useState } from 'react';
import { SocketContext, socket } from "./components/context/socket";
import Button from "./components/UI/Button"

function App() {
  const [dataset, setDataset] = useState({})
  const getDataHandler = (event) => {
    socket.emit("data")
    console.log("sending")
  }
  console.log(dataset)

  useEffect(() => {
    socket.on("data", (event) => {
      console.log(event)
      setDataset({...dataset, data: event})
    })
  },[])
  return (
    <SocketContext.Provider value={socket} className="app" >
      <Button clickMe={getDataHandler} />
      <RenderChart />
    </SocketContext.Provider>
  );
}

export default App;