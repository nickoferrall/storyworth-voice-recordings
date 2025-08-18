import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  await pg.schema.alterTable('PartnerRequest').addColumn('phone', 'text').execute()
}

export async function down(): Promise<void> {
  const pg = getKysely()

  await pg.schema.alterTable('PartnerRequest').dropColumn('phone').execute()
}
