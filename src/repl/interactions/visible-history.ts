import { measureLines } from './input-buffer.ts'
import type { HistoryEntry } from '../types.ts'

interface HistoryAccumulator {
  readonly used: number
  readonly full: boolean
  readonly entries: readonly HistoryEntry[]
}

const addWithin = (
  acc: HistoryAccumulator,
  entry: HistoryEntry,
  rows: number,
  columns: number,
): HistoryAccumulator => {
  if (acc.used + measureLines(entry.text, columns) > rows) {
    return { ...acc, full: true }
  }
  const used = acc.used + measureLines(entry.text, columns)
  return { used, full: false, entries: [entry, ...acc.entries] }
}

const keepWithin = (
  acc: HistoryAccumulator,
  entry: HistoryEntry,
  rows: number,
  columns: number,
): HistoryAccumulator => {
  if (acc.full) return acc
  return addWithin(acc, entry, rows, columns)
}

export const visibleHistory = (
  history: readonly HistoryEntry[],
  rows: number,
  columns: number,
): readonly HistoryEntry[] => {
  if (rows <= 0) return []
  const kept = history.reduceRight(
    (acc, entry) => keepWithin(acc, entry, rows, columns),
    { used: 0, full: false, entries: [] } as HistoryAccumulator,
  )
  return kept.entries
}
