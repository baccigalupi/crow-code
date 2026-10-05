import { PassThrough, Writable } from 'node:stream'
import { spy } from '@std/testing/mock'
import type { ReplIo } from '../../src/repl/types.ts'

export type MockTerminalOptions = {
  columns?: number
  rows?: number
  tty?: boolean
  rawMode?: boolean
}

const voidWrite = (
  _chunk: unknown,
  _encoding: string,
  callback: () => void,
) => {
  callback()
}

const mockStdin = (tty: boolean, rawMode: boolean) => {
  const stdin = new PassThrough()
  Object.assign(stdin, { isTTY: tty, ref: () => {}, unref: () => {} })
  if (rawMode) Object.assign(stdin, { setRawMode: spy(() => {}) })
  return stdin
}

const mockStdout = (columns: number, rows: number) => {
  const stdout = Object.assign(new Writable({ write: voidWrite }), {
    isTTY: true,
    columns,
    rows,
  })
  const write = spy(stdout, 'write')
  const lastFrame = () => {
    if (write.calls.length === 0) return ''
    const last = write.calls[write.calls.length - 1]
    return String(last.args[0])
  }
  return { stdout, write, lastFrame }
}

export const mockTerminal = (
  { columns = 80, rows = 24, tty = true, rawMode = true }: MockTerminalOptions =
    {},
) => {
  const stdin = mockStdin(tty, rawMode)
  const screen = mockStdout(columns, rows)
  const stderr = new Writable({ write: voidWrite })
  const io: ReplIo = {
    stdin: stdin as unknown as ReplIo['stdin'],
    stdout: screen.stdout as unknown as ReplIo['stdout'],
    stderr: stderr as unknown as ReplIo['stderr'],
  }
  return { stdin, stderr, io, ...screen }
}
