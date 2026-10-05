import { useApp, useInput, useStdin } from 'ink'
import type { Key } from 'ink'
import { keyToAction } from '../keymap.ts'
import { updateRepl } from '../repl-state.ts'
import type { SetReplState } from '../../types.ts'

const onInput = (
  input: string,
  key: Key,
  setState: SetReplState,
  columns: number,
  exit: () => void,
) => {
  const action = keyToAction(input, key)
  if (!action) return
  if (action.kind === 'quit') {
    exit()
    return
  }
  setState((state) => updateRepl(state, action, columns))
}

export const useReplKeys = (setState: SetReplState, columns: number) => {
  const { exit } = useApp()
  const { isRawModeSupported } = useStdin()
  useInput(
    (input, key) => onInput(input, key, setState, columns, exit),
    { isActive: isRawModeSupported },
  )
}
