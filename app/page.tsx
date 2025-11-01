'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  ArrowRight, 
  Star,
  DollarSign,
  Lock,
  Globe,
  Activity
} from 'lucide-react'
import HeroSection from '@/components/HeroSection'
import ProductShowcase from '@/components/ProductShowcase'
import WaterfallDiagram from '@/components/WaterfallDiagram'
import LossSimulation from '@/components/LossSimulation'
import WalletConnection from '@/components/WalletConnection'
import RWATransparency from '@/components/RWATransparency'
import SecondaryMarket from '@/components/SecondaryMarket'
import FeaturesSection from '@/components/FeaturesSection'
import DEFINDEXIntegration from '@/components/DEFINDEXIntegration'
import ComplianceSection from '@/components/ComplianceSection'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import TrancheInvestment from '@/components/TrancheInvestment'
import WalletDebug from '@/components/WalletDebug'

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <main className="relative">

        {/* Hero Section */}
        <HeroSection />
        
        {/* Product Showcase */}
        <ProductShowcase />
        
        {/* Waterfall Diagram - The WOW Factor! */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <WaterfallDiagram />
          </div>
        </section>
        
        {/* Loss Simulation - Interactive Demo */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <LossSimulation />
          </div>
        </section>
        
        {/* Wallet Connection & Investment Flow */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <WalletConnection />
          </div>
        </section>

        {/* Tranche Investment - LIVE CONTRACT INTEGRATION */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-purple-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 bg-green-500 bg-opacity-20 border border-green-500 rounded-full mb-4"
              >
                <span className="text-green-400 font-semibold text-sm">LIVE ON TESTNET</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Real Tranche Contract Integration
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Interact directly with our deployed Soroban smart contract on Stellar Testnet
              </p>
            </div>
            <TrancheInvestment />
          </div>
        </section>
        
        {/* RWA Transparency Panel */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <RWATransparency />
          </div>
        </section>
        
        {/* Secondary Market Trading */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SecondaryMarket />
          </div>
        </section>
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* DEFINDEX Integration */}
        <DEFINDEXIntegration />
        
        {/* Compliance & Audit */}
        <ComplianceSection />
        
        {/* Footer */}
        <Footer />
      </main>

      {/* Debug Panel */}
      <WalletDebug />
    </div>
  )
}
