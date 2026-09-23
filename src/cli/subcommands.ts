import { join } from '@std/path'
import type { CatalogBuilder, Logger } from '../types.ts'

export class Subcommands {
  private buildCatalog: CatalogBuilder
  private logger: Logger

  constructor(
    logger: Logger,
    buildCatalog: CatalogBuilder,
  ) {
    this.logger = logger
    this.buildCatalog = buildCatalog
  }

  findModels() {
    return this.buildCatalog(this.crowDirectory(), this.logger)
  }

  private crowDirectory() {
    return join(Deno.cwd(), '.crow')
  }
}
