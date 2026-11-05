import { describe, expect, it } from 'bun:test'
import { PermissionsStore } from '../../../../../src/tui/install/interactions/data-stores/permissions-store.ts'

describe('PermissionsStore', () => {
  it('when a permission is typed, values hold the typed text', () => {
    const permissions = new PermissionsStore()
    permissions.ignore.replace('.env')

    const values = permissions.values.peek()

    expect(values).toEqual({
      ignore: '.env',
      additionalRead: '',
      escalateRead: '',
      additionalWrite: '',
      escalateWrite: '',
      allowedLocalScripts: '',
    })
  })
})
