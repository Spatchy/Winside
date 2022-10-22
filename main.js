const { app, ipcMain } = require("electron")
const path = require("path")
const sidebar = require("./sidebar/sidebar")
const settings = require("./settings/settings")
const firstTimeSetup = require("./firstTimeSetup")
const winsertApi = require("./winsertApi")


winsertApi.openIpcChannels(app, ipcMain)
firstTimeSetup.check(app.getPath("userData"))

const checkValidWinsertUri = (winsertUri) => {
  const uuidRegexp = (
    /^[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}$/gi
  )

  if (winsertUri) {
    return uuidRegexp.test(winsertUri.slice("winside://".length))
  }
  return false
}

const instanceLock = app.requestSingleInstanceLock()

if (!instanceLock) {
  app.quit()
} else {
  app.on("second-instance", (event, commandLine) => {
    const winsertUri = commandLine.find((param) => {
      return param.startsWith("winside://")
    })
    if (checkValidWinsertUri(winsertUri)) {
      const winsertId = winsertUri.slice("winside://".length)
      sidebar.createWindow(winsertId)
    } else {
      settings.createWindow(app.getPath("userData"))
    }
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