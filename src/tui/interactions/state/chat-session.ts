import { batch, computed, signal } from '@preact/signals-core'
import {
  deleteBackward,
  deleteForward,
  emptyBuffer,
  insertText,
  measureRows,
  moveCursor,
} from '../input-buffer.ts'
import type { CursorMove, HistoryEntry, InputBuffer } from '../../types.ts'

export class ChatSession {
  readonly buffer = signal<InputBuffer>(emptyBuffer())
  readonly columns = signal(80)
  readonly history = signal<readonly HistoryEntry[]>([])
  readonly inputRows = computed(() =>
    measureRows(this.buffer.value.text, this.columns.value)
  )

  constructor(columns: number) {
    this.columns.value = columns
  }

  insert(text: string) {
    this.buffer.value = insertText(this.buffer.peek(), text)
  }

  newline() {
    this.insert('\n')
  }

  backspace() {
    this.buffer.value = deleteBackward(this.buffer.peek())
  }

  delete() {
    this.buffer.value = deleteForward(this.buffer.peek())
  }

  moveCursor(to: CursorMove) {
    this.buffer.value = moveCursor(this.buffer.peek(), to)
  }

  submit() {
    batch(() => {
      this.history.value = [...this.history.peek(), this.nextEntry()]
      this.buffer.value = emptyBuffer()
    })
  }

  resize(columns: number) {
    this.columns.value = columns
  }

  private nextEntry(): HistoryEntry {
    const history = this.history.peek()
    return { id: `entry-${history.length}`, text: this.buffer.peek().text }
  }
}
