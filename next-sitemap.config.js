const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://gonin.vercel.app";

const sitemapExcludedRoutes = [
  "/forum",
  "/login",
  "/register",
  "/post/*",
  "/profile/*",
  "/testeapi",
  "/topics",
  "/topics/*",
];

const robotsBlockedRoutes = ["/testeapi"];

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  exclude: sitemapExcludedRoutes,
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.7,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: robotsBlockedRoutes,
      },
    ],
  },
  transform: async (config, path) => ({
    loc: path,
    changefreq: path === "/" ? "weekly" : config.changefreq,
    priority: path === "/" ? 1.0 : config.priority,
    lastmod: new Date().toISOString(),
  }),
};
