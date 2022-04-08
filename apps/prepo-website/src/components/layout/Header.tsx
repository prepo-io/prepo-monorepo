import clsx from 'clsx'
import { FC } from 'react'
import Banner from './Banner'
import { Icon } from '../Icon'
import { IconButton, IconButtonProps } from '../IconButton'

const SHOW_LAUNCH_APP_BTN = false

type MobileMenuLinkProps = {
  href: string
  title: string
}

const MobileMenuLink: FC<MobileMenuLinkProps> = ({ href, title }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="mb-8 text-2xl font-medium text-primary"
  >
    {title}
  </a>
)

const externalLinks: MobileMenuLinkProps[] = [
  {
    href: 'https://docs.prepo.io/faq',
    title: 'FAQs',
  },
  {
    href: 'https://simulator.prepo.io',
    title: 'Simulator',
  },
  {
    href: 'https://docs.prepo.io',
    title: 'Docs',
  },
  {
    href: 'https://prepo.io/blog',
    title: 'Blog',
  },
  {
    href: 'https://acquisitionroyale.com',
    title: 'NFT Game',
  },
]

const IconButtonSized: FC<IconButtonProps> = (props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <IconButton {...props} className="w-12 h-10 rounded" />
)

const SocialLinks: FC = () => (
  <div className="flex gap-4">
    <a href="https://twitter.com/prepo_io" target="_blank" rel="noreferrer">
      <IconButtonSized icon="twitter" aria-label="Twitter" />
    </a>
    <a href="https://url.prepo.io/discord-website-desktop" target="_blank" rel="noreferrer">
      <IconButtonSized icon="discord" aria-label="Twitter" />
    </a>
  </div>
)

const MobileMenu: FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <div
    className={clsx(
      !isOpen && 'hidden',
      'flex relative flex-col grow justify-between items-center lg:hidden'
    )}
  >
    <div className="flex flex-col justify-center items-center mt-1">
      {externalLinks.map(({ title, href }) => (
        <MobileMenuLink key={title} title={title} href={href} />
      ))}
      {SHOW_LAUNCH_APP_BTN && (
        <button
          type="button"
          className="mt-7 w-56 h-16 font-semibold text-background bg-prepo rounded"
        >
          Launch App
        </button>
      )}
    </div>
    <div className="mb-9">
      <SocialLinks />
    </div>
  </div>
)

const DesktopLink: FC<{ href: string; selected?: boolean; remote?: boolean }> = ({
  children,
  href,
  selected = false,
  remote = false,
}) => (
  <a href={href} target={remote ? '_blank' : '_self'} rel="noreferrer">
    <span
      className={clsx(
        selected ? 'font-semibold text-prepo' : 'font-normal text-primary hover:text-prepo-accent',
        'text-lg whitespace-nowrap'
      )}
    >
      {children}
    </span>
  </a>
)

const DesktopItems: FC = () => (
  <>
    <div className="hidden gap-9 justify-around mx-11 lg:flex lg:visible xl:gap-11 xl:mx-24">
      {externalLinks.map(({ title, href }) => (
        <DesktopLink key={title} href={href} remote>
          {title}
        </DesktopLink>
      ))}
    </div>
    <div className="hidden gap-4 justify-center items-center lg:flex lg:visible">
      {SHOW_LAUNCH_APP_BTN && (
        <button
          type="button"
          className="w-36 h-10 font-semibold text-background bg-prepo hover:bg-prepo-accent rounded transition-all"
        >
          Launch App
        </button>
      )}
      <SocialLinks />
    </div>
  </>
)

export const Header: FC<{ isMobileMenuOpen: boolean; toggleMobileMenu: () => void }> = ({
  isMobileMenuOpen,
  toggleMobileMenu,
}) => (
  <div
    className={clsx(
      'flex flex-col mx-auto w-full lg:static lg:h-auto',
      isMobileMenuOpen && 'fixed top-0 right-0 z-10 h-screen bg-background'
    )}
  >
    <Banner />
    <div className="flex justify-between items-center mx-8 mt-14 mb-7 max-w-6xl lg:my-9 lg:mx-auto">
      <img
        src="/prepo-logo.svg"
        alt="prePO logo"
        className="w-[102.5px]"
        width="685.71"
        height="230.25"
      />
      <DesktopItems />
      <button
        type="button"
        aria-label={isMobileMenuOpen ? 'close navigation menu' : 'open navigation menu'}
        className={clsx(
          'flex justify-center items-center w-12 h-12 rounded-full shadow-prepo-4 lg:hidden'
        )}
        onClick={toggleMobileMenu}
      >
        <Icon name={isMobileMenuOpen ? 'cross' : 'burger'} height="14px" width="20px" />
      </button>
    </div>
    <MobileMenu isOpen={isMobileMenuOpen} />
  </div>
)
