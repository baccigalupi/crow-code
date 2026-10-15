import { CrowConfig } from '../../src/application-data/config.ts'
import { defaultCrowConfig } from '../../src/application-data/load-config.ts'

export const configWithIgnore = (ignore: string[]) => {
  const data = defaultCrowConfig()
  data.permissions = { ...data.permissions, ignore }
  return new CrowConfig('.', data)
}
