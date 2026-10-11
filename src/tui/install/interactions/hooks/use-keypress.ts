import { useApp, useInput, useStdin } from 'ink'
import { keypress } from '../keypress.ts'
import type { KeypressSignals } from '../../types.ts'

export const useKeypress = (signals: KeypressSignals) => {
  const { exit } = useApp()
  const { isRawModeSupported } = useStdin()
  useInput((input, key) => keypress({ signals, exit, input, key }).handle(), {
    isActive: isRawModeSupported,
  })
}
