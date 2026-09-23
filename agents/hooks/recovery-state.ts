const stateDirectory = (projectDirectory: string) =>
  `${projectDirectory}/.devin/state`

const markerName = (sessionId: string, promptId: string) =>
  `${sessionId}-${promptId}`.replaceAll('/', '_')

const markerPath = (
  projectDirectory: string,
  sessionId: string,
  promptId: string,
) => `${stateDirectory(projectDirectory)}/${markerName(sessionId, promptId)}`

export const recordRecovery = async (
  projectDirectory: string,
  sessionId: string,
  promptId: string,
) => {
  await Deno.mkdir(stateDirectory(projectDirectory), { recursive: true })
  await Deno.writeTextFile(
    markerPath(projectDirectory, sessionId, promptId),
    '',
  )
}

export const recoveryPending = async (
  projectDirectory: string,
  sessionId: string,
  promptId: string,
) => {
  try {
    await Deno.stat(markerPath(projectDirectory, sessionId, promptId))
    return true
  } catch {
    return false
  }
}

export const pruneRecovery = async (
  projectDirectory: string,
  sessionId: string,
  promptId: string,
) => {
  const keep = markerName(sessionId, promptId)
  for await (const entry of Deno.readDir(stateDirectory(projectDirectory))) {
    if (entry.name !== keep) {
      await Deno.remove(`${stateDirectory(projectDirectory)}/${entry.name}`)
    }
  }
}
