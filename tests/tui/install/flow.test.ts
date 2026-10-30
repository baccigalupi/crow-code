import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../src/tui/keypress.ts'
import { ConfirmStore } from '../../../src/tui/install/data-stores/confirm-store.ts'
import { DirectoriesStore } from '../../../src/tui/install/data-stores/directories-store.ts'
import { PermissionsStore } from '../../../src/tui/install/data-stores/permissions-store.ts'
import { ProvidersStore } from '../../../src/tui/install/data-stores/providers-store.ts'
import { InstallFlow } from '../../../src/tui/install/flow.ts'

describe('InstallFlow', () => {
  it('when built, has a panel for every install step', () => {
    const flow = new InstallFlow({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
      providers: new ProvidersStore(),
      confirm: new ConfirmStore(),
    })

    const panels = flow.panels()

    expect(Object.keys(panels)).toHaveLength(15)
  })

  it('when asked, confirm goes to completeSetup and has no cancel', () => {
    const flow = new InstallFlow({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
      providers: new ProvidersStore(),
      confirm: new ConfirmStore(),
    })

    const panels = flow.panels()

    expect(panels.confirm.next).toBe('completeSetup')
    expect(panels.confirm.cancel).toBeUndefined()
  })

  it('when asked, completeSetup and done go nowhere', () => {
    const flow = new InstallFlow({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
      providers: new ProvidersStore(),
      confirm: new ConfirmStore(),
    })

    const panels = flow.panels()

    expect(panels.completeSetup.next).toBeUndefined()
    expect(panels.done.next).toBeUndefined()
  })

  it('when a key arrives on done, exits', () => {
    const flow = new InstallFlow({
      directories: new DirectoriesStore(),
      permissions: new PermissionsStore(),
      providers: new ProvidersStore(),
      confirm: new ConfirmStore(),
    })
    const panels = flow.panels()

    const outcome = panels.done.controller.handle(new Keypress('x', {}))

    expect(outcome).toBe('exit')
  })

  it('when a key arrives on completeSetup, stays and edits nothing', () => {
    const directories = new DirectoriesStore()
    const flow = new InstallFlow({
      directories,
      permissions: new PermissionsStore(),
      providers: new ProvidersStore(),
      confirm: new ConfirmStore(),
    })
    const panels = flow.panels()

    const outcome = panels.completeSetup.controller.handle(
      new Keypress('x', {}),
    )

    expect(outcome).toBe('stay')
    expect(directories.envFile.text.peek().text).toBe('')
  })
})
