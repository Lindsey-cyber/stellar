'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/DashboardHeader'
import PortfolioOverview from '@/components/PortfolioOverview'
import YieldTracker from '@/components/YieldTracker'
import TransactionHistory from '@/components/TransactionHistory'
import RiskAssessment from '@/components/RiskAssessment'
import DEFINDEXAnalytics from '@/components/DEFINDEXAnalytics'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'yield', label: 'Yield Tracker', icon: '📈' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
    { id: 'risk', label: 'Risk Analysis', icon: '🛡️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-gray-800/50 rounded-2xl p-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === 'overview' && <PortfolioOverview />}
          {activeTab === 'portfolio' && <PortfolioOverview />}
          {activeTab === 'yield' && <YieldTracker />}
          {activeTab === 'transactions' && <TransactionHistory />}
          {activeTab === 'risk' && <RiskAssessment />}
          {activeTab === 'analytics' && <DEFINDEXAnalytics />}
        </motion.div>
      </div>
    </div>
  )
}
