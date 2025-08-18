import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  try {
    // Try to add directoryCompId to Competition table
    await pg.schema
      .alterTable('Competition')
      .addColumn('directoryCompId', 'text')
      .execute()
  } catch (error) {
    // Column already exists, ignore
    console.log('directoryCompId column already exists on Competition table')
  }

  try {
    // Try to add competitionId to DirectoryComp table
    await pg.schema
      .alterTable('DirectoryComp')
      .addColumn('competitionId', 'uuid')
      .execute()
  } catch (error) {
    // Column already exists, ignore
    console.log('competitionId column already exists on DirectoryComp table')
  }

  try {
    // Try to add index for Competition.directoryCompId
    await pg.schema
      .createIndex('idx_competition_directory_comp_id')
      .on('Competition')
      .column('directoryCompId')
      .execute()
  } catch (error) {
    // Index already exists, ignore
    console.log('idx_competition_directory_comp_id index already exists')
  }

  try {
    // Try to add index for DirectoryComp.competitionId
    await pg.schema
      .createIndex('idx_directory_comp_competition_id')
      .on('DirectoryComp')
      .column('competitionId')
      .execute()
  } catch (error) {
    // Index already exists, ignore
    console.log('idx_directory_comp_competition_id index already exists')
  }
}

export async function down(): Promise<void> {
  const pg = getKysely()

  // Drop indexes
  await pg.schema.dropIndex('idx_competition_directory_comp_id').ifExists().execute()
  await pg.schema.dropIndex('idx_directory_comp_competition_id').ifExists().execute()

  // Drop columns
  await pg.schema.alterTable('Competition').dropColumn('directoryCompId').execute()

  await pg.schema.alterTable('DirectoryComp').dropColumn('competitionId').execute()
}
