const fs = require("fs")

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
    return apiFunctionsMap.getSettings()
  })

  ipcMain.handle("getWinsertData", async () => {
    return Object.keys(
      JSON.parse(fs.readFileSync(`${userData}/index.json`))
    ).map((winsertId) => {
      return JSON.parse(
        fs.readFileSync(`${userData}/winserts/${winsertId}/manifest.json`)
      )
    })
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

}

module.exports = { openIpcChannels }