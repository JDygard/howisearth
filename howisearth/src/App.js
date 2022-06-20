import './App.css';
import RenderChart from './/components/StackedAreaChart.js';
import { useEffect } from 'react';
import { SocketContext, socket } from "./components/context/socket";
import Button from "./components/UI/Button"

function App() {
  const getDataHandler = (event) => {
    socket.emit("data")
  }

  useEffect(() => {
    socket.on("data", () => {
      
    })
  })
  return (
    <SocketContext.Provider value={socket} className="app" >
      <h3>Node is a real cunt.</h3>
      <Button clickMe={getDataHandler} />
      <RenderChart />
    </SocketContext.Provider>
  );
}

export default App;