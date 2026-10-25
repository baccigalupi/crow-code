import { describe, expect, it } from 'bun:test'
import { configViewModel } from '../../../../../src/tui/install/views/steps/config-view-model.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('configViewModel', () => {
  it('when the step is providerUrl, highlights the draft provider baseUrl', () => {
    const props = {
      step: 'providerUrl' as const,
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      escalateRead: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: insertText(emptyText(), 'd'),
      providerUrl: insertText(emptyText(), 'https://d'),
      providerCredentials: emptyText(),
      providers: [{ name: 'nous', url: 'https://n' }],
    }

    const viewModel = configViewModel(props)

    expect(viewModel.highlighted).toBe('"baseUrl": "https://d"')
  })

  it('when the step is providerName, highlights the draft provider name', () => {
    const props = {
      step: 'providerName' as const,
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      escalateRead: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: insertText(emptyText(), 'd'),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [{ name: 'nous', url: 'https://n' }],
    }

    const viewModel = configViewModel(props)

    expect(viewModel.highlighted).toBe('"name": "d",')
  })

  it('when the step is crowGlobalDirectory, highlights the crowGlobalDirectory line', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()
    const envFile = emptyText()

    const viewModel = configViewModel({
      step: 'crowGlobalDirectory',
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
    })

    expect(viewModel.before).toBe('{\n  ')
    expect(viewModel.highlighted).toBe('"crowGlobalDirectory": "~/.crow",')
  })

  it('when the step is envFile, highlights the envFile line', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()
    const envFile = emptyText()

    const viewModel = configViewModel({
      step: 'envFile',
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
    })

    expect(viewModel.highlighted).toBe('"envFile": "~/.crow/.env",')
  })

  it('when the step is ignore, highlights the ignore line', () => {
    const ignore = emptyText()

    const viewModel = configViewModel({
      step: 'ignore',
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      escalateRead: emptyText(),
      ignore,
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
    })

    expect(viewModel.highlighted).toBe('"ignore": [],')
  })

  it('when the step is ignore and paths are typed, highlights the whole ignore array', () => {
    const ignore = insertText(emptyText(), '.env')

    const viewModel = configViewModel({
      step: 'ignore',
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      escalateRead: emptyText(),
      ignore,
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
    })

    expect(viewModel.highlighted).toBe('"ignore": [\n      ".env"\n    ],')
  })

  it('when the step is additionalRead, highlights the additionalRead line', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()

    const viewModel = configViewModel({
      step: 'additionalRead',
      repoDirectory,
      globalDirectory,
      envFile: emptyText(),
      escalateRead: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
    })

    expect(viewModel.highlighted).toBe('"additionalRead": [],')
  })

  it('when the step is additionalWrite and a path is typed, highlights the whole additionalWrite array', () => {
    const additionalWrite = insertText(emptyText(), '/work')

    const viewModel = configViewModel({
      step: 'additionalWrite',
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      escalateRead: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite,
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
    })

    expect(viewModel.highlighted).toBe(
      '"additionalWrite": [\n      "/work"\n    ],',
    )
  })

  it('when the step is escalateRead, highlights the escalateRead line', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()

    const viewModel = configViewModel({
      step: 'escalateRead',
      repoDirectory,
      globalDirectory,
      envFile: emptyText(),
      escalateRead: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
    })

    expect(viewModel.highlighted).toBe('"escalateRead": [],')
  })

  it('when the step is escalateWrite, highlights the whole escalateWrite array', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()

    const viewModel = configViewModel({
      step: 'escalateWrite',
      repoDirectory,
      globalDirectory,
      envFile: emptyText(),
      escalateRead: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
    })

    expect(viewModel.highlighted).toBe(
      '"escalateWrite": [\n      "./dev",\n      "./agent"\n    ],',
    )
  })

  it('when the step is confirm, highlights nothing', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()
    const envFile = emptyText()

    const viewModel = configViewModel({
      step: 'confirm',
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
    })

    expect(viewModel.highlighted).toBe('')
    expect(viewModel.after).toBe('')
  })
})
