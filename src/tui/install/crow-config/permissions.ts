import { defaultCrowConfig } from '../../../domain/config.ts'
import type { InputBuffer } from '../../types.ts'

type PermissionsArguments = {
  readonly escalateRead: InputBuffer
  readonly escalateWrite: InputBuffer
}

const entries = (text: string) => {
  return text.split(',').map((entry) => entry.trim()).filter((entry) =>
    entry.length > 0
  )
}

const orDefault = (list: string[], defaultValue: string[]) => {
  if (list.length === 0) return defaultValue
  return list
}

const directoryList = (input: InputBuffer, defaultValue: string[]) => {
  return orDefault(entries(input.text), defaultValue)
}

export const buildPermissions = (
  { escalateRead, escalateWrite }: PermissionsArguments,
) => {
  const defaults = defaultCrowConfig().permissions
  return {
    ...defaults,
    escalateRead: directoryList(escalateRead, defaults.escalateRead),
    escalateWrite: directoryList(escalateWrite, defaults.escalateWrite),
  }
}
