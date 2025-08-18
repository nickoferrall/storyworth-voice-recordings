import getKysely from '../src/db'

type Props = {
  teamId: string | null
  userId: string
}

export const ensureTeamMembership = async (props: Props) => {
  const { teamId, userId } = props
  if (!teamId) {
    return false
  }
  const pg = getKysely()
  return await pg.transaction().execute(async (trx) => {
    const existingMember = await trx
      .selectFrom('TeamMember')
      .where('teamId', '=', teamId)
      .where('userId', '=', userId)
      .executeTakeFirst()

    if (!existingMember) {
      console.log(`Adding user ${userId} to team ${teamId}`)
      await trx
        .insertInto('TeamMember')
        .values({
          teamId,
          userId,
        })
        .onConflict((oc) => oc.columns(['teamId', 'userId']).doNothing())
        .execute()
      return true
    }
    return false
  })
}
