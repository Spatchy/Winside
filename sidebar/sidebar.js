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

const animateWindowPosition = (
  win,
  webContent,
  sideBarWidth,
  primaryDisplay,
  doReverse = false,
  callback = () => {}
) => {
  let fraction = 0.01
  const animationInterval = setInterval(() => {
    fraction = easeOutQuart(fraction)
    const currentPosition = Math.floor(
      doReverse
        ? sideBarWidth - (sideBarWidth * (1 - fraction))
        : sideBarWidth - (sideBarWidth * fraction)
    )
    win.setBounds({
      x: currentPosition,
      y: 0,
      width: sideBarWidth,
      height: primaryDisplay.workAreaSize.height
    })
    webContent.setBounds({
      x: currentPosition + 15,
      y: 0,
      width: sideBarWidth - 15,
      height: primaryDisplay.workAreaSize.height
    })
    if (fraction === 1) {
      clearInterval(animationInterval)
      callback()
    }
  }, 2)
}

const createWindow = (winsertId, userSettings, manifest) => {

  const { screen } = require("electron")
  const primaryDisplay = screen.getPrimaryDisplay()

  const sideBarWidth = relativeToActualWidth(
    (manifest?.sidebar?.size >= 1 && manifest?.sidebar?.size <= 11)
      ? manifest.sidebar.size
      : 3,
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
      preload: __("winsertPreload.js"),
      devTools: userSettings.openDevToolsOnLaunch
    }
  })

  container.addBrowserView(win)

  win.webContents.loadFile(__("index.html"))
    .then(() => {

      container.addBrowserView(webContent)
      if (userSettings.openDevToolsOnLaunch) {
        webContent.webContents.openDevTools()
      }

      win.webContents.executeJavaScript(
        `document.getElementById("mainControlContainer")
         .style.backgroundColor = "${manifest.sidebar.color}"`
      )

      winsertEngine.loadWinsert(webContent, winsertId)

      animateWindowPosition(win, webContent, sideBarWidth, primaryDisplay)

    })
    .catch((e) => console.error(e))

  container.on("close", (e) => {
    // eslint-disable-next-line max-len
    animateWindowPosition(win, webContent, sideBarWidth, primaryDisplay, true, () => {
      e.sender.hide()
    })
    e.preventDefault() // prevent quit process
  })
  
}

module.exports = { 
  createWindow
}