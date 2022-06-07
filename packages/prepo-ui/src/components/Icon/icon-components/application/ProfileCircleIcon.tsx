import { IconProps } from '../../icon.types'

type Props = Omit<IconProps, 'name'>

const ProfileCircleIcon: React.FC<Props> = ({ color = 'white', width = '21', height = '20' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 21 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.5 0C4.977 0 0.5 4.477 0.5 10C0.5 15.523 4.977 20 10.5 20C16.023 20 20.5 15.523 20.5 10C20.5 4.477 16.023 0 10.5 0ZM10.5 2.75C12.295 2.75 13.75 4.205 13.75 6C13.75 7.795 12.295 9.25 10.5 9.25C8.705 9.25 7.25 7.795 7.25 6C7.25 4.205 8.705 2.75 10.5 2.75ZM10.5 18C8.062 18 5.879 16.909 4.412 15.188C4.031 14.741 4.116 14.07 4.585 13.717C6.102 12.576 8.866 12 10.5 12C12.134 12 14.898 12.576 16.416 13.717C16.885 14.07 16.97 14.742 16.589 15.188C15.121 16.909 12.938 18 10.5 18Z"
      fill={color}
    />
  </svg>
)

export default ProfileCircleIcon
