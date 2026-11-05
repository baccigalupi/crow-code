import { defaultCrowConfig } from '../../../../domain/config.ts'
import type { PermissionInputs } from '../types.ts'

const entries = (text: string) => {
  return text
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

const orDefault = (paths: string[], defaultValue: string[]) => {
  if (paths.length === 0) return defaultValue
  return paths
}

const directoryArray = (input: string, defaultValue: string[]) => {
  return orDefault(entries(input), defaultValue)
}

const defaultPermissions = () => defaultCrowConfig().permissions

const readArrays = ({
  ignore,
  additionalRead,
  escalateRead,
}: PermissionInputs) => {
  const defaults = defaultPermissions()
  return {
    ignore: directoryArray(ignore, defaults.ignore),
    additionalRead: directoryArray(additionalRead, defaults.additionalRead),
    escalateRead: directoryArray(escalateRead, defaults.escalateRead),
  }
}

const writeArrays = ({
  additionalWrite,
  escalateWrite,
  allowedLocalScripts: scripts,
}: PermissionInputs) => {
  const defaults = defaultPermissions()
  return {
    additionalWrite: directoryArray(additionalWrite, defaults.additionalWrite),
    escalateWrite: directoryArray(escalateWrite, defaults.escalateWrite),
    allowedLocalScripts: directoryArray(scripts, defaults.allowedLocalScripts),
  }
}

export const buildPermissions = (inputs: PermissionInputs) => {
  return {
    ...defaultPermissions(),
    ...readArrays(inputs),
    ...writeArrays(inputs),
  }
}
