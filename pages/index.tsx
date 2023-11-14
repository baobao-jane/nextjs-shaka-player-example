import Head from 'next/head';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
const ShakaPlayerExample = dynamic(() => import('@/src/component/shaka-player/shaka-player-example'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Next.js shaka player example</title>
      </Head>
      <main>
        <ShakaPlayerExample />
      </main>
    </>
  );
}
