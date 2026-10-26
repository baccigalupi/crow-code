import { describe, expect, it } from 'bun:test'
import { stepPromptsViewModel } from '../../../../src/tui/install/views/step-prompts-view-model.ts'
import { RepoPathPrompt } from '../../../../src/tui/install/views/steps/repo-path-prompt.tsx'
import { DoneMessage } from '../../../../src/tui/install/views/steps/done-message.tsx'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('stepPromptsViewModel', () => {
  it('when the step is repo, the view is the repo path prompt', () => {
    const userInputStore = buildUserInputStore()

    const { View } = stepPromptsViewModel(userInputStore)

    expect(View).toBe(RepoPathPrompt)
  })

  it('when the step is done, the view is the done message', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'done'

    const { View } = stepPromptsViewModel(userInputStore)

    expect(View).toBe(DoneMessage)
  })
})
