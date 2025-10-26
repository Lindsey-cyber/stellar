'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Shield,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Info,
  Loader2
} from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

export default function TrancheInvestment() {
  const {
    publicKey,
    isConnected,
    connect,
    isLoading: walletLoading,
    error: walletError,
    subscribeToTranche,
    redeemFromTranche,
    getUserTrancheShare,
    getTrancheTotals,
    getTrancheMinimums
  } = useWallet()

  const [selectedTranche, setSelectedTranche] = useState<'Senior' | 'Junior'>('Senior')
  const [amount, setAmount] = useState('')
  const [seniorShare, setSeniorShare] = useState('0')
  const [juniorShare, setJuniorShare] = useState('0')
  const [totals, setTotals] = useState({ senior: '0', junior: '0' })
  const [minimums, setMinimums] = useState({ senior: '0', junior: '0' })
  const [txHash, setTxHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user shares and totals
  useEffect(() => {
    if (isConnected && publicKey) {
      loadData()
    }
  }, [isConnected, publicKey])

  const loadData = async () => {
    try {
      console.log('[TrancheInvestment] Loading data...')
      const [senior, junior, totalsData, minimumsData] = await Promise.all([
        getUserTrancheShare('Senior'),
        getUserTrancheShare('Junior'),
        getTrancheTotals(),
        getTrancheMinimums()
      ])

      console.log('[TrancheInvestment] Data loaded:', { senior, junior, totalsData, minimumsData })
      setSeniorShare(senior)
      setJuniorShare(junior)
      setTotals(totalsData)
      setMinimums(minimumsData)
    } catch (err) {
      console.error('[TrancheInvestment] Failed to load data:', err)
    }
  }

  const handleSubscribe = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('[TrancheInvestment] Subscribing to:', selectedTranche, 'Amount:', amount)
      const hash = await subscribeToTranche(selectedTranche, amount)
      console.log('[TrancheInvestment] Subscribe success, hash:', hash)
      setTxHash(hash)
      setAmount('')
      await loadData()
    } catch (err: any) {
      console.error('[TrancheInvestment] Subscribe error:', err)
      let errorMsg = err?.message || err?.toString() || 'Failed to subscribe to tranche'

      // Check for specific contract errors
      if (errorMsg.includes('UnreachableCodeReached')) {
        errorMsg = '⚠️ Contract Not Initialized: The tranche contract needs to be initialized by the administrator. Please contact your friend who deployed the contract to run the initialization function with the required parameters (Blend pool address, token addresses, admin address, etc.)'
      } else if (errorMsg.includes('InvalidAction')) {
        errorMsg = '⚠️ Contract Error: This action is not allowed. The contract may be paused or missing required configuration.'
      }

      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const hash = await redeemFromTranche(selectedTranche, amount)
      setTxHash(hash)
      setAmount('')
      await loadData()
    } catch (err: any) {
      console.error('[TrancheInvestment] Redeem error:', err)
      let errorMsg = err?.message || 'Failed to redeem from tranche'

      // Check for specific contract errors
      if (errorMsg.includes('UnreachableCodeReached')) {
        errorMsg = '⚠️ Contract Not Initialized: The tranche contract needs to be initialized by the administrator. Please contact your friend who deployed the contract to run the initialization function with the required parameters (Blend pool address, token addresses, admin address, etc.)'
      } else if (errorMsg.includes('InvalidAction')) {
        errorMsg = '⚠️ Contract Error: This action is not allowed. The contract may be paused or missing required configuration.'
      }

      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <h2 className="text-3xl font-bold text-white mb-2">Tranche Investment</h2>
          <p className="text-purple-100">Invest in Senior or Junior tranches with waterfall protection</p>
        </div>

        {!isConnected ? (
          <div className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 mb-4">Connect your wallet to start investing</p>
            <button
              onClick={connect}
              disabled={walletLoading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {walletLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Tranche Selection */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTranche('Senior')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedTranche === 'Senior'
                    ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <Shield className="w-8 h-8 mb-3 text-blue-400" />
                <h3 className="text-xl font-bold mb-2">Senior Tranche</h3>
                <p className="text-sm text-gray-400 mb-3">Lower risk, protected first in waterfall</p>
                <div className="space-y-1 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Share:</span>
                    <span className="font-mono text-blue-400">{parseFloat(seniorShare).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span className="font-mono">{parseFloat(totals.senior).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min:</span>
                    <span className="font-mono">{parseFloat(minimums.senior).toFixed(2)}</span>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTranche('Junior')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedTranche === 'Junior'
                    ? 'border-purple-500 bg-purple-500 bg-opacity-10'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <TrendingUp className="w-8 h-8 mb-3 text-purple-400" />
                <h3 className="text-xl font-bold mb-2">Junior Tranche</h3>
                <p className="text-sm text-gray-400 mb-3">Higher risk, higher returns potential</p>
                <div className="space-y-1 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Share:</span>
                    <span className="font-mono text-purple-400">{parseFloat(juniorShare).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span className="font-mono">{parseFloat(totals.junior).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min:</span>
                    <span className="font-mono">{parseFloat(minimums.junior).toFixed(2)}</span>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Amount Input */}
            <div className="bg-gray-800 rounded-xl p-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Amount (Tokens)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-lg font-mono"
                />
                <DollarSign className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Minimum: {selectedTranche === 'Senior' ? minimums.senior : minimums.junior} tokens
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubscribe}
                disabled={loading || !amount}
                className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ArrowUpCircle className="w-5 h-5" />
                    <span>Subscribe</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRedeem}
                disabled={loading || !amount}
                className="px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ArrowDownCircle className="w-5 h-5" />
                    <span>Redeem</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Transaction Result */}
            {txHash && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-900 bg-opacity-20 border border-green-500 rounded-xl"
              >
                <p className="text-sm text-green-400 mb-2 font-medium">Transaction Successful!</p>
                <p className="text-xs font-mono break-all text-gray-300">{txHash}</p>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                >
                  View on Stellar Expert →
                </a>
              </motion.div>
            )}

            {/* Error Display */}
            {(error || walletError) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-xl"
              >
                <p className="text-sm text-red-400">{error || walletError}</p>
              </motion.div>
            )}

            {/* Info Box */}
            <div className="bg-blue-900 bg-opacity-20 border border-blue-500 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-blue-400 mb-1">How it works:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Senior tranche has priority in the waterfall structure</li>
                    <li>Junior tranche absorbs losses first but gets higher returns</li>
                    <li>Subscribe to invest, redeem to withdraw your principal</li>
                    <li>Contract: CAIUMAVGQUDLA5EMTCC4GY5EF64VMZOFPSS6EFZZKLFWMAB56ZPE5QRP</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Refresh Data
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
