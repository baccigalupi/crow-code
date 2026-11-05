import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { RepoPanel } from '../../../../src/tui/install/directories/repo.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('RepoPanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new RepoPanel()

    const { name } = panel

    expect(name).toBe('repo')
    expect(panel.next).toBe('crowGlobalDirectory')
  })

  it('when asked for its field, is the repo directory', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const field = new RepoPanel().field(store)

    expect(field).toBe(store.directories.repoDirectory)
  })

  it('when asked for its prompt, renders the question and the default', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      new RepoPanel().prompt(store),
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'What directory for the local repo crow setup: (.crow)',
    )
    act(() => renderer.destroy())
  })
})
