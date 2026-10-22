// TODO: замінити на справжній домен, коли його оберемо
const HOST = 'solodki-buketi.example'

export default {
  fetch(request) {
    const url = new URL(request.url)
    url.hostname = HOST
    return Response.redirect(url.toString(), 301)
  }
}
