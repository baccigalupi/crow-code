import type { Knex } from 'knex'
import type { EmptyRecord } from './types.ts'
import { OperationWithResult } from '../operation.ts'

export abstract class CreateRecord<TParams, TRow, TRecord = unknown>
  extends OperationWithResult<TParams, TRecord | EmptyRecord> {
  protected abstract readonly tableName: string
  protected override succeeded = false
  private record?: TRecord

  async run() {
    try {
      await this.save()
    } catch (error) {
      this.fail((error as Error).message)
    }
    return this
  }

  result(): TRecord | EmptyRecord {
    if (this.record !== undefined) return this.record
    return this.emptyRecord()
  }

  private async save() {
    const database = await this.database()
    const rows = await database(this.tableName)
      .insert(this.params())
      .returning('*') as TRow[]
    this.record = this.serialize(rows)
    this.succeeded = true
  }

  protected database(): Promise<Knex> {
    return this.applicationData.database()
  }

  protected params(): TParams | Partial<TRow> {
    return this.operationArguments
  }

  protected serialize(rows: TRow[]): TRecord {
    return rows[0] as unknown as TRecord
  }

  protected emptyRecord(): TRecord | EmptyRecord {
    return {}
  }
}
