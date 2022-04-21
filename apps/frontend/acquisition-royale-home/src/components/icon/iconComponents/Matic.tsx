import { IconProps } from '../icon.types'

type Props = Omit<IconProps, 'name'>

const Matic: React.FC<Props> = ({ width = '34', height = '34', onClick }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
  >
    <path
      d="M17 0C26.3893 0 34 7.61069 34 17C34 26.3893 26.3893 34 17 34C7.61069 34 0 26.3893 0 17C0 7.61069 7.61069 0 17 0ZM11.5494 8.14088L7.04119 10.6611C6.83856 10.7659 6.669 10.9249 6.55138 11.1204C6.43377 11.3159 6.3727 11.5401 6.375 11.7683V16.847C6.375 17.306 6.60981 17.7257 7.04119 17.9552L11.5504 20.4754C11.9425 20.7039 12.4525 20.7039 12.8828 20.4754L15.9417 18.7563L18.0189 17.5727L21.0779 15.8546C21.4699 15.6251 21.9789 15.6251 22.4102 15.8546L24.8019 17.1913C25.1951 17.4197 25.4681 17.8394 25.4681 18.2984V21.0099C25.4681 21.4678 25.2344 21.8875 24.8019 22.117L22.4113 23.4919C22.0182 23.7214 21.5082 23.7214 21.0779 23.4919L18.6862 22.1552C18.2931 21.9257 18.0189 21.5061 18.0189 21.0481V19.2908L15.9417 20.4754V22.2317C15.9417 22.6897 16.1766 23.1104 16.6079 23.3389L21.1172 25.8591C21.5092 26.0886 22.0182 26.0886 22.4496 25.8591L26.9588 23.3389C27.3509 23.1104 27.625 22.6907 27.625 22.2317V17.153C27.6273 16.9249 27.5662 16.7006 27.4486 16.5051C27.331 16.3097 27.1614 16.1507 26.9588 16.0459L22.4113 13.4863C22.0182 13.2579 21.5082 13.2579 21.0779 13.4863L18.0189 15.2437L15.9417 16.3891L12.8828 18.1454C12.4908 18.3749 11.9818 18.3749 11.5504 18.1454L9.11944 16.7705C8.72738 16.5421 8.45325 16.1224 8.45325 15.6634V12.9519C8.45325 12.4939 8.68806 12.0742 9.11944 11.8447L11.5101 10.5081C11.9032 10.2786 12.4132 10.2786 12.8446 10.5081L15.2352 11.8447C15.6283 12.0742 15.9024 12.4939 15.9024 12.9519V14.7092L17.9796 13.5246V11.7683C17.9819 11.5401 17.9209 11.3159 17.8032 11.1204C17.6856 10.9249 17.5161 10.7659 17.3134 10.6611L12.8828 8.14088C12.4908 7.91138 11.9818 7.91138 11.5504 8.14088H11.5494Z"
      fill="#8247E5"
    />
  </svg>
)

export default Matic