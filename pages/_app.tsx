import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Preload Ndot55 font
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/otf';
      link.href = '/fonts/ndot-55.otf';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }, []);

  return <Component {...pageProps} />
}
