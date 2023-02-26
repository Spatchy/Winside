const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("WinsideAPI", {

  getAppVersion: () => ipcRenderer.invoke("getAppVersion"),

  openLinkInBrowser: (link) => ipcRenderer.send("openLinkInBrowser", link),

  requestPermission: (winsertId, permissionName) => {
    return ipcRenderer.invoke("requestPermission", winsertId, permissionName)
  },

  sendNotification: (winsertId, title, body) => {
    return ipcRenderer.invoke("sendNotification", winsertId, title, body)
  },

  keepOpenInBackground: (winsertId) => {
    return ipcRenderer.invoke("keepOpenInBackground", winsertId)
  },

  cancelKeepOpenInBackground: (winsertId, killIfInBackground = false) => {
    return ipcRenderer.invoke(
      "cancelKeepOpenInBackground",
      winsertId,
      killIfInBackground
    )
  }
})
