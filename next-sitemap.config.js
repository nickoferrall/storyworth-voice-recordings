module.exports = {
  siteUrl: 'https://fitlo.co',
  generateRobotsTxt: true,
  exclude: ['/events/*'],
  changefreq: 'daily',
  priority: 0.9,
  robotsTxtOptions: {
    additionalSitemaps: ['https://fitlo.co/api/sitemap.xml'],
  },
  transform: async (config, path) => {
    if (path.includes('/explore/')) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}
