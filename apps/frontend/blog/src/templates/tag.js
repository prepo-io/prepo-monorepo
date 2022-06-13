import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';

import { Layout, PostCard, Pagination } from '../components/common';
import { MetaData } from '../components/common/meta';

/**
 * Tag page (/tag/:slug)
 *
 * Loads all posts for the requested tag incl. pagination.
 *
 */
const Tag = ({ data, location, pageContext }) => {
  const tag = data.ghostTag;
  const posts = data.allGhostPost.edges;

  return (
    <>
      <MetaData data={data} location={location} type="series" />
      <Layout>
        <div className="container">
          <header className="tag-header">
            <h1>{tag.name}</h1>
            {tag.description ? <p>{tag.description}</p> : null}
          </header>
          <section className="post-feed">
            {posts.map(({ node }, i) => (
              // The tag below includes the markup for each post - components/common/PostCard.js
              <PostCard
                key={node.id}
                post={node}
                localImages={pageContext.localImageMappings[i]}
                localAuthorImage={pageContext.localAuthorImages[i]}
              />
            ))}
          </section>
          <Pagination pageContext={pageContext} />
        </div>
      </Layout>
    </>
  );
};

Tag.propTypes = {
  data: PropTypes.shape({
    ghostTag: PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    }),
    allGhostPost: PropTypes.object.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  pageContext: PropTypes.object,
};

export default Tag;

export const pageQuery = graphql`
  query GhostTagQuery($slug: String!, $limit: Int!, $skip: Int!) {
    ghostTag(slug: { eq: $slug }) {
      ...GhostTagFields
    }
    allGhostPost(
      sort: { order: DESC, fields: [published_at] }
      filter: { tags: { elemMatch: { slug: { eq: $slug } } } }
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
