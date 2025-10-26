'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Shield, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const ADMIN_ADDRESS = 'SC566PQX2UK4X7JXEF7UU7PE5IYCDGPE6C6VQH26RHLYNFKEEAWGSHHV'

export default function AdminPanel() {
  const { publicKey, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check if current user is admin
  const isAdmin = publicKey === ADMIN_ADDRESS

  // Mock pending requests - in production, fetch from contract or backend
  const [pendingRequests] = useState<Array<{
    user: string
    tranche: 'Senior' | 'Junior'
    amount: string
  }>>([])

  if (!isConnected) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <p className="text-gray-400 text-center">Connect your wallet to access the admin panel</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <p className="text-gray-400 text-center">You do not have admin privileges</p>
        <p className="text-gray-500 text-sm text-center mt-2">
          Connected as: {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
        </p>
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-3xl font-bold text-white">Admin Panel</h2>
              <p className="text-purple-100">Manage subscription requests</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">Admin Account</h3>
            <p className="text-gray-400 font-mono text-sm">{publicKey}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Pending Subscription Requests ({pendingRequests.length})
            </h3>

            <div className="bg-gray-800/50 rounded-xl p-8 text-center">
              <p className="text-gray-400">No pending requests</p>
              <p className="text-gray-500 text-sm mt-2">
                Once the contract functions are confirmed, requests will appear here
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold mb-2">Setup Required:</h4>
            <p className="text-gray-400 text-sm">
              Please check IMPORTANT_QUESTION.md to provide the contract function names so we can complete the admin approval workflow.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
