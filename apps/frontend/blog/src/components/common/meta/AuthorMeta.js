import React from 'react'
import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { StaticQuery, graphql } from 'gatsby'

import ImageMeta from './ImageMeta'
import getAuthorProperties from './getAuthorProperties'
import config from '../../../utils/siteConfig'

const AuthorMeta = ({ data, settings, canonical }) => {
    settings = settings.allGhostSettings.edges[0].node

    const author = getAuthorProperties(data)
    const shareImage = author.image || _.get(settings, `cover_image`, null)
    const title = `${data.name} - ${settings.title}`
    const description = data.bio || config.siteDescriptionMeta || settings.description

    const jsonLd = {
        "@context": `https://schema.org/`,
        "@type": `Person`,
        name: data.name,
        sameAs: author.sameAsArray ? author.sameAsArray : undefined,
        url: canonical,
        image: shareImage ? {
            "@type": `ImageObject`,
            url: shareImage,
            width: config.shareImageWidth,
            height: config.shareImageHeight,
        } : undefined,
        mainEntityOfPage: {
            "@type": `WebPage`,
            "@id": config.siteUrl,
        },
        description,
    }

    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={canonical} />
                <meta property="og:site_name" content={settings.title} />
                <meta property="og:type" content="profile" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonical} />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:url" content={canonical} />
                {settings.twitter && <meta name="twitter:site" content={`https://twitter.com/${settings.twitter.replace(/^@/, ``)}/`} />}
                {settings.twitter && <meta name="twitter:creator" content={settings.twitter} />}
                <script type="application/ld+json">{JSON.stringify(jsonLd, undefined, 4)}</script>
            </Helmet>
            <ImageMeta image={shareImage} />
        </>
    )
}

AuthorMeta.propTypes = {
    data: PropTypes.shape({
        name: PropTypes.string,
        bio: PropTypes.string,
        profile_image: PropTypes.string,
        website: PropTypes.string,
        twitter: PropTypes.string,
        facebook: PropTypes.string,
    }).isRequired,
    settings: PropTypes.shape({
        title: PropTypes.string,
        twitter: PropTypes.string,
        description: PropTypes.string,
        allGhostSettings: PropTypes.object.isRequired,
    }).isRequired,
    canonical: PropTypes.string.isRequired,
}

const AuthorMetaQuery = props => (
    <StaticQuery
        query={graphql`
            query GhostSettingsAuthorMeta {
                allGhostSettings {
                    edges {
                        node {
                            ...GhostSettingsFields
                        }
                    }
                }
            }
        `}
        render={data => <AuthorMeta settings={data} {...props} />}
    />
)

export default AuthorMetaQuery
