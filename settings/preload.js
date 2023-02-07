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

  openLinkInBrowser: (link) => ipcRenderer.send("openLinkInBrowser", link),

  browseForWinserts: () => {
    return ipcRenderer.invoke("browseForWinserts")
  },

  installDroppedWinsert: (path) => {
    return ipcRenderer.invoke("installDroppedWinsert", path)
  },

  uninstallWinsert: (winsertId, displayName) => {
    return ipcRenderer.invoke("uninstallWinsert", { winsertId, displayName })
  }
})

window.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.invoke("getLogoSvg").then((svgData) => {
    document.getElementById("winsideLogoPlaceholder")
      .innerHTML = svgData
  })
})