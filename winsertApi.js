const openIpcChannels = (app, ipcMain) => {

  ipcMain.on("closeSidebar", () => {
    app.quit()
  })

}

module.exports = { openIpcChannels }