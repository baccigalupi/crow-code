import { describe, expect, it } from 'bun:test'
import { buildPermissions } from '../../../../../src/tui/install/crow-config/from-inputs/permissions.ts'

describe('buildPermissions', () => {
  it('when the inputs are empty, escalate directories default', () => {
    const additionalRead = ''
    const escalateRead = ''
    const escalateWrite = ''
    const allowedLocalScripts = ''

    const permissions = buildPermissions({
      ignore: '',
      additionalRead,
      additionalWrite: '',
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.escalateRead).toEqual([])
    expect(permissions.escalateWrite).toEqual(['./dev', './agent'])
  })

  it('when the inputs are comma separated, escalate directories are trimmed entries', () => {
    const additionalRead = ''
    const escalateRead = ' /docs ,~/notes,'
    const escalateWrite = './scripts'
    const allowedLocalScripts = ''

    const permissions = buildPermissions({
      ignore: '',
      additionalRead,
      additionalWrite: '',
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.escalateRead).toEqual(['/docs', '~/notes'])
    expect(permissions.escalateWrite).toEqual(['./scripts'])
  })

  it('when allowedLocalScripts input is empty, it is the default globs', () => {
    const additionalRead = ''
    const escalateRead = ''
    const escalateWrite = ''
    const allowedLocalScripts = ''

    const permissions = buildPermissions({
      ignore: '',
      additionalRead,
      additionalWrite: '',
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.allowedLocalScripts).toEqual(['./dev/*', './agent/*'])
  })

  it('when allowedLocalScripts input is comma separated, it is trimmed entries', () => {
    const additionalRead = ''
    const escalateRead = ''
    const escalateWrite = ''
    const allowedLocalScripts = './a.sh, ./b.sh'

    const permissions = buildPermissions({
      ignore: '',
      additionalRead,
      additionalWrite: '',
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.allowedLocalScripts).toEqual(['./a.sh', './b.sh'])
  })

  it('when additionalRead input is empty, it is the default empty list', () => {
    const additionalRead = ''
    const escalateRead = ''
    const escalateWrite = ''
    const allowedLocalScripts = ''

    const permissions = buildPermissions({
      ignore: '',
      additionalRead,
      additionalWrite: '',
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.additionalRead).toEqual([])
  })

  it('when additionalRead input is comma separated, it is trimmed entries', () => {
    const additionalRead = ' /docs ,~/notes,'
    const escalateRead = ''
    const escalateWrite = ''
    const allowedLocalScripts = ''

    const permissions = buildPermissions({
      ignore: '',
      additionalRead,
      additionalWrite: '',
      escalateRead,
      escalateWrite,
      allowedLocalScripts,
    })

    expect(permissions.additionalRead).toEqual(['/docs', '~/notes'])
  })

  it('when additionalWrite input is empty, it is the default empty list', () => {
    const additionalWrite = ''

    const permissions = buildPermissions({
      ignore: '',
      additionalRead: '',
      additionalWrite,
      escalateRead: '',
      escalateWrite: '',
      allowedLocalScripts: '',
    })

    expect(permissions.additionalWrite).toEqual([])
  })

  it('when additionalWrite input is comma separated, it is trimmed entries', () => {
    const additionalWrite = ' /docs ,~/work,'

    const permissions = buildPermissions({
      ignore: '',
      additionalRead: '',
      additionalWrite,
      escalateRead: '',
      escalateWrite: '',
      allowedLocalScripts: '',
    })

    expect(permissions.additionalWrite).toEqual(['/docs', '~/work'])
  })

  it('when ignore input is empty, it is the default empty list', () => {
    const ignore = ''

    const permissions = buildPermissions({
      ignore,
      additionalRead: '',
      additionalWrite: '',
      escalateRead: '',
      escalateWrite: '',
      allowedLocalScripts: '',
    })

    expect(permissions.ignore).toEqual([])
  })

  it('when ignore input is comma separated, it is trimmed entries', () => {
    const ignore = ' .env ,secrets/,'

    const permissions = buildPermissions({
      ignore,
      additionalRead: '',
      additionalWrite: '',
      escalateRead: '',
      escalateWrite: '',
      allowedLocalScripts: '',
    })

    expect(permissions.ignore).toEqual(['.env', 'secrets/'])
  })
})
