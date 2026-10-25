import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { stepPromptsViewModel } from '../../../../src/tui/install/views/step-prompts-view-model.ts'
import { RepoPathPrompt } from '../../../../src/tui/install/views/steps/repo-path-prompt.tsx'
import { DoneMessage } from '../../../../src/tui/install/views/steps/done-message.tsx'
import { emptyText } from '../../../../src/tui/input-text.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('stepPromptsViewModel', () => {
  it('when the step is repo, the view is the repo path prompt', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      ignore: signal(emptyText()),
      additionalRead: signal(emptyText()),
      additionalWrite: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }

    const { View } = stepPromptsViewModel(installStore)

    expect(View).toBe(RepoPathPrompt)
  })

  it('when the step is done, the view is the done message', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      ignore: signal(emptyText()),
      additionalRead: signal(emptyText()),
      additionalWrite: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('done'),
      confirmation: signal(true),
    }

    const { View } = stepPromptsViewModel(installStore)

    expect(View).toBe(DoneMessage)
  })
})
