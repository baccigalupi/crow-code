import { useApp, useInput, useStdin } from 'ink'
import { InstallKeys } from '../keys.ts'
import type { InstallKeysArgs } from '../../types.ts'

export const useInstallKeys = (args: InstallKeysArgs) => {
  const { exit } = useApp()
  const { isRawModeSupported } = useStdin()
  const keys = new InstallKeys(args, exit)
  useInput((input, key) => keys.handle(input, key), {
    isActive: isRawModeSupported,
  })
}
