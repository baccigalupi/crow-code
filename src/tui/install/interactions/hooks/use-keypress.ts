import { useApp, useInput, useStdin } from 'ink'
import { keypress } from '../keypress.ts'
import type { InstallStore } from '../../types.ts'

export const useKeypress = (installData: InstallStore) => {
  const { exit } = useApp()
  const { isRawModeSupported } = useStdin()
  useInput(
    (input, key) => keypress({ installData, exit, input, key }).handle(),
    { isActive: isRawModeSupported },
  )
}
