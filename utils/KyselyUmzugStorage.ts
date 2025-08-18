import { Kysely, sql } from 'kysely'

export class KyselyUmzugStorage {
  constructor(private db: Kysely<any>) {}

  private async ensureTable() {
    await this.db.schema
      .createTable('migrations')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('name', 'varchar', (col) => col.notNull())
      .addColumn('executed_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
      .execute()
  }

  async executed() {
    await this.ensureTable()
    const migrations = await this.db.selectFrom('migrations').select('name').execute()
    return migrations.map((migration) => migration.name)
  }

  async logMigration({ name }: { name: string }) {
    await this.ensureTable()
    await this.db.insertInto('migrations').values({ name }).execute()
  }

  async unlogMigration({ name }: { name: string }) {
    await this.ensureTable()
    await this.db.deleteFrom('migrations').where('name', '=', name).execute()
  }
}
