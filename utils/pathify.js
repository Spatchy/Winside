const path = require("path")
const { app } = require("electron")

const __ = (file) => {
  return path.join(app.getAppPath(), file)
}

module.exports = __