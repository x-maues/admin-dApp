'use client'

import { useAccount, useChainId, useReadContract, useWriteContract } from 'wagmi'
import { useState } from 'react'
import { INR_TOKEN } from '../../contracts/INRToken'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

const isAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s)

export default function AdminPage() {

    const { address } = useAccount()
    const { writeContract, isPending } = useWriteContract()

    const { data: paused } = useReadContract({
        ...INR_TOKEN,
        functionName: 'paused',
    })

    const { data: pauserRole } = useReadContract({
        ...INR_TOKEN,
        functionName: 'PAUSER_ROLE',
    })

    const { data: blacklistAdminRole } = useReadContract({
        ...INR_TOKEN,
        functionName: 'BLACKLIST_ADMIN_ROLE',
    })

    const { data: isPauser } = useReadContract({
        ...INR_TOKEN,
        functionName: 'hasRole',
        args: pauserRole && address ? [pauserRole, address] : undefined,
        query: { enabled: !!pauserRole && !!address },
    })

    const { data: isBlacklistAdmin } = useReadContract({
        ...INR_TOKEN,
        functionName: 'hasRole',
        args: blacklistAdminRole && address ? [blacklistAdminRole, address] : undefined,
        query: { enabled: !!blacklistAdminRole && !!address },
    })

    const [single, setSingle] = useState('')
    const [batch, setBatch] = useState<string[]>([])

    const togglePause = () => {
        writeContract({
            ...INR_TOKEN,
            functionName: paused ? 'unpause' : 'pause',
        })
    }

    const blacklistSingle = (status: boolean) => {
        writeContract({
            ...INR_TOKEN,
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
        writeContract({
            ...INR_TOKEN,
            functionName: 'setBlacklistedBatch',
            args: [batch, status],
        })
    }

    const chainId = useChainId()
    const REQUIRED_CHAIN_ID = 84532

    if(!address)
        return (
    
            <div> 
                <main className="flex-1 flex flex-col justify-center items-center py-20">
                <ConnectButton />
                </main> 
            </div>)
    if (chainId !== REQUIRED_CHAIN_ID) {
        return (
          <main className="flex min-h-screen items-center justify-center">
            <div className="bg-white border rounded-xl p-6 text-center space-y-4">
              <h2 className="text-lg font-semibold">Wrong Network</h2>
              <p className="text-sm text-gray-600">
                Please switch to <strong>Base Sepolia</strong> to interact with the contract.
              </p>
              <ConnectButton />
            </div>
          </main>
        )
      }
      
    console.log('Connected address:', address)
    console.log('PAUSER_ROLE bytes32:', pauserRole)
    console.log('isPauser:', isPauser)
      

    const sectionClass = "bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5 transition-shadow hover:shadow-md"
    const buttonBase = "px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
    const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
    


    return (
        <main className="min-h-screen bg-gray-50/50 py-10 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-sm text-gray-900">
                Network:{' '}
                {chainId === 84532 && 'Base Sepolia'}
               
                {!chainId && 'Unknown'}
                {chainId != 84532 && 'Please switch to Base Sepolia!!'}
            </p>

        
                <div className="space-y-6 mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        ← Home
                    </Link>
                    
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">INR Token Admin</h1>
                        <ConnectButton showBalance={false} chainStatus="icon" />
                    </header>
                </div>

                <section className={sectionClass}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Pause control</h2>
                        
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${paused ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                            <span className={`w-2 h-2 rounded-full ${paused ? 'bg-red-500' : 'bg-green-500'}`} />
                            {paused === undefined ? 'Loading...' : paused ? 'Paused' : 'Active'}
                        </div>
                    </div>

                    <button
                        disabled={!isPauser || isPending}
                        onClick={togglePause}
                        className={`w-full ${buttonBase} ${
                            paused
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                        {paused ? 'Unpause' : 'Pause'}
                    </button>

                    {!isPauser && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                            You do not have PAUSER_ROLE
                        </p>
                    )}
                </section>

               
                <section className={sectionClass}>
                    <h2 className="text-lg font-semibold text-gray-900">Blacklist a single address</h2>

                    <input
                        className={inputClass}
                        placeholder="0x..."
                        value={single}
                        onChange={e => setSingle(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            disabled={!isBlacklistAdmin || !isAddress(single) || isPending}
                            onClick={() => blacklistSingle(true)}
                            className={`${buttonBase} bg-red-600 text-white hover:bg-red-700`}
                        >
                            Blacklist
                        </button>
                        <button
                            disabled={!isBlacklistAdmin || !isAddress(single) || isPending}
                            onClick={() => blacklistSingle(false)}
                            className={`${buttonBase} bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900`}
                        >
                            Unblacklist
                        </button>
                    </div>

                    {!isBlacklistAdmin && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                            You do not have BLACKLIST_ADMIN_ROLE
                        </p>
                    )}
                </section>

          
                <section className={sectionClass}>
                    <h2 className="text-lg font-semibold text-gray-900">Batch Blacklist</h2>

                    <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={e => e.target.files && uploadBatch(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                    />

                    {batch.length > 0 && (
                        <div className="space-y-4 pt-2">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <p className="text-xs font-medium text-gray-500 mb-2">
                                    {batch.length} addresses loaded
                                </p>

                                <div className="max-h-32 overflow-y-auto font-mono text-xs text-gray-600 space-y-1">
                                    {batch.slice(0, 10).map(a => (
                                        <div key={a} className="truncate">{a}</div>
                                    ))}
                                    {batch.length > 10 && <div className="text-gray-400">…</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    disabled={!isBlacklistAdmin || isPending}
                                    onClick={() => submitBatch(true)}
                                    className={`${buttonBase} bg-red-600 text-white hover:bg-red-700`}
                                >
                                    Blacklist Batch
                                </button>
                                <button
                                    disabled={!isBlacklistAdmin || isPending}
                                    onClick={() => submitBatch(false)}
                                    className={`${buttonBase} bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900`}
                                >
                                    Unblacklist Batch
                                </button>
                            </div>
                            {!isBlacklistAdmin && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                            You do not have BLACKLIST_ADMIN_ROLE
                        </p>
                    )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}