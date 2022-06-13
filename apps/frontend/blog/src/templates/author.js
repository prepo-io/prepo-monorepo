import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';

import { Layout, PostCard, Pagination } from '../components/common';
import { MetaData } from '../components/common/meta';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

/**
 * Author page (/author/:slug)
 *
 * Loads all posts for the requested author incl. pagination.
 *
 */
const Author = ({ data, location, pageContext }) => {
  const author = data.ghostAuthor;
  const posts = data.allGhostPost.edges;
  const twitterUrl = author.twitter
    ? `https://twitter.com/${author.twitter.replace(/^@/, ``)}`
    : null;
  const facebookUrl = author.facebook
    ? `https://www.facebook.com/${author.facebook.replace(/^\//, ``)}`
    : null;

  return (
    <>
      <MetaData data={data} location={location} type="profile" />
      <Layout>
        <div className="container">
          <header className="author-header">
            <div className="author-header-content">
              <h1>{author.name}</h1>
              {author.bio && <p>{author.bio}</p>}
              <div className="author-header-meta">
                {author.website && (
                  <a
                    className="author-header-item"
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website
                  </a>
                )}
                {twitterUrl && (
                  <a
                    className="author-header-item"
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter
                  </a>
                )}
                {facebookUrl && (
                  <a
                    className="author-header-item"
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                )}
              </div>
            </div>
            <div className="author-header-image">
              <GatsbyImage
                image={getImage(pageContext.localProfileImage)}
                alt={author.name}
                loading='eager'
                placeholder="blurred"
              />
            </div>
          </header>
          <section className="post-feed">
            {posts.map(({ node }, i) => (
              // The tag below includes the markup for each post - components/common/PostCard.js
              <PostCard
                key={node.id}
                post={node}
                localImages={pageContext.localImageMappings[i]}
                localAuthorImage={pageContext.localProfileImage}
              />
            ))}
          </section>
          <Pagination pageContext={pageContext} />
        </div>
      </Layout>
    </>
  );
};

Author.propTypes = {
  data: PropTypes.shape({
    ghostAuthor: PropTypes.shape({
      name: PropTypes.string.isRequired,
      cover_image: PropTypes.string,
      profile_image: PropTypes.string,
      website: PropTypes.string,
      bio: PropTypes.string,
      location: PropTypes.string,
      facebook: PropTypes.string,
      twitter: PropTypes.string,
    }),
    allGhostPost: PropTypes.object.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  pageContext: PropTypes.object,
};

export default Author;

export const pageQuery = graphql`
  query GhostAuthorQuery($slug: String!, $limit: Int!, $skip: Int!) {
    ghostAuthor(slug: { eq: $slug }) {
      ...GhostAuthorFields
    }
    allGhostPost(
      sort: { order: DESC, fields: [published_at] }
      filter: { authors: { elemMatch: { slug: { eq: $slug } } } }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          ...GhostPostFields
        }
      }
    }
  }
`;
