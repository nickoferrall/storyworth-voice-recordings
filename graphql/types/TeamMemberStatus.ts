import { enumType } from 'nexus'

export const TeamMemberStatus = enumType({
  name: 'TeamMemberStatus',
  members: ['PENDING', 'ACCEPTED', 'REJECTED'],
})
