const { app } = require("electron")
const sidebar = require("./sidebar/sidebar")

app.whenReady().then(() => {
  sidebar.createWindow()
})