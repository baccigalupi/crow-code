import { useEffect } from 'react'
import { updateRepl } from '../repl-state.ts'
import type { SetReplState } from '../../types.ts'

const handleResize = (
  stdout: NodeJS.WriteStream,
  setState: SetReplState,
) => {
  setState((state) =>
    updateRepl(state, { kind: 'resize' }, stdout.columns || 80)
  )
}

const unsubscribe = (
  stdout: NodeJS.WriteStream,
  onResize: () => void,
) => {
  stdout.off('resize', onResize)
}

export const useResize = (
  stdout: NodeJS.WriteStream,
  setState: SetReplState,
) => {
  useEffect(() => {
    const onResize = () => handleResize(stdout, setState)
    stdout.on('resize', onResize)
    return () => unsubscribe(stdout, onResize)
  }, [stdout, setState])
}
