const permissionsNames = [
  "see-hardware-info",
  "open-and-save-files",
  "send-notifications"
]

const openIpcChannels = (app, ipcMain, apiFunctionsMap) => {

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

  ipcMain.handle("requestPermission", async (_event, permissionName) => {
    // TODO: build permissions system
    if(permissionsNames.includes(permissionName)) {
      return "yeah"
    }
    return "nah"
  })

}

module.exports = { openIpcChannels }