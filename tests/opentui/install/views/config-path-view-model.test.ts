import { describe, expect, it } from 'bun:test'
import { configPathViewModel } from '../../../../src/opentui/install/views/config-path-view-model.ts'
import { emptyText, insertText } from '../../../../src/opentui/input-text.ts'

describe('config-path-view-model', () => {
  it('when no repo directory is typed, the path is in the default directory', () => {
    const inputs = {
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    }

    const { crowConfigPath } = configPathViewModel(inputs)

    expect(crowConfigPath).toBe('.crow/config.json')
  })

  it('when a repo directory is typed, the path is inside it', () => {
    const inputs = {
      repoDirectory: insertText(emptyText(), './lib'),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    }

    const { crowConfigPath } = configPathViewModel(inputs)

    expect(crowConfigPath).toBe('./lib/config.json')
  })
})
