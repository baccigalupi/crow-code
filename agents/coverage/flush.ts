import { writeRaw } from './raw-store.ts'
import { writeReport } from './write-report.ts'

export const flush = (dir: string, id: string, coverage: object) => {
  writeRaw(`${dir}/raw`, id, coverage)
  writeReport(dir)
}
