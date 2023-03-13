/* eslint-disable max-len */
const path = require("path")

module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        iconUrl: "https://raw.githubusercontent.com/Spatchy/Winside/main/logo.ico",
        setupIcon: path.join(__dirname, "logo.ico")
      },
    }
  ],
}
