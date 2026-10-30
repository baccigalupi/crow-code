import { describe, expect, it } from 'bun:test'
import { TextPromptViewModel } from '../../../../src/tui/install/view-models/text-prompt-view-model.ts'
import { DirectoriesStore } from '../../../../src/tui/install/data-stores/directories-store.ts'
import { PermissionsStore } from '../../../../src/tui/install/data-stores/permissions-store.ts'
import { emptyText, insertText } from '../../../../src/tui/input-text.ts'

describe('TextPromptViewModel', () => {
  it('when the step is repo, asks for the local repo directory', () => {
    const viewModel = new TextPromptViewModel({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
    })

    const props = viewModel.props('repo', {
      repoDirectory: insertText(emptyText(), 'x'),
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
    })

    expect(props).toEqual({
      label: 'What directory for the local repo crow setup',
      input: { text: 'x', cursor: 1 },
      defaultValue: '.crow',
      bare: false,
    })
  })

  it('when the step is crowGlobalDirectory, asks for the user crow directory', () => {
    const viewModel = new TextPromptViewModel({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
    })

    const props = viewModel.props('crowGlobalDirectory', {
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
    })

    expect(props.label).toBe('User crow directory')
    expect(props.defaultValue).toBe('~/.crow')
    expect(props.bare).toBe(false)
  })

  it('when the step is envFile, defaults to .env inside the typed global directory', () => {
    const viewModel = new TextPromptViewModel({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
    })

    const props = viewModel.props('envFile', {
      repoDirectory: emptyText(),
      globalDirectory: insertText(emptyText(), '/secrets'),
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
    })

    expect(props.label).toBe('Credentials .env file')
    expect(props.defaultValue).toBe('/secrets/.env')
  })

  it('when the step is ignore, shows a bare JSON default', () => {
    const viewModel = new TextPromptViewModel({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
    })

    const props = viewModel.props('ignore', {
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
    })

    expect(props.label).toBe('Ignored paths')
    expect(props.defaultValue).toBe('[]')
    expect(props.bare).toBe(true)
  })

  it('when the step is additionalRead, labels it and shows a bare default', () => {
    const viewModel = new TextPromptViewModel({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
    })

    const props = viewModel.props('additionalRead', {
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
    })

    expect(props.label).toBe('Additional read directories')
    expect(props.bare).toBe(true)
  })

  it('when the step is additionalWrite, labels it and shows a bare default', () => {
    const viewModel = new TextPromptViewModel({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
    })

    const props = viewModel.props('additionalWrite', {
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
    })

    expect(props.label).toBe('Additional write directories')
    expect(props.bare).toBe(true)
  })

  it('when the step is escalateRead, labels it and shows a bare default', () => {
    const viewModel = new TextPromptViewModel({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
    })

    const props = viewModel.props('escalateRead', {
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
    })

    expect(props.label).toBe('Escalate read directories')
    expect(props.bare).toBe(true)
  })

  it('when the step is escalateWrite, shows the joined default in parentheses', () => {
    const viewModel = new TextPromptViewModel({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
    })

    const props = viewModel.props('escalateWrite', {
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
    })

    expect(props.label).toBe('Escalate write directories')
    expect(props.defaultValue).toBe('./dev, ./agent')
    expect(props.bare).toBe(false)
  })

  it('when the step is allowedLocalScripts, shows the joined default in parentheses', () => {
    const viewModel = new TextPromptViewModel({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
    })

    const props = viewModel.props('allowedLocalScripts', {
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
    })

    expect(props.label).toBe('Allowed local scripts')
    expect(props.defaultValue).toBe('./dev/*, ./agent/*')
    expect(props.bare).toBe(false)
  })
})
