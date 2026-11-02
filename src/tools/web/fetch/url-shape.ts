export class UrlShape {
  private url: URL

  constructor(url: URL) {
    this.url = url
  }

  problem() {
    const problems = [
      this.schemeProblem(),
      this.userinfoProblem(),
      this.portProblem(),
    ]
    return problems.find((problem) => problem !== '') || ''
  }

  private schemeProblem() {
    if (['http:', 'https:'].includes(this.url.protocol)) {
      return ''
    }

    return `scheme not allowed: ${this.url.protocol}`
  }

  private userinfoProblem() {
    if (this.url.username === '' && this.url.password === '') {
      return ''
    }

    return `userinfo not allowed: ${this.url.hostname}`
  }

  private portProblem() {
    if (this.url.port === '') {
      return ''
    }

    return `port not allowed: ${this.url.port}`
  }
}
