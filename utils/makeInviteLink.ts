export const makeInviteLink = (ticketTypeId: string, token: string) => {
  return `https://fitlo.co/register/${ticketTypeId}?token=${token}`
}
