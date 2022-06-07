import { IconProps } from '../../icon.types'

type Props = Omit<IconProps, 'name' | 'onClick'>

const O365Icon: React.FC<Props> = ({ width = '25', height = '25' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.05347 5.3182L12.2201 1.98486L17.2201 3.23486V17.4015L12.2201 18.6515L3.05347 15.3182L12.2201 16.5682V4.48486L6.3868 5.73486V14.0682L3.05347 15.3182V5.3182Z"
      fill="#E64A19"
    />
  </svg>
)

export default O365Icon
