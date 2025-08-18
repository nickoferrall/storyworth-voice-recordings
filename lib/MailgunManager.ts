import FormData from 'form-data'
import Mailgun from 'mailgun.js'

type Input = {
  subject: string
  body?: string
  to: string | string[]
  attachments?: any
  html?: string
  tags?: string[]
  senderName?: string
  disableTracking?: boolean
}

export default class MailgunManager {
  mailgun = new Mailgun(FormData)
  mailgunClient = this.mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || '',
    url: 'https://api.eu.mailgun.net',
  })

  async sendEmail(input: Input) {
    const { subject, body, to, attachments, html, tags, senderName, disableTracking } =
      input
    const toArr = Array.isArray(to) ? to : [to]
    const toStr = toArr.join(',')

    // Only send emails in production environment
    // if (process.env.NODE_ENV !== 'production') {
    //   console.log(
    //     `[MailgunManager] Skipping email in ${process.env.NODE_ENV} environment:`,
    //     {
    //       to: toStr,
    //       subject,
    //       from: senderName
    //         ? `${senderName} <${process.env.MAIL_FROM}>`
    //         : process.env.MAIL_FROM,
    //     },
    //   )
    //   return true // Return true to simulate successful send
    // }

    const domain = process.env.MAILGUN_DOMAIN || ''
    if (!domain) {
      throw new Error('MAILGUN_DOMAIN is not defined')
    }

    try {
      await this.mailgunClient.messages.create(domain, {
        from: senderName
          ? `${senderName} <${process.env.MAIL_FROM}>`
          : process.env.MAIL_FROM,
        to: toStr,
        subject,
        text: body,
        html,
        attachment: attachments,
        'o:tracking': disableTracking ? false : true,
        'o:tag': tags,
      } as any)
      return true
    } catch (e) {
      console.error('Mailgun failed to send email', e)
      return false
    }
  }
}
