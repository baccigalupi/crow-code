import { Environment } from '../../src/application-data/env-vars.ts'

export const denoWithEnv = (values: Record<string, string> = {}) =>
  ({
    env: { toObject: () => values },
    readTextFile: Deno.readTextFile,
  }) as unknown as typeof Deno

export const mockEnvironment = (values: Record<string, string> = {}) =>
  new Environment(denoWithEnv(values))
