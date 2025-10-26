'use client'

import { useWallet } from '@/contexts/WalletContext'
import { useEffect, useState } from 'react'
import { requestAccess, getAddress } from '@stellar/freighter-api'

export default function WalletDebug() {
  const wallet = useWallet()
  const [freighterStatus, setFreighterStatus] = useState<string>('checking...')
  const [directTest, setDirectTest] = useState<string>('not tested')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasFreighter = !!(window as any).freighter
      setFreighterStatus(hasFreighter ? 'installed' : 'not installed')
    }
  }, [])

  const testDirectConnection = async () => {
    try {
      setDirectTest('testing...')
      console.log('[WalletDebug] Testing direct Freighter connection...')

      const resp = await requestAccess()
      console.log('[WalletDebug] requestAccess response:', resp)

      if (resp.error) {
        setDirectTest(`Error: ${JSON.stringify(resp.error)}`)
        return
      }

      const addressResp = await getAddress()
      console.log('[WalletDebug] getAddress response:', addressResp)

      if (addressResp.error) {
        setDirectTest(`Error: ${JSON.stringify(addressResp.error)}`)
        return
      }

      setDirectTest(`Success! Address: ${addressResp.address}`)
    } catch (err: any) {
      console.error('[WalletDebug] Direct test error:', err)
      setDirectTest(`Exception: ${err.message}`)
    }
  }

  if (process.env.NEXT_PUBLIC_WALLET_DEBUG !== '1') return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-md space-y-2 z-50">
      <div className="font-bold mb-2">Wallet Debug Info</div>
      <div>Freighter: {freighterStatus}</div>
      <div>Connected: {wallet.isConnected ? 'Yes' : 'No'}</div>
      <div>Public Key: {wallet.publicKey ? `${wallet.publicKey.slice(0,8)}...` : 'N/A'}</div>
      <div>Balance: {wallet.balance || '0'} XLM</div>
      <div>Loading: {wallet.isLoading ? 'Yes' : 'No'}</div>
      <div className="break-words">Error: {wallet.error || 'None'}</div>

      <div className="border-t border-gray-600 pt-2 mt-2">
        <button
          onClick={testDirectConnection}
          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white w-full"
        >
          Test Direct Connection
        </button>
        <div className="mt-2 break-words">Direct Test: {directTest}</div>
      </div>
    </div>
  )
}
