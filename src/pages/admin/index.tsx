'use client'

import { useAccount, useChainId, useReadContract, useWriteContract } from 'wagmi'
import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

import { INR_TOKEN_ABI } from '../../contracts/INRToken'



const isAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s)

const INR_TOKEN_ADDRESS: Record<number, `0x${string}`> = {
  84532: '0x941cD55bD4E103906ABCBf28D5CCda2f103110e3', 
}



function useInrToken() {
  const chainId = useChainId()
  const address = chainId ? INR_TOKEN_ADDRESS[chainId] : undefined

  if (!address) return undefined

  return {
    address,
    abi: INR_TOKEN_ABI,
  } as const
}



export default function AdminPage() {
  const { address } = useAccount()
  const { writeContract, isPending } = useWriteContract()
  const inrToken = useInrToken()

  const [single, setSingle] = useState('')
  const [batch, setBatch] = useState<string[]>([])



  const { data: paused } = useReadContract(
    inrToken
      ? { ...inrToken, functionName: 'paused' }
      : undefined
  )

  const { data: pauserRole } = useReadContract(
    inrToken
      ? { ...inrToken, functionName: 'PAUSER_ROLE' }
      : undefined
  )

  const { data: blacklistRole } = useReadContract(
    inrToken
      ? { ...inrToken, functionName: 'BLACKLIST_ADMIN_ROLE' }
      : undefined
  )

  const { data: isPauser } = useReadContract(
    inrToken && pauserRole && address
      ? {
          ...inrToken,
          functionName: 'hasRole',
          args: [pauserRole, address],
        }
      : undefined
  )

  const { data: isBlacklistAdmin } = useReadContract(
    inrToken && blacklistRole && address
      ? {
          ...inrToken,
          functionName: 'hasRole',
          args: [blacklistRole, address],
        }
      : undefined
  )


  const togglePause = () => {
    if (!inrToken || paused === undefined) return

    writeContract({
      ...inrToken,
      functionName: paused ? 'unpause' : 'pause',
    })
  }

  const blacklistSingle = (status: boolean) => {
    if (!inrToken || !isAddress(single)) return

    writeContract({
      ...inrToken,
      functionName: 'setBlacklisted',
      args: [single, status],
    })
  }

  const uploadBatch = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const addresses = text
        .split(/[\n,]/)
        .map(s => s.trim())
        .filter(isAddress)

      setBatch(Array.from(new Set(addresses)))
    }
    reader.readAsText(file)
  }

  const submitBatch = (status: boolean) => {
    if (!inrToken || batch.length === 0) return

    writeContract({
      ...inrToken,
      functionName: 'setBlacklistedBatch',
      args: [batch, status],
    })
  }

 

  if (!address) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <ConnectButton />
      </main>
    )
  }

  if (!inrToken) {
    return (
      <main className="min-h-screen flex items-center text-center justify-center text-red-600">
        <div className='text-xl p-10'>No contract deployed on this network<br/>(consider switching networks)</div>
        
        <ConnectButton />
      </main>
    )
  }


  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto py-10 space-y-6">
        <Link href="/" className="text-xl py-6 text-gray-500 underline">
          ← Home
        </Link>

        <header className="flex justify-between py-6 items-center">
          <h1 className="text-2xl font-bold">INR Token Admin</h1>
          <ConnectButton showBalance={false} />
        </header>


        <section className="bg-white p-4 rounded-lg border space-y-3">
          <div className="flex justify-between">
            <h2 className="font-semibold">Pause</h2>
            <span className={paused ? 'text-red-600' : 'text-green-600'}>
              {paused === undefined ? 'Loading' : paused ? 'Paused' : 'Active'}
            </span>
          </div>

          <button
            disabled={!isPauser || isPending}
            onClick={togglePause}
            className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
          >
            {paused ? 'Unpause' : 'Pause'}
          </button>

          {isPauser === false && (
            <p className="text-sm text-red-600 text-center">
              You do not have PAUSER_ROLE
            </p>
          )}
        </section>


        <section className="bg-white p-4 rounded-lg border space-y-3">
          <h2 className="font-semibold">Blacklist Address</h2>

          <input
            value={single}
            onChange={e => setSingle(e.target.value)}
            placeholder="0x..."
            className="w-full p-2 border rounded font-mono"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={!isBlacklistAdmin || isPending}
              onClick={() => blacklistSingle(true)}
              className="bg-red-600 text-white py-2 rounded disabled:opacity-50"
            >
              Blacklist
            </button>

            <button
              disabled={!isBlacklistAdmin || isPending}
              onClick={() => blacklistSingle(false)}
              className="border py-2 rounded disabled:opacity-50"
            >
              Unblacklist
            </button>
          </div>

          {isBlacklistAdmin === false && (
            <p className="text-sm text-red-600 text-center">
              You do not have BLACKLIST_ADMIN_ROLE
            </p>
          )}
        </section>

      
        <section className="bg-white p-4 rounded-lg border space-y-3">
          <h2 className="font-semibold">Batch Blacklist</h2>

          <input
            type="file"
            accept=".csv,.txt"
            onChange={e => e.target.files && uploadBatch(e.target.files[0])}
          />

          {batch.length > 0 && (
            <>
              <p className="text-sm text-gray-600">
                {batch.length} addresses loaded
              </p>

              <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50 font-mono text-xs space-y-1">
                {batch.map((addr, i) => (
                <div key={addr} className="text-gray-700">
                {i + 1}. {addr}
            </div>
        ))}
        </div>
              

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={!isBlacklistAdmin || isPending}
                  onClick={() => submitBatch(true)}
                  className="bg-red-600 text-white py-2 rounded disabled:opacity-50"
                >
                  Blacklist
                </button>

                <button
                  disabled={!isBlacklistAdmin || isPending}
                  onClick={() => submitBatch(false)}
                  className="border py-2 rounded disabled:opacity-50"
                >
                  Unblacklist
                </button>
              </div>
            </>
          )}

          <a
            href="data:text/csv;charset=utf-8,0x1111111111111111111111111111111111111111%0A0x2222222222222222222222222222222222222222"
            download="blacklist_sample.csv"
            className="text-sm underline text-gray-500"
          >
            Download sample CSV
          </a>
        </section>
      </div>
    </main>
  )
}
