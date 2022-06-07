import { IconProps } from '../../icon.types'

type Props = Omit<IconProps, 'name' | 'onClick'>

const SoundOffIcon: React.FC<Props> = ({ color = 'white', width = '25', height = '25' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 21 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.4568 2.5L5.45681 7.5H3.79014C2.86931 7.5 2.12347 8.24583 2.12347 9.16667V10.8333C2.12347 11.7542 2.86931 12.5 3.79014 12.5H5.45681L10.4568 17.5V2.5ZM8.79014 6.52344V13.4766L6.63519 11.3216L6.14691 10.8333H5.45681H3.79014V9.16667H5.45681H6.14691L6.63519 8.67838L8.79014 6.52344ZM13.546 6.91081L12.3676 8.08919L14.2784 10L12.3676 11.9108L13.546 13.0892L15.4568 11.1784L17.3676 13.0892L18.546 11.9108L16.6352 10L18.546 8.08919L17.3676 6.91081L15.4568 8.82162L13.546 6.91081Z"
      fill={color}
    />
  </svg>
)

export default SoundOffIcon
