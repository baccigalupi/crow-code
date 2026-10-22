import { mergeCoverage } from './merge.ts'
import { readAllRaw } from './raw-store.ts'
import { summary } from './summary.ts'
import { writeHtml } from './write-html.ts'
import { writeReport } from './write-report.ts'

export const run = (command: string | undefined, dir: string) => {
  if (command === 'lcov') {
    writeReport(dir)
    return ''
  }
  if (command === 'html') {
    writeHtml(dir)
    return ''
  }

  return summary(mergeCoverage(readAllRaw(`${dir}/raw`)))
}

if (import.meta.main) {
  process.stdout.write(run(Bun.argv[2], 'coverage'))
}
