export class RedirectLocation {
  private url: string
  private response: Response
  private redirectStatuses = [301, 302, 303, 307, 308]

  constructor(url: string, response: Response) {
    this.url = url
    this.response = response
  }

  isRedirect() {
    return (
      this.redirectStatuses.includes(this.response.status) &&
      this.response.headers.has('location')
    )
  }

  target() {
    const location = this.response.headers.get('location') as string
    return new URL(location, this.url).href
  }
}
