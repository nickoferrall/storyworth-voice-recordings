import { BaseScraper } from './base'
import getKysely from '../src/db'
import OpenAI from 'openai'

// Optional OpenAI client (used only if API key is present)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// Minimal shape to stage into PotentialCompetition with default HYROX tickets
export class HyroxScraper extends BaseScraper {
  name = 'hyrox'

  async scrapeToStaging(limit?: number): Promise<any[]> {
    const browser = await this.initBrowser()
    const pg = getKysely()

    try {
      const page = await browser.newPage()
      await this.setPageDefaults(page)

      await page.goto('https://hyrox.com/find-my-race/', {
        waitUntil: 'networkidle2',
        timeout: 60000,
      })

      await this.randomDelay(1500, 3000)

      // Extract events from HYROX grid
      const events = await page.evaluate((max?: number) => {
        const articles = Array.from(
          document.querySelectorAll('.w-grid-list article.w-grid-item'),
        )

        const results: Array<{
          title: string
          href: string | null
          image: string | null
          rawDate1: string | null
          rawDate3: string | null
          comingSoon: boolean
          rawDateText: string | null
        }> = []

        for (const el of articles) {
          const titleAnchor = el.querySelector('h2 a') as HTMLAnchorElement | null
          const title = titleAnchor?.textContent?.trim() || ''
          const href = titleAnchor?.href || null

          const img =
            (el.querySelector('.post_image img') as HTMLImageElement | null)?.src || null

          const d1 =
            el.querySelector('.event_date_1 .w-post-elm-value')?.textContent?.trim() ||
            null
          const d3 =
            el.querySelector('.event_date_3 .w-post-elm-value')?.textContent?.trim() ||
            null
          const comingSoon = /date coming soon/i.test(el.textContent || '')

          const rawDateText =
            d1 && d3 ? `${d1} - ${d3}` : d1 || (comingSoon ? 'Date coming soon!' : null)

          results.push({
            title,
            href,
            image: img,
            rawDate1: d1,
            rawDate3: d3,
            comingSoon,
            rawDateText,
          })

          if (typeof max === 'number' && results.length >= max) break
        }

        return results
      }, limit)

      // Dedupe by href where possible, else by normalized title
      const seen = new Set<string>()
      const uniqueEvents = events.filter((ev) => {
        const key = (ev.href || ev.title).trim().toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      const created: any[] = []

      // Fetch detail page content in parallel (batched) for better context
      const detailTextByHref: Record<string, string> = {}
      const BATCH_SIZE = 6
      for (let i = 0; i < uniqueEvents.length; i += BATCH_SIZE) {
        const batch = uniqueEvents.slice(i, i + BATCH_SIZE)
        await Promise.all(
          batch.map(async (ev) => {
            if (!ev.href) return
            try {
              const p = await browser.newPage()
              await this.setPageDefaults(p)
              await p.goto(ev.href, { waitUntil: 'domcontentloaded', timeout: 45000 })
              await this.randomDelay(300, 1000)
              const text = await p.evaluate(() => {
                const sel =
                  document.querySelector(
                    '[class*="event_description"], .event_description',
                  ) ||
                  document.querySelector('.w-post-elm.post_custom_field') ||
                  document.body
                return (sel?.textContent || '').replace(/\s+/g, ' ').trim()
              })
              detailTextByHref[ev.href] = text?.slice(0, 2000) || ''
              await p.close()
            } catch {
              // ignore detail failures
            }
          }),
        )
      }

      // Pre-infer locations with OpenAI (batched), using title + detail text
      const aiLocationByKey: Record<
        string,
        { city: string | null; country: string | null }
      > = {}
      if (openai) {
        for (let i = 0; i < uniqueEvents.length; i += BATCH_SIZE) {
          const batch = uniqueEvents.slice(i, i + BATCH_SIZE)
          await Promise.all(
            batch.map(async (ev) => {
              try {
                const detail = ev.href ? detailTextByHref[ev.href] : ''
                const guess = await this.determineLocationWithAIFromDetails(
                  ev.title,
                  detail,
                )
                aiLocationByKey[ev.href || ev.title] = guess
              } catch {}
            }),
          )
        }
      }

      for (const ev of uniqueEvents) {
        try {
          const parsed = this.parseHyroxDate(ev.rawDate1, ev.rawDate3, ev.comingSoon)
          const startDate = parsed.date

          // Resolve city/country: rule-based first (title + slug), then AI precomputed fallback
          let { city, country } = this.parseCityCountryFromTitle(ev.title)
          if ((!city || !country) && ev.href) {
            const fromSlug = this.parseCityFromSlug(ev.href)
            if (fromSlug.city && !city) city = fromSlug.city
            if (fromSlug.country && !country) country = fromSlug.country
          }
          if (!country) {
            const guessedCountry = this.matchCountryFromTitle(ev.title)
            if (guessedCountry) country = guessedCountry
          }
          const aiGuess = aiLocationByKey[ev.href || ev.title]
          if (aiGuess) {
            const cityGuess = this.normalizeCase(aiGuess.city)
            const countryGuess = this.normalizeCase(aiGuess.country)
            if (cityGuess && countryGuess) {
              city = cityGuess
              country = countryGuess
            } else {
              if (cityGuess && !city) city = cityGuess
              if (countryGuess && !country) country = countryGuess
            }
          }

          if (!country && city) {
            const mapped = this.cityToCountryMap()[city.toLowerCase()]
            if (mapped) country = mapped
          }

          // Try to fetch an image from detail page if missing
          let finalImage = ev.image
          if (!finalImage && ev.href) {
            try {
              const detail = await browser.newPage()
              await this.setPageDefaults(detail)
              await detail.goto(ev.href, {
                waitUntil: 'domcontentloaded',
                timeout: 30000,
              })
              await this.randomDelay(500, 1500)
              finalImage = await detail.evaluate(() => {
                const selectors = ['img[src*="hyrox" i]', 'img']
                for (const sel of selectors) {
                  const el = document.querySelector(sel) as HTMLImageElement | null
                  if (el && el.src && !el.src.includes('placeholder')) return el.src
                }
                return null
              })
              await detail.close()
            } catch {}
          }

          // If a row exists for this website, update instead of inserting
          let existingBySite: any | undefined
          if (ev.href) {
            existingBySite = await pg
              .selectFrom('PotentialCompetition')
              .select(['id', 'status', 'addressId'])
              .where('website', '=', ev.href)
              .where('source', '=', 'OFFICIAL_HYROX')
              .executeTakeFirst()
          }

          if (existingBySite) {
            await pg
              .updateTable('PotentialCompetition')
              .set({
                name: ev.title.slice(0, 255),
                startDateTime: startDate,
                endDateTime: startDate,
                country: country || null,
                logo: finalImage || null,
                status:
                  (existingBySite as any).status === 'REJECTED'
                    ? 'PENDING'
                    : (existingBySite as any).status,
                description: parsed.comingSoon
                  ? 'Official HYROX event – Date TBC'
                  : 'Official HYROX event',
                scrapedData: JSON.stringify({
                  rawDate1: ev.rawDate1,
                  rawDate3: ev.rawDate3,
                  comingSoon: parsed.comingSoon,
                  rawDateText: ev.rawDateText,
                  dateTbc: parsed.comingSoon || /coming soon/i.test(ev.rawDateText || ''),
                }),
              })
              .where('id', '=', (existingBySite as any).id)
              .execute()

            if ((existingBySite as any).addressId && (city || country)) {
              await pg
                .updateTable('Address')
                .set({
                  city: city ? this.normalizeCase(city) : null,
                  country: country ? this.normalizeCase(country) : null,
                })
                .where('id', '=', (existingBySite as any).addressId)
                .execute()
            }

            created.push(existingBySite)
            continue
          }

          // Skip if already staged by name+date (fallback)
          const existing = await pg
            .selectFrom('PotentialCompetition')
            .select(['id', 'status', 'addressId'])
            .where('name', '=', ev.title.slice(0, 255))
            .where('startDateTime', '=', startDate)
            .where('source', '=', 'OFFICIAL_HYROX')
            .executeTakeFirst()
          if (existing) {
            if ((existing as any).status === 'REJECTED') {
              await pg
                .updateTable('PotentialCompetition')
                .set({
                  website: ev.href || null,
                  logo: finalImage || null,
                  country: country || null,
                  status: 'PENDING',
                  description: parsed.comingSoon
                    ? 'Official HYROX event – Date TBC'
                    : 'Official HYROX event',
                  scrapedData: JSON.stringify({
                    rawDate1: ev.rawDate1,
                    rawDate3: ev.rawDate3,
                    comingSoon: parsed.comingSoon,
                    rawDateText: ev.rawDateText,
                    dateTbc:
                      parsed.comingSoon || /coming soon/i.test(ev.rawDateText || ''),
                  }),
                })
                .where('id', '=', (existing as any).id)
                .execute()

              if ((existing as any).addressId && (city || country)) {
                await pg
                  .updateTable('Address')
                  .set({
                    city: city ? this.normalizeCase(city) : null,
                    country: country ? this.normalizeCase(country) : null,
                  })
                  .where('id', '=', (existing as any).addressId)
                  .execute()
              }
            }
            continue
          }

          // Insert Address
          const address = await pg
            .insertInto('Address')
            .values({ venue: null, street: null, city, postcode: null, country })
            .returningAll()
            .executeTakeFirstOrThrow()

          // Insert PotentialCompetition (staging)
          const potential = await pg
            .insertInto('PotentialCompetition')
            .values({
              name: ev.title.slice(0, 255),
              startDateTime: startDate,
              endDateTime: startDate,
              addressId: address.id,
              source: 'OFFICIAL_HYROX',
              timezone: null,
              description: parsed.comingSoon
                ? 'Official HYROX event – Date TBC'
                : 'Official HYROX event',
              website: ev.href || null,
              email: null,
              currency: null,
              price: null,
              country: country || null,
              logo: finalImage || null,
              scrapedData: JSON.stringify({
                rawDate1: ev.rawDate1,
                rawDate3: ev.rawDate3,
                comingSoon: parsed.comingSoon,
                rawDateText: ev.rawDateText,
                dateTbc: parsed.comingSoon || /coming soon/i.test(ev.rawDateText || ''),
              }),
              status: 'PENDING',
            })
            .returningAll()
            .executeTakeFirstOrThrow()

          // Default HYROX ticket types (dummy volunteer so UI shows View Pricing)
          const tickets = [
            { name: 'Men Open', teamSize: 1 },
            { name: 'Women Open', teamSize: 1 },
            { name: 'Men Pro', teamSize: 1 },
            { name: 'Women Pro', teamSize: 1 },
            { name: 'Men Doubles', teamSize: 2 },
            { name: 'Women Doubles', teamSize: 2 },
            { name: 'Mixed Doubles', teamSize: 2 },
            { name: 'Relay', teamSize: 4 },
          ]

          for (const t of tickets) {
            await pg
              .insertInto('PotentialTicketType')
              .values({
                potentialCompetitionId: potential.id,
                name: t.name,
                description: 'Standard HYROX ticket',
                price: 0,
                currency: 'USD',
                maxEntries: 500,
                teamSize: t.teamSize,
                isVolunteer: true,
                allowHeatSelection: false,
                passOnPlatformFee: true,
              })
              .execute()
          }

          created.push(potential)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('HYROX staging failed:', e)
        }
      }

      return created
    } finally {
      await browser.close()
    }
  }

  private safeParseDate(text: string): Date {
    try {
      if (!text || /coming soon/i.test(text)) {
        return new Date('2030-12-31')
      }
      const d = new Date(text)
      if (isNaN(d.getTime())) return new Date('2030-12-31')
      return d
    } catch {
      return new Date('2030-12-31')
    }
  }

  private parseHyroxDate(
    raw1: string | null,
    raw3: string | null,
    comingSoonFlag: boolean,
  ) {
    const map: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      mär: 2,
      apr: 3,
      may: 4,
      mai: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      sept: 8,
      okt: 9,
      oct: 9,
      nov: 10,
      dec: 11,
      dez: 11,
    }

    const normalize = (s: string) => s.replace(/\./g, '').trim().toLowerCase()

    const parseOne = (s: string | null): Date | null => {
      if (!s) return null
      const m = s.match(/(\d{1,2})\.?\s*([A-Za-zÀ-ÿ]+)\.?,?\s*(\d{4})/)
      if (m) {
        const day = parseInt(m[1], 10)
        const monKey = normalize(m[2]).slice(0, 3)
        const month = map[monKey]
        const year = parseInt(m[3], 10)
        if (month !== undefined) {
          return new Date(Date.UTC(year, month, day))
        }
      }
      // Fallback to Date()
      const d = new Date(s)
      return isNaN(d.getTime()) ? null : d
    }

    if (comingSoonFlag) {
      return { date: new Date('2030-12-31'), comingSoon: true }
    }

    const start = parseOne(raw1)
    if (start) return { date: start, comingSoon: false }

    const end = parseOne(raw3)
    if (end) return { date: end, comingSoon: false }

    return { date: new Date('2030-12-31'), comingSoon: true }
  }

  private parseCityCountryFromTitle(title: string, fallbackCity?: string) {
    const clean = title
      .replace(/HYROX/gi, '')
      .replace(/CHAMPIONSHIPS?/gi, '')
      .replace(/[()]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()

    const stopWords = [
      'smart',
      'fit',
      'sports',
      'world',
      'gym',
      'fitness',
      'club',
      'event',
    ]

    const base = (clean || fallbackCity || '')
      .split(/[-|,]/)
      .map((s) => s.trim())
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim()

    const tokens = base
      .split(/\s+/)
      .map((t) => t.replace(/[^A-Za-zÀ-ÿ]/g, ''))
      .filter((t) => t && !stopWords.includes(t.toLowerCase()))

    // Consider multi-word city endings first (e.g., New York, Los Angeles)
    const lowerTokens = tokens.map((t) => t.toLowerCase())
    const tail2 = lowerTokens.slice(-2).join(' ')
    const tail3 = lowerTokens.slice(-3).join(' ')
    let city = ''
    let key = ''
    if (tail3 in this.cityToCountryMap()) {
      city = tokens.slice(-3).join(' ')
      key = tail3
    } else if (tail2 in this.cityToCountryMap()) {
      city = tokens.slice(-2).join(' ')
      key = tail2
    } else {
      // Walk backwards to find the first token that maps to a country
      for (let i = lowerTokens.length - 1; i >= 0; i--) {
        const tok = lowerTokens[i]
        if (tok in this.cityToCountryMap()) {
          city = tokens[i]
          key = tok
          break
        }
      }
      if (!city) {
        city = tokens[tokens.length - 1] || ''
        key = city.toLowerCase()
      }
    }
    const countryMap: Record<string, string> = {
      london: 'United Kingdom',
      manchester: 'United Kingdom',
      glasgow: 'United Kingdom',
      birmingham: 'United Kingdom',
      cardiff: 'United Kingdom',
      liverpool: 'United Kingdom',
      leeds: 'United Kingdom',
      berlin: 'Germany',
      hamburg: 'Germany',
      munich: 'Germany',
      frankfurt: 'Germany',
      cologne: 'Germany',
      köln: 'Germany',
      dusseldorf: 'Germany',
      düsseldorf: 'Germany',
      stuttgart: 'Germany',
      leipzig: 'Germany',
      hannover: 'Germany',
      vienna: 'Austria',
      wien: 'Austria',
      zurich: 'Switzerland',
      basel: 'Switzerland',
      geneva: 'Switzerland',
      paris: 'France',
      lyon: 'France',
      marseille: 'France',
      madrid: 'Spain',
      barcelona: 'Spain',
      valencia: 'Spain',
      maastricht: 'Netherlands',
      monterrey: 'Mexico',
      guadalajara: 'Mexico',
      bangkok: 'Thailand',
      istanbul: 'Turkey',
      lisbon: 'Portugal',
      porto: 'Portugal',
      amsterdam: 'Netherlands',
      rotterdam: 'Netherlands',
      utrecht: 'Netherlands',
      antwerp: 'Belgium',
      brussels: 'Belgium',
      milan: 'Italy',
      bologna: 'Italy',
      rome: 'Italy',
      naples: 'Italy',
      turin: 'Italy',
      warsaw: 'Poland',
      krakow: 'Poland',
      prague: 'Czech Republic',
      budapest: 'Hungary',
      stockholm: 'Sweden',
      gothenburg: 'Sweden',
      copenhagen: 'Denmark',
      oslo: 'Norway',
      helsinki: 'Finland',
      dublin: 'Ireland',
      reykjavik: 'Iceland',
      newyork: 'United States',
      'new york': 'United States',
      miami: 'United States',
      chicago: 'United States',
      dallas: 'United States',
      austin: 'United States',
      houston: 'United States',
      boston: 'United States',
      seattle: 'United States',
      denver: 'United States',
      phoenix: 'United States',
      orlando: 'United States',
      tampa: 'United States',
      atlanta: 'United States',
      nashville: 'United States',
      losangeles: 'United States',
      'los angeles': 'United States',
      sandiego: 'United States',
      'san diego': 'United States',
      sanfrancisco: 'United States',
      'san francisco': 'United States',
      lasvegas: 'United States',
      'las vegas': 'United States',
      philadelphia: 'United States',
      washington: 'United States',
      beijing: 'China',
      toronto: 'Canada',
      montreal: 'Canada',
      vancouver: 'Canada',
      calgary: 'Canada',
      ottawa: 'Canada',
      sydney: 'Australia',
      melbourne: 'Australia',
      brisbane: 'Australia',
      perth: 'Australia',
      adelaide: 'Australia',
      mumbai: 'India',
      auckland: 'New Zealand',
      wellington: 'New Zealand',
      christchurch: 'New Zealand',
      acapulco: 'Mexico',
      dubai: 'United Arab Emirates',
      'abu dhabi': 'United Arab Emirates',
      doha: 'Qatar',
      riyadh: 'Saudi Arabia',
    }

    const country = countryMap[key] || null
    return { city, country }
  }

  private cityToCountryMap() {
    // Reuse the same map as above for quick lookups
    return {
      london: 'United Kingdom',
      manchester: 'United Kingdom',
      glasgow: 'United Kingdom',
      birmingham: 'United Kingdom',
      cardiff: 'United Kingdom',
      liverpool: 'United Kingdom',
      leeds: 'United Kingdom',
      berlin: 'Germany',
      hamburg: 'Germany',
      munich: 'Germany',
      frankfurt: 'Germany',
      cologne: 'Germany',
      köln: 'Germany',
      dusseldorf: 'Germany',
      düsseldorf: 'Germany',
      stuttgart: 'Germany',
      leipzig: 'Germany',
      hannover: 'Germany',
      vienna: 'Austria',
      wien: 'Austria',
      zurich: 'Switzerland',
      basel: 'Switzerland',
      geneva: 'Switzerland',
      paris: 'France',
      lyon: 'France',
      marseille: 'France',
      madrid: 'Spain',
      barcelona: 'Spain',
      valencia: 'Spain',
      maastricht: 'Netherlands',
      monterrey: 'Mexico',
      guadalajara: 'Mexico',
      bangkok: 'Thailand',
      istanbul: 'Turkey',
      lisbon: 'Portugal',
      porto: 'Portugal',
      amsterdam: 'Netherlands',
      rotterdam: 'Netherlands',
      utrecht: 'Netherlands',
      antwerp: 'Belgium',
      brussels: 'Belgium',
      milan: 'Italy',
      bologna: 'Italy',
      rome: 'Italy',
      naples: 'Italy',
      turin: 'Italy',
      warsaw: 'Poland',
      krakow: 'Poland',
      prague: 'Czech Republic',
      budapest: 'Hungary',
      stockholm: 'Sweden',
      gothenburg: 'Sweden',
      copenhagen: 'Denmark',
      oslo: 'Norway',
      helsinki: 'Finland',
      dublin: 'Ireland',
      reykjavik: 'Iceland',
      newyork: 'United States',
      'new york': 'United States',
      miami: 'United States',
      chicago: 'United States',
      dallas: 'United States',
      austin: 'United States',
      houston: 'United States',
      boston: 'United States',
      seattle: 'United States',
      denver: 'United States',
      phoenix: 'United States',
      orlando: 'United States',
      tampa: 'United States',
      atlanta: 'United States',
      nashville: 'United States',
      losangeles: 'United States',
      'los angeles': 'United States',
      sandiego: 'United States',
      'san diego': 'United States',
      sanfrancisco: 'United States',
      'san francisco': 'United States',
      lasvegas: 'United States',
      'las vegas': 'United States',
      philadelphia: 'United States',
      washington: 'United States',
      beijing: 'China',
      toronto: 'Canada',
      montreal: 'Canada',
      vancouver: 'Canada',
      calgary: 'Canada',
      ottawa: 'Canada',
      sydney: 'Australia',
      melbourne: 'Australia',
      brisbane: 'Australia',
      perth: 'Australia',
      adelaide: 'Australia',
      mumbai: 'India',
      auckland: 'New Zealand',
      wellington: 'New Zealand',
      christchurch: 'New Zealand',
      acapulco: 'Mexico',
      dubai: 'United Arab Emirates',
      'abu dhabi': 'United Arab Emirates',
      doha: 'Qatar',
      riyadh: 'Saudi Arabia',
    } as Record<string, string>
  }

  private matchCountryFromTitle(title: string): string | null {
    const countryList = [
      'United Kingdom',
      'Germany',
      'Austria',
      'Switzerland',
      'France',
      'Spain',
      'Portugal',
      'Netherlands',
      'Belgium',
      'Italy',
      'Poland',
      'Czech Republic',
      'Hungary',
      'Sweden',
      'Denmark',
      'Norway',
      'Finland',
      'Ireland',
      'Iceland',
      'United States',
      'Canada',
      'Australia',
      'New Zealand',
      'United Arab Emirates',
      'Qatar',
      'Saudi Arabia',
    ]
    const lower = title.toLowerCase()
    for (const c of countryList) {
      if (lower.includes(c.toLowerCase())) return c
    }
    return null
  }

  private async determineLocationWithAI(
    title: string,
  ): Promise<{ city: string | null; country: string | null }> {
    if (!openai) return { city: null, country: null }
    const prompt = `You are a precise location extractor. Task: Return the event city and country for a HYROX event title.
Rules:
- Ignore sponsor/venue words: Smart, Fit, Sports, World, Gym, Club, Fitness.
- Only output city and country; no extra text.
- If city is multi-word, keep intact, e.g., New York, Los Angeles.
- If unsure, guess the most likely country for that city.
- Respond STRICTLY as compact JSON with lowercase keys.
Examples:
- "Smart Fit HYROX Acapulco" -> {"city":"Acapulco","country":"Mexico"}
- "Sports World HYROX Maastricht" -> {"city":"Maastricht","country":"Netherlands"}
- "HYROX Istanbul" -> {"city":"Istanbul","country":"Turkey"}
- "Smart Fit HYROX Monterrey" -> {"city":"Monterrey","country":"Mexico"}
- "HYROX Bologna" -> {"city":"Bologna","country":"Italy"}

Title: ${title}`
    try {
      const res = await openai.chat.completions.create({
        model: 'chatgpt-4o-latest',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0,
      })
      const text = res.choices[0]?.message?.content?.trim() || ''
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}')
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1))
        return { city: parsed.city || null, country: parsed.country || null }
      }
      return { city: null, country: null }
    } catch {
      return { city: null, country: null }
    }
  }

  private async determineLocationWithAIFromDetails(
    title: string,
    detailText: string,
  ): Promise<{ city: string | null; country: string | null }> {
    if (!openai) return { city: null, country: null }
    const prompt = `Extract event city and country from this HYROX event.
Rules:
- Ignore sponsor words (Smart, Fit, Sports, World, Gym, Club, Fitness).
- Output only JSON with lowercase keys.
- Use the detail text to infer country if the title alone is ambiguous.
Title: ${title}
Detail: ${detailText.slice(0, 1200)}`
    try {
      const res = await openai.chat.completions.create({
        model: 'chatgpt-4o-latest',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0,
      })
      const text = res.choices[0]?.message?.content?.trim() || ''
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}')
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1))
        return { city: parsed.city || null, country: parsed.country || null }
      }
      return { city: null, country: null }
    } catch {
      return { city: null, country: null }
    }
  }

  private parseCityFromSlug(href: string): {
    city: string | null
    country: string | null
  } {
    try {
      const url = new URL(href)
      const slug = url.pathname.split('/').filter(Boolean).pop() || ''
      const cleaned = slug
        .replace(/hyrox-/i, '')
        .replace(/smart-fit-/i, '')
        .replace(/smart-*/i, '')
        .replace(/event-/i, '')
        .replace(/[^a-z\-]/gi, '-')
      const cityToken = cleaned.split('-').filter(Boolean).pop() || ''
      const city = this.normalizeCase(cityToken)
      const country = city ? this.cityToCountryMap()[city.toLowerCase()] || null : null
      return { city: city || null, country }
    } catch {
      return { city: null, country: null }
    }
  }

  private normalizeCase(s: string | null): string | null {
    if (!s) return s
    return s
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }
}

// Allow direct execution with ts-node
if (require.main === module) {
  ;(async () => {
    const limitArg = process.argv.find((a) => a.startsWith('--limit='))
    const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined
    const scraper = new HyroxScraper()
    try {
      const created = await scraper.scrapeToStaging(limit)
      console.log(`✅ Hyrox scraper completed: ${created.length} competitions staged`)
      process.exit(0)
    } catch (e) {
      console.error('❌ Hyrox scraper failed:', e)
      process.exit(1)
    }
  })()
}
