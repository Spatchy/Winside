const { BrowserWindow, BrowserView } = require("electron")
const path = require("path")
const winsertEngine = require("./winsertEngine")

const __ = (file) => {
  return path.join(__dirname, file)
}

const relativeToActualWidth = (rel, screenWidth) => {
  return (screenWidth / 12) * rel
}

const easeOutQuart = (x) => {
  try {
    return 1 - Math.pow(1 - x, 1.15)
  } catch (error) {
    console.error(error)
  }
}

const createWindow = (winsertId, sidebarRelativeWidth = 3) => {

  const { screen } = require("electron")
  const primaryDisplay = screen.getPrimaryDisplay()

  const sideBarWidth = relativeToActualWidth(
    sidebarRelativeWidth,
    primaryDisplay.workAreaSize.width
  )

  const win = new BrowserWindow({
    width: sideBarWidth,
    height: primaryDisplay.workAreaSize.height,
    x: primaryDisplay.workAreaSize.width,
    y: 0,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: __("preload.js")
    }
  })

  const webContent = new BrowserView({
    webPreferences: {
      preload: __("winsertPreload.js")
    }
  })

  win.loadFile(__("index.html"))
    .then(() => {

      win.setBrowserView(webContent)
      webContent.setBounds({
        x: 10,
        y: 0,
        width: sideBarWidth - 10,
        height: primaryDisplay.workAreaSize.height
      })

      // a placeholder... for now ;)
      winsertEngine.loadWinsert(webContent, "OOBE")

      let fraction = 0.01
      const animationInterval = setInterval(() => {
        fraction = easeOutQuart(fraction)
        win.setPosition(
          Math.floor(
            primaryDisplay.workAreaSize.width - (sideBarWidth * fraction)
          ),
          0
        )
        if (fraction === 1) {
          clearInterval(animationInterval)
        }
      }, 2)



    })
    .catch((e) => console.error(e))
  
}

module.exports = { 
  createWindow
}