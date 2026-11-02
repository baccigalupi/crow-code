import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { ProviderPromptView } from '../../../../../src/tui/install/panels/provider/view.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('ProviderPromptView', () => {
  it('when given fields, groups them under one title', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 60, height: 8 },
    )
    const view = new ProviderPromptView(renderer)
    renderer.root.add(view.root())
    view.update({
      title: 'Provider 2',
      fields: [
        {
          label: 'Name',
          input: insertText(emptyText(), 'or'),
          masked: false,
          status: 'done',
        },
        { label: 'Url', input: emptyText(), masked: false, status: 'active' },
        {
          label: 'API key',
          input: emptyText(),
          masked: true,
          status: 'pending',
        },
      ],
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
