import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { buildPermissions } from '../../../../src/tui/install/crow-config/permissions.ts'
import { emptyBuffer, insertText } from '../../../../src/tui/input-buffer.ts'

describe('buildPermissions', () => {
  it('when the inputs are empty, escalate directories default', () => {
    const escalateRead = emptyBuffer()
    const escalateWrite = emptyBuffer()
    const allowedLocalScripts = emptyBuffer()

    const permissions = buildPermissions({
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.escalateRead).toEqual([])
    expect(permissions.escalateWrite).toEqual(['./dev', './agent'])
  })

  it('when the inputs are comma separated, escalate directories are trimmed entries', () => {
    const escalateRead = insertText(emptyBuffer(), ' /docs ,~/notes,')
    const escalateWrite = insertText(emptyBuffer(), './scripts')
    const allowedLocalScripts = emptyBuffer()

    const permissions = buildPermissions({
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.escalateRead).toEqual(['/docs', '~/notes'])
    expect(permissions.escalateWrite).toEqual(['./scripts'])
  })

  it('when allowedLocalScripts input is empty, it is the default globs', () => {
    const escalateRead = emptyBuffer()
    const escalateWrite = emptyBuffer()
    const allowedLocalScripts = emptyBuffer()

    const permissions = buildPermissions({
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.allowedLocalScripts).toEqual(['./dev/*', './agent/*'])
  })

  it('when allowedLocalScripts input is comma separated, it is trimmed entries', () => {
    const escalateRead = emptyBuffer()
    const escalateWrite = emptyBuffer()
    const allowedLocalScripts = insertText(emptyBuffer(), './a.sh, ./b.sh')

    const permissions = buildPermissions({
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.allowedLocalScripts).toEqual(['./a.sh', './b.sh'])
  })
})
