const fs = require("fs")
const path = require("path")
const JSZip = require("jszip")

async function createWinsertBundle(directoryPath, outPath) {
  const zip = new JSZip()
  const files = fs.readdirSync(directoryPath)

  for (const file of files) {
    const filePath = path.join(directoryPath, file)
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      const folder = zip.folder(file)
      createWinsertBundle(filePath, folder)
    } else if (stats.isFile()) {
      const data = fs.readFileSync(filePath)
      zip.file(file, data)
    }
  }

  const data = await zip.generateAsync({ type: "nodebuffer" })
  fs.writeFileSync(outPath, data)
}

module.exports = { createWinsertBundle }
