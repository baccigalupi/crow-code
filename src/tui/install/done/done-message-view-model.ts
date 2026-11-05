import type { SetupTaskRow } from '../types.ts'

// The hint that says how setup ended.
export class DoneMessageViewModel {
  private rows: readonly SetupTaskRow[]

  constructor(rows: readonly SetupTaskRow[]) {
    this.rows = rows
  }

  summary() {
    if (this.rows.some((row) => row.error)) {
      return 'Setup failed. Press any key to exit'
    }

    return 'Done! Press any key to exit'
  }
}

export const doneMessageViewModel = (rows: readonly SetupTaskRow[]) =>
  new DoneMessageViewModel(rows)
