import styled from 'styled-components'

const Wrapper = styled.img`
  display: block;
  height: auto;
  max-width: 100%;
`

type Props = {
  alt: string
  src: string
}

const ResponsiveImage: React.FC<Props> = ({ alt, src }) => <Wrapper alt={alt} src={src} />

export default ResponsiveImage
