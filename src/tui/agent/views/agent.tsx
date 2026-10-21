import { Box, useStdout } from 'ink'
import { useReplKeys } from '../interactions/hooks/use-repl-keys.ts'
import { useResize } from '../interactions/hooks/use-resize.ts'
import { useSignalValue } from '../../use-signal-value.ts'
import { chatSession } from '../interactions/state.ts'
import { agentViewModel } from './agent-view-model.ts'
import { Chat } from './chat.tsx'
import { Header } from './header.tsx'
import { Input } from './input.tsx'
import type { AgentProps } from '../types.ts'

export const Agent = ({ session = chatSession }: AgentProps) => {
  const { stdout } = useStdout()
  const buffer = useSignalValue(session.buffer)
  const history = useSignalValue(session.history)
  const inputRows = useSignalValue(session.inputRows)
  const { columnWidth, rowHeight, chatRowHeight } = agentViewModel({
    stdout,
    state: { buffer, history, inputRows },
  })
  useResize(stdout, session)
  useReplKeys(session)
  return (
    <Box flexDirection="column" height={rowHeight} width={columnWidth}>
      <Header />
      <Chat history={history} height={chatRowHeight} width={columnWidth} />
      <Input buffer={buffer} height={inputRows} />
    </Box>
  )
}
