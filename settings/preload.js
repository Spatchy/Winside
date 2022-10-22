const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("WinsideSettings", {
  closeSidebar: () => ipcRenderer.send("closeSidebar")
})