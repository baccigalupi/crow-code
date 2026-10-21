import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import type { CoverageMapData } from 'istanbul-lib-coverage'

export const writeRaw = (dir: string, id: string, coverage: object) => {
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${dir}/${id}.json`, JSON.stringify(coverage))
}

export const clearRaw = (dir: string) => {
  rmSync(dir, { recursive: true, force: true })
}

const names = (dir: string) => {
  if (!existsSync(dir)) {
    return []
  }

  return readdirSync(dir).filter((name) => name.endsWith('.json')).sort()
}

export const readAllRaw = (dir: string): CoverageMapData[] => {
  return names(dir).map((name) => {
    return JSON.parse(readFileSync(`${dir}/${name}`, 'utf8'))
  })
}
