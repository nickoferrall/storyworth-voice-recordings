import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  await pg.schema.alterTable('Competition').addColumn('testField', 'text').execute()
}

export async function down(): Promise<void> {
  const pg = getKysely()

  await pg.schema.alterTable('Competition').dropColumn('testField').execute()
}
