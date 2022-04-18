import { Flex, Link } from '@chakra-ui/react'
import { useState } from 'react'

const MediumIcon: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => (
  <svg width="50" height="50" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" transform="translate(2 2)" fill={isLight ? 'white' : '#F3D29D'} />
    <path
      d="M21.5374 19.815C21.5374 23.5789 18.507 26.6303 14.7686 26.6303C11.0302 26.6303 8 23.5798 8 19.815C8 16.0502 11.0305 13 14.7686 13C18.5067 13 21.5374 16.0511 21.5374 19.815Z"
      fill="#191623"
    />
    <path
      d="M28.9629 19.815C28.9629 23.3582 27.4475 26.2303 25.5785 26.2303C23.7094 26.2303 22.1941 23.3573 22.1941 19.815C22.1941 16.2727 23.7094 13.3997 25.5785 13.3997C27.4475 13.3997 28.9629 16.2727 28.9629 19.815Z"
      fill="#191623"
    />
    <path
      d="M30.8097 25.5629C31.467 25.5629 32 22.9896 32 19.815C32 16.6407 31.4675 14.0672 30.8099 14.0672C30.1523 14.0672 29.6193 16.6414 29.6193 19.815C29.6193 22.9887 30.1523 25.5629 30.8097 25.5629Z"
      fill="#191623"
    />
    {isLight && (
      <path
        d="M0 0V-1H-1V0H0ZM40 0H41V-1H40V0ZM40 40V41H41V40H40ZM0 40H-1V41H0V40ZM0 1H40V-1H0V1ZM39 0V40H41V0H39ZM40 39H0V41H40V39ZM1 40V0H-1V40H1Z"
        fill="white"
      />
    )}
  </svg>
)

const TwitterIcon: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => (
  <svg width="50" height="50" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" transform="translate(2 2)" fill={isLight ? 'white' : '#F3D29D'} />
    <path
      d="M27.9525 16.0457C27.9647 16.222 27.9647 16.3983 27.9647 16.5763C27.9647 21.9982 23.8371 28.2513 16.2897 28.2513V28.248C14.0601 28.2513 11.8769 27.6126 10 26.4085C10.3242 26.4475 10.65 26.467 10.9766 26.4678C12.8243 26.4694 14.6191 25.8495 16.0727 24.7079C14.3169 24.6746 12.7772 23.5298 12.2393 21.8584C12.8544 21.9771 13.4881 21.9527 14.0918 21.7877C12.1775 21.401 10.8003 19.7191 10.8003 17.7658C10.8003 17.7479 10.8003 17.7309 10.8003 17.7138C11.3707 18.0315 12.0093 18.2078 12.6626 18.2273C10.8596 17.0224 10.3039 14.6238 11.3926 12.7485C13.4759 15.312 16.5497 16.8704 19.8493 17.0354C19.5186 15.6102 19.9703 14.1168 21.0364 13.115C22.689 11.5615 25.2882 11.6411 26.8418 13.2929C27.7607 13.1117 28.6415 12.7745 29.4475 12.2968C29.1412 13.2466 28.5001 14.0534 27.6437 14.5661C28.457 14.4703 29.2517 14.2525 30 13.9202C29.4491 14.7457 28.7552 15.4648 27.9525 16.0457Z"
      fill="#191623"
    />
    {isLight && (
      <path
        d="M0 0V-1H-1V0H0ZM40 0H41V-1H40V0ZM40 40V41H41V40H40ZM0 40H-1V41H0V40ZM0 1H40V-1H0V1ZM39 0V40H41V0H39ZM40 39H0V41H40V39ZM1 40V0H-1V40H1Z"
        fill="white"
      />
    )}
  </svg>
)

const DiscordIcon: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => (
  <svg width="50" height="50" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" transform="translate(2 2)" fill={isLight ? 'white' : '#F3D29D'} />
    <path
      d="M28.3303 12.5559C26.7767 11.8291 25.1156 11.3008 23.3789 11C23.1656 11.3856 22.9164 11.9043 22.7446 12.3169C20.8985 12.0392 19.0693 12.0392 17.2572 12.3169C17.0854 11.9043 16.8306 11.3856 16.6154 11C14.8768 11.3008 13.2138 11.831 11.6602 12.5598C8.52664 17.295 7.67719 21.9126 8.10192 26.4646C10.1803 28.0166 12.1944 28.9595 14.1746 29.5764C14.6635 28.9035 15.0995 28.1883 15.4752 27.4344C14.7598 27.1626 14.0745 26.8271 13.4271 26.4376C13.5988 26.3104 13.7669 26.1773 13.9292 26.0404C17.8782 27.8875 22.1689 27.8875 26.0707 26.0404C26.235 26.1773 26.403 26.3104 26.5728 26.4376C25.9235 26.829 25.2364 27.1645 24.521 27.4363C24.8966 28.1883 25.3308 28.9055 25.8216 29.5783C27.8036 28.9614 29.8197 28.0186 31.898 26.4646C32.3964 21.1876 31.0467 16.6125 28.3303 12.5559ZM16.0132 23.6651C14.8277 23.6651 13.8556 22.5585 13.8556 21.2108C13.8556 19.8631 14.807 18.7545 16.0132 18.7545C17.2194 18.7545 18.1916 19.8612 18.1708 21.2108C18.1727 22.5585 17.2194 23.6651 16.0132 23.6651ZM23.9867 23.6651C22.8013 23.6651 21.8291 22.5585 21.8291 21.2108C21.8291 19.8631 22.7805 18.7545 23.9867 18.7545C25.193 18.7545 26.1651 19.8612 26.1444 21.2108C26.1444 22.5585 25.193 23.6651 23.9867 23.6651Z"
      fill="#191623"
    />
    {isLight && (
      <path
        d="M0 0V-1H-1V0H0ZM40 0H41V-1H40V0ZM40 40V41H41V40H40ZM0 40H-1V41H0V40ZM0 1H40V-1H0V1ZM39 0V40H41V0H39ZM40 39H0V41H40V39ZM1 40V0H-1V40H1Z"
        fill="white"
      />
    )}
  </svg>
)

const socialLinksArray: {
  Icon: React.FC<{ isLight?: boolean }>
  url: string
  key: string
}[] = [
  {
    key: 'discord',
    Icon: ({ isLight }): JSX.Element => <DiscordIcon isLight={isLight} />,
    url: 'https://url.prepo.io/discord-ar-landing',
  },
  {
    key: 'twitter',
    Icon: ({ isLight }): JSX.Element => <TwitterIcon isLight={isLight} />,
    url: 'https://twitter.com/AcqRoyale',
  },
  {
    key: 'medium',
    Icon: ({ isLight }): JSX.Element => <MediumIcon isLight={isLight} />,
    url: 'https://medium.com/prepo',
  },
]

const SocialLink: React.FC<{
  Icon: React.FC<{ isLight?: boolean }>
  url: string
  isMobileHeader?: boolean
}> = ({ Icon, url, isMobileHeader }) => {
  const [onHover, setOnHover] = useState(false)
  return (
    <Link
      href={url}
      onMouseEnter={(): void => setOnHover(true)}
      onMouseLeave={(): void => setOnHover(false)}
      m={2}
      isExternal
    >
      <Icon isLight={isMobileHeader || onHover} />
    </Link>
  )
}

const SocialLinks: React.FC<{ isMobileHeader?: boolean }> = ({ isMobileHeader = false }) => (
  <Flex flex-direction="row" alignItems="center" justifyContent="center">
    {socialLinksArray.map(({ key, ...otherProps }) => (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <SocialLink key={key} isMobileHeader={isMobileHeader} {...otherProps} />
    ))}
  </Flex>
)

export default SocialLinks
