import { defaultCrowConfig } from '../../../domain/config.ts'
import type { InputBuffer } from '../../types.ts'
import type { PermissionInputs } from '../types.ts'

const entries = (text: string) => {
  return text
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

const orDefault = (list: string[], defaultValue: string[]) => {
  if (list.length === 0) return defaultValue
  return list
}

const directoryList = (input: InputBuffer, defaultValue: string[]) => {
  return orDefault(entries(input.text), defaultValue)
}

const defaultPermissions = () => defaultCrowConfig().permissions

const readLists = ({ additionalRead, escalateRead }: PermissionInputs) => {
  const defaults = defaultPermissions()
  return {
    additionalRead: directoryList(additionalRead, defaults.additionalRead),
    escalateRead: directoryList(escalateRead, defaults.escalateRead),
  }
}

const writeLists = ({
  escalateWrite,
  allowedLocalScripts: scripts,
}: PermissionInputs) => {
  const defaults = defaultPermissions()
  return {
    escalateWrite: directoryList(escalateWrite, defaults.escalateWrite),
    allowedLocalScripts: directoryList(scripts, defaults.allowedLocalScripts),
  }
}

export const buildPermissions = (inputs: PermissionInputs) => {
  return {
    ...defaultPermissions(),
    ...readLists(inputs),
    ...writeLists(inputs),
  }
}
