import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { RepoPanel } from '../../../../src/tui/install/directories/repo.ts'
import { IgnorePanel } from '../../../../src/tui/install/permissions/ignore.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('TextPromptPanel', () => {
  it('when asked for its placeholder, is the default in parentheses', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const placeholder = new RepoPanel().placeholder(store, store.inputs.peek())

    expect(placeholder).toBe('(.crow)')
  })

  it('when the panel is bare, its placeholder is the default alone', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const placeholder = new IgnorePanel().placeholder(
      store,
      store.inputs.peek(),
    )

    expect(placeholder).toBe('[]')
  })
})
