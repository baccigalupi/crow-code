import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { EnvPromptView } from '../../../../../src/tui/install/views/steps/env-prompt.ts'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('EnvPromptView', () => {
  it('when the global directory is the default, defaults the env file inside it', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new EnvPromptView(renderer)
    renderer.root.add(view.root())
    view.update(store.inputs.peek())

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Credentials .env file: (~/.crow/.env)',
    )
    renderer.destroy()
  })

  it('when a global directory is typed, defaults the env file inside it', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.directories.globalDirectory.insert('/opt/crow')
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new EnvPromptView(renderer)
    renderer.root.add(view.root())
    view.update(store.inputs.peek())

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Credentials .env file: (/opt/crow/.env)',
    )
    renderer.destroy()
  })
})
