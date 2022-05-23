import clsx from 'clsx'
import { FC } from 'react'
import Link from 'next/link'
import { Icon } from './Icon'

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & {
    href?: string
    target?: '_blank' | '_self'
  }

export const Button: FC<ButtonProps> = ({
  href,
  target = '_self',
  className,
  children,
  ...props
}) => {
  const styles = clsx(
    'inline-flex justify-center items-center py-4 px-14 text-lg font-semibold text-white bg-prepo hover:bg-prepo-accent disabled:hover:bg-prepo rounded disabled:opacity-50 transition-colors disabled:cursor-default',
    className
  )

  if (href && target === '_blank') {
    return (
      <a href={href} target={target} className={styles} rel="noopener noreferrer" {...props}>
        {children}
        <Icon name="shareIcon" className="inline-block ml-4" />
      </a>
    )
  }

  if (href && target === '_self') {
    return (
      <Link href={href}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className={styles}>{children}</a>
      </Link>
    )
  }

  return (
    <button type="button" className={styles} {...props}>
      {children}
    </button>
  )
}
