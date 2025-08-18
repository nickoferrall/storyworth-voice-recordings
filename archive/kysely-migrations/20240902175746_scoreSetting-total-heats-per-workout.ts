import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('ScoreSetting')
      .renameColumn('totalHeats', 'totalHeatsPerWorkout')
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('ScoreSetting')
      .renameColumn('totalHeatsPerWorkout', 'totalHeats')
      .execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
  }
}
