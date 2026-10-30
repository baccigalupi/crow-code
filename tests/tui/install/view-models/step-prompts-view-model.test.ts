import { describe, expect, it } from 'bun:test'
import { StepPromptsViewModel } from '../../../../src/tui/install/view-models/step-prompts-view-model.ts'
import { ConfirmPromptViewModel } from '../../../../src/tui/install/view-models/confirm-prompt-view-model.ts'
import { DoneMessageViewModel } from '../../../../src/tui/install/view-models/done-message-view-model.ts'
import { ProviderPromptViewModel } from '../../../../src/tui/install/view-models/provider-prompt-view-model.ts'
import { SetupProgressViewModel } from '../../../../src/tui/install/view-models/setup-progress-view-model.ts'
import { TextPromptViewModel } from '../../../../src/tui/install/view-models/text-prompt-view-model.ts'
import { DirectoriesStore } from '../../../../src/tui/install/data-stores/directories-store.ts'
import { PermissionsStore } from '../../../../src/tui/install/data-stores/permissions-store.ts'
import { emptyText } from '../../../../src/tui/input-text.ts'

describe('StepPromptsViewModel', () => {
  it('when the step is repo, gives the text prompt props', () => {
    const progress = new SetupProgressViewModel()
    const viewModel = new StepPromptsViewModel({
      text: new TextPromptViewModel({
        directories: new DirectoriesStore(),
        permissions: new PermissionsStore(),
      }),
      provider: new ProviderPromptViewModel(),
      confirm: new ConfirmPromptViewModel(),
      progress,
      done: new DoneMessageViewModel(progress),
    })

    const result = viewModel.props({
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
      step: 'repo',
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    })

    expect(result).toEqual({
      step: 'repo',
      props: {
        label: 'What directory for the local repo crow setup',
        input: { text: '', cursor: 0 },
        defaultValue: '.crow',
        bare: false,
      },
    })
  })

  it('when the step is a provider step, gives the provider prompt props', () => {
    const progress = new SetupProgressViewModel()
    const viewModel = new StepPromptsViewModel({
      text: new TextPromptViewModel({
        directories: new DirectoriesStore(),
        permissions: new PermissionsStore(),
      }),
      provider: new ProviderPromptViewModel(),
      confirm: new ConfirmPromptViewModel(),
      progress,
      done: new DoneMessageViewModel(progress),
    })

    const result = viewModel.props({
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
      providers: [{ name: 'nous', url: 'https://n' }],
      setupTasks: [],
      step: 'providerUrl',
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    })

    expect(result.step).toBe('providerUrl')
    expect(result.props).toMatchObject({ title: 'Provider 2' })
  })

  it('when the step is confirm, gives the selected index', () => {
    const progress = new SetupProgressViewModel()
    const viewModel = new StepPromptsViewModel({
      text: new TextPromptViewModel({
        directories: new DirectoriesStore(),
        permissions: new PermissionsStore(),
      }),
      provider: new ProviderPromptViewModel(),
      confirm: new ConfirmPromptViewModel(),
      progress,
      done: new DoneMessageViewModel(progress),
    })

    const result = viewModel.props({
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
      step: 'confirm',
      crowConfigPath: '.crow/config.json',
      confirmation: false,
    })

    expect(result).toEqual({ step: 'confirm', props: { selectedIndex: 1 } })
  })

  it('when the step is completeSetup, gives the progress rows', () => {
    const progress = new SetupProgressViewModel()
    const viewModel = new StepPromptsViewModel({
      text: new TextPromptViewModel({
        directories: new DirectoriesStore(),
        permissions: new PermissionsStore(),
      }),
      provider: new ProviderPromptViewModel(),
      confirm: new ConfirmPromptViewModel(),
      progress,
      done: new DoneMessageViewModel(progress),
    })

    const result = viewModel.props({
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
      setupTasks: [{ id: 'a', label: 'A', done: false, error: '' }],
      step: 'completeSetup',
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    })

    expect(result).toEqual({
      step: 'completeSetup',
      props: {
        rows: [{ id: 'a', label: 'A', done: false, error: '', indicator: '›' }],
      },
    })
  })

  it('when the step is done, gives the rows and the exit hint', () => {
    const progress = new SetupProgressViewModel()
    const viewModel = new StepPromptsViewModel({
      text: new TextPromptViewModel({
        directories: new DirectoriesStore(),
        permissions: new PermissionsStore(),
      }),
      provider: new ProviderPromptViewModel(),
      confirm: new ConfirmPromptViewModel(),
      progress,
      done: new DoneMessageViewModel(progress),
    })

    const result = viewModel.props({
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
      setupTasks: [{ id: 'a', label: 'A', done: true, error: '' }],
      step: 'done',
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    })

    expect(result.props).toMatchObject({ hint: 'Done! Press any key to exit' })
  })

  it('when the step has no prompt, gives empty props', () => {
    const progress = new SetupProgressViewModel()
    const viewModel = new StepPromptsViewModel({
      text: new TextPromptViewModel({
        directories: new DirectoriesStore(),
        permissions: new PermissionsStore(),
      }),
      provider: new ProviderPromptViewModel(),
      confirm: new ConfirmPromptViewModel(),
      progress,
      done: new DoneMessageViewModel(progress),
    })

    const result = viewModel.props({
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
      step: 'default' as 'repo',
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    })

    expect(result).toEqual({ step: 'default' as 'repo', props: {} })
  })
})
