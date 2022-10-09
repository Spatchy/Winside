const fs = require("fs")
const path = require("path")

const __ = (file) => {
  return path.join(__dirname, file)
}

const loadWinsert = (webContent, winsertId) => {
  const winsertPath = __(`../winserts/${winsertId}/`)
  const manifest = JSON.parse(
    fs.readFileSync(`${winsertPath}manifest.json`)
  )
  webContent.webContents.loadURL(manifest.mainURL).then(() => {
    webContent.webContents.openDevTools()
    webContent.webContents.executeJavaScript(
      `window.winsideVars = {winsertId: "${winsertId}"}`
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
}

module.exports = { loadWinsert }