import { join } from '@std/path'

export const fixturesDirectory = join(
  Deno.cwd(),
  'tests',
  'support',
  'fixtures',
)

export const clearDirectory = async (path: string) => {
  await Deno.remove(path, { recursive: true }).catch(() => {})
}
