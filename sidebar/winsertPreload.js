const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("WinsideAPI", {
  closeSidebar: () => ipcRenderer.send("closeSidebar")
})
