'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import toast from 'react-hot-toast'
import { 
  Wallet, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Zap,
  DollarSign,
  TrendingUp,
  Lock,
  Eye
} from 'lucide-react'

export default function WalletConnection() {
  const { 
    isConnected, 
    publicKey, 
    balance, 
    connect, 
    disconnect, 
    createTrancheTokens, 
    investInTranche,
    isLoading,
    error
  } = useWallet()
  
  const [selectedTranche, setSelectedTranche] = useState<'senior' | 'junior' | null>(null)
  const [amount, setAmount] = useState(0)
  const [isMinting, setIsMinting] = useState(false)

  const tranches = [
    {
      id: 'senior',
      name: 'Senior Tier',
      description: 'Priority cash flow with lower risk',
      apy: '8.5%',
      risk: 'Low',
      color: 'from-blue-500 to-cyan-600',
      icon: Shield,
      features: ['First priority', 'Lower risk', 'Stable returns']
    },
    {
      id: 'junior',
      name: 'Junior Tier',
      description: 'Higher yield with increased risk',
      apy: '15.2%',
      risk: 'High',
      color: 'from-orange-500 to-red-600',
      icon: AlertTriangle,
      features: ['Higher yield', 'Absorbs losses', 'Variable returns']
    }
  ]

  const handleConnect = async () => {
    try {
      await connect()
      toast.success('Wallet connected successfully!')
    } catch (err: any) {
      console.error('[WalletConnection] Connect error:', err)
      const errorMsg = err?.message || 'Failed to connect wallet'
      toast.error(errorMsg)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast.success('Wallet disconnected')
  }

  const mintTokens = async () => {
    if (!selectedTranche || amount <= 0) {
      toast.error('Please select a tranche and enter an amount')
      return
    }

    try {
      setIsMinting(true)
      const txHash = await createTrancheTokens(amount, selectedTranche)
      toast.success(`Tranche tokens minted! Transaction: ${txHash}`)
      setAmount(0)
      setSelectedTranche(null)
    } catch (err) {
      toast.error('Failed to mint tokens')
    } finally {
      setIsMinting(false)
    }
  }

  const handleInvest = async () => {
    if (!selectedTranche || amount <= 0) {
      toast.error('Please select a tranche and enter an amount')
      return
    }

    try {
      setIsMinting(true)
      const txHash = await investInTranche(amount, selectedTranche)
      toast.success(`Investment successful! Transaction: ${txHash}`)
      setAmount(0)
      setSelectedTranche(null)
    } catch (err) {
      toast.error('Failed to invest in tranche')
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="glass-effect rounded-3xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Investment Flow</h2>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-gray-400">
            {isConnected ? `Connected: ${publicKey?.slice(0, 8)}...` : 'Wallet Disconnected'}
          </span>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {!isConnected ? (
        /* Wallet Connection */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-12 h-12 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your Soroban-compatible wallet to start investing in RWA-backed structured products
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md mx-auto">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Connection Error</span>
              </div>
              <p className="text-red-300 text-sm mt-2">{error}</p>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect Freighter Wallet</span>
              </>
            )}
          </button>
        </motion.div>
      ) : (
        /* Investment Interface */
        <div className="space-y-8">
          {/* Tranche Selection */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Choose Your Tranche</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tranches.map((tranche, index) => (
                <motion.button
                  key={tranche.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  onClick={() => setSelectedTranche(tranche.id as 'senior' | 'junior')}
                  className={`p-6 rounded-2xl transition-all duration-300 ${
                    selectedTranche === tranche.id
                      ? 'ring-2 ring-blue-500 bg-blue-500/10'
                      : 'bg-gray-800/50 hover:bg-gray-800/70'
                  }`}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${tranche.color} rounded-xl flex items-center justify-center`}>
                      <tranche.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{tranche.name}</h4>
                      <p className="text-gray-400 text-sm">{tranche.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-gray-400 text-sm">Expected APY</div>
                      <div className="text-2xl font-bold text-white">{tranche.apy}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Risk Level</div>
                      <div className={`text-lg font-bold ${
                        tranche.risk === 'Low' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {tranche.risk}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {tranche.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Amount Selection */}
          {selectedTranche && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gray-800/50 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Investment Amount</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Amount (XLM)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[1000, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className="p-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
                    >
                      ${preset.toLocaleString()}
                    </button>
                  ))}
                </div>
                
                {amount > 0 && (
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                    <h4 className="text-white font-semibold mb-2">Investment Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tranche:</span>
                        <span className="text-white">{tranches.find(t => t.id === selectedTranche)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white">${amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expected APY:</span>
                        <span className="text-green-400 font-semibold">
                          {tranches.find(t => t.id === selectedTranche)?.apy}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Annual Yield:</span>
                        <span className="text-green-400 font-semibold">
                          ${Math.round(amount * (selectedTranche === 'senior' ? 0.085 : 0.152))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Mint Tokens */}
          {selectedTranche && amount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex space-x-4">
                <button
                  onClick={mintTokens}
                  disabled={isMinting || !selectedTranche || amount <= 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isMinting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Minting...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Mint Tokens</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleInvest}
                  disabled={isMinting || !selectedTranche || amount <= 0}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isMinting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Investing...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      <span>Invest</span>
                    </>
                  )}
                </button>
              </div>
              
              {isMinting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-gray-400 text-sm"
                >
                  Creating your tranche tokens on-chain...
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Wallet Balance */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-gray-800/50 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Wallet Balance</h3>
              
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                <div>
                  <div className="text-gray-400 text-sm">XLM Balance</div>
                  <div className="text-2xl font-bold text-white">{parseFloat(balance).toFixed(2)} XLM</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm">Public Key</div>
                  <div className="text-blue-400 font-mono text-sm">{publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Token Balance Display */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gray-800/50 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Your Tranche Tokens</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <h4 className="text-white font-semibold">Senior Tokens (SRN)</h4>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">0</div>
                  <div className="text-gray-400 text-sm">Tokens owned</div>
                  <div className="text-green-400 text-sm">+$0.00 earned</div>
                </div>
                
                <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                    <h4 className="text-white font-semibold">Junior Tokens (JRN)</h4>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">0</div>
                  <div className="text-gray-400 text-sm">Tokens owned</div>
                  <div className="text-green-400 text-sm">+$0.00 earned</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
