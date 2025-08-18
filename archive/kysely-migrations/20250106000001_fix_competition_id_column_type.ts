import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  try {
    // Change DirectoryComp.competitionId column type from uuid to text
    // to match Competition.id which is text (nanoid format)
    await pg.schema
      .alterTable('DirectoryComp')
      .alterColumn('competitionId', (col) => col.setDataType('text'))
      .execute()

    console.log(
      'Successfully changed DirectoryComp.competitionId column type from uuid to text',
    )
  } catch (error) {
    console.error('Error changing DirectoryComp.competitionId column type:', error)
    throw error
  }
}

export async function down(): Promise<void> {
  const pg = getKysely()

  try {
    // Revert back to uuid type
    await pg.schema
      .alterTable('DirectoryComp')
      .alterColumn('competitionId', (col) => col.setDataType('uuid'))
      .execute()

    console.log('Reverted DirectoryComp.competitionId column type back to uuid')
  } catch (error) {
    console.error('Error reverting DirectoryComp.competitionId column type:', error)
    throw error
  }
}
