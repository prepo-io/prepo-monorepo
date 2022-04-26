import { IconProps } from '../icon.types'

type Props = Omit<IconProps, 'name'>

const DownArrow: React.FC<Props> = ({ color = 'white', width = '16', height = '9', onClick }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 16 9"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
  >
    <path
      d="M0.437198 0.460294C1.0386 -0.130049 1.87588 -0.176377 2.61108 0.460294L8.00163 5.41997L13.3922 0.460294C14.1274 -0.176377 14.966 -0.130049 15.5633 0.460294C16.1647 1.04931 16.1261 2.04469 15.5633 2.59797C15.0033 3.15125 9.08719 8.557 9.08719 8.557C8.94631 8.69711 8.77746 8.80855 8.59071 8.88466C8.40396 8.96077 8.20315 9 8.00025 9C7.79736 9 7.59655 8.96077 7.4098 8.88466C7.22305 8.80855 7.0542 8.69711 6.91332 8.557C6.91332 8.557 0.999978 3.15125 0.437198 2.59797C-0.126962 2.04469 -0.164205 1.04931 0.437198 0.460294Z"
      fill={color}
    />
  </svg>
)

export default DownArrow
