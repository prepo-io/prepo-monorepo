import { RenderPageResult } from 'next/dist/shared/lib/utils'
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentInitialProps,
  DocumentContext,
} from 'next/document'
import { ServerStyleSheet } from 'styled-components'
import config from '../lib/config'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    // More referrence on the SSR of styled components:
    // https://styled-components.com/docs/advanced#server-side-rendering
    // https://github.com/vercel/next.js/blob/master/examples/with-styled-components/pages/_document.js
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = (): RenderPageResult | Promise<RenderPageResult> =>
        originalRenderPage({
          enhanceApp:
            (App) =>
            (props): React.ReactElement<{ sheet: ServerStyleSheet }> =>
              // eslint-disable-next-line react/jsx-props-no-spreading
              sheet.collectStyles(<App {...props} />),
        })
      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      sheet.seal()
    }
  }

  render(): JSX.Element {
    return (
      <Html>
        <Head>
          <link
            rel="preload"
            href="/fonts/Eurostile/EuroStyleNormal.ttf"
            as="font"
            crossOrigin=""
          />
          <link rel="preload" href="/fonts/Eurostile/EurostileBold.ttf" as="font" crossOrigin="" />
          <link
            rel="preload"
            href="/fonts/GeometosNeue/GeometosNeue.ttf"
            as="font"
            crossOrigin=""
          />
          <link
            rel="preload"
            href="/fonts/GeometosNeue/GeometosNeueBold.ttf"
            as="font"
            crossOrigin=""
          />
          <link
            rel="preload"
            href="/fonts/GeometosNeue/GeometosNeueBlack.ttf"
            as="font"
            crossOrigin=""
          />
          <link rel="canonical" href={config.SITE_URL} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
