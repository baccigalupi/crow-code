import type { ReplIo } from './types.ts'

export const tuiRendererConfig = (io: ReplIo) => ({
  stdin: io.stdin,
  stdout: io.stdout,
  exitOnCtrlC: false,
  exitSignals: [],
})
