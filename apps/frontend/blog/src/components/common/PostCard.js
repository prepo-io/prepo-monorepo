import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { Tags } from '@tryghost/helpers-gatsby';
import { readingTime as readingTimeHelper } from '@tryghost/helpers';

const PostCard = ({ post, localImages, localAuthorImage }) => {
  const url = `/${post.slug}/`;
  const readingTime = readingTimeHelper(post);
  const authorImage = getImage(localAuthorImage);

  return (
    <Link to={url} className="post-card">
      <header className="post-card-header">
        {post.feature_image && (
          <div
            className="post-card-image"
            style={{
              backgroundImage: `url(${localImages[post.feature_image]})`,
            }}
          ></div>
        )}
        {post.tags && (
          <div className="post-card-tags">
            {' '}
            <Tags post={post} visibility="public" autolink={false} />
          </div>
        )}
        {post.featured && <span>Featured</span>}
        <h2 className="post-card-title">{post.title}</h2>
      </header>
      <section className="post-card-excerpt">{post.excerpt}</section>
      <footer className="post-card-footer">
        <div className="post-card-footer-left">
          <div className="post-card-avatar">
            {authorImage ? (
              <GatsbyImage
                image={authorImage}
                alt={post.primary_author.name}
                loading="eager"
                placeholder="blurred"
              />
            ) : (
              <img
                className="default-avatar"
                src="/blog/images/icons/avatar.svg"
                alt={post.primary_author.name}
              />
            )}
          </div>
          <span>{post.primary_author.name}</span>
        </div>
        <div className="post-card-footer-right">
          <div>{readingTime}</div>
        </div>
      </footer>
    </Link>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    feature_image: PropTypes.string,
    featured: PropTypes.bool,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
      })
    ),
    excerpt: PropTypes.string.isRequired,
    primary_author: PropTypes.shape({
      name: PropTypes.string.isRequired,
      profile_image: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default PostCard;
