import { describe, expect, it } from 'bun:test'
import { ConfigPanelViewModel } from '../../../../src/tui/install/view-models/config-panel-view-model.ts'
import { emptyText, insertText } from '../../../../src/tui/input-text.ts'

describe('ConfigPanelViewModel', () => {
  it('when the step is repo, hides the panel', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props({
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

  it('when the step is envFile, shows the config path and highlights the env file line', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props({
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: insertText(emptyText(), '/secrets/crow.env'),
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
      step: 'envFile',
    })

    expect(props.visible).toBe(true)
    expect(props.crowConfigPath).toBe('.crow/config.json')
    expect(props.highlighted).toBe('"envFile": "/secrets/crow.env",')
  })

  it('when the step is providerUrl, highlights the last provider base url', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props({
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: insertText(emptyText(), 'second'),
      providerUrl: insertText(emptyText(), 'http://second'),
      providerCredentials: emptyText(),
      providers: [{ name: 'first', url: 'http://first' }],
      step: 'providerUrl',
    })

    expect(props.highlighted).toBe('"baseUrl": "http://second"')
  })

  it('when the step is providerName, highlights the last provider name', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props({
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: insertText(emptyText(), 'second'),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [{ name: 'first', url: 'http://first' }],
      step: 'providerName',
    })

    expect(props.highlighted).toBe('"name": "second",')
  })

  it('when the step is ignore and paths are typed, highlights the whole array', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props({
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      ignore: insertText(emptyText(), '.env'),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
      step: 'ignore',
    })

    expect(props.highlighted).toBe('"ignore": [\n      ".env"\n    ],')
  })

  it('when the step is confirm, highlights nothing', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props({
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
      step: 'confirm',
    })

    expect(props.highlighted).toBe('')
  })
})
