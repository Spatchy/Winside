const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("WinsideSettings", {
  changeSetting: (setting, value) => {
    ipcRenderer.send("changeSetting", {setting, value})
  },

  getSettings: () => {
    return ipcRenderer.invoke("getSettings")
  },

  openDataFolder: () => {
    ipcRenderer.send("openDataFolder")
  }
})