import { z } from 'zod'
import { CrowConfigData } from '../types.ts'

export const defaultCrowConfig = (): CrowConfigData => ({
  crowGlobalDirectory: '~/.crow',
  envFile: '~/.crow/.env',
  permissions: {
    ignore: [],
    additionalRead: [],
    additionalWrite: [],
    escalateRead: [],
    escalateWrite: ['./dev', './agent'],
    allowedLocalScripts: ['./dev/*', './agent/*'],
  },
})

const crowConfigSchema = z.object({
  crowGlobalDirectory: z.string(),
  envFile: z.string(),
  permissions: z.object({
    ignore: z.array(z.string()),
    additionalRead: z.array(z.string()),
    additionalWrite: z.array(z.string()),
    escalateRead: z.array(z.string()),
    escalateWrite: z.array(z.string()),
    allowedLocalScripts: z.array(z.string()).default([]),
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
