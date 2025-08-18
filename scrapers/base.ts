import puppeteer from 'puppeteer'

export abstract class BaseScraper {
  abstract name: string

  protected async initBrowser() {
    console.log(`🚀 Initializing browser for ${this.name} scraper...`)

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ],
    })

    return browser
  }

  protected async setPageDefaults(page: any) {
    // Set user agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    )

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 })

    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    })
  }

  protected async randomDelay(min: number = 1000, max: number = 3000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  // Helper method to generate consistent IDs
  protected generateId(title: string, date: string): string {
    const combined = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${date}`
    return combined.substring(0, 50)
  }
}
