// import { Context } from '@apollo/client'
// import { getLinkInvitationByTokenInDb } from '../queries/getLinkInvitationByToken'
// import { updateEmailInvitationInDb } from '../queries/updateEmailInvitation'
// import { updateLinkInvitationByTokenInDb } from '../queries/updateLinkInvitationByToken'

// export const updateAcceptedToken = async (
//   userId: string,
//   ctx: Context,
//   emailToken?: string,
//   linkToken?: string,
// ): Promise<void> => {
//   if (emailToken) {
//     await updateEmailInvitationInDb({
//       token: emailToken,
//       accepted: true,
//       acceptedById: userId,
//       status: 'ACCEPTED',
//     })
//   }

//   if (linkToken) {
//     const linkInvitation = await getLinkInvitationByTokenInDb({
//       token: linkToken,
//     })

//     const updatedAcceptedByIds = [...(linkInvitation.acceptedByIds || []), userId]
//     await updateLinkInvitationByTokenInDb({
//       token: linkToken,
//       acceptedByIds: updatedAcceptedByIds,
//     })
//   }
// }
