import type { AAModel, Logger } from '../../types.ts'
import type { Environment } from '../../../env-vars.ts'
import { matchAABenchmarks } from './scores.ts'
import { BenchmarksPage } from './page.ts'

class Benchmarks {
  private keyMissingMessage =
    'AA_API_KEY is not set. Put it in .env (AA_API_KEY=...) or export it, or get a free key at https://artificialanalysis.ai/api-key-management-redirect'

  private catalogIds: Set<string>
  private environment: Environment
  private logger: Logger
  private fetchClient: typeof fetch

  constructor(
    catalogIds: Set<string>,
    environment: Environment,
    logger: Logger,
    fetchClient: typeof fetch,
  ) {
    this.catalogIds = catalogIds
    this.environment = environment
    this.logger = logger
    this.fetchClient = fetchClient
  }

  async fetch() {
    if (this.environment.missingAaApiKey()) {
      this.logger.error(this.keyMissingMessage)
    }
    const models = await this.allPages()
    return matchAABenchmarks(models, this.catalogIds)
  }

  private async allPages() {
    const models: AAModel[] = []
    let page = 1
    while (await this.appendPage(page, models)) {
      page += 1
    }
    return models
  }

  private async appendPage(page: number, models: AAModel[]) {
    const result = await this.newPage(page).fetch()
    models.push(...result.data)
    return result.pagination.has_more
  }

  private newPage(page: number) {
    return new BenchmarksPage(
      page,
      this.environment,
      this.fetchClient,
      this.logger,
    )
  }
}

export const fetchAABenchmarks = (
  catalogIds: Set<string>,
  environment: Environment,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => new Benchmarks(catalogIds, environment, logger, fetchClient).fetch()
