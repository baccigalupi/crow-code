import { recoveryPending } from './recovery-state.ts'

export type StopInput = {
  sessionId: string
  promptId: string
  stopHookActive: boolean
}

export const stopDecision = async (
  input: StopInput,
  projectDirectory: string,
) => {
  if (input.stopHookActive) return null
  const pending = await recoveryPending(
    projectDirectory,
    input.sessionId,
    input.promptId,
  )
  if (!pending) return null
  return { decision: 'block' }
}
