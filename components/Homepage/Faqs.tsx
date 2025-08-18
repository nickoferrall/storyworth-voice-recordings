import Image from 'next/image'

import { Container } from './Container'
import backgroundImage from '../../public/assets/background-faqs.jpg'

const faqs = [
  [
    {
      question: 'How can I customise heats?',
      answer:
        'You can click Heat Settings to select the number of Entries/Athletes per heat, the heat start time, and time between heats. You can also click Customise to adjust specific heat limits, add a break, or add a new heat.',
    },
    {
      question: 'How can athletes select their heat times?',
      answer: 'Go to Registration, select on your ticket type, and select "Yes" to "Let athletes choose their heat?"',
    },
    {
      question: 'Can I use fitlo for a free event?',
      answer:
        'Yes! We only charge a fee for paid tickets. You can use fitlo for free events, and we will not charge you any fees.',
    },
  ],
  [
    {
      question: 'Can I add custom registration questions?',
      answer:
        `Yes, in the Registration page, you can choose which default questions you want to ask your athletes, whether they're required or not, and include any custom questions too.`,
    },
    {
      question: 'Can I email athletes from fitlo?',
      answer:
        `Yes, you can email athletes from fitlo. You can also export all athlete emails and email them from your email client.`
    },
    {
      question:
        'Can I speak with someone if I have questions?',
      answer:
       `Yes, you can email us or add us on whatsapp and typically receive a response within one hour. We can also set-up a video call if you prefer.`
    },
  ],
  [
    {
      question: 'Will athletes receive an email reminder before the competition?',
      answer:
`Yes, athletes will receive an email reminder 24 hours before the competition. It will include a link to the event page where they can find their schedule for the day and the leaderboard. You can also send a reminder email to all athletes at any time.`
    },
    {
      question: 'Are Stripe fees included?',
      answer: `No, they're not. Stripe's fees are separate from fitlo's fees. You can find more information on Stripe's pricing on their <a href="https://stripe.com/gb/pricing" target="_blank" rel="noopener noreferrer">website</a>.`,
    },
    {
      question: 'What payment types do you accept?',
      answer:
        `We accept Apple Pay, Google Pay, Stripe Link, AMEX, Visa, and Mastercard.`
    },
  ],
]

export default function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
    >
      <Image
        className="absolute left-1/2 top-0 max-w-none -translate-y-1/4 translate-x-[-30%]"
        src={backgroundImage}
        alt=""
        width={1558}
        height={946}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can’t find what you’re looking for, email our support team at hello@fitlo.co
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg leading-7 text-slate-900">
                      {faq.question}
                    </h3>
                    <p 
                      className="mt-4 text-sm text-slate-700 [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
