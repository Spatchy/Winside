const permissionsNames = [
  "see-hardware-info",
  "open-and-save-files",
  "send-notifications"
]

const openIpcChannels = (app, ipcMain) => {

  ipcMain.on("closeSidebar", () => {
    app.quit()
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