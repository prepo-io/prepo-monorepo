import React from 'react';
import { Helmet } from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';
import PropTypes from 'prop-types';
import _ from 'lodash';
import url from 'url';

import getAuthorProperties from './getAuthorProperties';
import ImageMeta from './ImageMeta';
import config from '../../../utils/siteConfig';

import { tags as tagsHelper } from '@tryghost/helpers';

const ArticleMetaGhost = ({ data, settings, canonical, pageContext }) => {
  const ghostPost = data;
  settings = settings.allGhostSettings.edges[0].node;

  const author = getAuthorProperties(ghostPost.primary_author);
  const publicTags = _.map(
    tagsHelper(ghostPost, { visibility: `public`, fn: tag => tag }),
    `name`
  );
  const primaryTag = publicTags[0] || ``;
  const shareImage = pageContext.feature_image_local
    ? url.resolve(
        config.siteUrl,
        pageContext.feature_image_local.images.fallback.src
      )
    : _.get(settings, `cover_image`, null);
  const publisherLogo =
    settings.logo || config.siteIcon
      ? url.resolve(config.siteUrl, settings.logo || config.siteIcon)
      : null;

  const jsonLd = {
    '@context': `https://schema.org/`,
    '@type': `Article`,
    author: {
      '@type': `Person`,
      name: author.name,
      image: author.image ? author.image : undefined,
      sameAs: author.sameAsArray ? author.sameAsArray : undefined,
    },
    keywords: publicTags.length ? publicTags.join(`, `) : undefined,
    headline: ghostPost.meta_title || ghostPost.title,
    url: canonical,
    datePublished: ghostPost.published_at,
    dateModified: ghostPost.updated_at,
    image: shareImage
      ? {
          '@type': `ImageObject`,
          url: shareImage,
          width: config.shareImageWidth,
          height: config.shareImageHeight,
        }
      : undefined,
    publisher: {
      '@type': `Organization`,
      name: settings.title,
      logo: {
        '@type': `ImageObject`,
        url: publisherLogo,
        width: 60,
        height: 60,
      },
    },
    description: ghostPost.meta_description || ghostPost.excerpt,
    mainEntityOfPage: {
      '@type': `WebPage`,
      '@id': config.siteUrl,
    },
  };

  return (
    <>
      <Helmet>
        <title>{ghostPost.meta_title || ghostPost.title}</title>
        <meta
          name="description"
          content={ghostPost.meta_description || ghostPost.excerpt}
        />
        <link rel="canonical" href={canonical} />

        <meta property="og:site_name" content={settings.title} />
        <meta property="og:type" content="article" />
        <meta
          property="og:title"
          content={
            ghostPost.og_title || ghostPost.meta_title || ghostPost.title
          }
        />
        <meta
          property="og:description"
          content={
            ghostPost.og_description ||
            ghostPost.excerpt ||
            ghostPost.meta_description
          }
        />
        <meta property="og:url" content={canonical} />
        <meta
          property="article:published_time"
          content={ghostPost.published_at}
        />
        <meta property="article:modified_time" content={ghostPost.updated_at} />
        {publicTags.map((keyword, i) => (
          <meta property="article:tag" content={keyword} key={i} />
        ))}
        {author.facebookUrl && (
          <meta property="article:author" content={author.facebookUrl} />
        )}

        <meta
          name="twitter:title"
          content={
            ghostPost.twitter_title || ghostPost.meta_title || ghostPost.title
          }
        />
        <meta
          name="twitter:description"
          content={
            ghostPost.twitter_description ||
            ghostPost.excerpt ||
            ghostPost.meta_description
          }
        />
        <meta name="twitter:url" content={canonical} />
        <meta name="twitter:label1" content="Written by" />
        <meta name="twitter:data1" content={author.name} />
        {primaryTag && <meta name="twitter:label2" content="Filed under" />}
        {primaryTag && <meta name="twitter:data2" content={primaryTag} />}

        {settings.twitter && (
          <meta
            name="twitter:site"
            content={`https://twitter.com/${settings.twitter.replace(
              /^@/,
              ``
            )}/`}
          />
        )}
        {settings.twitter && (
          <meta name="twitter:creator" content={settings.twitter} />
        )}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd, undefined, 4)}
        </script>
      </Helmet>
      <ImageMeta image={shareImage} />
    </>
  );
};

ArticleMetaGhost.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string.isRequired,
    published_at: PropTypes.string.isRequired,
    updated_at: PropTypes.string.isRequired,
    meta_title: PropTypes.string,
    meta_description: PropTypes.string,
    primary_author: PropTypes.object.isRequired,
    feature_image: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        slug: PropTypes.string,
        visibility: PropTypes.string,
      })
    ),
    primaryTag: PropTypes.shape({
      name: PropTypes.string,
    }),
    og_title: PropTypes.string,
    og_description: PropTypes.string,
    twitter_title: PropTypes.string,
    twitter_description: PropTypes.string,
    excerpt: PropTypes.string.isRequired,
  }).isRequired,
  settings: PropTypes.shape({
    logo: PropTypes.object,
    title: PropTypes.string,
    twitter: PropTypes.string,
    allGhostSettings: PropTypes.object.isRequired,
  }).isRequired,
  canonical: PropTypes.string.isRequired,
};

const ArticleMetaQuery = props => (
  <StaticQuery
    query={graphql`
      query GhostSettingsArticleMeta {
        allGhostSettings {
          edges {
            node {
              ...GhostSettingsFields
            }
          }
        }
      }
    `}
    render={data => <ArticleMetaGhost settings={data} {...props} />}
  />
);

export default ArticleMetaQuery;
