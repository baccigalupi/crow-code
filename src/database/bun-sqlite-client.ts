import Client_SQLite3 from 'knex/lib/dialects/sqlite3/index.js'
import { Database, type Statement } from 'bun:sqlite'

type KnexQuery = {
  sql: string
  bindings?: unknown[]
  response?: unknown
  context?: object
}

export class BunSqliteClient extends Client_SQLite3 {
  declare driver: { Database: typeof Database }
  declare connectionSettings: { filename: string }

  _driver() {
    return { Database }
  }

  override acquireRawConnection() {
    return Promise.resolve(
      new this.driver.Database(this.connectionSettings.filename),
    )
  }

  override destroyRawConnection(connection: Database) {
    return Promise.resolve(connection.close())
  }

  _query(connection: Database, obj: KnexQuery) {
    try {
      return Promise.resolve(this.execute(connection, obj))
    } catch (error) {
      if (error instanceof Error) error.message = `${obj.sql} - ${error.message}`
      return Promise.reject(error)
    }
  }

  private execute(connection: Database, obj: KnexQuery) {
    const statement = connection.prepare(obj.sql)
    const bindings = this.sqliteBindings(obj.bindings)
    return this.executeStatement(statement, bindings, obj)
  }

  private executeStatement(
    statement: Statement,
    bindings: unknown[],
    obj: KnexQuery,
  ) {
    if (statement.columnNames.length > 0) return this.readRows(statement, bindings, obj)
    return this.runWrite(statement, bindings, obj)
  }

  private readRows(statement: Statement, bindings: unknown[], obj: KnexQuery) {
    obj.response = statement.all(...bindings)
    obj.context = {}
    return obj
  }

  private runWrite(statement: Statement, bindings: unknown[], obj: KnexQuery) {
    const response = statement.run(...bindings)
    obj.response = response
    obj.context = {
      lastID: response.lastInsertRowid,
      changes: response.changes,
    }
    return obj
  }

  private sqliteBindings(bindings: unknown[] = []) {
    return bindings.map((binding) => this.sqliteBinding(binding))
  }

  private sqliteBinding(binding: unknown) {
    if (binding instanceof Date) return binding.valueOf()
    return this.sqlitePrimitive(binding)
  }

  private sqlitePrimitive(binding: unknown) {
    if (typeof binding === 'boolean') return Number(binding)
    return binding
  }
}

Object.assign(BunSqliteClient.prototype, { driverName: 'bun:sqlite' })
