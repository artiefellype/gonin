/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://gonin.vercel.app',
    generateRobotsTxt: true,
    robotsTxtOptions: {
      policies: [
        { userAgent: '*', allow: '/' },
      ],
    },
    sitemapSize: 5000,
    changefreq: 'daily',
    priority: 0.7,
  };
  