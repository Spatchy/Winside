const init = () => {
  console.log(window.Winside.vars.winsertId)

  const questrial = new FontFace(
    "Questrial",
    window.Winside.addons.winsideAssets.questrialFont
  )
  document.fonts.add(questrial)

  document.querySelector("[hidden]").removeAttribute("hidden")
  document.getElementById("logoWrapper")
    .innerHTML = window.Winside.addons.winsideAssets.logoSvg
  document.getElementsByTagName("button")[0].addEventListener("click", () => {
    window.WinsideAPI.openLinkInBrowser("https://github.com/Spatchy/Winserts/")
  })
}

if (document.readyState) init()
else document.addEventListener("DOMContentLoaded", init)