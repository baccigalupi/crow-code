import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { RepoPanel } from '../../../../src/tui/install/panels/repo.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('RepoPanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new RepoPanel()

    const { name } = panel

    expect(name).toBe('repo')
    expect(panel.next).toBe('crowGlobalDirectory')
    expect(panel.cancel).toBeUndefined()
  })

  it('when a key is typed, its controller edits the repo directory', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new RepoPanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.directories.repoDirectory.text.peek().text).toBe('x')
  })

  it('when return is pressed, its controller moves on', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new RepoPanel().controller(store)

    const outcome = controller.handle(new Keypress('', { return: true }))

    expect(outcome).toBe('next')
  })

  it('when nothing is typed, its view model shows the question and the default', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new RepoPanel().viewModel(store)

    const props = viewModel.props(store.stepValues.peek())

    expect(props).toEqual({
      label: 'What directory for the local repo crow setup',
      input: { text: '', cursor: 0 },
      defaultValue: '.crow',
      bare: false,
    })
  })
})
