const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

const defaults = {
  showOOBE: false,
  isDefaultSide: true,
  accentColor: "#5dc1dc",
  allowAccentOverride: true,
  showDeveloperOptions: false,
  openDevToolsOnLaunch: false,
  customUserAgent: ""
}

const init = (userData) => {
  const oobeWinsertId = uuidv4()

  fs.writeFileSync(
    `${userData}/index.json`,
    JSON.stringify({
      [oobeWinsertId]: "OOBE"
    })
  )

  fs.cpSync("/winserts/OOBE", `${userData}/winserts/${oobeWinsertId}`)
}

const getOverriddenDefaults = (userData) => {
  const settingsFilepath = `${userData}/settings.json`
  if (fs.existsSync(settingsFilepath)){
    return {...defaults, ...JSON.parse(fs.readFileSync(settingsFilepath))}
  }
  return defaults
}

const writeSetting = (userData, setting, value) => {
  const settingsFilepath = `${userData}/settings.json`
  let settingsData = {}
  if (fs.existsSync(settingsFilepath)) {
    settingsData = JSON.parse(fs.readFileSync(settingsFilepath))
  }
  settingsData[setting] = value
  fs.writeFileSync(settingsFilepath, JSON.stringify(settingsData))
}

const check = (userData) => {
  if (!fs.existsSync(`${userData}/index.json`)) {
    init(userData)
    return { ...defaults, showOOBE: true}
  }
  return getOverriddenDefaults(userData)
}

module.exports = { check, writeSetting }