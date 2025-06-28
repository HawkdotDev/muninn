import Header from "./components/Header";

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send("ping");

  return (
    <div className="flex flex-col h-screen">
      <Header />

      {/* <a
        target="_blank"
        className="bg-red-500 px-3 py-2"
        rel="noreferrer"
        onClick={ipcHandle}
      >
        Send IPC
      </a> */}
    </div>
  );
}

export default App;
