
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

    // Test settings
    console.log(settings)
    changeSetting("showDeveloperOptions", true)
    
    const handlers = {
      // Menu:
      menuGeneral: () => {
        menuSelector("general")
      },
    
      menuWinserts: () => {
        menuSelector("winserts")
      },
      
      menuDeveloper: () => {
        menuSelector("developer")
      },
    
      // General:
      rescan: () => {
        console.log("rescan")
      },
    
      dataFolder: () => {
        console.log("dataFolder")
      },
    
      rebuild: () => {
        console.log("rebuild")
      }
    }
  
    Array.from(document.getElementsByTagName("button")).forEach(btn => {
      btn.addEventListener("click", handlers[btn.id])
    })

  })
})
