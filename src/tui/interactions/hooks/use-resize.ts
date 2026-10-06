import { useEffect, useReducer } from 'react'
import { chatSession } from '../state.ts'
import type { ChatSession } from '../state/chat-session.ts'

const bump = (count: number) => count + 1

const measure = (stdout: NodeJS.WriteStream, session: ChatSession) => {
  session.resize(stdout.columns || 80)
}

const watch = (
  stdout: NodeJS.WriteStream,
  session: ChatSession,
  rerender: () => void,
) => {
  measure(stdout, session)
  rerender()
}

const listen = (
  stdout: NodeJS.WriteStream,
  session: ChatSession,
  rerender: () => void,
) => {
  const onResize = () => watch(stdout, session, rerender)
  measure(stdout, session)
  stdout.on('resize', onResize)
  return () => {
    stdout.off('resize', onResize)
  }
}

export const useResize = (
  stdout: NodeJS.WriteStream,
  session: ChatSession = chatSession,
) => {
  const [, rerender] = useReducer(bump, 0)
  useEffect(() => listen(stdout, session, rerender), [stdout, session])
}
