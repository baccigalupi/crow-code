import type { Knex } from 'knex'
import type { Logger } from '../types.ts'
import type { EmptyRecord } from './types.ts'

export abstract class CreateRecord<TParams, TRow, TRecord = unknown> {
  protected abstract readonly tableName: string
  protected readonly database: Knex
  protected readonly logger: Logger
  protected readonly recordParams: TParams
  private result: TRow | EmptyRecord = {}
  private succeeded = false

  constructor(
    database: Knex,
    logger: Logger,
    recordParams: TParams,
  ) {
    this.database = database
    this.logger = logger
    this.recordParams = recordParams
  }

  async create() {
    try {
      await this.save()
    } catch (error) {
      this.logger.error((error as Error).message)
    }
    return this
  }

  success(): boolean | Promise<boolean> {
    return this.succeeded
  }

  record(): TRecord | Promise<TRecord> {
    return this.serialize(this.result)
  }

  private async save() {
    await this.insert()
    this.succeeded = true
  }

  private async insert() {
    const [record] = await this.database(this.tableName)
      .insert(this.params())
      .returning<TRow[]>('*')
    this.result = record
  }

  protected params(): TParams | Partial<TRow> {
    return this.recordParams
  }

  protected serialize(result: TRow | EmptyRecord): TRecord {
    return result as unknown as TRecord
  }
}
