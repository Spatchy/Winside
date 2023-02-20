const {
  BrowserWindow,
  BrowserView,
  globalShortcut,
  ipcMain
} = require("electron")
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
  isDefaultSide = true,
  callback = () => {}
) => {
  let fraction = 0.01
  const animationInterval = setInterval(() => {
    fraction = easeOutQuart(fraction)
    const adj = isDefaultSide ? 0 : sideBarWidth
    const currentPosition = Math.floor(
      doReverse
        ? (sideBarWidth - (sideBarWidth * (1 - fraction))) - adj
        : sideBarWidth - (sideBarWidth * fraction) - adj
    )
    win.setBounds({
      x: currentPosition,
      y: 0,
      width: sideBarWidth,
      height: primaryDisplay.workAreaSize.height
    })
    webContent.setBounds({
      x: isDefaultSide ? currentPosition + 15 : currentPosition,
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

const createWindow = (
  winsertId,
  userSettings,
  manifest,
  view = null,
  saveWinsertView
) => {

  let shouldSaveWinsertView = !!view

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
    x: userSettings.isDefaultSide
      ? primaryDisplay.workAreaSize.width - sideBarWidth
      : 0,
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

  const webContent = view ?? new BrowserView({
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

      const colorToUse = userSettings.allowAccentOverride
        ? manifest.sidebar.color
        : userSettings.accentColor
      win.webContents.insertCSS(
        `.mainControlContainer {
          background-color: ${colorToUse};
        }`
      )

      if (!userSettings.isDefaultSide) {
        win.webContents.insertCSS(
          `html, body {
            flex-direction: row-reverse !important;
          }

          .closeBtn {
            transform: scaleX(-1)
          }`
        )
      }

      if (!view) {
        winsertEngine.loadWinsert(webContent, winsertId, manifest, userSettings)
      }

      animateWindowPosition(
        win,
        webContent,
        sideBarWidth,
        primaryDisplay,
        !userSettings.isDefaultSide,
        userSettings.isDefaultSide
      )

    })
    .catch((e) => console.error(e))

  const closeFunction = () => {
    globalShortcut.unregister("Super+Escape")
    animateWindowPosition(
      win,
      webContent,
      sideBarWidth,
      primaryDisplay,
      userSettings.isDefaultSide,
      userSettings.isDefaultSide,
      () => {
        if (shouldSaveWinsertView) {
          saveWinsertView(webContent)
        } else {
          webContent.webContents.destroy()
        }
        container.destroy()
        ipcMain.removeListener("closeSidebar", closeFunction)
        ipcMain.removeHandler("keepOpenInBackground")
      }
    )
  }
  globalShortcut.register("Super+Escape", closeFunction)
  ipcMain.on("closeSidebar", closeFunction)

  ipcMain.handle("keepOpenInBackground", (_event, _winsertId) => {
    shouldSaveWinsertView = true
  })
  
}

module.exports = { 
  createWindow
}