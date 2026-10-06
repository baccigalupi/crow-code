import { useApp, useInput, useStdin } from 'ink'
import { Keymap } from '../keymap.ts'
import { chatSession } from '../state.ts'
import type { ChatSession } from '../state/chat-session.ts'

export const useReplKeys = (session: ChatSession = chatSession) => {
  const { exit } = useApp()
  const { isRawModeSupported } = useStdin()
  const keymap = new Keymap(exit, session)
  useInput((input, key) => keymap.handle(input, key), {
    isActive: isRawModeSupported,
  })
}
