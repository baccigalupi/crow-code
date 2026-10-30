import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DirectoriesStore } from '../../../../src/tui/install/data-stores/directories-store.ts'
import { PermissionsStore } from '../../../../src/tui/install/data-stores/permissions-store.ts'
import { TextFlow } from '../../../../src/tui/install/flow/text-flow.ts'

describe('TextFlow', () => {
  describe('next', () => {
    it('when asked, the directory prompts chain to the permission prompts', () => {
      const flow = new TextFlow({
        directories: new DirectoriesStore(),
        permissions: new PermissionsStore(),
      })

      const panels = flow.panels()

      expect(panels['repo'].next).toBe('crowGlobalDirectory')
      expect(panels.crowGlobalDirectory.next).toBe('envFile')
      expect(panels.envFile.next).toBe('ignore')
    })

    it('when asked, the permission prompts chain on', () => {
      const flow = new TextFlow({
        directories: new DirectoriesStore(),
        permissions: new PermissionsStore(),
      })

      const panels = flow.panels()

      expect(panels.ignore.next).toBe('additionalRead')
      expect(panels.additionalRead.next).toBe('additionalWrite')
      expect(panels.additionalWrite.next).toBe('escalateRead')
      expect(panels.escalateRead.next).toBe('escalateWrite')
      expect(panels.escalateWrite.next).toBe('allowedLocalScripts')
    })

    it('when asked, the last prompt hands over to the provider form', () => {
      const flow = new TextFlow({
        directories: new DirectoriesStore(),
        permissions: new PermissionsStore(),
      })

      const panels = flow.panels()

      expect(panels.allowedLocalScripts.next).toBe('providerName')
    })
  })

  describe('fields', () => {
    it('when a key arrives on repo, types into the repo directory', () => {
      const directories = new DirectoriesStore()
      const panels = new TextFlow({
        directories,
        permissions: new PermissionsStore(),
      }).panels()

      panels['repo'].controller.handle(new Keypress('x', {}))

      expect(directories.repoDirectory.text.peek().text).toBe('x')
    })

    it('when a key arrives on the global directory, types into it', () => {
      const directories = new DirectoriesStore()
      const panels = new TextFlow({
        directories,
        permissions: new PermissionsStore(),
      }).panels()

      panels.crowGlobalDirectory.controller.handle(new Keypress('x', {}))

      expect(directories.globalDirectory.text.peek().text).toBe('x')
    })

    it('when a key arrives on a permission prompt, types into its field', () => {
      const permissions = new PermissionsStore()
      const panels = new TextFlow({
        directories: new DirectoriesStore(),
        permissions,
      }).panels()

      panels.escalateRead.controller.handle(new Keypress('x', {}))

      expect(permissions.escalateRead.text.peek().text).toBe('x')
    })
  })
})
