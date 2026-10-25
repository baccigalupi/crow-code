import { describe, expect, it } from 'bun:test'
import { stepPromptsViewModel } from '../../../../src/tui/install/views/step-prompts-view-model.ts'
import { RepoPathPrompt } from '../../../../src/tui/install/views/steps/repo-path-prompt.tsx'
import { DoneMessage } from '../../../../src/tui/install/views/steps/done-message.tsx'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('stepPromptsViewModel', () => {
  it('when the step is repo, the view is the repo path prompt', () => {
    const installStore = buildInstallStore()

    const { View } = stepPromptsViewModel(installStore)

    expect(View).toBe(RepoPathPrompt)
  })

  it('when the step is done, the view is the done message', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'done'

    const { View } = stepPromptsViewModel(installStore)

    expect(View).toBe(DoneMessage)
  })
})
