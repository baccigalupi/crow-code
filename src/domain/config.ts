import { z } from 'zod'
import { CrowConfigData } from '../types.ts'

export const defaultCrowConfig = (): CrowConfigData => ({
  crowGlobalDirectory: '~/.crow',
  envFile: '~/.crow/.env',
  permissions: {
    ignore: [],
    additionalRead: [],
    additionalWrite: [],
  },
})

const crowConfigSchema = z.object({
  crowGlobalDirectory: z.string(),
  envFile: z.string(),
  permissions: z.object({
    ignore: z.array(z.string()),
    additionalRead: z.array(z.string()),
    additionalWrite: z.array(z.string()),
  }),
})

export class NormalizeConfig {
  private config: unknown

  constructor(config: unknown) {
    this.config = config
  }

  isValid() {
    return crowConfigSchema.safeParse(this.config).success
  }

  errorMessage() {
    if (this.isValid()) return ''
    return 'config does not match schema'
  }

  result() {
    if (this.isValid()) return crowConfigSchema.parse(this.config)
    return defaultCrowConfig()
  }
}

export const normalizeConfig = (config: unknown) => {
  return new NormalizeConfig(config)
}
