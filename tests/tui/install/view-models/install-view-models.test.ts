import { describe, expect, it } from 'bun:test'
import { InstallViewModels } from '../../../../src/tui/install/view-models/install-view-models.ts'
import { DirectoriesStore } from '../../../../src/tui/install/data-stores/directories-store.ts'
import { PermissionsStore } from '../../../../src/tui/install/data-stores/permissions-store.ts'
import { emptyText } from '../../../../src/tui/input-text.ts'

describe('InstallViewModels', () => {
  it('when asked for the config panel, hides it on the first step', () => {
    const viewModels = new InstallViewModels({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
    })

    const props = viewModels.configPanel().props({
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
      step: 'repo',
    })

    expect(props.visible).toBe(false)
  })

  it('when asked for the step prompts, gives the default of the stores it was built with', () => {
    const viewModels = new InstallViewModels({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
    })

    const result = viewModels.stepPrompts().props({
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
      setupTasks: [],
      step: 'escalateWrite',
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    })

    expect(result.props).toMatchObject({ defaultValue: './dev, ./agent' })
  })
})
