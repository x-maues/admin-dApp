import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen px-8 py-0 flex flex-col justify-center items-center font-sans">
      <Head>
        <title>Admin</title>
        <meta
          content=""
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className="flex-1 flex flex-col justify-center items-center py-20">
        <ConnectButton />

        <div className="text-6xl font-bold text-center leading-[1.15] mt-12 mb-4">
          INR Token Admin Dashboard
        </div>
     

        <Link
          href="/admin"
          className="px-6 pb-2 text-4xl bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
           →
        </Link>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Deployments</h2>
          <div className=" text-gray-900 mb-2">
            Contract Address -
            <div className="bg-gray-900 text-white px-2 py-1 rounded font-mono">
              0x941cD55bD4E103906ABCBf28D5CCda2f103110e3
            </div>
          </div>
          <div className="text-gray-900 mb-2">
            <strong>Network:</strong> Base Sepolia
          </div>
          <div className="text-sm text-gray-600">
          
            <a
              href="https://sepolia.basescan.org/address/0x941cD55bD4E103906ABCBf28D5CCda2f103110e3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on BaseScan →
            </a>
          </div>
        </div>
      </main>

     
    </div>
  );
};

export default Home;
