import { IconProps } from '../../icon.types'

type Props = Omit<IconProps, 'name' | 'color'>

const Donation: React.FC<Props> = ({ width = '25', height = '25', onClick }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1776_5117)">
        <path
          d="M19.0261 10.3354C19.6488 10.9581 20.1221 11.6725 20.4601 12.4323L26.3122 11.7817L26.1778 11.1101C25.6861 8.65168 24.97 6.24393 24.039 3.91566L23.6923 3.04845C23.6923 3.04845 21.0356 2.18823 12.3391 2.18823L11.637 2.70175C14.4237 5.58894 18.4943 9.80359 19.0261 10.3354Z"
          fill="#E8D47B"
        />
        <path
          d="M24.0391 3.91647L23.6924 3.04839C23.6924 3.04839 23.3841 2.9497 22.6602 2.81958L23.2287 4.24047C24.1046 6.42989 24.7902 8.70925 25.2688 11.0192L25.4364 11.8794L26.3124 11.7816L26.1779 11.11C25.6862 8.65249 24.971 6.24387 24.0391 3.91647Z"
          fill="#BA9B48"
        />
        <path
          d="M22.8189 33.1912C16.7991 33.1912 11.9023 28.2945 11.9023 22.2747C11.9023 16.2549 16.7991 11.3582 22.8189 11.3582C28.8387 11.3582 33.7354 16.2549 33.7354 22.2747C33.7354 28.2945 28.8387 33.1912 22.8189 33.1912Z"
          fill="#B3ADD8"
        />
        <path
          d="M22.819 11.7947C28.5978 11.7947 33.2988 16.4958 33.2988 22.2746C33.2988 28.0533 28.5978 32.7544 22.819 32.7544C17.0402 32.7544 12.3391 28.0533 12.3391 22.2746C12.3391 16.4958 17.0402 11.7947 22.819 11.7947ZM22.819 10.9214C16.5485 10.9214 11.4658 16.0041 11.4658 22.2746C11.4658 28.545 16.5485 33.6277 22.819 33.6277C29.0894 33.6277 34.1722 28.545 34.1722 22.2746C34.1722 16.0041 29.0894 10.9214 22.819 10.9214Z"
          fill="#8B75A1"
        />
        <path
          d="M22.8189 30.1346C27.1598 30.1346 30.6788 26.6156 30.6788 22.2747C30.6788 17.9338 27.1598 14.4148 22.8189 14.4148C18.478 14.4148 14.959 17.9338 14.959 22.2747C14.959 26.6156 18.478 30.1346 22.8189 30.1346Z"
          fill="#DCD5F2"
        />
        <path
          d="M25.7893 23.5515C25.6585 23.2916 25.4741 23.0625 25.2483 22.8791C24.9825 22.6656 24.6895 22.4883 24.377 22.3518C23.9481 22.1634 23.5098 21.9971 23.0639 21.8534C22.671 21.7485 22.3003 21.574 21.9691 21.3381C21.8728 21.2557 21.7963 21.1527 21.7453 21.0367C21.6943 20.9207 21.6701 20.7947 21.6745 20.668C21.6677 20.5261 21.6912 20.3844 21.7433 20.2522C21.7954 20.12 21.875 20.0004 21.9767 19.9012C22.2193 19.7161 22.5206 19.625 22.8251 19.6446C22.9872 19.6367 23.1493 19.6615 23.3016 19.7176C23.4539 19.7738 23.5934 19.86 23.7116 19.9713C23.8739 20.1642 23.9761 20.4004 24.0057 20.6508C24.0167 20.7086 24.0478 20.7607 24.0935 20.7979C24.1391 20.8351 24.1965 20.8549 24.2554 20.854H25.6839C25.7199 20.8549 25.7556 20.848 25.7887 20.8338C25.8218 20.8195 25.8513 20.7983 25.8753 20.7714C25.8993 20.7446 25.9172 20.7129 25.9277 20.6784C25.9382 20.644 25.9411 20.6077 25.9361 20.572C25.8663 20.0844 25.6473 19.6303 25.3092 19.272C24.8005 18.8001 24.1469 18.5144 23.455 18.4615L23.4372 18.46V17.7094C23.4356 17.6437 23.4079 17.5813 23.3603 17.536C23.3126 17.4906 23.249 17.466 23.1832 17.4676H22.4212C22.3555 17.466 22.2918 17.4906 22.2442 17.536C22.1966 17.5813 22.1689 17.6437 22.1672 17.7094V18.4689C21.5113 18.5226 20.8825 18.7544 20.3486 19.1392C20.1184 19.3194 19.9334 19.5507 19.8082 19.8147C19.683 20.0788 19.621 20.3685 19.6272 20.6607C19.6187 20.9831 19.6912 21.3026 19.838 21.5898C19.9829 21.8563 20.184 22.0883 20.4273 22.2695C20.7472 22.4778 21.0898 22.649 21.4484 22.7798C21.8594 22.9516 22.2791 23.1018 22.7057 23.2299C23.0503 23.321 23.3699 23.4888 23.6404 23.7209C23.7416 23.8104 23.8214 23.9213 23.8741 24.0457C23.9269 24.17 23.9512 24.3045 23.9452 24.4394C23.9495 24.5828 23.9211 24.7253 23.8622 24.856C23.8032 24.9868 23.7152 25.1024 23.6049 25.1941C23.3682 25.3792 23.0716 25.4705 22.7718 25.4506C22.3782 25.4772 21.9894 25.3526 21.6846 25.1021C21.426 24.8604 21.2467 24.546 21.1703 24.2004C21.159 24.143 21.1279 24.0914 21.0824 24.0546C21.037 24.0178 20.9801 23.9981 20.9216 23.999H19.6381C19.6035 23.9983 19.5691 24.0049 19.5371 24.0182C19.5052 24.0315 19.4763 24.0514 19.4524 24.0764C19.4285 24.1015 19.4101 24.1313 19.3984 24.1639C19.3866 24.1965 19.3818 24.2311 19.3841 24.2657C19.4175 24.866 19.6832 25.4297 20.1251 25.8375C20.6122 26.2756 21.2963 26.5174 22.1672 26.6266V27.3859C22.1689 27.4516 22.1966 27.514 22.2442 27.5593C22.2918 27.6047 22.3555 27.6292 22.4212 27.6277H23.1832C23.249 27.6292 23.3126 27.6047 23.3603 27.5593C23.4079 27.514 23.4356 27.4516 23.4372 27.3859V26.6178C24.1008 26.5788 24.738 26.3443 25.2686 25.9439C25.4966 25.7637 25.6794 25.5328 25.8025 25.2695C25.9255 25.0062 25.9854 24.7178 25.9773 24.4272C25.9838 24.1247 25.9194 23.8247 25.7893 23.5515Z"
          fill="#8E5CC0"
        />
        <path
          d="M19.6435 20.8459C16.5737 23.9156 11.5976 23.9156 8.52784 20.8459C5.45811 17.7761 0.98584 13.5414 0.98584 13.5414C0.98584 13.5414 1.85916 10.0481 5.35244 6.55484C8.84573 3.06155 12.339 2.18823 12.339 2.18823C12.339 2.18823 18.0837 8.17048 19.6435 9.73023C22.7132 12.8 22.7132 17.7761 19.6435 20.8459Z"
          fill="#FFEEA3"
        />
        <path
          d="M19.6435 20.8459C16.5737 23.9156 11.5976 23.9156 8.52784 20.8459C5.45811 17.7761 0.98584 13.5414 0.98584 13.5414C0.98584 13.5414 1.85916 10.0481 5.35244 6.55484C8.84573 3.06155 12.339 2.18823 12.339 2.18823C12.339 2.18823 18.0837 8.17048 19.6435 9.73023C22.7132 12.8 22.7132 17.7761 19.6435 20.8459Z"
          fill="#FFEEA3"
        />
        <path
          d="M19.6435 9.73023C18.0837 8.17048 12.339 2.18823 12.339 2.18823C12.339 2.18823 11.9993 2.27294 11.4255 2.49564C14.2123 5.38371 18.4811 9.80272 19.026 10.3477C21.7499 13.0716 21.7499 17.5045 19.026 20.2284C17.7064 21.548 15.9519 22.2746 14.0857 22.2746C12.2194 22.2746 10.4649 21.548 9.14528 20.2284C8.63089 19.714 4.57082 15.7762 1.30198 12.6078C1.07317 13.1929 0.98584 13.5414 0.98584 13.5414C0.98584 13.5414 5.45811 17.7761 8.52784 20.8459C10.0623 22.3803 12.0744 23.1479 14.0857 23.1479C16.0969 23.1479 18.109 22.3803 19.6435 20.8459C22.7132 17.7761 22.7132 12.8 19.6435 9.73023Z"
          fill="#BA9B48"
        />
        <path
          d="M15.3701 9.10238C14.475 8.18016 13.0454 8.03606 11.9878 8.76703C11.3162 9.23076 10.5031 9.88488 9.58963 10.7975C8.67876 11.7084 8.02726 12.5171 7.5644 13.186C6.83518 14.2401 6.97404 15.6619 7.8919 16.5562C8.65867 17.3029 9.53374 18.1648 10.2315 18.8609C11.138 19.7648 12.31 20.3918 13.5851 20.5062C15.1675 20.6486 16.681 20.0966 17.7866 18.991C19.8337 16.9448 19.8337 13.6157 17.7866 11.5704C17.3063 11.0892 16.3369 10.098 15.3701 9.10238Z"
          fill="#E8D47B"
        />
      </g>
      <defs>
        <clipPath id="clip0_1776_5117">
          <rect
            width={width}
            height={height}
            fill="white"
            transform="translate(0.112549 0.44165)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default Donation
