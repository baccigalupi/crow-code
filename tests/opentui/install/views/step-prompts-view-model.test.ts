import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import {
  noView,
  stepPromptsViewModel,
} from '../../../../src/opentui/install/views/step-prompts-view-model.ts'
import { emptyText } from '../../../../src/opentui/input-text.ts'
import type { InstallStep } from '../../../../src/opentui/install/types.ts'

describe('stepPromptsViewModel', () => {
  it('when the step has a registered view, the view is that view', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }
    const RepoView = () => null

    const { View } = stepPromptsViewModel(installStore, { repo: RepoView })

    expect(View).toBe(RepoView)
  })

  it('when the step has no registered view, the view renders nothing', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('write'),
      confirmation: signal(true),
    }

    const { View } = stepPromptsViewModel(installStore, {})

    expect(View).toBe(noView)
  })
})
