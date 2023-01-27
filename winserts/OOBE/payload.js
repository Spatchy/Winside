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
}

if (document.readyState) init()
else document.addEventListener("DOMContentLoaded", init)