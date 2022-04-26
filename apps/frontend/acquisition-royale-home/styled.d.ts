import 'styled-components'

declare module 'styled-components' {
  export interface Color {
    modalTextColor: string
    primary: string
    secondary: string
    success: string
    error: string
    info: string
    accentPrimary: string
    white: string
    grey: string
    darkGrey: string
    backgroundGradientStart: string
    backgroundGradientEnd: string
  }

  export interface FontWeight {
    /** 800 */
    extraBold: number
    /** 700 */
    bold: number
    /** 600 */
    semiBold: number
    /** 500 */
    medium: number
    /** 400 */
    regular: number
  }

  export interface FontSize {
    /** 9px */
    '2xs': string
    /** 12px */
    xs: string
    /** 14px */
    sm: string
    /** 16px */
    base: string
    /** 18px */
    md: string
    /** 20px */
    lg: string
    /** 24px */
    xl: string
    /** 28px */
    '2xl': string
    /** 30px */
    '3xl': string
    /** 36px */
    '4xl': string
    /** 40px */
    '5xl': string
  }

  export interface FontFamily {
    /** Geometos Neue */
    primary: string
    /** Eurostile */
    secondary: string
  }

  export interface DefaultTheme {
    color: Color
    fontSize: FontSize
    fontFamily: FontFamily
    fontWeight: FontWeight
    borderRadius: number
  }
}
