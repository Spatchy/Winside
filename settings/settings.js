const { BrowserWindow } = require("electron")
const path = require("path")

const __ = (file) => {
  return path.join(__dirname, file)
}

const createWindow = () => {

  const { screen } = require("electron")
  const primaryDisplay = screen.getPrimaryDisplay()

  const win = new BrowserWindow({
    width: primaryDisplay.workAreaSize.height / 2,
    height: primaryDisplay.workAreaSize.height / 2,
    webPreferences: {
      preload: __("preload.js")
    }
  })

  win.loadFile(__("index.html"))
    .catch((e) => console.error(e))
  
}

module.exports = { 
  createWindow
}