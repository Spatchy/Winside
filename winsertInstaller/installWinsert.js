const fs = require("fs")
const JSZip = require("jszip")
const { v4: uuidv4 } = require("uuid")

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

const installWinsert = async (source, userData) => {
  const winsertId = uuidv4()
  fs.mkdirSync(`${userData}/winserts/${winsertId}`, { recursive: true })
  await extractWinsert(source, `${userData}/winserts/${winsertId}`)
  const winsertName = JSON.parse(fs.readFileSync(
    `${userData}/winserts/${winsertId}/manifest.json`
  )).displayName
  updateIndex(`${userData}/index.json`, winsertId, winsertName)
  return winsertId
}

module.exports = { installWinsert }