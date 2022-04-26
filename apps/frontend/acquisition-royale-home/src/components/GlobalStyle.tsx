import { createGlobalStyle } from 'styled-components'
import { tooltipStyles } from './Tooltip'
import { pixelSizes } from '../utils/theme/breakpoints'
import { primaryFontFamily } from '../utils/theme/utils'
import blocknativeStyles from '../utils/theme/blocknative-modal-styles'

const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    margin: 0; 
    height: 100%; 
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  body {
    ${primaryFontFamily}
    height: 100%; 
    padding: 0;
    margin: 0;
    font-size: ${({ theme }): string => theme.fontSize.base};
  }
  a {
    text-decoration: none;
    color: inherit;
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
  }
  h1,
  h2,
  h3,
  h4,
  h5 {
    line-height: 1;
    margin: 0;
  }


div::-webkit-scrollbar {
  width: 6px; /* width of the entire scrollbar */
}

div::-webkit-scrollbar-track {
  background: transparent; /* color of the tracking area */
}

div::-webkit-scrollbar-thumb {
  /* color of the scroll thumb */
  background-color: ${({ theme }): string => theme.color.accentPrimary}; 
  border-radius: 5px; /* roundness of the scroll thumb */
  border-right: solid 2px ${({ theme }): string => theme.color.secondary};
}

  .ant-notification-notice {
    background-color: ${({ theme }): string => theme.color.secondary};
    font-family: ${({ theme }): string => theme.fontFamily.secondary};
    font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
    .ant-notification-notice-message {
      color: ${({ theme }): string => theme.color.accentPrimary};
      font-size: ${({ theme }): string => theme.fontSize.lg};
    }
    .ant-notification-notice-description {
      color: ${({ theme }): string => theme.color.white};
      font-weight: ${({ theme }): number => theme.fontWeight.regular};
    }
    .ant-notification-notice-close {
      color: ${({ theme }): string => theme.color.white};
    }
}

  
  @media screen and (max-width: ${pixelSizes.tablet}) {
    input, select, textarea {
      font-size: ${({ theme }): string => theme.fontSize.base};
    }
  }

    /* Blocknative modal style classes */
    ${blocknativeStyles}
`

export const AntdGlobalStyle = createGlobalStyle`
  ${tooltipStyles}
`

export default GlobalStyle
