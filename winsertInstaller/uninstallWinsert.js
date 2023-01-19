const { dialog } = require("electron")
const fs = require("fs")

const uninstallWinsert = async (userData, winsertId, displayName) => {
  const dialogResult = await dialog.showMessageBox({
    type: "warning",
    title: "Uninstall",
    message: `Are you sure you want to permanently uninstall ${displayName}?`,
    buttons: ["Uninstall", "Cancel"],
    defaultId: 1,
    noLink: true
  })

  if (dialogResult) {
    const indexData = JSON.parse(fs.readFileSync(`${userData}/index.json`))
    if (winsertId in indexData) {
      delete indexData[winsertId]
      fs.writeFileSync(`${userData}/index.json`, JSON.stringify(indexData))
      fs.rmSync(
        `${userData}/winserts/${winsertId}`,
        { recursive: true, force: true }
      )

      await dialog.showMessageBox({
        type: "info",
        title: "Uninstall",
        message: `${displayName} was uninstalled successfully`,
      })

      return true
    }
  }
  return false
}

module.exports = { uninstallWinsert }