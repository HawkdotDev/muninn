import Header from "./components/Header";
import LiveGraphs from "./components/LiveGraphs";

function App() {
  // const ipcHandle = () => window.electron.ipcRenderer.send("ping");

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <LiveGraphs />
    </div>
  );
}

export default App;
