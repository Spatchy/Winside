document.addEventListener("DOMContentLoaded", () => { 

  document.getElementById("closeButton").addEventListener("click", () => {
    console.log("clicked")
    window.WinsideAPI.closeSidebar()
  })
  
})