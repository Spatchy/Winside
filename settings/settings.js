const { BrowserWindow } = require("electron")
const path = require("path")
const fs = require("fs")

const __ = (file) => {
  return path.join(__dirname, file)
}

const createWindow = (userdata) => {

  const { screen } = require("electron")
  const primaryDisplay = screen.getPrimaryDisplay()

  const winsertData = fs.readFileSync(`${userdata}/index.json`)

  const win = new BrowserWindow({
    width: primaryDisplay.workAreaSize.height / 2,
    height: primaryDisplay.workAreaSize.height / 2,
    webPreferences: {
      preload: __("preload.js")
    }
  })

  win.loadFile(__("index.html"))
    .then(() => {
      win.webContents.executeJavaScript(
        `window.winsertData = ${JSON.stringify(winsertData)}`
      )
    })
    .catch((e) => console.error(e))
  
}

module.exports = { 
  createWindow
}