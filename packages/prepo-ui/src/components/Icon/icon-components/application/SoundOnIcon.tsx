import { IconProps } from '../../icon.types'

type Props = Omit<IconProps, 'name' | 'onClick'>

const SoundOnIcon: React.FC<Props> = ({ color = 'white', width = '25', height = '25' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 21 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.0803 2.5L5.08034 7.5H3.41368C2.49284 7.5 1.74701 8.24583 1.74701 9.16667V10.8333C1.74701 11.7542 2.49284 12.5 3.41368 12.5H5.08034L10.0803 17.5V2.5ZM14.7939 5.28646L13.6155 6.46484C15.5754 8.42477 15.5752 11.5761 13.6155 13.5352L14.7939 14.7135C17.3908 12.1176 17.3906 7.8832 14.7939 5.28646ZM8.41368 6.52344V13.4766L6.25873 11.3216L5.77045 10.8333H5.08034H3.41368V9.16667H5.08034H5.77045L6.25873 8.67838L8.41368 6.52344ZM12.4371 7.64323L11.2587 8.82162C11.9171 9.48002 11.9171 10.52 11.2587 11.1784L12.4371 12.3584C13.732 11.0635 13.732 8.93815 12.4371 7.64323Z"
      fill={color}
    />
  </svg>
)

export default SoundOnIcon
