import { describe, expect, it } from 'bun:test'
import { PermissionsStore } from '../../../../src/tui/install/data-stores/permissions-store.ts'

describe('PermissionsStore', () => {
  it('when built, shows an empty list default as JSON', () => {
    const permissions = new PermissionsStore()

    const defaultText = permissions.defaultIgnore

    expect(defaultText).toBe('[]')
  })

  it('when built, shows the escalate write default joined', () => {
    const permissions = new PermissionsStore()

    const defaultText = permissions.defaultEscalateWrite

    expect(defaultText).toBe('./dev, ./agent')
  })

  it('when built, shows the allowed local scripts default joined', () => {
    const permissions = new PermissionsStore()

    const defaultText = permissions.defaultAllowedLocalScripts

    expect(defaultText).toBe('./dev/*, ./agent/*')
  })
})
