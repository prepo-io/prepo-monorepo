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
          <link href="/fonts/Eurostile/EuroStyleNormal.ttf" />
          <link href="/fonts/Eurostile/EurostileBold.ttf" />
          <link href="/fonts/GeometosNeue/GeometosNeue.ttf" />
          <link href="/fonts/GeometosNeue/GeometosNeueBold.ttf" />
          <link href="/fonts/GeometosNeue/GeometosNeueBlack.ttf" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="canonical" href={config.CANONICAL_URL} />
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
