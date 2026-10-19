import { join } from '@std/path'
import { defaultRuntime } from '../../src/application-data/runtime.ts'
import { defaultFilesystem } from '../../src/application-data/filesystem.ts'

export const fixturesDirectory = join(
  defaultRuntime().cwd,
  'tests',
  'support',
  'fixtures',
)

export const loadFixture = async (subpath: string) => {
  const text = await loadTextFixture(subpath)
  return JSON.parse(text)
}

export const loadTextFixture = async (subpath: string) => {
  const path = join(fixturesDirectory, subpath)
  return await defaultFilesystem().readTextFile(path)
}

export const loadNousFixture = async () =>
  await loadFixture('model-discovery/populate/providers/nous-models.json')

export const loadOpenRouterFixture = async () =>
  await loadFixture('model-discovery/populate/providers/openrouter-models.json')

export const loadOllamaFixture = async () =>
  await loadFixture('model-discovery/populate/providers/ollama-models.json')

export const clearDirectory = async (path: string) => {
  await Deno.remove(path, { recursive: true }).catch(() => {})
}

export const searchFixtureNodeModules = () =>
  join(fixturesDirectory, 'tools', 'search', 'node_modules')

export const createSearchFixtureNodeModules = async () => {
  const path = searchFixtureNodeModules()
  const filesystem = defaultFilesystem()
  await filesystem.mkdirWithParents(path)
  await filesystem.writeTextFile(join(path, 'skipped.txt'), 'two')
}
