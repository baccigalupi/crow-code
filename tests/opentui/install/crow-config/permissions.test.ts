import { describe, expect, it } from 'bun:test'
import { buildPermissions } from '../../../../src/opentui/install/crow-config/permissions.ts'
import { emptyText, insertText } from '../../../../src/opentui/input-text.ts'

describe('buildPermissions', () => {
  it('when the inputs are empty, escalate directories default', () => {
    const additionalRead = emptyText()
    const escalateRead = emptyText()
    const escalateWrite = emptyText()
    const allowedLocalScripts = emptyText()

    const permissions = buildPermissions({
      additionalRead,
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.escalateRead).toEqual([])
    expect(permissions.escalateWrite).toEqual(['./dev', './agent'])
  })

  it('when the inputs are comma separated, escalate directories are trimmed entries', () => {
    const additionalRead = emptyText()
    const escalateRead = insertText(emptyText(), ' /docs ,~/notes,')
    const escalateWrite = insertText(emptyText(), './scripts')
    const allowedLocalScripts = emptyText()

    const permissions = buildPermissions({
      additionalRead,
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.escalateRead).toEqual(['/docs', '~/notes'])
    expect(permissions.escalateWrite).toEqual(['./scripts'])
  })

  it('when allowedLocalScripts input is empty, it is the default globs', () => {
    const additionalRead = emptyText()
    const escalateRead = emptyText()
    const escalateWrite = emptyText()
    const allowedLocalScripts = emptyText()

    const permissions = buildPermissions({
      additionalRead,
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.allowedLocalScripts).toEqual(['./dev/*', './agent/*'])
  })

  it('when allowedLocalScripts input is comma separated, it is trimmed entries', () => {
    const additionalRead = emptyText()
    const escalateRead = emptyText()
    const escalateWrite = emptyText()
    const allowedLocalScripts = insertText(emptyText(), './a.sh, ./b.sh')

    const permissions = buildPermissions({
      additionalRead,
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.allowedLocalScripts).toEqual(['./a.sh', './b.sh'])
  })

  it('when additionalRead input is empty, it is the default empty list', () => {
    const additionalRead = emptyText()
    const escalateRead = emptyText()
    const escalateWrite = emptyText()
    const allowedLocalScripts = emptyText()

    const permissions = buildPermissions({
      additionalRead,
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.additionalRead).toEqual([])
  })

  it('when additionalRead input is comma separated, it is trimmed entries', () => {
    const additionalRead = insertText(emptyText(), ' /docs ,~/notes,')
    const escalateRead = emptyText()
    const escalateWrite = emptyText()
    const allowedLocalScripts = emptyText()

    const permissions = buildPermissions({
      additionalRead,
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.additionalRead).toEqual(['/docs', '~/notes'])
  })
})
