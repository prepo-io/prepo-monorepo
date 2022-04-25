import { IconProps } from '../icon.types'

type Props = Omit<IconProps, 'name'>

const RightArrow: React.FC<Props> = ({ color = 'white', width = '17', height = '19', onClick }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 17 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
  >
    <path
      d="M16 7.76795C17.3333 8.53775 17.3333 10.4623 16 11.2321L3.25 18.5933C1.91667 19.3631 0.249999 18.4008 0.249999 16.8612L0.25 2.13878C0.25 0.599183 1.91667 -0.363068 3.25 0.406733L16 7.76795Z"
      fill={color}
    />
  </svg>
)

export default RightArrow
