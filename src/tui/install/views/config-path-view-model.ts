import { buildCrowConfig } from '../crow-config/build.ts'
import type { BuildCrowConfigArguments } from '../types.ts'

export const configPathViewModel = (
  buildCrowConfigArguments: BuildCrowConfigArguments,
) => {
  const { crowConfigPath } = buildCrowConfig(buildCrowConfigArguments).all()
  return { crowConfigPath }
}
