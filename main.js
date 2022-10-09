const { app, ipcMain } = require("electron")
const path = require("path")
const sidebar = require("./sidebar/sidebar")
const winsertApi = require("./winsertApi")

winsertApi.openIpcChannels(app, ipcMain)

const instanceLock = app.requestSingleInstanceLock()

if (!instanceLock) {
  app.quit()
} else {
  app.on("second-instance", (event, commandLine) => {
    const winsertId = commandLine.find((param) => {
      return param.startsWith("winside://")
    }).slice("winside://".length)
    sidebar.createWindow(winsertId)
  })

  app.whenReady().then(() => {

    console.log("winside started, listening for triggers")

    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient(
          "winside",
          process.execPath,
          [path.resolve(process.argv[1])]
        )
      }
    } else {
      app.setAsDefaultProtocolClient("winside")
    }

  })

}