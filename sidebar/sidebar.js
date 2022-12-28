const { BrowserWindow, BrowserView } = require("electron")
const path = require("path")
const winsertEngine = require("./winsertEngine")

const __ = (file) => {
  return path.join(__dirname, file)
}

const relativeToActualWidth = (rel, screenWidth) => {
  return Math.floor((screenWidth / 12) * rel)
}

const easeOutQuart = (x) => {
  try {
    return 1 - Math.pow(1 - x, 1.05)
  } catch (error) {
    console.error(error)
  }
}

const createWindow = (winsertId, userSettings, sidebarRelativeWidth = 3) => {

  const { screen } = require("electron")
  const primaryDisplay = screen.getPrimaryDisplay()

  const sideBarWidth = relativeToActualWidth(
    sidebarRelativeWidth,
    primaryDisplay.workAreaSize.width
  )

  const container = new BrowserWindow({
    width: sideBarWidth,
    height: primaryDisplay.workAreaSize.height,
    x: primaryDisplay.workAreaSize.width - sideBarWidth,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
  })

  const win = new BrowserView({
    webPreferences: {
      preload: __("preload.js")
    }
  })

  const webContent = new BrowserView({
    webPreferences: {
      preload: __("winsertPreload.js")
    }
  })

  container.addBrowserView(win)

  win.webContents.loadFile(__("index.html"))
    .then(() => {

      container.addBrowserView(webContent)

      // a placeholder... for now ;)
      winsertEngine.loadWinsert(webContent, "OOBE")

      let fraction = 0.01
      const animationInterval = setInterval(() => {
        fraction = easeOutQuart(fraction)
        const currentPosition = Math.floor(
          sideBarWidth - (sideBarWidth * fraction)
        )
        win.setBounds({
          x: currentPosition,
          y: 0,
          width: sideBarWidth,
          height: primaryDisplay.workAreaSize.height
        })
        webContent.setBounds({
          x: currentPosition + 10,
          y: 0,
          width: sideBarWidth - 10,
          height: primaryDisplay.workAreaSize.height
        })
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