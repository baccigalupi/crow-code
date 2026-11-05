import { describe, expect, it } from 'bun:test'
import { HiddenElement } from '../../../../../../../src/tools/web/fetch/read-body/page-parser/html-text/hidden-element.ts'

describe('HiddenElement', () => {
  it('when the element has the hidden attribute, is hidden', async () => {
    let hidden = false
    const rewriter = new HTMLRewriter().on('p', {
      element: (element) => {
        hidden = new HiddenElement(element).hidden()
      },
    })

    await rewriter.transform(new Response('<p hidden>a</p>')).text()

    expect(hidden).toBe(true)
  })

  it('when the element has aria-hidden true, is hidden', async () => {
    let hidden = false
    const rewriter = new HTMLRewriter().on('p', {
      element: (element) => {
        hidden = new HiddenElement(element).hidden()
      },
    })

    await rewriter.transform(new Response('<p aria-hidden="TRUE">a</p>')).text()

    expect(hidden).toBe(true)
  })

  it('when the element has a hiding inline style, is hidden', async () => {
    let hidden = false
    const rewriter = new HTMLRewriter().on('p', {
      element: (element) => {
        hidden = new HiddenElement(element).hidden()
      },
    })

    await rewriter
      .transform(new Response('<p style="color: red; DISPLAY : none">a</p>'))
      .text()

    expect(hidden).toBe(true)
  })

  it('when the element has a harmless style, is not hidden', async () => {
    let hidden = true
    const rewriter = new HTMLRewriter().on('p', {
      element: (element) => {
        hidden = new HiddenElement(element).hidden()
      },
    })

    await rewriter
      .transform(new Response('<p style="font-size:0.8em">a</p>'))
      .text()

    expect(hidden).toBe(false)
  })
})
