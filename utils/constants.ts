import { Currency } from '../src/generated/graphql'

export const countryList = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo, Democratic Republic of the',
  'Congo, Republic of the',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Korea, North',
  'Korea, South',
  'Kosovo',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Sudan, South',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
]

export const coreTimeZones = [
  'UTC',
  'America/New_York', // Eastern Time (US & Canada)
  'America/Chicago', // Central Time (US & Canada)
  'America/Denver', // Mountain Time (US & Canada)
  'America/Los_Angeles', // Pacific Time (US & Canada)
  'America/Sao_Paulo', // Brasilia
  'Europe/London', // London
  'Europe/Berlin', // Central European Time
  'Europe/Moscow', // Moscow
  'Asia/Dubai', // Dubai
  'Asia/Kolkata', // India Standard Time
  'Asia/Shanghai', // China Standard Time
  'Asia/Tokyo', // Japan Standard Time
  'Australia/Sydney', // Sydney
]

export const platformFee = 0.05 // 5%

export const stripeFeesByCurrency = {
  USD: { percentage: 0.029, fixed: 0.3 },
  EUR: { percentage: 0.014, fixed: 0.25 },
  GBP: { percentage: 0.015, fixed: 0.2 },
} as const

export const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
} as Record<Currency, '$' | '€' | '£'>

export const currencyLookup = {
  $: Currency['Usd'],
  '€': Currency['Eur'],
  '£': Currency['Gbp'],
}

export const unchangeableQuestions = ['First Name', 'Last Name', 'Email']

export const PartnerEmailQuestion = 'Partner Emails'

export const exampleRefundPolicy = `Refund Policy for Functional Fitness Events

Full Refunds:

Cancelation 30+ days before the event: Full refund.
Partial Refunds:

Cancelation 29 to 14 days before the event: 50% refund.
Cancelation less than 14 days before the event: No refund.
Event Cancellation by Organizer:

If the event is canceled by the organizer, all participants receive a full refund.
Force Majeure:

In cases of unforeseen circumstances (e.g., natural disasters, pandemics), refunds will be at the discretion of the event organizer.
Transfer of Registration:

Registration transfers are allowed up to 7 days before the event.
Non-Refundable Fees:

Certain fees, such as transaction processing or administrative charges, may not be refundable.
Refund Process:

Refund requests must be submitted in writing.
Approved refunds will be processed within 14 business days.`
