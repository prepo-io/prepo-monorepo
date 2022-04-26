import { IconProps } from '../icon.types'

type Props = Omit<IconProps, 'name'>

const LeftArrow: React.FC<Props> = ({ color = 'white', width = '17', height = '19', onClick }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 17 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
  >
    <path
      d="M1 11.2321C-0.333333 10.4623 -0.333334 8.53775 0.999999 7.76795L13.75 0.406734C15.0833 -0.363066 16.75 0.599183 16.75 2.13878L16.75 16.8612C16.75 18.4008 15.0833 19.3631 13.75 18.5933L1 11.2321Z"
      fill={color}
    />
  </svg>
)

export default LeftArrow
