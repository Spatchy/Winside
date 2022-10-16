const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("WinsideAPI", {
  closeSidebar: () => ipcRenderer.send("closeSidebar"),

  requestPermission: (permissionName) => {
    return ipcRenderer.invoke("requestPermission", permissionName)
  }
})
