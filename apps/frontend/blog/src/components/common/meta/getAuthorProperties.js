import _ from 'lodash'
import PropTypes from 'prop-types'

export const getAuthorProperties = (primaryAuthor) => {
    let authorProfiles = []

    authorProfiles.push(
        primaryAuthor.website ? primaryAuthor.website : null,
        primaryAuthor.twitter ? `https://twitter.com/${primaryAuthor.twitter.replace(/^@/, ``)}/` : null,
        primaryAuthor.facebook ? `https://www.facebook.com/${primaryAuthor.facebook.replace(/^\//, ``)}/` : null
    )

    authorProfiles = _.compact(authorProfiles)

    return {
        name: primaryAuthor.name || null,
        sameAsArray: authorProfiles.length ? `["${_.join(authorProfiles, `", "`)}"]` : null,
        image: primaryAuthor.profile_image || null,
        facebookUrl: primaryAuthor.facebook ? `https://www.facebook.com/${primaryAuthor.facebook.replace(/^\//, ``)}/` : null,
    }
}

getAuthorProperties.defaultProps = {
    fetchAuthorData: false,
}

getAuthorProperties.PropTypes = {
    primaryAuthor: PropTypes.shape({
        name: PropTypes.string.isRequired,
        profile_image: PropTypes.string,
        website: PropTypes.string,
        twitter: PropTypes.string,
        facebook: PropTypes.string,
    }).isRequired,
}

export default getAuthorProperties
