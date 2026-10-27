import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { ProviderPromptView } from '../../../../../src/tui/install/views/steps/provider-prompt.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('ProviderPromptView', () => {
  it('when on the url step, groups the provider fields under one title', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 60, height: 8 },
    )
    const view = new ProviderPromptView(renderer)
    renderer.root.add(view.root())
    view.update({
      step: 'providerUrl',
      providers: [{ name: 'nous', url: 'https://n' }],
      providerName: insertText(emptyText(), 'or'),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
    })

    await renderOnce()

    const frame = captureCharFrame()
    expect(frame).toContain('Provider 2')
    expect(frame).toContain('Name: or')
    expect(frame).toContain('Url:')
    expect(frame).toContain('API key:')
    expect(frame).toContain('Esc to finish adding providers')
    renderer.destroy()
  })
})
