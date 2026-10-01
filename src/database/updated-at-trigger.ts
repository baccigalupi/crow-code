import type { Knex } from 'knex'

const isoNow = "strftime('%Y-%m-%dT%H:%M:%fZ','now')"

const triggerSql = (table: string) => `
  CREATE TRIGGER ${table}_updated_at
  AFTER UPDATE ON ${table}
  FOR EACH ROW
  BEGIN
    UPDATE ${table} SET updated_at = ${isoNow} WHERE id = NEW.id;
  END
`

export const updatedAtDefault = (database: Knex) => database.raw(`(${isoNow})`)

export const createUpdatedAtTrigger = (database: Knex, table: string) =>
  database.raw(triggerSql(table))
