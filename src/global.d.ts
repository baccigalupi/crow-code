declare module 'knex/lib/dialects/sqlite3/index.js' {
  import type { Knex } from 'knex'

  const Client_SQLite3: typeof Knex.Client
  export default Client_SQLite3
}
