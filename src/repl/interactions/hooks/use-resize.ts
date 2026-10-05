import { useEffect } from 'react'
import { updateRepl } from '../repl-state.ts'
import type { SetReplState } from '../../types.ts'

export const useResize = (
  stdout: NodeJS.WriteStream,
  setState: SetReplState,
) => {
  useEffect(() => {
    const onResize = () => {
      setState((state) =>
        updateRepl(state, { kind: 'resize' }, stdout.columns || 80)
      )
    }
    stdout.on('resize', onResize)
    return () => {
      stdout.off('resize', onResize)
    }
  }, [stdout, setState])
}
