import { IconProps } from '../../icon.types'

type Props = Omit<IconProps, 'name'>

const GradientLogoIcon: React.FC<Props> = ({ color = 'white', width = '31', height = '35' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 547.64 625.35"
    fill={color}
  >
    <defs>
      <linearGradient
        id="gradient_number_7"
        x1="175.92"
        y1="646.69"
        x2="175.92"
        y2="-18.7"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#454699" />
        <stop offset="1" stopColor="#6264d9" />
      </linearGradient>
      <linearGradient
        id="gradient_number_7-2"
        x1="307.54"
        y1="646.69"
        x2="307.54"
        y2="-18.7"
        xlinkHref="#gradient_number_7"
      />
      <linearGradient
        id="gradient_number_7-3"
        x1="240.01"
        y1="646.69"
        x2="240.01"
        y2="-18.7"
        xlinkHref="#gradient_number_7"
      />
      <linearGradient
        id="gradient_number_7-4"
        x1="370.94"
        y1="646.69"
        x2="370.94"
        y2="-18.7"
        xlinkHref="#gradient_number_7"
      />
    </defs>
    <title>Logomark_Color_prePO_SVG</title>
    <g id="layer_2" data-name="layer 2">
      <g id="layer_1-2" data-name="layer 1">
        <path
          fill="url(#gradient_number_7)"
          d="M349.67,253l-26.47,27.06a7.58,7.58,0,0,1-10.84,0l-34.24-35a7.58,7.58,0,0,0-10.86,0l-39.08,40.35L201.8,312.68l-36.92,38.13L138.5,378,96.35,421.46l-27.14,28-33.94,35A7.58,7.58,0,0,1,26,485.81l-15.57-9-6.68-3.87A7.58,7.58,0,0,1,0,466.37V450.8a15.16,15.16,0,0,1,4.28-10.55l48.79-50.32L91,350.81l10.54-10.92,26.38-27.21,37-38.13,26.38-27.21,70.35-72.65a15.16,15.16,0,0,1,21.73-.06l66.33,67.79A7.58,7.58,0,0,1,349.67,253Z"
        />
        <path
          fill="url(#gradient_number_7-2)"
          d="M547.64,243.46V457.65a22.74,22.74,0,0,1-11.41,19.72l-252.31,145a22.74,22.74,0,0,1-22.74,0L69.53,511.1a4.19,4.19,0,0,1-.91-6.54l30.2-31.16a7.58,7.58,0,0,1,9.25-1.28l160.82,93.3a7.58,7.58,0,0,0,7.58,0L490.77,442.3a7.58,7.58,0,0,0,3.8-6.57V292.34a7.58,7.58,0,0,1,2.16-5.3l45-46A3.46,3.46,0,0,1,547.64,243.46Z"
        />
        <path
          fill="url(#gradient_number_7-3)"
          d="M478.82,121l-30.4,31.12a7.58,7.58,0,0,1-9.2,1.28L276.48,59.92a7.58,7.58,0,0,0-7.58,0L56.84,183a7.58,7.58,0,0,0-3.78,6.56V332.35a7.58,7.58,0,0,1-2.13,5.27l-45,46.47A3.46,3.46,0,0,1,0,381.69v-214A22.74,22.74,0,0,1,11.33,148l249.85-145a22.74,22.74,0,0,1,22.74,0l194,111.45A4.19,4.19,0,0,1,478.82,121Z"
        />
        <path
          fill="url(#gradient_number_7-4)"
          d="M547.64,158.92v15.59a15.16,15.16,0,0,1-4.33,10.61L494.57,234.9l-37.9,38.74-11.6,11.9-26.61,27.14-37.07,37.9-26.53,27.06-71.51,73.09a15.16,15.16,0,0,1-21.73-.06L196.37,383.3a7.58,7.58,0,0,1,0-10.55l26.37-27.24a7.58,7.58,0,0,1,10.89,0l33.64,34.72a7.58,7.58,0,0,0,10.86,0l39.66-40.53,26.53-27.06,37.07-37.9,26.53-27.14,42.91-43.82,27.37-28,34.25-35a7.58,7.58,0,0,1,9.2-1.27l15.61,9,6.59,3.8A7.58,7.58,0,0,1,547.64,158.92Z"
        />
      </g>
    </g>
  </svg>
)

export default GradientLogoIcon
