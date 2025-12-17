import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ClickTesseract from '@/components/ClickTesseract'

const LoadingScreen = dynamic(() => import('@/components/LoadingScreen'), { ssr: false });

const CursorTrail = dynamic(() => import('@/components/CursorTrail'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  const [clickEffect, setClickEffect] = useState<{ x: number, y: number, id: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

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

    // Global click handler for tesseract effect
    const handleClick = (e: MouseEvent) => {
      setClickEffect({ x: e.clientX, y: e.clientY, id: Date.now() });
      setTimeout(() => setClickEffect(null), 800);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <>
      <CursorTrail />
      {clickEffect && <ClickTesseract key={clickEffect.id} x={clickEffect.x} y={clickEffect.y} />}
      <Component {...pageProps} />
    </>
  )
}
