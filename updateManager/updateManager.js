const semver = require("semver")
const fetch = require("electron-fetch").default

const getLatestVersionNumber = async () => {
  const url = "https://api.github.com/repos/Spatchy/Winside/releases"
  const response = await fetch(url)
  const releases = await response.json()
  
  const filteredReleases = releases
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
  
  return filteredReleases[0].tag_name
}

const checkIsNewerVersion = (tag, currentVersion) => {
  let parsedTag = tag
  if (tag.split(".").length === 2) { // sanitise old version scheme
    parsedTag = tag.split(".").map((n) => +n)
    parsedTag.push(0)
    parsedTag = parsedTag.join(".")
  }
  return semver.gt(semver.coerce(parsedTag), currentVersion)
}

const checkForUpdates = async (currentVersion) => {
  const latestTag = await getLatestVersionNumber()
  return checkIsNewerVersion(latestTag, currentVersion)
}

module.exports = {
  checkForUpdates
}