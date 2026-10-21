import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { signal } from '@preact/signals-core'
import { emptyBuffer } from '../../../../src/tui/input-buffer.ts'
import { stepPromptsViewModel } from '../../../../src/tui/install/views/step-prompts-view-model.ts'
import { RepoPathPrompt } from '../../../../src/tui/install/views/steps/repo-path-prompt.tsx'
import { DoneMessage } from '../../../../src/tui/install/views/steps/done-message.tsx'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('stepPromptsViewModel', () => {
  it('when the step is repo, the view is the repo path prompt', () => {
    const installStore = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }

    const { View } = stepPromptsViewModel(installStore)

    expect(View).toBe(RepoPathPrompt)
  })

  it('when the step is done, the view is the done message', () => {
    const installStore = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('done'),
      confirmation: signal(true),
    }

    const { View } = stepPromptsViewModel(installStore)

    expect(View).toBe(DoneMessage)
  })
})
