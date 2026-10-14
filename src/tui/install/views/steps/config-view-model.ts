import { buildCrowConfig } from '../../crow-config/build.ts'
import type { BuildCrowConfigArguments } from '../../types.ts'

export const configViewModel = (
  buildCrowConfigArguments: BuildCrowConfigArguments,
) => {
  const { crowConfigPath, crowConfigJson } = buildCrowConfig(
    buildCrowConfigArguments,
  ).all()
  return { crowConfigPath, crowConfigJson }
}
