const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("WinsideSettings", {
  changeSetting: (setting, value) => {
    ipcRenderer.send("changeSetting", { setting, value })
  },

  getSettings: () => {
    return ipcRenderer.invoke("getSettings")
  },

  getWinsertData: () => {
    return ipcRenderer.invoke("getWinsertData")
  },

  openDataFolder: () => {
    ipcRenderer.send("openDataFolder")
  },

  browseForWinserts: () => {
    return ipcRenderer.invoke("browseForWinserts")
  },

  installDroppedWinsert: (path) => {
    return ipcRenderer.invoke("installDroppedWinsert", path)
  }
})