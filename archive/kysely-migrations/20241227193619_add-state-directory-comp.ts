import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>) {
  const pg = getKysely()

  await pg.schema.alterTable('DirectoryComp').addColumn('state', 'text').execute()
}

export async function down(db: Kysely<any>) {
  const pg = getKysely()

  await pg.schema.alterTable('DirectoryComp').dropColumn('state').execute()
}
