import type { Environment } from '../../../env-vars.ts'
import type { Logger } from '../../types.ts'
import { ApiRequest } from '../../api-request.ts'
import { aaModelsRequest } from './request.ts'
import { parsePage } from './parse.ts'

export class BenchmarksPage {
  private page: number
  private environment: Environment
  private fetchClient: typeof fetch
  private logger: Logger

  constructor(
    page: number,
    environment: Environment,
    fetchClient: typeof fetch,
    logger: Logger,
  ) {
    this.page = page
    this.environment = environment
    this.fetchClient = fetchClient
    this.logger = logger
  }

  fetch() {
    if (this.environment.missingAaApiKey()) {
      return parsePage(Response.error())
    }
    return this.request().perform()
  }

  private request() {
    return new ApiRequest(
      aaModelsRequest(this.page, this.environment.aaApiKey()),
      this.fetchClient,
      parsePage,
      this.logger,
    )
  }
}
