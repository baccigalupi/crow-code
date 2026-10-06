import { useState } from 'react'
import { Box, useStdout } from 'ink'
import { useReplKeys } from '../interactions/hooks/use-repl-keys.ts'
import { useResize } from '../interactions/hooks/use-resize.ts'
import { initialReplState } from '../interactions/repl-state.ts'
import { appViewModel } from './app-view-model.ts'
import { Chat } from './chat.tsx'
import { Header } from './header.tsx'
import { Input } from './input.tsx'

export const App = () => {
  const { stdout } = useStdout()
  const [state, setState] = useState(initialReplState)
  const { columnWidth, rowHeight, chatRowHeight, history, buffer, inputRows } =
    appViewModel({ stdout, state })
  useResize(stdout, setState)
  useReplKeys(setState, columnWidth)
  return (
    <Box flexDirection='column' height={rowHeight} width={columnWidth}>
      <Header />
      <Chat history={history} height={chatRowHeight} width={columnWidth} />
      <Input buffer={buffer} height={inputRows} />
    </Box>
  )
}
