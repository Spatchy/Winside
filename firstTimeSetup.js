const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

const init = (userData) => {
  const oobeWinsertId = uuidv4()
  fs.writeFileSync(
    `${userData}/index.json`,
    JSON.stringify({
      [oobeWinsertId]: "OOBE"
    })
  )
}

const check = (userData) => {
  if (!fs.existsSync(`${userData}/index.json`)) {
    init(userData)
  }
}

module.exports = { check }