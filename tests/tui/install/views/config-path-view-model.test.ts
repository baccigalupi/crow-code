import { describe, expect, it } from 'bun:test'
import { configPathViewModel } from '../../../../src/tui/install/views/config-path-view-model.ts'
import { emptyBuffer, insertText } from '../../../../src/tui/input-buffer.ts'

describe('config-path-view-model', () => {
  it('when no repo directory is typed, the path is in the default directory', () => {
    const inputs = {
      repoDirectory: emptyBuffer(),
      globalDirectory: emptyBuffer(),
      envFile: emptyBuffer(),
      escalateRead: emptyBuffer(),
      additionalRead: emptyBuffer(),
      escalateWrite: emptyBuffer(),
      allowedLocalScripts: emptyBuffer(),
    }

    const { crowConfigPath } = configPathViewModel(inputs)

    expect(crowConfigPath).toBe('.crow/config.json')
  })

  it('when a repo directory is typed, the path is inside it', () => {
    const inputs = {
      repoDirectory: insertText(emptyBuffer(), './lib'),
      globalDirectory: emptyBuffer(),
      envFile: emptyBuffer(),
      escalateRead: emptyBuffer(),
      additionalRead: emptyBuffer(),
      escalateWrite: emptyBuffer(),
      allowedLocalScripts: emptyBuffer(),
    }

    const { crowConfigPath } = configPathViewModel(inputs)

    expect(crowConfigPath).toBe('./lib/config.json')
  })
})
