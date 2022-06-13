import React from 'react'
import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'
import config from '../../../utils/siteConfig'

const ImageMeta = ({ image }) => {
    if (!image) {
        return null
    }

    return (
        <Helmet>
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content={image} />
            <meta property="og:image" content={image} />
            <meta property="og:image:width" content={config.shareImageWidth} />
            <meta property="og:image:height" content={config.shareImageHeight} />
        </Helmet >
    )
}

ImageMeta.propTypes = {
    image: PropTypes.string,
}

export default ImageMeta
