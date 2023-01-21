const { BrowserWindow } = require("electron")
const path = require("path")

const __ = (file) => {
  return path.join(__dirname, file)
}

const createWindow = () => {

  const { screen } = require("electron")
  const primaryDisplay = screen.getPrimaryDisplay()

  const win = new BrowserWindow({
    width: primaryDisplay.workAreaSize.width / 2,
    height: primaryDisplay.workAreaSize.height / 2,
    icon: __("../logo.ico"),
    webPreferences: {
      preload: __("preload.js"),
    }
  })

  win.loadFile(__("index.html"))
    .catch((e) => console.error(e))

  win.on("close", (e) => {
    e.sender.hide()
    e.preventDefault() // prevent quit process
  })
}

module.exports = { 
  createWindow
}