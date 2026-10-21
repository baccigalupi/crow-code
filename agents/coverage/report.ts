import { createCoverageMap } from 'istanbul-lib-coverage'
import type { CoverageMapData, FileCoverage } from 'istanbul-lib-coverage'

const hitCount = (counts: number[]) => {
  return counts.filter((count) => count > 0).length
}

const functionLines = (file: FileCoverage) => {
  const ids = Object.keys(file.fnMap)
  const name = (id: string) => file.fnMap[id].name

  return [
    ...ids.map((id) => `FN:${file.fnMap[id].line},${name(id)}`),
    ...ids.map((id) => `FNDA:${file.f[id]},${name(id)}`),
    `FNF:${ids.length}`,
    `FNH:${hitCount(ids.map((id) => file.f[id]))}`,
  ]
}

const arms = (file: FileCoverage, id: string, block: number) => {
  return file.b[id].map((count: number, branch: number) => {
    return {
      text: `BRDA:${file.branchMap[id].line},${block},${branch},${count}`,
      count,
    }
  })
}

const branchLines = (file: FileCoverage) => {
  const all = Object.keys(file.branchMap).flatMap((id, block) =>
    arms(file, id, block)
  )

  return [
    ...all.map((arm) => arm.text),
    `BRF:${all.length}`,
    `BRH:${hitCount(all.map((arm) => arm.count))}`,
  ]
}

const lineLines = (file: FileCoverage) => {
  const lines = file.getLineCoverage()
  const numbers = Object.keys(lines).map(Number)

  return [
    ...numbers.map((line) => `DA:${line},${lines[line]}`),
    `LF:${numbers.length}`,
    `LH:${hitCount(numbers.map((line) => lines[line]))}`,
  ]
}

const record = (file: FileCoverage) => {
  const lines = [
    ...functionLines(file),
    ...branchLines(file),
    ...lineLines(file),
  ]

  return [`SF:${file.path}`, ...lines, 'end_of_record\n'].join('\n')
}

export const lcov = (coverage: CoverageMapData) => {
  const map = createCoverageMap(coverage)

  return map.files().map((path: string) => record(map.fileCoverageFor(path)))
    .join('')
}
