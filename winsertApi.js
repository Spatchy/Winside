const fs = require("fs")
const { createShortcut } = require("./winsertInstaller/installWinsert")

const permissionsNames = [
  "see-hardware-info",
  "open-and-save-files",
  "send-notifications"
]

const openIpcChannels = (app, ipcMain, apiFunctionsMap) => {

  const userData = app.getPath("userData")

  ipcMain.on("closeSidebar", () => {
    app.quit()
  })

  ipcMain.on("changeSetting", (_event, settingsMap) => {
    const {
      setting,
      value
    } = settingsMap

    apiFunctionsMap.changeSetting(setting, value)
  })

  ipcMain.handle("getSettings", async () => {
    const questrial = fs.readFileSync(
      "addons/assets/Questrial-Regular.ttf",
      { encoding: "base64" }
    )

    return {
      settings: apiFunctionsMap.getSettings(),
      version: apiFunctionsMap.getAppVersion(),
      font: `url(data:font/ttf;base64,${questrial})`
    }
  })

  ipcMain.handle("getWinsertData", async () => {
    return Object.keys(
      JSON.parse(fs.readFileSync(`${userData}/index.json`))
    ).map((winsertId) => {
      return {
        winsertId: winsertId,
        manifest: JSON.parse(
          fs.readFileSync(`${userData}/winserts/${winsertId}/manifest.json`)
        )
      }
    })
  })

  ipcMain.on("saveShortcut", async (_event, winsertId, defaultName) => {
    const dialogResult = await apiFunctionsMap.saveDialog({
      title: "Save Shortcut",
      buttonLabel: "Create Shortcut",
      defaultPath: defaultName,
      filters: [
        { name: "Winsert Shortcut", extensions: ["url"] }
      ]
    })

    if (dialogResult === undefined) return null

    const splitPath =  dialogResult.filePath.split("\\")
    const shortcutName = splitPath.pop().slice(0, -4) // ".url" length

    let icoPath = `${userData}/winserts/${winsertId}/icon.ico`
    if (!fs.existsSync(icoPath)) {
      icoPath = undefined
    }

    createShortcut(shortcutName, winsertId, splitPath.join("\\"), icoPath)
  })

  ipcMain.handle("uninstallWinsert", async (_event, dataObject) => {
    const { winsertId, displayName } = dataObject
    return apiFunctionsMap.uninstallWinsert(winsertId, displayName)
  })

  ipcMain.on("openDataFolder", apiFunctionsMap.openDataFolder)

  ipcMain.handle("browseForWinserts", async (_event) => {
    const dialogResult = await apiFunctionsMap.openDialog({
      title: "Install Winsert",
      buttonLabel: "Install",
      properties: ["openFile"],
      filters: [
        { name: "Winserts", extensions: ["winsert"] },
      ]
    })

    if (dialogResult.filePaths[0] === undefined) return null
    return apiFunctionsMap.installWinsertFromPath(dialogResult.filePaths[0])
  })

  ipcMain.handle("installDroppedWinsert", async (_event, path) => {
    return apiFunctionsMap.installWinsertFromPath(path)
  })

  ipcMain.handle("requestPermission", async (_event, permissionName) => {
    // TODO: build permissions system
    if (permissionsNames.includes(permissionName)) {
      return "yeah"
    }
    return "nah"
  })

  ipcMain.on("openLinkInBrowser", async (_event, link) => {
    apiFunctionsMap.openExternal(link)
  })

}

module.exports = { openIpcChannels }