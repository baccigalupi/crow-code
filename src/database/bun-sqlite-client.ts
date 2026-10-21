import Client_SQLite3 from 'knex/lib/dialects/sqlite3/index.js'
import { Database } from 'bun:sqlite'

export class BunSqliteClient extends Client_SQLite3 {
  _driver() {
    return { Database }
  }

  acquireRawConnection() {
    return new this.driver.Database(this.connectionSettings.filename)
  }

  destroyRawConnection(connection) {
    return connection.close()
  }

  _query(connection, obj) {
    const statement = connection.prepare(obj.sql)
    const bindings = this.sqliteBindings(obj.bindings)
    return Promise.resolve(this.executeStatement(statement, bindings, obj))
  }

  private executeStatement(statement, bindings, obj) {
    if (statement.columnNames.length > 0) return this.readRows(statement, bindings, obj)
    return this.runWrite(statement, bindings, obj)
  }

  private readRows(statement, bindings, obj) {
    obj.response = statement.all(bindings)
    obj.context = {}
    return obj
  }

  private runWrite(statement, bindings, obj) {
    const response = statement.run(bindings)
    obj.response = response
    obj.context = {
      lastID: response.lastInsertRowid,
      changes: response.changes,
    }
    return obj
  }

  private sqliteBindings(bindings) {
    if (!bindings) return []
    return bindings.map((binding) => this.sqliteBinding(binding))
  }

  private sqliteBinding(binding) {
    if (binding instanceof Date) return binding.valueOf()
    return this.sqlitePrimitive(binding)
  }

  private sqlitePrimitive(binding) {
    if (typeof binding === 'boolean') return Number(binding)
    return binding
  }
}

Object.assign(BunSqliteClient.prototype, { driverName: 'bun:sqlite' })
