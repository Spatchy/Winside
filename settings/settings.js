const { BrowserWindow } = require("electron")
const __ = require("../utils/pathify")

const createWindow = () => {

  const { screen } = require("electron")
  const primaryDisplay = screen.getPrimaryDisplay()

  const win = new BrowserWindow({
    width: primaryDisplay.workAreaSize.width / 2,
    height: primaryDisplay.workAreaSize.height / 2,
    icon: __("logo.ico"),
    webPreferences: {
      preload: __("settings/preload.js"),
    }
  })

  win.loadFile(__("settings/index.html"))
    .catch((e) => console.error(e))

  win.on("close", (e) => {
    e.sender.destroy()
    e.preventDefault() // prevent quit process
  })
}

module.exports = { 
  createWindow
}