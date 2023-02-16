const {
  app,
  ipcMain,
  shell,
  dialog,
  Tray,
  Menu,
  Notification
} = require("electron")
const path = require("path")
const sidebar = require("./sidebar/sidebar")
const settings = require("./settings/settings")
const setup = require("./setup")
const winsertApi = require("./winsertApi")
const installWinsert = require("./winsertInstaller/installWinsert")
const uninstallWinsert = require("./winsertInstaller/uninstallWinsert")
const winsertBundler = require("./winsertBundler/winsertBundler")
const fs = require("fs")

const APP_VERSION = "2023.02"


let userSettings = setup.check(app.getPath("userData"))

const apiFunctionsMap = {
  changeSetting: (setting, value) => {
    userSettings = setup.writeSetting(app.getPath("userData"), setting, value)
  },

  openDataFolder: () => {
    shell.showItemInFolder(app.getPath("userData"))
  },

  installWinsertFromPath: (path) => {
    return installWinsert.installWinsert(
      path,
      app.getPath("userData"),
      userSettings,
      app.getPath("desktop"),
      `${app.getPath("appData")}/Microsoft/Windows/Start Menu/Programs`
    )
  },

  uninstallWinsert: (winsertId, displayName) => {
    return uninstallWinsert.uninstallWinsert(
      app.getPath("userData"),
      winsertId,
      displayName
    )
  },

  sendNotification: (title, body, iconPath) => {
    let icon = iconPath
    if (!fs.existsSync(iconPath)) {
      icon = "./logo.ico"
    }
    new Notification({ title: title, body: body, icon: icon }).show()
  },

  getSettings: () => userSettings,
  openExternal: shell.openExternal,
  openDialog: dialog.showOpenDialog,
  saveDialog: dialog.showSaveDialog,
  showMessageBox: dialog.showMessageBoxSync,
  bundleWinsert: winsertBundler.createWinsertBundle,
  getAppVersion: () => APP_VERSION
}

winsertApi.openIpcChannels(app, ipcMain, apiFunctionsMap)

const checkValidWinsertUri = (winsertUri) => {
  const uuidRegexp = (
    /^[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}$/gi
  )

  if (winsertUri) {
    const winsertId = winsertUri.slice("winside://".length).replace(/\/$/, "")
    return uuidRegexp.test(winsertId)
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
      const winsertId = winsertUri.slice("winside://".length).replace(/\/$/, "")
      const manifest = JSON.parse(fs.readFileSync(
        `${app.getPath("userData")}/winserts/${winsertId}/manifest.json`
      ))
      sidebar.createWindow(winsertId, userSettings, manifest)
    } else {
      settings.createWindow(app.getPath("userData"), userSettings)
    }
  })

  app.whenReady().then(() => {

    if (userSettings.showOOBE) {
      const oobeWinsertId = userSettings.showOOBE
      userSettings.showOOBE = true // remove ID to avoid leaking
      sidebar.createWindow(oobeWinsertId, userSettings)
    }

    const tray = new Tray("logo.ico")
    const menu = Menu.buildFromTemplate([
      { role: "quit" }
    ])
    tray.setToolTip("Winside is running")
    tray.setContextMenu(menu)

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