const fs = require("fs")

const loadAddon = (webContent, windowObject, addonName) => {
  return {
    winsideAssets: () => {
      const rawSvg = fs.readFileSync("logo.svg", "utf8")
      const modifiedSvg = rawSvg
        .replace(
          // eslint-disable-next-line max-len
          /style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"/,
          "class=\"winside-assets svg-style-replace-1\""
        )
        .replace(
          /style="fill:none;"/,
          "class=\"winside-assets svg-style-replace-2\""
        )
        .replace(
          /style="fill:rgb\(235,235,235\);"/,
          "class=\"winside-assets svg-style-replace-3\""
        )
      fs.readFile("addons/assets/logoSvgStyles.css", (err, svgCss) => {
        webContent.webContents.insertCSS(
          svgCss.toString()
        )
          .catch(err => console.log(err))
      })
      const questrial = fs.readFileSync("addons/assets/Questrial-Regular.ttf")
      windowObject.addons.winsideAssets = {
        logoSvg: modifiedSvg,
        questrialFont: questrial.toString("binary")
      }
    }
  }[addonName]()
}

module.exports = { loadAddon }