import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import {
  noView,
  stepPromptsViewModel,
} from '../../../../src/opentui/install/views/step-prompts-view-model.ts'
import { emptyBuffer } from '../../../../src/tui/input-buffer.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('stepPromptsViewModel', () => {
  it('when the step has a registered view, the view is that view', () => {
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
    const RepoView = () => null

    const { View } = stepPromptsViewModel(installStore, { repo: RepoView })

    expect(View).toBe(RepoView)
  })

  it('when the step has no registered view, the view renders nothing', () => {
    const installStore = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('write'),
      confirmation: signal(true),
    }

    const { View } = stepPromptsViewModel(installStore, {})

    expect(View).toBe(noView)
  })
})
