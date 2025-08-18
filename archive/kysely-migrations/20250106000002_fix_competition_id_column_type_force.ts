import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  try {
    // Drop the existing competitionId column (uuid type)
    await pg.schema.alterTable('DirectoryComp').dropColumn('competitionId').execute()

    console.log('Dropped DirectoryComp.competitionId column')

    // Add it back as text type to match Competition.id
    await pg.schema
      .alterTable('DirectoryComp')
      .addColumn('competitionId', 'text')
      .execute()

    console.log('Successfully recreated DirectoryComp.competitionId column as text type')
  } catch (error) {
    console.error('Error fixing DirectoryComp.competitionId column type:', error)
    throw error
  }
}

export async function down(): Promise<void> {
  const pg = getKysely()

  try {
    // Drop the text column
    await pg.schema.alterTable('DirectoryComp').dropColumn('competitionId').execute()

    // Add it back as uuid type
    await pg.schema
      .alterTable('DirectoryComp')
      .addColumn('competitionId', 'uuid')
      .execute()

    console.log('Reverted DirectoryComp.competitionId column type back to uuid')
  } catch (error) {
    console.error('Error reverting DirectoryComp.competitionId column type:', error)
    throw error
  }
}
