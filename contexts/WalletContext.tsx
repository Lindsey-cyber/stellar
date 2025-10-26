 'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Networks } from '@stellar/stellar-sdk'
import {
  requestAccess,
  isConnected as checkIsConnected,
  getAddress,
  signTransaction as freighterSignTransaction
} from '@stellar/freighter-api'
import {
  tokenHelpers,
  blendPoolHelpers,
  submitSignedTransaction,
  parseTokenAmount,
  formatTokenAmount
} from '@/utils/contractHelpers'
import {
  trancheContractHelpers,
  parseTokenAmount as parseTrancheAmount,
  formatTokenAmount as formatTrancheAmount
} from '@/utils/trancheHelpers'
import { BLEND_CONTRACTS, TOKEN_CONTRACTS } from '@/config/contracts'

const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org'
const DEBUG = process.env.NEXT_PUBLIC_WALLET_DEBUG === '1'

interface WalletContextType {
  isConnected: boolean
  publicKey: string | null
  balance: string
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (transactionXDR: string) => Promise<string>
  createTrancheTokens: (amount: number, trancheType: 'senior' | 'junior') => Promise<string>
  investInTranche: (amount: number, trancheType: 'senior' | 'junior') => Promise<string>
  getAccountBalance: () => Promise<string>
  getTokenBalance: (tokenAddress: string) => Promise<string>
  supplyToPool: (tokenAddress: string, amount: string) => Promise<string>
  withdrawFromPool: (tokenAddress: string, amount: string) => Promise<string>
  borrowFromPool: (tokenAddress: string, amount: string) => Promise<string>
  repayToPool: (tokenAddress: string, amount: string) => Promise<string>
  getPoolPosition: () => Promise<any>
  // Tranche contract methods
  initializeContract: (tokenContract: string, poolContract: string, minSenior: string, minJunior: string) => Promise<string>
  subscribeToTranche: (trancheType: 'Senior' | 'Junior', amount: string) => Promise<string>
  redeemFromTranche: (trancheType: 'Senior' | 'Junior', amount: string) => Promise<string>
  getUserTrancheShare: (trancheType: 'Senior' | 'Junior') => Promise<string>
  getTrancheTotals: () => Promise<{ senior: string; junior: string }>
  getTrancheMinimums: () => Promise<{ senior: string; junior: string }>
  isLoading: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) throw new Error('useWallet must be used within a WalletProvider')
  return context
}

interface WalletProviderProps { children: ReactNode }

async function submitSignedXDR(signedXDR: string) {
  const res = await fetch(`${HORIZON_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ tx: signedXDR }).toString()
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Horizon submit error: ${res.status} ${txt}`)
  }
  return res.json()
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [isConnected, setIsConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [balance, setBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { checkConnection() }, [])

  const checkConnection = async () => {
    try {
      setError(null) // Clear any previous errors
      const resp = await checkIsConnected()
      if (DEBUG) console.log('[Wallet] isConnected ->', resp)
      if (resp.error || !resp.isConnected) return
      const addressResp = await getAddress()
      if (addressResp.error) return
      setPublicKey(addressResp.address)
      setIsConnected(true)
      await getAccountBalance()
    } catch (err) {
      if (DEBUG) console.error('[Wallet] checkConnection error', err)
      // Don't set error here, just silently fail on initial check
    }
  }

  const connect = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (DEBUG) console.log('[Wallet] Starting connection process...')

      // Check if window is available
      if (typeof window === 'undefined') {
        throw new Error('Window is not available. Please make sure you are in a browser environment.')
      }

      // Check if Freighter is installed
      if (!(window as any).freighter) {
        throw new Error('Freighter wallet not detected. Please install the Freighter browser extension from https://www.freighter.app/')
      }

      if (DEBUG) console.log('[Wallet] Freighter detected, requesting access...')

      const resp = await requestAccess()
      if (DEBUG) console.log('[Wallet] requestAccess response:', JSON.stringify(resp, null, 2))

      if (resp.error) {
        throw new Error(resp.error.message || resp.error || 'Failed to connect to Freighter. Make sure Freighter is unlocked.')
      }

      if (DEBUG) console.log('[Wallet] Access granted, getting address...')

      const addressResp = await getAddress()
      if (DEBUG) console.log('[Wallet] getAddress response:', JSON.stringify(addressResp, null, 2))

      if (addressResp.error) {
        throw new Error(addressResp.error.message || addressResp.error || 'Failed to get wallet address. Please try again.')
      }

      if (!addressResp.address) {
        throw new Error('No address returned from Freighter. Please try again.')
      }

      setPublicKey(addressResp.address)
      setIsConnected(true)

      if (DEBUG) console.log('[Wallet] Connected successfully, fetching balance...')

      // Fetch balance (pass the address since state might not be updated yet)
      await getAccountBalance(addressResp.address)

      if (DEBUG) console.log('[Wallet] Successfully connected:', addressResp.address)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to connect wallet'
      setError(errorMessage)
      console.error('[Wallet] connect error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => { setIsConnected(false); setPublicKey(null); setBalance('0'); setError(null) }

  const getAccountBalance = async (address?: string): Promise<string> => {
    const accountAddress = address || publicKey
    if (!accountAddress) return '0'
    try {
      const res = await fetch(`${HORIZON_URL}/accounts/${accountAddress}`)
      if (!res.ok) {
        if (DEBUG) console.log('[Wallet] Account not found on network')
        return '0'
      }
      const data = await res.json()
      const xlm = data.balances?.find((b: any) => b.asset_type === 'native')
      const value = xlm?.balance || '0'
      setBalance(value)
      return value
    } catch (err) {
      if (DEBUG) console.error('[Wallet] getAccountBalance error', err)
      return '0'
    }
  }

  const signTransactionInternal = async (transactionXDR: string): Promise<string> => {
    try {
      const response = await freighterSignTransaction(transactionXDR, { networkPassphrase: Networks.TESTNET })
      if (DEBUG) console.log('[Wallet] freighter sign ->', response)
      return (response as any).signedTxXdr || (response as any).signedTransaction || ''
    } catch (err) { if (DEBUG) console.error('[Wallet] freighter sign error ->', err); throw err }
  }

  const getTokenBalance = async (tokenAddress: string): Promise<string> => {
    if (!publicKey) return '0'
    try { const b = await tokenHelpers.getBalance(tokenAddress, publicKey); return formatTokenAmount(b) } catch (err) { if (DEBUG) console.error(err); return '0' }
  }

  const supplyToPool = async (tokenAddress: string, amount: string): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected')
    try { setIsLoading(true); setError(null); const amountParsed = parseTokenAmount(amount); const pool = BLEND_CONTRACTS.testnetV2Pool; const tx = await blendPoolHelpers.supply(pool, publicKey, tokenAddress, amountParsed); const signedXDR = await signTransactionInternal(tx.toXDR()); const res = await submitSignedTransaction(signedXDR); await getAccountBalance(); return res.hash } catch (err: any) { setError(err?.message || 'Failed to supply to pool'); throw err } finally { setIsLoading(false) }
  }

  const withdrawFromPool = async (tokenAddress: string, amount: string): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected')
    try { setIsLoading(true); setError(null); const amountParsed = parseTokenAmount(amount); const pool = BLEND_CONTRACTS.testnetV2Pool; const tx = await blendPoolHelpers.withdraw(pool, publicKey, tokenAddress, amountParsed); const signedXDR = await signTransactionInternal(tx.toXDR()); const res = await submitSignedTransaction(signedXDR); await getAccountBalance(); return res.hash } catch (err: any) { setError(err?.message || 'Failed to withdraw from pool'); throw err } finally { setIsLoading(false) }
  }

  const borrowFromPool = async (tokenAddress: string, amount: string): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected')
    try { setIsLoading(true); setError(null); const amountParsed = parseTokenAmount(amount); const pool = BLEND_CONTRACTS.testnetV2Pool; const tx = await blendPoolHelpers.borrow(pool, publicKey, tokenAddress, amountParsed); const signedXDR = await signTransactionInternal(tx.toXDR()); const res = await submitSignedTransaction(signedXDR); await getAccountBalance(); return res.hash } catch (err: any) { setError(err?.message || 'Failed to borrow from pool'); throw err } finally { setIsLoading(false) }
  }

  const repayToPool = async (tokenAddress: string, amount: string): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected')
    try { setIsLoading(true); setError(null); const amountParsed = parseTokenAmount(amount); const pool = BLEND_CONTRACTS.testnetV2Pool; const tx = await blendPoolHelpers.repay(pool, publicKey, tokenAddress, amountParsed); const signedXDR = await signTransactionInternal(tx.toXDR()); const res = await submitSignedTransaction(signedXDR); await getAccountBalance(); return res.hash } catch (err: any) { setError(err?.message || 'Failed to repay to pool'); throw err } finally { setIsLoading(false) }
  }

  const getPoolPosition = async (): Promise<any> => {
    if (!publicKey) return null
    try { const pool = BLEND_CONTRACTS.testnetV2Pool; return await blendPoolHelpers.getPosition(pool, publicKey) } catch (err) { if (DEBUG) console.error(err); return null }
  }

  // Implement tranche-related functions using existing pool supply flow for demo purposes.
  // Note: Proper tranche minting may require admin-only contract calls; this uses supplyToPool
  // to move RWA tokens to the pool and acts as an investment for the demo.
  const createTrancheTokens = async (amount: number, _trancheType: 'senior' | 'junior'): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected')
    try {
      setIsLoading(true); setError(null)
      // treat `amount` as decimal units (e.g., 1000 -> "1000")
      const hash = await supplyToPool(TOKEN_CONTRACTS.RWA_UST, String(amount))
      return hash
    } catch (err: any) {
      setError(err?.message || 'Failed to create tranche tokens')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const investInTranche = async (amount: number, _trancheType: 'senior' | 'junior'): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected')
    try {
      setIsLoading(true); setError(null)
      const hash = await supplyToPool(TOKEN_CONTRACTS.RWA_UST, String(amount))
      return hash
    } catch (err: any) {
      setError(err?.message || 'Failed to invest in tranche')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Tranche contract methods
  const initializeContract = async (tokenContract: string, poolContract: string, minSenior: string, minJunior: string): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected')

    try {
      setIsLoading(true)
      setError(null)

      const minSeniorParsed = parseTrancheAmount(minSenior)
      const minJuniorParsed = parseTrancheAmount(minJunior)

      const transaction = await trancheContractHelpers.initialize(
        publicKey,
        tokenContract,
        poolContract,
        minSeniorParsed,
        minJuniorParsed
      )

      const signedXDR = await signTransactionInternal(transaction.toXDR())
      const result = await submitSignedTransaction(signedXDR)

      await getAccountBalance()
      return result.hash
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to initialize contract'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToTranche = async (trancheType: 'Senior' | 'Junior', amount: string): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected')

    try {
      setIsLoading(true)
      setError(null)

      const amountParsed = parseTrancheAmount(amount)
      const transaction = await trancheContractHelpers.subscribe(publicKey, trancheType as any, amountParsed)
      const signedXDR = await signTransactionInternal(transaction.toXDR())
      const result = await submitSignedTransaction(signedXDR)

      await getAccountBalance()
      return result.hash
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to subscribe to tranche'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const redeemFromTranche = async (trancheType: 'Senior' | 'Junior', amount: string): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected')

    try {
      setIsLoading(true)
      setError(null)

      const amountParsed = parseTrancheAmount(amount)
      const transaction = await trancheContractHelpers.redeem(publicKey, trancheType as any, amountParsed)
      const signedXDR = await signTransactionInternal(transaction.toXDR())
      const result = await submitSignedTransaction(signedXDR)

      await getAccountBalance()
      return result.hash
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to redeem from tranche'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getUserTrancheShare = async (trancheType: 'Senior' | 'Junior'): Promise<string> => {
    if (!publicKey) return '0'

    try {
      const share = await trancheContractHelpers.getUserShare(publicKey, trancheType as any)
      return formatTrancheAmount(share)
    } catch (error) {
      console.error('Error getting user tranche share:', error)
      return '0'
    }
  }

  const getTrancheTotals = async (): Promise<{ senior: string; junior: string }> => {
    try {
      const totals = await trancheContractHelpers.getTotals()
      return {
        senior: formatTrancheAmount(totals.senior),
        junior: formatTrancheAmount(totals.junior)
      }
    } catch (error) {
      console.error('Error getting tranche totals:', error)
      return { senior: '0', junior: '0' }
    }
  }

  const getTrancheMinimums = async (): Promise<{ senior: string; junior: string }> => {
    try {
      const minimums = await trancheContractHelpers.getMinimums()
      return {
        senior: formatTrancheAmount(minimums.senior),
        junior: formatTrancheAmount(minimums.junior)
      }
    } catch (error) {
      console.error('Error getting tranche minimums:', error)
      return { senior: '0', junior: '0' }
    }
  }

  const value: WalletContextType = {
    isConnected,
    publicKey,
    balance,
    connect,
    disconnect,
    signTransaction: signTransactionInternal,
    createTrancheTokens,
    investInTranche,
    getAccountBalance,
    getTokenBalance,
    supplyToPool,
    withdrawFromPool,
    borrowFromPool,
    repayToPool,
    getPoolPosition,
    initializeContract,
    subscribeToTranche,
    redeemFromTranche,
    getUserTrancheShare,
    getTrancheTotals,
    getTrancheMinimums,
    isLoading,
    error
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
