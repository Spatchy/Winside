const { contextBridge, ipcRenderer, app } = require("electron")
const fs = require("fs")

const userData = app.getPath("userData")

contextBridge.exposeInMainWorld("WinsideSettings", {
  changeSetting: (setting, value) => {
    ipcRenderer.send("changeSetting", { setting, value })
  },

  getSettings: () => {
    return ipcRenderer.invoke("getSettings")
  },

  openDataFolder: () => {
    ipcRenderer.send("openDataFolder")
  },

  browseForWinserts: () => {
    return ipcRenderer.invoke("browseForWinserts")
  },

  installDroppedWinsert: (path) => {
    return ipcRenderer.invoke("installDroppedWinsert", path)
  },

  winsertData: Object.keys(
    JSON.parse(fs.readFileSync(`${userData}/index.json`))
  ).map((winsertId) => {
    return JSON.parse(
      fs.readFileSync(`${userData}/winserts/${winsertId}/manifest.json`)
    )
  })
})