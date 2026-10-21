import { EventEmitter } from 'node:events'
import { Writable } from 'node:stream'
import { mock, spyOn } from 'bun:test'
import type { ReplIo } from '../../src/tui/types.ts'

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

// A stdin whose writes are delivered synchronously, so a key written to it
// has been handled by Ink before `write` returns. A real stream would
// deliver on the next tick.
class MockStdin extends EventEmitter {
  isTTY: boolean
  private data: string | null = null

  constructor(tty: boolean) {
    super()
    this.isTTY = tty
  }

  write = (data: string) => {
    this.data = data
    this.emit('readable')
    this.emit('data', data)
  }

  read = () => {
    const { data } = this
    this.data = null
    return data
  }

  setEncoding() {}
  ref() {}
  unref() {}
  resume() {}
  pause() {}
}

const mockStdin = (tty: boolean, rawMode: boolean) => {
  const stdin = new MockStdin(tty)
  if (rawMode) Object.assign(stdin, { setRawMode: mock(() => {}) })
  return stdin
}

const mockStdout = (columns: number, rows: number) => {
  const stdout = Object.assign(new Writable({ write: voidWrite }), {
    isTTY: true,
    columns,
    rows,
  })
  const write = spyOn(stdout, 'write')
  // Ink's waitUntilRenderFlush writes an empty barrier chunk; it is not a frame.
  const lastFrame = () => {
    const frames = write.mock.calls.filter(
      (call: unknown[]) => String(call[0]) !== '',
    )
    if (frames.length === 0) return ''
    return String(frames[frames.length - 1][0])
  }
  return { stdout, write, lastFrame }
}

export const mockTerminal = ({
  columns = 80,
  rows = 24,
  tty = true,
  rawMode = true,
}: MockTerminalOptions = {}) => {
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
