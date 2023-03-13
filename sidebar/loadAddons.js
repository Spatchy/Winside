const fs = require("fs")
const __ = require("../utils/pathify")

const loadAddon = (webContent, windowObject, addonName) => {
  return {
    winsideAssets: () => {
      const rawSvg = fs.readFileSync(__("logo.svg"), "utf8")
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
      fs.readFile(__("addons/assets/logoSvgStyles.css"), (err, svgCss) => {
        webContent.webContents.insertCSS(
          svgCss.toString()
        )
          .catch(err => console.log(err))
      })
      const questrial = fs.readFileSync(
        __("addons/assets/Questrial-Regular.ttf"),
        { encoding: "base64" }
      )
      windowObject.addons.winsideAssets = {
        logoSvg: modifiedSvg,
        questrialFont: `url(data:font/ttf;base64,${questrial})`
      }
    }
  }[addonName]()
}

module.exports = { loadAddon }