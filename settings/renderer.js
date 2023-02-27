
const menuSelector = (selection) => {
  Array.from(document.getElementsByClassName("settings-page"))
    .forEach(page => {
      if (page.classList.contains(selection)) {
        page.classList.remove("is-hidden")
      } else {
        page.classList.add("is-hidden")
      }
    })
  
  Array.from(document.getElementsByClassName("menu-option"))
    .forEach((button) => {
      if (button.id.toLowerCase() === `menu${selection}`) {
        button.parentElement.classList.add("is-selected")
      } else {
        button.parentElement.classList.remove("is-selected")
      }
    })
}

const generateWinsertListing = (winsertId, manifestData, permissionsData) => {
  const node = document.getElementById("winsertListingTemplate")
    .cloneNode(true)

  node.setAttribute("id", `Winsert-${winsertId}`)
  node.setAttribute("searchName", manifestData.displayName)

  Object.keys(manifestData).forEach((key) => {
    node.querySelector(`.${key}`)?.appendChild(
      document.createTextNode(manifestData[key])
    )
  })

  node.querySelector("#saveShortcut").addEventListener("click", () => {
    window.WinsideSettings.saveShortcut(winsertId, manifestData.displayName)
  })

  node.querySelector(".uninstall").addEventListener("click", async () => {
    if (await window.WinsideSettings.uninstallWinsert(
      winsertId,
      manifestData.displayName
    )) {
      node.remove()
    } else {
      alert(`${manifestData.displayName} was not removed`)
    }
  })

  if (permissionsData) {
    const grantedPermisionsArr = Object.keys(permissionsData).filter((perm) => {
      return permissionsData[perm]
    })
    const permissionsHeader = node.querySelector(".permissions-header")
    const permissionsTable = node.querySelector(".permissions-table")
    grantedPermisionsArr.forEach((permissionName) => {
      const row = document.getElementById("permissionRowTemplate")
        .cloneNode(true)

      row.setAttribute("id", `permission-${permissionName}-${winsertId}`)
      row.querySelector(".permission-name").innerText = permissionName
      row.querySelector(".revoke-permission").addEventListener("click", () => {
        window.WinsideSettings.revokePermission(
          winsertId,
          manifestData.displayName,
          permissionName
        ).then((result) => {
          if (result === true) {
            row.remove()
            node.querySelector(".number-of-perms").innerText -= 1
          }
        })
      })
      permissionsTable.appendChild(row)
    })

    const numOfPermissions = grantedPermisionsArr.length
    const singleOrMultiple = numOfPermissions === 1
      ? "\xa0permission has"
      : "\xa0permissions have"
    permissionsHeader.querySelector(".number-of-perms")
      .innerText = numOfPermissions
    permissionsHeader.querySelector(".number-of-perms-message")
      .innerText = `${singleOrMultiple} been granted`

    permissionsHeader.addEventListener("click", async () => {
      if (!permissionsHeader.classList.contains("expanded")) {
        permissionsHeader.classList.add("expanded")
        const arrow = permissionsHeader.querySelector(
          ".permissions-header-arrow .fa-chevron-right"
        )
        arrow.classList.remove("fa-chevron-right")
        arrow.classList.add("fa-chevron-down")
        permissionsTable.classList.remove("is-hidden")
      } else {
        permissionsHeader.classList.remove("expanded")
        const arrow = permissionsHeader.querySelector(
          ".permissions-header-arrow .fa-chevron-down"
        )
        arrow.classList.remove("fa-chevron-down")
        arrow.classList.add("fa-chevron-right")
        permissionsTable.classList.add("is-hidden")
      }
    })

  } else {
    node.querySelector(".permissions-header").classList.add("is-hidden")
  }

  node.addEventListener("click", async (event) => {
    if (!node.classList.contains("expanded")) {
      node.classList.add("expanded")
      const arrow = node.querySelector(".main-area-arrow .fa-chevron-right")
      arrow.classList.remove("fa-chevron-right")
      arrow.classList.add("fa-chevron-down")
    } else {
      const mainArea = node.querySelector(".main-area")
      if (mainArea.contains(event.target)) {
        node.classList.remove("expanded")
        const arrow = node.querySelector(".main-area-arrow .fa-chevron-down")
        arrow.classList.remove("fa-chevron-down")
        arrow.classList.add("fa-chevron-right")
      }
    }
  })

  return node
}

const generateBackgroundListing = (winsertId, manifestData) => {
  const node = document.getElementById("backgroundListingTemplate")
    .cloneNode(true)

  node.setAttribute("id", `Winsert-background-${winsertId}`)

  node.querySelector(".displayName")?.appendChild(
    document.createTextNode(manifestData.displayName)
  )

  node.querySelector(".kill").addEventListener("click", async () => {
    if (await window.WinsideSettings.killBackgroundProcess(
      winsertId,
      manifestData.displayName
    )) {
      node.remove()
      const backgroundListElem = document.getElementById("backgroundList")
      if (backgroundListElem.children.length === 0) {
        backgroundListElem
          .innerText = "There's nothing currently running in the background"
      }
    } else {
      alert(`${manifestData.displayName} was not stopped`)
    }
  })

  return node
}

document.addEventListener("DOMContentLoaded", () => {
  window.WinsideSettings.getSettings().then(async (data) => {

    const {
      settings,
      version,
      backgroundProcesses,
      permissions,
      font
    } = data

    console.log(JSON.stringify(permissions))

    const winsertDataPromise = window.WinsideSettings.getWinsertData()

    const questrial = new FontFace(
      "Questrial",
      font
    )

    const questrialFont = await questrial.load()
      
    document.fonts.add(questrialFont)
    document.body.style = "font-family: 'Questrial', sans-serif;"

    const rootStyle = document.querySelector(":root").style
    rootStyle.setProperty("--accent-color", settings.accentColor)
    rootStyle.setProperty("--accent-color-alpha", `${settings.accentColor}aa`)

    const changeSetting = (setting, value) => {
      window.WinsideSettings.changeSetting(setting, value)
      settings[setting] = value
    }
    
    const clickHandlers = {
      // Menu:
      menuGeneral: (_ctrl) => {
        menuSelector("general")
      },
    
      menuWinserts: (_ctrl) => {
        menuSelector("winserts")
      },
      
      menuDeveloper: (_ctrl) => {
        menuSelector("developer")
      },
    
      // General:
      dataFolder: (_ctrl) => {
        window.WinsideSettings.openDataFolder()
      },

      winsertPanel: async (_ctrl) => {
        const result = await window.WinsideSettings.browseForWinserts()
        if (result) alert("Winsert installed Successfully")
      },

      createDesktopShortcuts: (ctrl) => {
        changeSetting("createDesktopShortcuts", ctrl.checked)
      },

      createStartMenuShortcuts: (ctrl) => {
        changeSetting("createStartMenuShortcuts", ctrl.checked)
      },

      setSidebarLeft: (ctrl) => {
        changeSetting("isDefaultSide", false)
        stateMap.setSidebarLeft(ctrl)
        stateMap.setSidebarRight(ctrl.nextElementSibling)
      },
      
      setSidebarRight: (ctrl) => {
        changeSetting("isDefaultSide", true)
        stateMap.setSidebarRight(ctrl)
        stateMap.setSidebarLeft(ctrl.previousElementSibling)
      },
      
      colorPicker: (_ctrl) => {}, // TODO

      allowColorOverride: (ctrl) => {
        changeSetting("allowAccentOverride", ctrl.checked)
      },

      enableDevOptions: (ctrl) => {
        changeSetting("showDeveloperOptions", ctrl.checked)
      },

      // Developer
      useChromeDevTools: (ctrl) => {
        changeSetting("openDevToolsOnLaunch", ctrl.checked)
      },

      overrideWinsertAgents: (ctrl) => {
        changeSetting("overrideWinsertAgents", ctrl.checked)
      },

      bundleWinsert: (_ctrl) => {
        window.WinsideSettings.bundleWinsert()
      }

    }

    const stateMap = {
      createDesktopShortcuts: (ctrl) => {
        ctrl.checked = settings.createDesktopShortcuts
      },

      createStartMenuShortcuts: (ctrl) => {
        ctrl.checked = settings.createStartMenuShortcuts
      },

      setSidebarLeft: (ctrl) => {
        if (settings.isDefaultSide) {
          ctrl.classList.add("ghost")
        } else {
          ctrl.classList.remove("ghost")
        }
      },

      setSidebarRight: (ctrl) => {
        if (settings.isDefaultSide) {
          ctrl.classList.remove("ghost")
        } else {
          ctrl.classList.add("ghost")
        }
      },

      allowColorOverride: (ctrl) => {
        ctrl.checked = settings.allowAccentOverride
      },

      enableDevOptions: (ctrl) => {
        ctrl.checked = settings.showDeveloperOptions
        if (ctrl.checked) {
          document.getElementById("menuDeveloper").classList.remove("is-hidden")
        } else {
          document.getElementById("menuDeveloper").classList.add("is-hidden")
        }
      },

      useChromeDevTools: (ctrl) => {
        ctrl.checked = settings.openDevToolsOnLaunch
      },

      appVersion: (ctrl) => {
        ctrl.innerText = version
      },

      winsertCount: async (ctrl) => {
        ctrl.innerText = (await winsertDataPromise).length
      },

      customAgentInput: (ctrl) => {
        ctrl.value = settings.customUserAgent
      },

      overrideWinsertAgents: (ctrl) => {
        ctrl.checked = settings.overrideWinsertAgents
      }
    }

    const specHandlers = {
      winsertPanel: (ctrl) => {
        ctrl.addEventListener("dragover", (event) => {
          event.stopPropagation()
          event.preventDefault()
          event.dataTransfer.dropEffect = "copy"
        })

        ctrl.addEventListener("drop", async (event) => {
          event.stopPropagation()
          event.preventDefault()
          const paths = [...event.dataTransfer.files]
            .filter(file => file.name.endsWith(".winsert"))
            .map(file => file.path)
          paths.forEach(async (path) => {
            await window.WinsideSettings.installDroppedWinsert(path)
          })
          alert("Winsert(s) installed successfully")
        })
      },

      customAgentInput: (ctrl) => {
        ctrl.addEventListener("change", () => {
          window.WinsideSettings.changeSetting("customUserAgent", ctrl.value)
        })
      }
    }
  
    Array.from(document.querySelectorAll("[control]")).forEach(ctrl => {
      if (typeof clickHandlers[ctrl.id] === "function") {
        ctrl.addEventListener("click", () => {
          clickHandlers[ctrl.id](ctrl)
          stateMap[ctrl.id] && stateMap[ctrl.id](ctrl)
        })
      }
      if (typeof stateMap[ctrl.id] === "function") {
        stateMap[ctrl.id](ctrl)
      }
      if (typeof specHandlers[ctrl.id] === "function") {
        specHandlers[ctrl.id](ctrl)
      }
    })

    Array.from(document.querySelectorAll("[browserLink]")).forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        window.WinsideSettings.openLinkInBrowser(link.href)
      })
    })

    const winsertsListElem = document.getElementById("winsertsList")
    const backgroundListElem = document.getElementById("backgroundList")
    winsertDataPromise.then((winsertData) => {
      winsertData.forEach((winsert) => {
        winsertsListElem.appendChild(
          generateWinsertListing(
            winsert.winsertId,
            winsert.manifest,
            permissions[winsert.winsertId]
          )
        )
        if (backgroundProcesses.includes(winsert.winsertId)) {
          backgroundListElem.appendChild(
            generateBackgroundListing(winsert.winsertId, winsert.manifest)
          )
        }
      })
      if (backgroundProcesses.length === 0) {
        backgroundListElem
          .innerText = "There's nothing currently running in the background"
      }
    })

  })
})
