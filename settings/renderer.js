
const menuSelector = (selection) => {
  Array.from(document.getElementsByClassName("settings-page"))
    .forEach(page => {
      if (page.classList.contains(selection)) {
        page.classList.remove("is-hidden")
      } else {
        page.classList.add("is-hidden")
      }
    })
}

document.addEventListener("DOMContentLoaded", () => {
  window.WinsideSettings.getSettings().then((data) => {

    const settings = data
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
      rescan: (_ctrl) => {
        console.log("rescan")
      },
    
      dataFolder: (_ctrl) => {
        window.WinsideSettings.openDataFolder()
      },
    
      rebuild: (_ctrl) => {
        console.log("rebuild")
      },

      winsertPanel: async (_ctrl) => {
        const result = await window.WinsideSettings.browseForWinserts()
        if (result) alert("Winsert installed Successfully")
      },

      setSidebarLeft: (_ctrl) => {
        changeSetting("isDefaultSide", false)
      },
      
      setSidebarRight: (_ctrl) => {
        changeSetting("isDefaultSide", true)
      },
      
      colorPicker: (_ctrl) => {}, // TODO

      allowColorOverride: (ctrl) => {
        changeSetting("allowAccentOverride", ctrl.checked)
      },

      enableDevOptions: (ctrl) => {
        changeSetting("showDeveloperOptions", ctrl.checked)
      },

    }

    const stateMap = {
      colorPicker: (ctrl) => {
        ctrl.style.backgroundColor = settings.accentColor
      },

      setSidebarLeft: (ctrl) => {
        if (settings.isDefaultSide) {
          ctrl.classList.remove("is-selected")
        } else {
          ctrl.classList.add("is-selected")
        }
      },

      setSidebarRight: (ctrl) => {
        if (settings.isDefaultSide) {
          ctrl.classList.add("is-selected")
        } else {
          ctrl.classList.remove("is-selected")
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

  })
})
