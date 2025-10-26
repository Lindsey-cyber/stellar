'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { TOKEN_CONTRACTS, BLEND_CONTRACTS } from '@/config/contracts'
import { tokenHelpers, submitSignedTransaction, parseTokenAmount } from '@/utils/contractHelpers'

export default function BlendPoolInteraction() {
  const {
    publicKey,
    isLoading,
    error,
    getTokenBalance,
    supplyToPool,
    withdrawFromPool,
    borrowFromPool,
    repayToPool,
    getPoolPosition,
    signTransaction
  } = useWallet()

  const [selectedToken, setSelectedToken] = useState<string>(TOKEN_CONTRACTS.RWA_UST)
  const [amount, setAmount] = useState<string>('')
  const [tokenBalance, setTokenBalance] = useState<string>('0')
  const [poolPosition, setPoolPosition] = useState<any>(null)
  const [txHash, setTxHash] = useState<string>('')

  const handleGetBalance = async () => {
    try {
      const balance = await getTokenBalance(selectedToken)
      setTokenBalance(balance)
    } catch (err) {
      console.error('Failed to get balance:', err)
    }
  }

  const handleGetPosition = async () => {
    try {
      const position = await getPoolPosition()
      setPoolPosition(position)
    } catch (err) {
      console.error('Failed to get position:', err)
    }
  }

  const handleSupply = async () => {
    try {
      const hash = await supplyToPool(selectedToken, amount)
      setTxHash(hash)
      setAmount('')
    } catch (err) {
      console.error('Failed to supply:', err)
    }
  }

  const handleWithdraw = async () => {
    try {
      const hash = await withdrawFromPool(selectedToken, amount)
      setTxHash(hash)
      setAmount('')
    } catch (err) {
      console.error('Failed to withdraw:', err)
    }
  }

  const handleBorrow = async () => {
    try {
      const hash = await borrowFromPool(selectedToken, amount)
      setTxHash(hash)
      setAmount('')
    } catch (err) {
      console.error('Failed to borrow:', err)
    }
  }

  const handleRepay = async () => {
    try {
      const hash = await repayToPool(selectedToken, amount)
      setTxHash(hash)
      setAmount('')
    } catch (err) {
      console.error('Failed to repay:', err)
    }
  }

  // RWA Received Benefit: transfer from connected account (receiver) to pool contract
  const handleRwaBenefit = async () => {
    try {
      if (!amount) throw new Error('Enter an amount')
      // parse to contract format
      const amountParsed = parseTokenAmount(amount)
      // build transfer transaction (token contract transfer)
      const tx = await tokenHelpers.transfer(TOKEN_CONTRACTS.RWA_UST, publicKey as string, BLEND_CONTRACTS.testnetV2Pool, amountParsed)
  // request freighter to sign XDR
  const signedXDR = await signTransaction(tx.toXDR())
      // submit signed transaction via Soroban RPC
      const res = await submitSignedTransaction(signedXDR)
      if (res && typeof res === 'object') {
        if ('hash' in res && typeof (res as any).hash === 'string') {
          setTxHash((res as any).hash)
        } else if ('transactionHash' in res && typeof (res as any).transactionHash === 'string') {
          setTxHash((res as any).transactionHash)
        } else {
          setTxHash('')
        }
      } else {
        setTxHash('')
      }
      setAmount('')
    } catch (err) {
      console.error('Failed to transfer RWA benefit:', err)
    }
  }

  if (!publicKey) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Please connect your wallet to interact with Blend Pool</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Blend Pool Interaction</h2>

        {/* Token Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Token</label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value={TOKEN_CONTRACTS.RWA_UST}>RWA_UST</option>
            <option value={TOKEN_CONTRACTS.USDC}>USDC</option>
            <option value={TOKEN_CONTRACTS.XLM}>XLM</option>
            <option value={TOKEN_CONTRACTS.BLND}>BLND</option>
            <option value={TOKEN_CONTRACTS.wETH}>wETH</option>
            <option value={TOKEN_CONTRACTS.wBTC}>wBTC</option>
          </select>
        </div>

        {/* Token Balance */}
        <div className="mb-4 p-4 bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Token Balance:</span>
            <span className="font-mono">{tokenBalance}</span>
          </div>
          <button
            onClick={handleGetBalance}
            disabled={isLoading}
            className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50"
          >
            Refresh Balance
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={handleSupply}
            disabled={isLoading || !amount}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50"
          >
            Supply
          </button>
          <button
            onClick={handleWithdraw}
            disabled={isLoading || !amount}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium disabled:opacity-50"
          >
            Withdraw
          </button>
          <button
            onClick={handleBorrow}
            disabled={isLoading || !amount}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium disabled:opacity-50"
          >
            Borrow
          </button>
          <button
            onClick={handleRepay}
            disabled={isLoading || !amount}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50"
          >
            Repay
          </button>
        </div>

        {/* Pool Position */}
        <div className="mb-4">
          <button
            onClick={handleGetPosition}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium disabled:opacity-50"
          >
            Get Pool Position
          </button>
          {poolPosition && (
            <div className="mt-2 p-4 bg-gray-700 rounded-lg">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(poolPosition, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Transaction Hash */}
        {txHash && (
          <div className="p-4 bg-green-900 bg-opacity-20 border border-green-500 rounded-lg">
            <p className="text-sm text-green-400 mb-1">Transaction Successful!</p>
            <p className="text-xs font-mono break-all">{txHash}</p>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
            >
              View on Stellar Expert
            </a>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="mt-2 text-sm text-gray-400">Processing transaction...</p>
          </div>
        )}
      </div>

      {/* Contract Info */}
      <div className="p-6 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Contract Information</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-400">Pool Address:</span>
            <p className="font-mono text-xs break-all">CD24SABPPEFJHQ4D5UEVAV52SUYHDERKKBNWX2PUGVPSJ6NCOEJVBLTQ</p>
          </div>
          <div>
            <span className="text-gray-400">Selected Token:</span>
            <p className="font-mono text-xs break-all">{selectedToken}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
