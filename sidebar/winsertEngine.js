const fs = require("fs")
const { app } = require("electron")
const { loadAddon } = require("./loadAddons")

const loadWinsert = (webContent, winsertId, manifest) => {
  const winsertPath = `${app.getPath("userData")}/winserts/${winsertId}/`
  webContent.webContents.loadURL(manifest.mainURL)
    .then(async () => {

      const windowObject = {
        vars: {
          winsertId: winsertId
        }
      }

      if (manifest.exposeAddons && manifest.exposeAddons.length > 0) {
        windowObject.addons = {}
        manifest.exposeAddons.forEach((addonName) => {
          loadAddon(webContent, windowObject, addonName)
        })
      }

      if (manifest.inject.document) {
        await webContent.webContents.loadFile(
          `${winsertPath}${manifest.inject.document}`
        )
      }

      await webContent.webContents.executeJavaScript(
        `window.Winside = ${JSON.stringify(windowObject)}`
      )
      manifest.inject.script.forEach((file) => {
        fs.readFile(`${winsertPath}${file}`, (err, payload) => {
          const payloadStr = payload.toString()
          webContent.webContents.executeJavaScript(
            payloadStr
          )
            .catch(e => console.log(e))
          
        })
      })

      manifest.inject.style.forEach((file)=> {
        fs.readFile(`${winsertPath}${file}`, (err, styleSheet) => {
          const styleSheetStr = styleSheet.toString()
          webContent.webContents.insertCSS(
            styleSheetStr
          )
            .catch(e => console.log(e))
          
        })
      })    
    })
    .catch(err => console.log(err))
}

module.exports = { loadWinsert }