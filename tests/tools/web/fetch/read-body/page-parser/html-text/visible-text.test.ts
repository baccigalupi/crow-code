import { describe, expect, it } from 'bun:test'
import { VisibleText } from '../../../../../../../src/tools/web/fetch/read-body/page-parser/html-text/visible-text.ts'

describe('VisibleText', () => {
  it('when text is appended with newlines between, separates lines', () => {
    const visibleText = new VisibleText()

    visibleText.append('a \n b')
    visibleText.newline()
    visibleText.append('c')

    expect(visibleText.text()).toBe('a b\nc')
  })

  it('when an element with content is skipped, drops its text until it ends', async () => {
    const visibleText = new VisibleText()
    const rewriter = new HTMLRewriter().on('*', {
      element: (element) => {
        if (element.tagName === 'div') visibleText.skip(element)
      },
      text: (chunk) => visibleText.append(chunk.text),
    })

    await rewriter.transform(new Response('<div>x</div><p>y</p>')).text()

    expect(visibleText.text()).toBe('y')
    expect(visibleText.visible()).toBe(true)
  })

  it('when a void element is skipped, stays visible', async () => {
    const visibleText = new VisibleText()
    const rewriter = new HTMLRewriter().on('input', {
      element: (element) => visibleText.skip(element),
    })

    await rewriter.transform(new Response('<input>')).text()

    expect(visibleText.visible()).toBe(true)
  })
})
