import { describe, expect, it } from 'bun:test'
import { ConfigPanelViewModel } from '../../../../../src/tui/install/panels/config-preview/view-model.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('ConfigPanelViewModel', () => {
  it('when the step is repo, hides the panel', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props(
      {
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
      },
      { key: 'repo' },
    )

    expect(props.visible).toBe(false)
  })

  it('when the highlight is envFile, shows the config path and highlights the env file line', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props(
      {
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
      },
      { key: 'envFile' },
    )

    expect(props.visible).toBe(true)
    expect(props.crowConfigPath).toBe('.crow/config.json')
    expect(props.highlighted).toBe('"envFile": "/secrets/crow.env",')
  })

  it('when the highlight is the last baseUrl, highlights the last provider base url', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props(
      {
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
      },
      { key: 'baseUrl', occurrence: 'last' },
    )

    expect(props.highlighted).toBe('"baseUrl": "http://second"')
  })

  it('when the highlight is the last name, highlights the last provider name', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props(
      {
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
      },
      { key: 'name', occurrence: 'last' },
    )

    expect(props.highlighted).toBe('"name": "second",')
  })

  it('when the highlight is ignore and paths are typed, highlights the whole array', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props(
      {
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
      },
      { key: 'ignore' },
    )

    expect(props.highlighted).toBe('"ignore": [\n      ".env"\n    ],')
  })

  it('when the highlight key is not in the config, highlights nothing', () => {
    const viewModel = new ConfigPanelViewModel()

    const props = viewModel.props(
      {
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
      },
      { key: 'confirm' },
    )

    expect(props.highlighted).toBe('')
  })
})
