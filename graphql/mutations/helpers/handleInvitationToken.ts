import getKysely from '../../../src/db'

type HandleInviteInput = {
  invitationToken: string
  teamSize: number
  email: string
  userId: string
}

export const handleInvitationToken = async (input: HandleInviteInput) => {
  const { invitationToken, teamSize, email, userId } = input
  const pg = getKysely()

  const invitation = await pg
    .selectFrom('Invitation')
    .where('token', '=', invitationToken)
    .selectAll()
    .executeTakeFirst()

  if (!invitation) {
    throw new Error('Invalid or expired invitation token')
  }

  if (invitation.email && invitation.email !== email) {
    throw new Error('Email does not match the invitation')
  }

  // Check if invitation has expired (30 days from creation)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  if (new Date(invitation.createdAt) < thirtyDaysAgo) {
    // Mark as expired if not already
    if (invitation.status === 'PENDING') {
      await pg
        .updateTable('Invitation')
        .set({ status: 'EXPIRED' })
        .where('id', '=', invitation.id)
        .execute()
    }
    throw new Error('This invitation has expired. Please request a new invitation.')
  }

  const teamMembers = await pg
    .selectFrom('TeamMember')
    .where('teamId', '=', invitation.teamId)
    .selectAll()
    .execute()

  // Allow reuse of invitations that are PENDING or ACCEPTED (within 30 days)
  if (invitation.status === 'EXPIRED' || invitation.status === 'REVOKED') {
    throw new Error('This invitation is no longer valid')
  }

  if (teamMembers.length >= teamSize) {
    throw new Error('Team is full')
  }

  // Check if user is already a member of this team
  const existingMember = teamMembers.find((member) => member.userId === userId)

  if (existingMember) {
    // User is already on the team, just return the teamId (allow graceful reuse)
    return { teamId: invitation.teamId }
  }

  await pg.transaction().execute(async (trx) => {
    await trx
      .insertInto('TeamMember')
      .values({
        teamId: invitation.teamId,
        userId: userId,
      })
      .onConflict((oc) => oc.columns(['teamId', 'userId']).doNothing())
      .execute()

    // Update existing Entry record to point to correct team
    await trx
      .updateTable('Entry')
      .set({
        teamId: invitation.teamId,
      })
      .where('userId', '=', userId)
      .execute()

    // Only mark as accepted if it's still pending
    if (invitation.status === 'PENDING') {
      await trx
        .updateTable('Invitation')
        .set({
          status: 'ACCEPTED',
        })
        .where('id', '=', invitation.id)
        .execute()
    }
  })
  return { teamId: invitation.teamId }
}
