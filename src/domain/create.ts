import type { Knex } from 'knex'
import type { ApplicationData } from '../application-data.ts'
import type { EmptyRecord } from './types.ts'

export abstract class CreateRecord<TParams, TRow, TRecord = unknown> {
  protected abstract readonly tableName: string
  protected readonly applicationData: ApplicationData
  protected readonly recordParams: TParams
  private result?: TRecord
  private succeeded = false

  constructor(applicationData: ApplicationData, recordParams: TParams) {
    this.applicationData = applicationData
    this.recordParams = recordParams
  }

  async create() {
    try {
      await this.save()
    } catch (error) {
      this.applicationData.logger().error((error as Error).message)
    }
    return this
  }

  success() {
    return this.succeeded
  }

  record(): TRecord | EmptyRecord {
    if (this.result !== undefined) return this.result
    return this.emptyRecord()
  }

  private async save() {
    await this.insert()
    this.succeeded = true
  }

  protected database(): Promise<Knex> {
    return this.applicationData.database()
  }

  private async insert() {
    const database = await this.database()
    const rows = await database(this.tableName)
      .insert(this.params())
      .returning('*') as TRow[]
    this.result = this.serialize(rows)
  }

  protected params(): TParams | Partial<TRow> {
    return this.recordParams
  }

  protected serialize(rows: TRow[]): TRecord {
    return rows[0] as unknown as TRecord
  }

  protected emptyRecord(): TRecord | EmptyRecord {
    return {}
  }
}
