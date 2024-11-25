import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { isSafari, isChrome } from 'react-device-detect';
const ShakaPlayerExample = dynamic(() => import('src/component/shaka-player/shaka-player-example'), { ssr: false });
const ShakaPlayerFairplayExample = dynamic(() => import('src/component/shaka-player/shaka-player-fairplay-example'), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Next.js shaka player widevine & fairplay example</title>
      </Head>
      <main>
        {isChrome && <ShakaPlayerExample />} {isSafari && <ShakaPlayerFairplayExample />}
      </main>
    </>
  );
}
