import { IconProps } from '../../icon.types'

type Props = Omit<IconProps, 'name'>

const ZoomInIcon: React.FC<Props> = ({ color = 'white', width = '24', height = '25', onClick }) => {
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
        d="M10.0799 1.5127C5.56792 1.5127 1.91992 5.1607 1.91992 9.6727C1.91992 14.1847 5.56792 17.8327 10.0799 17.8327C11.8559 17.8327 13.4881 17.2571 14.8321 16.2971L21.1677 22.5849L22.5121 21.2405L16.2721 15.0005C17.5201 13.5605 18.2399 11.7367 18.2399 9.6727C18.2399 5.1607 14.5919 1.5127 10.0799 1.5127ZM10.0799 2.4727C14.0639 2.4727 17.2799 5.68869 17.2799 9.6727C17.2799 13.6567 14.0639 16.8727 10.0799 16.8727C6.09592 16.8727 2.87992 13.6567 2.87992 9.6727C2.87992 5.68869 6.09592 2.4727 10.0799 2.4727ZM9.59992 5.8327V9.1927H6.23992V10.1527H9.59992V13.5127H10.5599V10.1527H13.9199V9.1927H10.5599V5.8327H9.59992Z"
        fill="current"
        stroke="current"
      />
    </svg>
  )
}

export default ZoomInIcon
