import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="SweepX - Real-world cleanup game. Post trash, clean quests, earn XP." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
