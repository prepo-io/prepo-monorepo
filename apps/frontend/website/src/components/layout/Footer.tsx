import clsx from 'clsx'
import ReCAPTCHA from 'react-google-recaptcha'
import { createRef, FC, useState, KeyboardEvent } from 'react'
import Head from 'next/head'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { IconButton, IconButtonProps } from '../IconButton'
import { subscribe } from '../../utils/mailchimp-subscribe'
import { EMAIL_REGEX, RECAPTCHA_SITE_ID } from '../../lib/constants'

const Nav: FC = ({ children }) => (
  <nav className="font-medium">
    <ul className="flex flex-col gap-12 my-10 sm:flex-row sm:gap-20 sm:justify-around lg:my-0">
      {children}
    </ul>
  </nav>
)

type NavGroupProps = { title: string }
const NavGroup: FC<NavGroupProps> = ({ title, children }) => (
  <li>
    <div className="text-base text-secondary sm:text-lg text-opacity-[62%]">{title}</div>
    <ul className="pt-4 space-y-[14px]">{children}</ul>
  </li>
)

type NavItemProps = { title: string; href: string }
const NavItem: FC<NavItemProps> = ({ title, href }) => (
  <li>
    <a
      href={href}
      target="_blank"
      className="text-sm hover:text-prepo-accent sm:text-base"
      rel="noreferrer"
    >
      {title}
    </a>
  </li>
)

const NewsletterSignup: FC = () => {
  const recaptchaRef = createRef<ReCAPTCHA>()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const onUserSubscribe = (): void => {
    setLoading(true)
    subscribe(email, recaptchaRef).finally(() => setLoading(false))
  }
  const disabled = !EMAIL_REGEX.test(email)
  return (
    <>
      {/* Must place ReCAPTCHA component where we want challenge to appear */}
      <Head>
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://www.gstatic.com" />
      </Head>
      <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_ID} size="invisible" />
      <div className="self-center w-[310px] max-w-full font-medium sm:w-[386px] lg:self-start">
        <div className="font-semibold sm:text-lg sm:leading-[23px]">Stay up to date</div>
        <p className="mt-[7px] mb-[16px] text-sm font-medium text-secondary text-opacity-[68%]">
          Get early access to our news &amp; releases
        </p>
        <div className="flex py-2 px-[14px] w-full bg-white border-[0.61px] border-inputBorder focus-within:border-prepo focus-within:ring-1 focus-within:ring-prepo">
          <input
            type="email"
            autoComplete="email"
            placeholder="Enter your Email Address"
            className="grow pl-0 w-1 text-[11px] leading-none border-none focus:border-none focus:outline-none focus:ring-0 sm:text-sm min-w-1"
            value={email}
            onChange={(e): void => setEmail(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>): void => {
              if (e.key === 'Enter') onUserSubscribe()
            }}
          />
          <Button
            onClick={onUserSubscribe}
            className={clsx(
              disabled && 'opacity-50 pointer-events-none',
              loading && 'bg-secondary hover:bg-secondary pointer-events-none',
              'py-2 px-4 text-[11px] leading-none whitespace-nowrap rounded-sm sm:text-sm'
            )}
          >
            <div className="flex items-center">
              Stay Updated
              <div
                className={clsx(
                  loading ? 'ml-1 w-[1em] opacity-100' : 'ml-0 w-0 opacity-0',
                  'transition-all animate-spin pointer-events-none'
                )}
              >
                <Icon width="1em" height="1em" name="spinner" />
              </div>
            </div>
          </Button>
        </div>
      </div>
    </>
  )
}

const IconButtonSized: FC<IconButtonProps & { href: string }> = ({ href, ...props }) => (
  <a href={href} target="_blank" rel="noreferrer">
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <IconButton {...props} className="w-6 h-6 sm:w-12 sm:h-12" />
  </a>
)

const SocialLinks: FC = () => (
  <div className="flex flex-wrap gap-2 justify-center sm:gap-4">
    <IconButtonSized icon="twitter" aria-label="Twitter" href="https://twitter.com/prepo_io" />
    <IconButtonSized
      icon="discord"
      aria-label="Discord"
      href="https://url.prepo.io/discord-website-desktop"
    />
    <IconButtonSized
      icon="linkedIn"
      aria-label="LinkedIn"
      href="https://www.linkedin.com/company/prepo-io"
    />
    <IconButtonSized
      icon="instagram"
      aria-label="Instagram"
      href="https://www.instagram.com/prepo.io/"
    />
    <IconButtonSized icon="reddit" aria-label="Reddit" href="https://www.reddit.com/r/prepo_io/" />
    <IconButtonSized
      icon="facebook"
      aria-label="Facebook"
      href="https://www.facebook.com/prePO.official"
    />
    <IconButtonSized
      icon="youTube"
      aria-label="Youtube"
      href="https://www.youtube.com/channel/UCNcBzbUjN4GQevx4Z4dccVA"
    />
    <IconButtonSized icon="medium" aria-label="Medium" href="https://medium.com/prepo" />
  </div>
)

export const Footer: FC = () => (
  <div id="layout-footer" className="text-secondary bg-background-footer">
    <div className="container mx-auto max-w-[1180px] divide-y-2 divide-separator">
      <div className="flex flex-col p-7 sm:pt-14 sm:pb-10 lg:flex-row lg:gap-16 lg:justify-center xl:px-0">
        <div className="m-0 sm:m-auto lg:m-0">
          <img
            src="/prepo-logo.svg"
            alt="prePO logo"
            className="w-[102.5px]"
            width="685.71"
            height="230.25"
          />
        </div>
        <Nav>
          {/* <NavGroup title="PPO Token">
              <NavItem
                title="Staking"
                href="https://docs.prepo.io/tokenomics-and-governance#timelock"
              />
              <NavItem
                title="Governance"
                href="https://docs.prepo.io/tokenomics-and-governance#voting"
              />
              <NavItem
                title="Token Sale"
                href="https://docs.prepo.io/tokenomics-and-governance#ido"
              />
            </NavGroup> */}
          <NavGroup title="Resources">
            <NavItem title="Blog" href="https://prepo.io/blog" />
            <NavItem title="Docs" href="https://docs.prepo.io" />
            <NavItem title="FAQ" href="https://docs.prepo.io/faq" />
            <NavItem title="Jobs" href="https://url.prepo.io/jobs" />
          </NavGroup>
          <NavGroup title="Products">
            <NavItem title="Simulator" href="https://simulator.prepo.io" />
            <NavItem title="Acquisition Royale" href="https://acquisitionroyale.com" />
          </NavGroup>
        </Nav>
        <NewsletterSignup />
      </div>
      <div className="flex flex-col flex-wrap gap-5 items-center p-5 text-sm text-center sm:py-12 lg:flex-row lg:justify-between xl:px-0">
        <div className="text-sm font-semibold text-secondary sm:text-lg text-opacity-60">
          &copy; prePO {new Date().getFullYear()}. All rights reserved.
        </div>
        <SocialLinks />
      </div>
    </div>
  </div>
)
