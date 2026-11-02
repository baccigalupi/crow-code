import { describe, expect, it } from 'bun:test'
import { UrlShape } from '../../../../src/tools/web/fetch/url-shape.ts'

describe('UrlShape', () => {
  it('when the url is plain https, has no problem', () => {
    const url = new URL('https://192.0.2.1/a')

    const problem = new UrlShape(url).problem()

    expect(problem).toBe('')
  })

  it('when the scheme is ftp, names the scheme', () => {
    const url = new URL('ftp://192.0.2.1/a')

    const problem = new UrlShape(url).problem()

    expect(problem).toBe('scheme not allowed: ftp:')
  })

  it('when the url has userinfo, names the host without credentials', () => {
    const url = new URL('https://user:secret@192.0.2.1/')

    const problem = new UrlShape(url).problem()

    expect(problem).toBe('userinfo not allowed: 192.0.2.1')
  })

  it('when the port is not the default, names the port', () => {
    const url = new URL('https://192.0.2.1:8443/')

    const problem = new UrlShape(url).problem()

    expect(problem).toBe('port not allowed: 8443')
  })

  it('when the port is the explicit default, has no problem', () => {
    const url = new URL('http://192.0.2.1:80/')

    const problem = new UrlShape(url).problem()

    expect(problem).toBe('')
  })
})
