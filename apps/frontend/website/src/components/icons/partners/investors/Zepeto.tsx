import { FC, SVGProps } from 'react'

export const Zepeto: FC<SVGProps<SVGSVGElement>> = ({ id, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="189"
    height="189"
    viewBox="0 0 189 189"
    fill="none"
    {...props}
  >
    <circle cx="94.0704" cy="94.0704" r="94.0704" fill="#5C46FF" />
    <rect x="8" y="35" width="172" height="117" rx="58.5" fill={`url(#${id})`} />
    <defs>
      <pattern id={id} patternContentUnits="objectBoundingBox" width="1" height="1">
        <use
          xlinkHref="#image0_103_137"
          transform="translate(0 -0.235043) scale(0.0025 0.00367521)"
        />
      </pattern>
      <image
        id="image0_103_137"
        width="400"
        height="400"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
)

export default Zepeto
