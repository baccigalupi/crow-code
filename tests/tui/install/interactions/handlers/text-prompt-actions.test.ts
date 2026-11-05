import { describe, expect, it, mock } from 'bun:test'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { TextPromptActions } from '../../../../../src/tui/install/interactions/handlers/text-prompt-actions.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('TextPromptActions', () => {
  it('when the input changes, the panel field holds the new text', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const navigation = { goTo: mock(), exit: mock() }
    const actions = new TextPromptActions({
      step: 'repoDirectory',
      store,
      navigation,
    })

    actions.input()('./crow')

    expect(store.directories.repoDirectory.text.peek().text).toBe('./crow')
  })

  it('when the input is submitted, goes to the next panel', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const navigation = { goTo: mock(), exit: mock() }
    const actions = new TextPromptActions({
      step: 'repoDirectory',
      store,
      navigation,
    })

    actions.submit()()

    expect(navigation.goTo.mock.calls).toEqual([['crowGlobalDirectory']])
  })
})
