const fs = require("fs")
const { app } = require("electron")
const perms = require("./permissionTypes")

const path = `${app.getPath("userData")}/permissions.json`

if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}))
}

const permissionsMap = JSON.parse(fs.readFileSync(path))

const getAllPermissions = () => permissionsMap

const writePermissionsFile = () => {
  fs.writeFileSync(path, JSON.stringify(permissionsMap, null, 2))
}

const checkPermission = (winsertId, permission) => {
  // true = granted, false = explict deny, undefined = not asked
  return permissionsMap[winsertId]?.[permission]
}

const grantPermission = (winsertId, permission) => {
  if (!(permission in perms)) return
  permissionsMap[winsertId] ??= {}
  permissionsMap[winsertId][permission] = true
  writePermissionsFile()
}

const revokePermission = (winsertId, permission) => {
  if (!(permission in perms)) return
  permissionsMap[winsertId] ??= {}
  permissionsMap[winsertId][permission] = false
  writePermissionsFile()
}

module.exports = {
  getAllPermissions,
  checkPermission,
  grantPermission,
  revokePermission,
  getPermissionMessage: (perm) => perms[perm]
}
