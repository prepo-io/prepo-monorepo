import React from 'react';
import PropTypes from 'prop-types';
import { Link, graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { Helmet } from 'react-helmet';

import { Layout } from '../components/common';
import { MetaData } from '../components/common/meta';

import { readingTime as readingTimeHelper } from '@tryghost/helpers';

/**
 * Single post view (/:slug)
 *
 * This file renders a single post and loads all the content.
 *
 */
const Post = ({ data, location, pageContext }) => {
  const post = data.ghostPost;
  const feature_image = getImage(pageContext.feature_image_local);
  const author_image = getImage(pageContext.author_image_local);
  const readingTime = readingTimeHelper(post);

  let modifiedHtml = post.html;
  if (pageContext.localImageList) {
    pageContext.localImageList.forEach(([remote, local]) => {
      modifiedHtml = modifiedHtml.replace(remote, local);
    });
  }

  return (
    <>
      <MetaData
        data={data}
        location={location}
        pageContext={pageContext}
        type="article"
      />
      <Helmet>
        <style type="text/css">{`${post.codeinjection_styles}`}</style>
      </Helmet>
      <Layout>
        <div className="container">
          <article className="content">
            <div className="article-header">
              <div>
                {post.primary_tag ? (
                  <section className="article-tag">
                    <Link to={`/tag/${post.primary_tag.slug}/`}>
                      {post.primary_tag ? post.primary_tag.name : ''}
                    </Link>
                  </section>
                ) : null}
                <h1 className="content-title">{post.title}</h1>
                <p className="content-excerpt">{post.excerpt}</p>

                <section className="article-byline-content">
                  <ul className="author-list">
                    <li className="author-list-item">
                      <Link
                        to={`/author/${post.primary_author.slug}/`}
                        className="author-avatar"
                      >
                        <GatsbyImage
                          image={author_image}
                          alt={post.primary_author.name}
                          loading="eager"
                          placeholder="blurred"
                        />
                      </Link>
                    </li>
                  </ul>
                  <div className="article-byline-meta">
                    <h4 className="author-name">
                      <Link to={`/author/${post.primary_author.slug}/`}>
                        {post.primary_author.name}
                      </Link>
                    </h4>
                    <div className="byline-meta-content">
                      <time
                        className="byline-meta-date"
                        dateTime={post.published_at_pretty}
                      >
                        {post.published_at_pretty}
                      </time>
                      <span className="byline-reading-time">
                        <span className="bull">•</span>
                        {readingTime}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {pageContext.feature_image_local ? (
              <figure className="post-feature-image">
                <GatsbyImage
                  image={feature_image}
                  alt={post.title}
                  loading="eager"
                  placeholder="blurred"
                />
              </figure>
            ) : null}
            <section className="post-full-content">
              {/* The main post content */}
              <section
                className="content-body load-external-scripts"
                dangerouslySetInnerHTML={{ __html: modifiedHtml }}
              />
            </section>
          </article>
        </div>
      </Layout>
    </>
  );
};

Post.propTypes = {
  data: PropTypes.shape({
    ghostPost: PropTypes.shape({
      codeinjection_styles: PropTypes.object,
      title: PropTypes.string.isRequired,
      html: PropTypes.string.isRequired,
      feature_image: PropTypes.string,
    }).isRequired,
  }).isRequired,
  location: PropTypes.object.isRequired,
};

export default Post;

export const postQuery = graphql`
  query ($slug: String!) {
    ghostPost(slug: { eq: $slug }) {
      ...GhostPostFields
    }
  }
`;
