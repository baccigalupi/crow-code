import { join } from '@std/path'

export const fixturesDirectory = join(
  Deno.cwd(),
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
  return await Deno.readTextFile(path)
}

export const loadModelsDevFixture = async () =>
  await loadFixture('model-discovery/catalog/providers/models-dev-api.json')

export const loadNousFixture = async () =>
  await loadFixture('model-discovery/catalog/providers/nous-models.json')

export const loadOpenRouterFixture = async () =>
  await loadFixture('model-discovery/catalog/providers/openrouter-models.json')

export const loadOllamaFixture = async () =>
  await loadFixture('model-discovery/catalog/providers/ollama-models.json')

export const clearDirectory = async (path: string) => {
  await Deno.remove(path, { recursive: true }).catch(() => {})
}
