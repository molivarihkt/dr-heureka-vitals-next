export const handlePageReload = (executable) => {
  executable()
  addEventListener("popstate", (event) => {
    location.reload();
  })
}