import type { BuiltCrowConfig } from '../types.ts'

// WRITE side: creates the repo directory and writes config.json to disk.
// Only called once the user confirms; deriving the config lives in build.ts.
export const writeCrowConfig = (
  { crowRepoDirectory, crowConfigPath, crowConfigJson }: BuiltCrowConfig,
) => {
  Deno.mkdirSync(crowRepoDirectory, { recursive: true })
  Deno.writeTextFileSync(crowConfigPath, `${crowConfigJson}\n`)
}
