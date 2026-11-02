import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { EnvFilePanel } from '../../../../src/tui/install/panels/env-file.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('EnvFilePanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new EnvFilePanel()

    const { name } = panel

    expect(name).toBe('envFile')
    expect(panel.next).toBe('ignore')
  })

  it('when a key is typed, its controller edits the env file', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new EnvFilePanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.directories.envFile.text.peek().text).toBe('x')
  })

  it('when nothing is typed, its view model defaults to .env inside the global directory', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.directories.globalDirectory.insert('/g')
    const viewModel = new EnvFilePanel().viewModel(store)

    const props = viewModel.props(store.stepValues.peek())

    expect(props.label).toBe('Credentials .env file')
    expect(props.defaultValue).toBe('/g/.env')
    expect(props.bare).toBe(false)
  })
})
