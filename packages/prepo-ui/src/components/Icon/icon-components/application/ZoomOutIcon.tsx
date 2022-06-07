import { IconProps } from '../../icon.types'

type Props = Omit<IconProps, 'name'>

const ZoomOutIcon: React.FC<Props> = ({
  color = 'white',
  width = '24',
  height = '25',
  onClick,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <path
        d="M10.0799 1.5127C5.57805 1.5127 1.91992 5.17082 1.91992 9.67269C1.91992 14.1746 5.57805 17.8327 10.0799 17.8327C11.8612 17.8327 13.5074 17.2589 14.8499 16.2877L21.1649 22.5877L22.5149 21.2377L16.2749 14.9827C17.5012 13.5539 18.2399 11.6996 18.2399 9.67269C18.2399 5.17082 14.5818 1.5127 10.0799 1.5127ZM10.0799 2.4727C14.0624 2.4727 17.2799 5.6902 17.2799 9.67269C17.2799 13.6552 14.0624 16.8727 10.0799 16.8727C6.09742 16.8727 2.87992 13.6552 2.87992 9.67269C2.87992 5.6902 6.09742 2.4727 10.0799 2.4727ZM6.23992 9.19269V10.1527H13.9199V9.19269H6.23992Z"
        fill="current"
        stroke="current"
      />
    </svg>
  )
}

export default ZoomOutIcon
