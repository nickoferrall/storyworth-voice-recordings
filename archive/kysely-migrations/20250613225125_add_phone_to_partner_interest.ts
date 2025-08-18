import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  await pg.schema.alterTable('PartnerInterest').addColumn('phone', 'text').execute()
}

export async function down(): Promise<void> {
  const pg = getKysely()

  await pg.schema.alterTable('PartnerInterest').dropColumn('phone').execute()
}
