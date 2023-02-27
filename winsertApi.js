const fs = require("fs")
const {
  createShortcut,
  createIco
} = require("./winsertInstaller/installWinsert")
const permissionsEngine = require("./permissionsManager/permissionsEngine")

const openIpcChannels = (app, ipcMain, apiFunctionsMap) => {

  const userData = app.getPath("userData")

  ipcMain.on("changeSetting", (_event, settingsMap) => {
    const {
      setting,
      value
    } = settingsMap

    apiFunctionsMap.changeSetting(setting, value)
  })

  ipcMain.handle("getSettings", async () => {
    const questrial = fs.readFileSync(
      "addons/assets/Questrial-Regular.ttf",
      { encoding: "base64" }
    )

    return {
      settings: apiFunctionsMap.getSettings(),
      version: apiFunctionsMap.getAppVersion(),
      backgroundProcesses: apiFunctionsMap.getBackgroundWinsertsList(),
      permissions: permissionsEngine.getAllPermissions(),
      font: `url(data:font/ttf;base64,${questrial})`
    }
  })

  ipcMain.handle("getWinsertData", async () => {
    return Object.keys(
      JSON.parse(fs.readFileSync(`${userData}/index.json`))
    ).map((winsertId) => {
      return {
        winsertId: winsertId,
        manifest: JSON.parse(
          fs.readFileSync(`${userData}/winserts/${winsertId}/manifest.json`)
        )
      }
    })
  })

  ipcMain.on("saveShortcut", async (_event, winsertId, defaultName) => {
    const dialogResult = await apiFunctionsMap.saveDialog({
      title: "Save Shortcut",
      buttonLabel: "Create Shortcut",
      defaultPath: defaultName,
      filters: [
        { name: "Winsert Shortcut", extensions: ["url"] }
      ]
    })

    if (dialogResult === undefined) return null

    const splitPath =  dialogResult.filePath.split("\\")
    const shortcutName = splitPath.pop().slice(0, -4) // ".url" length

    const rawIconPath = `${userData}/winserts/${winsertId}/icon`
    let icoPath
    if (!fs.existsSync(`${rawIconPath}.ico`)) {
      if (fs.existsSync(`${rawIconPath}.png`)) {
        await createIco(rawIconPath)
        icoPath = `${rawIconPath}.ico`
      }
    }
    createShortcut(shortcutName, winsertId, splitPath.join("\\"), icoPath)
  })

  ipcMain.handle("uninstallWinsert", async (_event, dataObject) => {
    const { winsertId, displayName } = dataObject
    return apiFunctionsMap.uninstallWinsert(winsertId, displayName)
  })

  ipcMain.on("openDataFolder", apiFunctionsMap.openDataFolder)

  ipcMain.handle("browseForWinserts", async (_event) => {
    const dialogResult = await apiFunctionsMap.openDialog({
      title: "Install Winsert",
      buttonLabel: "Install",
      properties: ["openFile"],
      filters: [
        { name: "Winserts", extensions: ["winsert"] },
      ]
    })

    if (dialogResult.filePaths[0] === undefined) return null
    return apiFunctionsMap.installWinsertFromPath(dialogResult.filePaths[0])
  })

  ipcMain.handle("installDroppedWinsert", async (_event, path) => {
    return apiFunctionsMap.installWinsertFromPath(path)
  })

  ipcMain.on("bundleWinsert", async () => {
    const openResult = await apiFunctionsMap.openDialog({
      title: "Bundle Winsert",
      buttonLabel: "Next",
      properties: ["openDirectory"]
    })

    if (openResult.canceled) return
    
    const contentsPath = openResult.filePaths[0]

    if (fs.existsSync(`${contentsPath}/manifest.json`)) {
      const defaultName = JSON.parse(
        fs.readFileSync(`${contentsPath}/manifest.json`)
      ).displayName

      if (!defaultName) return apiFunctionsMap.showMessageBox({
        type: "error",
        message: "The selected directory contains a malformed manifest file"
      })

      apiFunctionsMap.showMessageBox({
        type: "info",
        message: [
          "Manifest verified!",
          "Now select an output location to save the bundled Winsert."
        ].join("\n")
      })

      const saveResult = await (apiFunctionsMap.saveDialog({
        title: "Select Bundle Output Path",
        buttonLabel: "Save Bundle",
        defaultPath: defaultName,
        filters: [
          { name: "Winserts", extensions: ["winsert"] }
        ]
      }))
      if (!saveResult.canceled) {
        apiFunctionsMap.bundleWinsert(contentsPath, saveResult.filePath)
        apiFunctionsMap.showMessageBox({
          type: "info",
          message: "Winsert saved successfully"
        })
      }
    } else {
      return apiFunctionsMap.showMessageBox({
        type: "error",
        message: "The selected directory does not contain a valid manifest.json"
      })
    }
  })

  ipcMain.handle(
    "killBackgroundProcess",
    async (_event, winsertId, displayName) => {
      if (apiFunctionsMap.showMessageBox({
        type: "question",
        message: [
          `Are you sure you want to stop ${displayName}?`,
          "It will be restarted next time you open it."
        ].join("\n"),
        buttons: [
          "No",
          "Yes"
        ]
      })) {
        apiFunctionsMap.kill(winsertId)
        return true
      }
    }
  )

  ipcMain.handle("revokePermission", async (
    _event,
    winsertId,
    displayName,
    permissionName
  ) => {
    if (apiFunctionsMap.showMessageBox({
      type: "question",
      message:[
        "Are you sure you want to remove",
        permissionName,
        `from ${displayName}?`
      ].join(" "),
      buttons: [
        "No",
        "Yes"
      ]
    })) {
      permissionsEngine.revokePermission(winsertId, permissionName)
      return true
    } else {
      return false
    }
  })

  ipcMain.handle("requestPermission", async (
    _event,
    winsertId,
    permissionName
  ) => {
    const displayName = apiFunctionsMap.getWinsertDisplayName(winsertId)
    if (displayName === undefined) return new Error("Invalid Winsert ID")
    if (apiFunctionsMap.showMessageBox({
      type: "question",
      message: `${displayName} is requesting to ${
        permissionsEngine.getPermissionMessage(permissionName)
      }`,
      buttons: [
        "Deny",
        "Allow"
      ]
    })) {
      permissionsEngine.grantPermission(winsertId, permissionName)
      return true
    } else {
      permissionsEngine.revokePermission(winsertId, permissionName)
      return false
    }
  })

  ipcMain.handle("getAppVersion", () => {
    return apiFunctionsMap.getAppVersion()
  })

  ipcMain.on("openLinkInBrowser", async (_event, link) => {
    apiFunctionsMap.openExternal(link)
  })

  ipcMain.handle("sendNotification", (_event, winsertId, title, body) => {
    if (!permissionsEngine.checkPermission(winsertId, "sendNotifications")) {
      return new Error("Insufficient Permissions")
    }
    const icon = `${userData}/winserts/${winsertId}/icon.png`
    apiFunctionsMap.sendNotification(title, body, icon)
  })

  ipcMain.handle("keepOpenInBackground", async (_event, winsertId) => {
    if (!permissionsEngine.checkPermission(winsertId, "keepOpenInBackground")) {
      return new Error("Insufficient Permissions")
    }
    apiFunctionsMap.unsetBackgroundToExpire(winsertId)
    ipcMain.emit("keepOpenInBackground", winsertId)
  })

  ipcMain.handle("cancelKeepOpenInBackground", async (
    _event,
    winsertId,
    shouldKill
  ) => {
    if (
      shouldKill 
      && apiFunctionsMap.getBackgroundWinsertsList().includes(winsertId)
    ) {
      apiFunctionsMap.kill(winsertId)
    }
    apiFunctionsMap.setBackgroundToExpire(winsertId)
    ipcMain.emit("cancelKeepOpenInBackground", winsertId)
  })

}

module.exports = { openIpcChannels }