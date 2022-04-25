import styled from 'styled-components'

const Link = styled.a`
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
`

const Text = styled.p`
  margin-bottom: 0;
`

const Wrapper = styled.div`
  color: ${({ theme }): string => theme.color.white};
  font-size: ${({ theme }): string => theme.fontSize.md};
  text-align: center;
`

const LowMatic: React.FC = () => (
  <Wrapper>
    <Text>Running low on MATIC?</Text>
    <br />
    <Text>
      Get MATIC following our{' '}
      <Link
        href="https://medium.com/prepo/setting-up-metamask-and-getting-eth-matic-on-polygon-step-by-step-guide-fd55147a0f05"
        target="_blank"
        rel="noreferrer"
      >
        step-by-step guide
      </Link>
      .
    </Text>
  </Wrapper>
)

export default LowMatic
