import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { AllowedLocalScriptsPanel } from '../../../../src/tui/install/permissions/allowed-local-scripts.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('AllowedLocalScriptsPanel', () => {
  it('when asked, names itself and hands over to the provider form', () => {
    const panel = new AllowedLocalScriptsPanel()

    const { name } = panel

    expect(name).toBe('allowedLocalScripts')
    expect(panel.next).toBe('providerName')
  })

  it('when a key is typed, its controller edits the allowed local scripts', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new AllowedLocalScriptsPanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.permissions.allowedLocalScripts.text.peek().text).toBe('x')
  })

  it('when nothing is typed, it shows the question and a parenthesised default', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const panel = new AllowedLocalScriptsPanel()

    const defaultValue = panel.defaultValue(store)

    expect(panel.label).toBe('Allowed local scripts')
    expect(defaultValue).toBe(store.permissions.defaultAllowedLocalScripts)
    expect(panel.bare).toBe(false)
  })
})
