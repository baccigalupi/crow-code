import { describe, expect, it } from 'bun:test'
import { stepPromptsViewModel } from '../../../../src/tui/install/views/step-prompts-view-model.ts'
import { RepoPathPrompt } from '../../../../src/tui/install/views/steps/repo-path-prompt.tsx'
import { DoneMessage } from '../../../../src/tui/install/views/steps/done-message.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('stepPromptsViewModel', () => {
  it('when the step is repo, the view is the repo path prompt', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    const { View } = stepPromptsViewModel(model)

    expect(View).toBe(RepoPathPrompt)
  })

  it('when the step is done, the view is the done message', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('done')

    const { View } = stepPromptsViewModel(model)

    expect(View).toBe(DoneMessage)
  })
})
