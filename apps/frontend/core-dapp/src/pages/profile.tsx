import { NextPage } from 'next'
import SEO from '../components/SEO'
import ProfilePage from '../features/profile/ProfilePage'

const Profile: NextPage = () => (
  <>
    <SEO
      title="Profile | prePO"
      description="Explore your profile on prePO"
      ogImageUrl="/prepo-og-image.png"
    />
    <ProfilePage />
  </>
)

export default Profile
