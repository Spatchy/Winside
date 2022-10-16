console.log(window.winsideVars.winsertId)

window.WinsideAPI.requestPermission("see-hardware-info").then((res) => {
  console.log(res)
})