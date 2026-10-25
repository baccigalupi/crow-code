/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { ProviderPrompt } from '../../../../../src/tui/install/views/steps/provider-prompt.tsx'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('ProviderPrompt', () => {
  it('when on the url step, groups the provider fields under one title', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ProviderPrompt
        step="providerUrl"
        providers={[{ name: 'nous', url: 'https://n' }]}
        providerName={insertText(emptyText(), 'or')}
        providerUrl={emptyText()}
        providerCredentials={emptyText()}
      />,
      { width: 60, height: 8 },
    )

    await renderOnce()

    const frame = captureCharFrame()
    expect(frame).toContain('Provider 2')
    expect(frame).toContain('Name: or')
    expect(frame).toContain('Url:')
    expect(frame).toContain('API key:')
    expect(frame).toContain('Esc to finish adding providers')
    renderer.destroy()
  })

  it('when the credential is done, never shows it', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ProviderPrompt
        step="providerCredentials"
        providers={[]}
        providerName={insertText(emptyText(), 'or')}
        providerUrl={insertText(emptyText(), 'https://o')}
        providerCredentials={insertText(emptyText(), 'sk-1')}
      />,
      { width: 60, height: 8 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('API key: ••••')
    expect(captureCharFrame()).not.toContain('sk-1')
    renderer.destroy()
  })
})
