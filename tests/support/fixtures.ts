import { join } from '@std/path'

export const fixturesDirectory = join(
  Deno.cwd(),
  'tests',
  'support',
  'fixtures',
)

export const loadFixture = async (subpath: string) => {
  const path = join(fixturesDirectory, subpath)
  const text = await Deno.readTextFile(path)
  return JSON.parse(text)
}

export const loadModelsDevFixture = async () =>
  await loadFixture('models-dev-api.json')

export const loadNousFixture = async () => await loadFixture('nous-models.json')

export const loadOpenRouterFixture = async () =>
  await loadFixture('openrouter-models.json')

export const loadOllamaFixture = async () =>
  await loadFixture('ollama-models.json')

export const clearDirectory = async (path: string) => {
  await Deno.remove(path, { recursive: true }).catch(() => {})
}
