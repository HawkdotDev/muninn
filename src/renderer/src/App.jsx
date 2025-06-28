function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="actions">
        <div className="action">
          <a target="_blank" className="bg-red-500 px-3 py-2" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
    </>
  )
}

export default App
