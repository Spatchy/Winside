const { app, ipcMain } = require("electron")
const sidebar = require("./sidebar/sidebar")

ipcMain.on("closeSidebar", () => {
  app.quit()
})

app.whenReady().then(() => {
  sidebar.createWindow()
})