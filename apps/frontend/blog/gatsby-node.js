const fs = require('fs');
const url = require('url');
const path = require(`path`);
const { postsPerPage } = require(`./src/utils/siteConfig`);
const { paginate } = require(`gatsby-awesome-pagination`);
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);
const { compress } = require('compress-images/promise');
const cheerio = require(`cheerio`);

/**
 * Here is the place where Gatsby creates the URLs for all the
 * posts, tags, pages and authors that we fetched from the Ghost site.
 */
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      allGhostPost(sort: { order: ASC, fields: published_at }) {
        edges {
          node {
            slug
            localImageList
            primary_author {
              id
            }
            tags {
              id
            }
            feature_image_local {
              childImageSharp {
                gatsbyImageData
              }
            }
            author_image_local {
              childImageSharp {
                gatsbyImageData(placeholder: BLURRED)
              }
            }
          }
        }
      }
      allGhostTag(sort: { order: ASC, fields: name }) {
        edges {
          node {
            id
            slug
            url
            postCount
          }
        }
      }
      allGhostAuthor(sort: { order: ASC, fields: name }) {
        edges {
          node {
            id
            slug
            url
            postCount
            profile_image_local {
              childImageSharp {
                gatsbyImageData(placeholder: BLURRED)
              }
            }
          }
        }
      }
      allGhostPage(sort: { order: ASC, fields: published_at }) {
        edges {
          node {
            slug
            url
          }
        }
      }
    }
  `);

  // Check for any errors
  if (result.errors) {
    throw new Error(result.errors);
  }

  // Extract query results
  const tags = result.data.allGhostTag.edges;
  const authors = result.data.allGhostAuthor.edges;
  const pages = result.data.allGhostPage.edges;
  const posts = result.data.allGhostPost.edges;

  // Load templates
  const indexTemplate = path.resolve(`./src/templates/index.js`);
  const tagsTemplate = path.resolve(`./src/templates/tag.js`);
  const authorTemplate = path.resolve(`./src/templates/author.js`);
  const pageTemplate = path.resolve(`./src/templates/page.js`);
  const postTemplate = path.resolve(`./src/templates/post.js`);

  // Create tag pages
  tags.forEach(({ node }) => {
    const totalPosts = node.postCount !== null ? node.postCount : 0;

    // This part here defines, that our tag pages will use
    // a `/tag/:slug/` permalink.
    const url = `/tag/${node.slug}`;

    const items = Array.from({ length: totalPosts });

    // Create pagination
    paginate({
      createPage,
      items: items,
      itemsPerPage: postsPerPage,
      component: tagsTemplate,
      pathPrefix: ({ pageNumber }) => (pageNumber === 0 ? url : `${url}/page`),
      context: {
        slug: node.slug,
        localImageMappings: posts
          .filter(post => {
            return post.node.tags.filter(tag => tag.id === node.id).length > 0;
          })
          .reverse()
          .map(({ node }) =>
            node.localImageList.reduce((acc, [remote, local]) => {
              return { ...acc, [remote]: local };
            }, {})
          ),
        localAuthorImages: posts
          .filter(post => {
            return post.node.tags.filter(tag => tag.id === node.id).length > 0;
          })
          .reverse()
          .map(
            ({ node }) =>
              node.author_image_local.childImageSharp.gatsbyImageData
          ),
      },
    });
  });

  // Create author pages
  authors.forEach(({ node }) => {
    const totalPosts = node.postCount !== null ? node.postCount : 0;

    // This part here defines, that our author pages will use
    // a `/author/:slug/` permalink.
    const url = `/author/${node.slug}`;

    const items = Array.from({ length: totalPosts });

    // Create pagination
    paginate({
      createPage,
      items: items,
      itemsPerPage: postsPerPage,
      component: authorTemplate,
      pathPrefix: ({ pageNumber }) => (pageNumber === 0 ? url : `${url}/page`),
      context: {
        slug: node.slug,
        localProfileImage:
          node.profile_image_local.childImageSharp.gatsbyImageData,
        localImageMappings: posts
          .filter(post => {
            return post.node.primary_author.id === node.id;
          })
          .reverse()
          .map(({ node }) =>
            node.localImageList.reduce((acc, [remote, local]) => {
              return { ...acc, [remote]: local };
            }, {})
          ),
      },
    });
  });

  // Create pages
  pages.forEach(({ node }) => {
    // This part here defines, that our pages will use
    // a `/:slug/` permalink.
    node.url = `/${node.slug}/`;

    createPage({
      path: node.url,
      component: pageTemplate,
      context: {
        // Data passed to context is available
        // in page queries as GraphQL variables.
        slug: node.slug,
      },
    });
  });

  // Create post pages
  posts.forEach(({ node }) => {
    // This part here defines, that our posts will use
    // a `/:slug/` permalink.
    node.url = `/${node.slug}/`;

    createPage({
      path: node.url,
      component: postTemplate,
      context: {
        // Data passed to context is available
        // in page queries as GraphQL variables.
        slug: node.slug,
        feature_image_local:
          node.feature_image_local.childImageSharp.gatsbyImageData,
        author_image_local:
          node.author_image_local.childImageSharp.gatsbyImageData,
        localImageList: node.localImageList,
      },
    });
  });

  // Create pagination
  paginate({
    createPage,
    items: posts,
    itemsPerPage: postsPerPage,
    component: indexTemplate,
    pathPrefix: ({ pageNumber }) => {
      if (pageNumber === 0) {
        return `/`;
      } else {
        return `/page`;
      }
    },
    context: {
      localImageMappings: posts.reverse().map(({ node }) =>
        node.localImageList.reduce((acc, [remote, local]) => {
          return { ...acc, [remote]: local };
        }, {})
      ),
      localAuthorImages: posts
        .reverse()
        .map(
          ({ node }) => node.author_image_local.childImageSharp.gatsbyImageData
        ),
    },
  });
};

exports.onCreateNode = async ({
  node,
  actions: { createNode },
  createNodeId,
  getCache,
}) => {
  if (node.internal.type === 'GhostAuthor') {
    const fileNode = await addRemoteToLocalImageList(
      node.profile_image,
      node,
      createNode,
      createNodeId,
      getCache
    );
    if (fileNode) {
      node.profile_image_local___NODE = fileNode.id;
    }
  }

  if (node.internal.type === 'GhostPost') {
    // Compress and host site images
    // Compress and host post post content
    const html = node.html;
    const $ = cheerio.load(html);
    const promis = $('body')
      .find('img')
      .map(async (i, el) => {
        if (el.attribs.srcset) {
          const promis = el.attribs.srcset.split(' ').map(async item => {
            const fileUrl = url.parse(item);
            if (!fileUrl.protocol) return;
            return addRemoteToLocalImageList(
              item,
              node,
              createNode,
              createNodeId,
              getCache
            );
          });
          await Promise.all(promis);
        }
        if (!el.attribs.src.includes('prepo.io')) return;
        await addRemoteToLocalImageList(
          el.attribs.src,
          node,
          createNode,
          createNodeId,
          getCache
        );
      });
    await Promise.all(promis);

    const featureNode = await addRemoteToLocalImageList(
      node.feature_image,
      node,
      createNode,
      createNodeId,
      getCache
    );
    if (featureNode) {
      node.feature_image_local___NODE = featureNode.id;
    }

    const authorNode = await addRemoteToLocalImageList(
      node.primary_author.profile_image,
      node,
      createNode,
      createNodeId,
      getCache
    );
    if (authorNode) {
      node.author_image_local___NODE = authorNode.id;
    }
  }
};

async function addRemoteToLocalImageList(
  url,
  node,
  createNode,
  createNodeId,
  getCache
) {
  const fileNode = await createRemoteFileNode({
    url,
    parentNodeId: node.id,
    createNode,
    createNodeId,
    getCache,
  });
  const obfuscatedFileName = `${fileNode.internal.contentDigest}${fileNode.ext}`;
  const obfuscatedFilePath = `${fileNode.dir}/${obfuscatedFileName}`;

  // Create file where name is its contentDigest
  fs.copyFileSync(fileNode.absolutePath, obfuscatedFilePath);
  if (!fs.existsSync('./public')) fs.mkdirSync('./public');
  if (!fs.existsSync('./public/images'))
    fs.mkdirSync('./public/images');
  await compressImage(obfuscatedFilePath, './public/images/');
  if (!node.localImageList) node.localImageList = [];
  const absoluteBrowserPath = `/blog/images/${obfuscatedFileName}`;
  node.localImageList.push([url, absoluteBrowserPath]);
  fileNode.absolutePath = obfuscatedFilePath;
  fileNode.relativePath = obfuscatedFilePath;
  fileNode.base = obfuscatedFileName;
  fileNode.name = obfuscatedFileName.split('.')[0];
  return fileNode;
}

const compressImage = (src, dest) => {
  return compress({
    source: src,
    destination: dest,
    enginesSetup: {
      jpg: { engine: 'mozjpeg', command: ['-quality', '80'] },
      png: { engine: 'pngquant', command: ['--quality=60-80', '-o'] },
    },
  });
};
