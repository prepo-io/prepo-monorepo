const path = require(`path`);

const config = require(`./src/utils/siteConfig`);
const generateRSSFeed = require(`./src/utils/rss/generate-feed`);

let ghostConfig;

try {
  ghostConfig = require(`./.ghost`);
} catch (e) {
  ghostConfig = {
    production: {
      apiUrl: process.env.GHOST_API_URL,
      contentApiKey: process.env.GHOST_CONTENT_API_KEY,
    },
  };
} finally {
  const { apiUrl, contentApiKey } =
    process.env.NODE_ENV === `development`
      ? ghostConfig.development
      : ghostConfig.production;

  if (!apiUrl || !contentApiKey || contentApiKey.match(/<key>/)) {
    throw new Error(
      `GHOST_API_URL and GHOST_CONTENT_API_KEY are required to build. Check the README.`
    ); 
  }
}

if (
  process.env.NODE_ENV === `production` &&
  config.siteUrl === `http://localhost:8000` &&
  !process.env.SITEURL
) {
  throw new Error(
    `siteUrl can't be localhost and needs to be configured in siteConfig. Check the README.`
  );
}

/**
 * This is the place where you can tell Gatsby which plugins to use
 * and set them up the way you want.
 *
 * Further info 👉🏼 https://www.gatsbyjs.org/docs/gatsby-config/
 *
 */
module.exports = {
  pathPrefix: `/blog`,
  siteMetadata: {
    siteUrl: process.env.SITEURL || config.siteUrl,
  },
  plugins: [
    /**
     *  Content Plugins
     */
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        output: '/'
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: path.join(__dirname, `src`, `pages`),
        name: `pages`,
      },
    },
    // Setup for optimised images.
    // See https://www.gatsbyjs.org/packages/gatsby-plugin-image/
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: path.join(__dirname, `src`, `images`),
        name: `images`,
      },
    },
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        defaults: {
          formats: [`auto`, `webp`],
          placeholder: `dominantColor`,
          quality: 80,
          breakpoints: [750, 1080, 1366, 1920],
          backgroundColor: `transparent`,
          tracedSVGOptions: {},
          blurredOptions: {},
          jpgOptions: {},
          pngOptions: {},
          webpOptions: {},
          avifOptions: {},
        },
      },
    },
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-ghost`,
      options:
        process.env.NODE_ENV === `development`
          ? ghostConfig.development
          : ghostConfig.production,
    },
    /**
     *  Utility Plugins
     */
    {
      resolve: `gatsby-plugin-ghost-manifest`,
      options: {
        short_name: config.shortTitle,
        start_url: `/`,
        background_color: config.backgroundColor,
        theme_color: config.themeColor,
        display: `minimal-ui`,
        icon: `static/${config.siteIcon}`,
        legacy: true,
        query: `
                {
                    allGhostSettings {
                        edges {
                            node {
                                title
                                description
                            }
                        }
                    }
                }
              `,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
                {
                    allGhostSettings {
                        edges {
                            node {
                                title
                                description
                            }
                        }
                    }
                }
              `,
        feeds: [generateRSSFeed(config)],
      },
    },
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-force-trailing-slashes`,
    `gatsby-plugin-offline`
  ],
};
