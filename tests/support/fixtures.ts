import { join } from '@std/path'

export const fixturesDirectory = join(
  Deno.cwd(),
  'tests',
  'support',
  'fixtures',
)

export const loadModelsDevFixture = async () => {
  const path = join(fixturesDirectory, 'models-dev-api.json')
  const text = await Deno.readTextFile(path)
  return JSON.parse(text)
}

export const clearDirectory = async (path: string) => {
  await Deno.remove(path, { recursive: true }).catch(() => {})
}
