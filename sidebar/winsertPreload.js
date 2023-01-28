const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("WinsideAPI", {
  closeSidebar: () => ipcRenderer.send("closeSidebar"),

  openLinkInBrowser: (link) => ipcRenderer.send("openLinkInBrowser", link),

  requestPermission: (permissionName) => {
    return ipcRenderer.invoke("requestPermission", permissionName)
  }
})
