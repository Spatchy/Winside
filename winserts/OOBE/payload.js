console.log(window.Winside.vars.winsertId)

window.WinsideAPI.requestPermission("see-hardware-info").then((res) => {
  console.log(res)
})