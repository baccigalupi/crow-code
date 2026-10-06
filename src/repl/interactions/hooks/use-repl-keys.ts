import { useApp, useInput, useStdin } from 'ink'
import { keyToAction } from '../keymap.ts'
import { updateRepl } from '../repl-state.ts'
import type { ReplAction, SetReplState } from '../../types.ts'

const handleInput = (
  action: ReplAction | null | undefined,
  setState: SetReplState,
  columns: number,
  exit: () => void,
) => {
  if (!action) return
  if (action.kind === 'quit') {
    exit()
  } else {
    setState((state) => updateRepl(state, action, columns))
  }
}

export const useReplKeys = (setState: SetReplState, columns: number) => {
  const { exit } = useApp()
  const { isRawModeSupported } = useStdin()
  useInput(
    (input, _key) =>
      handleInput(keyToAction(input, _key), setState, columns, exit),
    { isActive: isRawModeSupported },
  )
}
