'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function InitializeContract() {
  const { publicKey, isConnected, initializeContract } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Pre-filled values from your HTML testing page
  const [tokenContract] = useState('CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA')
  const [poolContract] = useState('CD24SABPPEFJHQ4D5UEVAV52SUYHDERKKBNWX2PUGVPSJ6NCOEJVBLTQ')
  const [minSenior, setMinSenior] = useState('2') // 2 tokens
  const [minJunior, setMinJunior] = useState('1') // 1 token

  const handleInitialize = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      console.log('[InitializeContract] Starting initialization...')

      const hash = await initializeContract(tokenContract, poolContract, minSenior, minJunior)

      setSuccess(`Contract initialized successfully! Transaction: ${hash}`)
      console.log('[InitializeContract] Success:', hash)
    } catch (err: any) {
      console.error('[InitializeContract] Error:', err)
      setError(err?.message || 'Failed to initialize contract')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <p className="text-gray-400 text-center">Connect your wallet to initialize the contract</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-3xl font-bold text-white">Initialize Contract</h2>
              <p className="text-orange-100">One-time setup (Admin only)</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <h4 className="text-yellow-400 font-semibold mb-1">⚠️ Important</h4>
                <p className="text-gray-300 text-sm">
                  This should only be called ONCE by the admin. If the contract is already initialized, this will fail.
                </p>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Configuration */}
          <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
            <h3 className="text-white font-semibold text-lg mb-4">Configuration</h3>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Admin Address (You)</label>
              <input
                type="text"
                value={publicKey || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Token Contract Address</label>
              <input
                type="text"
                value={tokenContract}
                disabled
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Pool Contract Address</label>
              <input
                type="text"
                value={poolContract}
                disabled
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Minimum Senior Investment (tokens)</label>
                <input
                  type="number"
                  value={minSenior}
                  onChange={(e) => setMinSenior(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-2">Minimum Junior Investment (tokens)</label>
                <input
                  type="number"
                  value={minJunior}
                  onChange={(e) => setMinJunior(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Initialize Button */}
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Initializing Contract...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Initialize Contract</span>
              </>
            )}
          </button>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold mb-2">What happens when you initialize?</h4>
            <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
              <li>Sets you ({publicKey?.slice(0, 8)}...) as the admin</li>
              <li>Configures the underlying token contract (USDC)</li>
              <li>Links to the Blend pool for yield generation</li>
              <li>Sets minimum investment amounts for each tranche</li>
              <li>Once initialized, users can subscribe to tranches</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
