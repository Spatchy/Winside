const fs = require("fs")
const JSZip = require("jszip")
const { v4: uuidv4 } = require("uuid")
const pngToIco = require("png-to-ico")
const path = require("path")

const __ = (file) => {
  return path.join(__dirname, file)
}

const extractWinsert = async (source, dest) => {
  const zip = new JSZip()
  const promiseArray = []
  const winsert = await zip.loadAsync(fs.readFileSync(source))
  const items = Object.keys(winsert.files)
  items.forEach((filename) => {
    const zipPromise = zip.file(filename).async("nodebuffer")
    promiseArray.push(zipPromise)
    zipPromise.then((content) => {
      fs.writeFileSync(`${dest}/${filename}`, content)
    })
  })
  return Promise.all(promiseArray)
}

const updateIndex = (indexPath, uuid, winsertName) => {
  const indexData = JSON.parse(fs.readFileSync(indexPath))
  indexData[uuid] = winsertName
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2))
}

const createShortcut = (winsertName, winsertId, outPath, icoPath) => {
  const icoPathToUse = icoPath ?? __("../logo.ico")
  fs.writeFileSync(`${outPath}/${winsertName}.url`, [
    "[InternetShortcut]",
    `URL=winside://${winsertId}/`,
    `IconFile=${icoPathToUse}`,
    "IconIndex=0"
  ].join("\r\n") + "\r\n")
}

const installWinsert = async (
  source,
  userData,
  userSettings,
  desktopPath,
  startPath
) => {
  const winsertId = uuidv4()
  fs.mkdirSync(`${userData}/winserts/${winsertId}`, { recursive: true })
  await extractWinsert(source, `${userData}/winserts/${winsertId}`)
  const winsertName = JSON.parse(fs.readFileSync(
    `${userData}/winserts/${winsertId}/manifest.json`
  )).displayName
  updateIndex(`${userData}/index.json`, winsertId, winsertName)

  let icoPath
  const rawIconPath = `${userData}/winserts/${winsertId}/icon`
  if (fs.existsSync(`${rawIconPath}.png`)) {
    icoPath = `${rawIconPath}.ico`
    const icoData = await pngToIco(`${rawIconPath}.png`)
    fs.writeFileSync(icoPath, icoData)
  }

  if (userSettings.createDesktopShortcuts) {
    createShortcut(winsertName, winsertId, desktopPath, icoPath)
  }
  if (userSettings.createStartMenuShortcuts) {
    createShortcut(winsertName, winsertId, startPath, icoPath)
  }
  return winsertId
}

module.exports = { installWinsert }