import type { Knex } from 'knex'
import type { Environment } from '../../env-vars.ts'
import type { Logger } from '../../types.ts'
import { modelFindCheapNoReasoning } from '../../domain/models/find-cheap-no-reasoning.ts'
import { providerFindAll } from '../../domain/providers/find-all.ts'
import { FoundModels } from './found-models.ts'

class EndpointInfo {
  private database: Knex
  private environment: Environment
  private logger: Logger
  private foundModels!: FoundModels

  constructor(database: Knex, environment: Environment, logger: Logger) {
    this.database = database
    this.environment = environment
    this.logger = logger
  }

  async run() {
    const [models, providers] = await Promise.all([
      modelFindCheapNoReasoning(this.database, this.logger).first(5),
      providerFindAll(this.environment, this.database, this.logger).all(),
    ])
    this.foundModels = new FoundModels(models, providers)
    return this
  }

  isAvailable() {
    return this.foundModels.firstEndpoint().baseURL !== ''
  }

  value() {
    return this.foundModels.firstEndpoint()
  }
}

export const modelEndpointInfo = async (
  database: Knex,
  environment: Environment,
  logger: Logger,
) => {
  return await new EndpointInfo(database, environment, logger).run()
}
