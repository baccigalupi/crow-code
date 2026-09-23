import { pruneRecovery, recordRecovery } from './recovery-state.ts'

export type RecoveryIds = { sessionId: string; promptId: string }

// deno-lint-ignore no-explicit-any
const payloadId = (payload: any, key: string) => {
  if (typeof payload !== 'object' || payload === null) return ''
  if (typeof payload[key] !== 'string') return ''
  return payload[key]
}

// deno-lint-ignore no-explicit-any
export const recoveryIds = (payload: any) => ({
  sessionId: payloadId(payload, 'session_id'),
  promptId: payloadId(payload, 'prompt_id'),
})

export const tryRecordRecovery = async (
  projectDirectory: string | undefined,
  ids: RecoveryIds,
) => {
  if (projectDirectory === undefined) return
  if (ids.sessionId === '') return
  try {
    await recordRecovery(projectDirectory, ids.sessionId, ids.promptId)
  } catch {
    return
  }
}

export const tryPruneRecovery = async (
  projectDirectory: string | undefined,
  ids: RecoveryIds,
) => {
  if (projectDirectory === undefined) return
  if (ids.sessionId === '') return
  try {
    await pruneRecovery(projectDirectory, ids.sessionId, ids.promptId)
  } catch {
    return
  }
}
