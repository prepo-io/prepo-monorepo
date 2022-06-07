import { IconProps } from '../../icon.types'

type Props = Omit<IconProps, 'name' | 'onClick'>

const YahooIcon: React.FC<Props> = ({ width = '25', height = '25' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.88672 2.40137C3.88672 2.40137 4.47005 2.52637 4.92839 2.52637C5.38672 2.52637 5.97005 2.40137 5.97005 2.40137L10.1367 9.4847L14.3451 2.40137C14.3451 2.40137 14.8034 2.56803 15.3451 2.56803C15.9284 2.56803 16.3867 2.40137 16.3867 2.40137L10.9701 11.568L11.1367 18.2347C11.1367 18.2347 10.5534 18.068 10.1367 18.068C9.72005 18.068 9.09505 18.2347 9.09505 18.2347L9.30339 11.568L3.88672 2.40137Z"
      fill="#673AB7"
    />
  </svg>
)

export default YahooIcon
