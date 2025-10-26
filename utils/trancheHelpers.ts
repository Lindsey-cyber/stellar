import {
  Contract,
  TransactionBuilder,
  Networks,
  xdr,
  scValToNative,
  nativeToScVal,
  Account,
  rpc,
  Address
} from '@stellar/stellar-sdk'

import { NETWORK_CONFIG, TRANCHE_CONTRACT } from '@/config/contracts'

// TrancheType enum matching the contract
export enum TrancheType {
  Senior = 'Senior',
  Junior = 'Junior'
}

// Initialize Soroban RPC server
export const getSorobanServer = () => {
  if (!rpc || !rpc.Server) {
    console.error('[getSorobanServer] rpc not available:', rpc)
    throw new Error('rpc.Server is not available. Please check @stellar/stellar-sdk installation.')
  }
  return new rpc.Server(NETWORK_CONFIG.sorobanRpc)
}

// Helper to convert TrancheType to ScVal
// Soroban C-style enums (without data) are encoded as Vec[Symbol, Vec[]]
const trancheTypeToScVal = (trancheType: TrancheType): xdr.ScVal => {
  const variantName = trancheType === TrancheType.Senior ? 'Senior' : 'Junior'

  // Encode as Vec[Symbol("Senior"), Vec[]] or Vec[Symbol("Junior"), Vec[]]
  // The second element is an empty Vec for unit-style enum variants
  return xdr.ScVal.scvVec([
    xdr.ScVal.scvSymbol(Buffer.from(variantName)),
    xdr.ScVal.scvVec([])  // Empty vec for unit variant
  ])
}

// Tranche Contract Interactions
export const trancheContractHelpers = {
  // Initialize the contract (call once)
  async initialize(
    adminAddress: string,
    tokenContractId: string,
    poolContractId: string,
    minSenior: bigint,
    minJunior: bigint
  ) {
    try {
      console.log('[trancheHelpers] Initialize - admin:', adminAddress)

      const server = getSorobanServer()
      const contract = new Contract(TRANCHE_CONTRACT.address)
      const sourceAccount = await server.getAccount(adminAddress)

      // Convert addresses to Address objects first
      const adminAddr = new Address(adminAddress)
      const tokenAddr = new Address(tokenContractId)
      const poolAddr = new Address(poolContractId)

      const args = [
        adminAddr.toScVal(),
        tokenAddr.toScVal(),
        poolAddr.toScVal(),
        nativeToScVal(minSenior, { type: 'i128' }),
        nativeToScVal(minJunior, { type: 'i128' })
      ]

      console.log('[trancheHelpers] Initialize args:', {
        admin: adminAddr.toString(),
        token: tokenAddr.toString(),
        pool: poolAddr.toString(),
        minSenior: minSenior.toString(),
        minJunior: minJunior.toString()
      })

      let transaction = new TransactionBuilder(sourceAccount, {
        fee: '100000',
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(contract.call('initialize', ...args))
        .setTimeout(30)
        .build()

      console.log('[trancheHelpers] Initialize transaction built, simulating...')

      const simulated = await server.simulateTransaction(transaction)
      console.log('[trancheHelpers] Initialize simulation:', JSON.stringify(simulated, null, 2))

      if (!rpc.Api.isSimulationSuccess(simulated)) {
        console.error('[trancheHelpers] Initialize simulation failed:', simulated)
        let errorMessage = 'Initialize simulation failed'
        if ('error' in simulated) {
          errorMessage += `: ${simulated.error}`
        }
        throw new Error(errorMessage)
      }

      transaction = rpc.assembleTransaction(transaction, simulated).build()
      return transaction
    } catch (error) {
      console.error('[trancheHelpers] Initialize error:', error)
      throw error
    }
  },

  // Subscribe to a tranche (invest)
  async subscribe(
    from: string,
    trancheType: TrancheType,
    amount: bigint
  ) {
    try {
      console.log('[trancheHelpers] Subscribe - from:', from, 'tranche:', trancheType, 'amount:', amount.toString())

      const server = getSorobanServer()
      const contract = new Contract(TRANCHE_CONTRACT.address)

      // Get account from network
      const sourceAccount = await server.getAccount(from)
      let seq = ''
      if (sourceAccount && typeof sourceAccount === 'object') {
        if ('sequence' in sourceAccount && typeof (sourceAccount as any).sequence === 'string') {
          seq = (sourceAccount as any).sequence
        } else if (typeof (sourceAccount as any).sequenceNumber === 'function') {
          // 某些 SDK 可能以方法提供序列号
          seq = (sourceAccount as any).sequenceNumber()
        }
      }
      console.log('[trancheHelpers] Account loaded, sequence:', seq)

      // Convert from address to Address object
      const fromAddr = new Address(from)

      const args = [
        fromAddr.toScVal(),
        trancheTypeToScVal(trancheType),
        nativeToScVal(amount, { type: 'i128' })
      ]

      console.log('[trancheHelpers] Subscribe args:', {
        from: fromAddr.toString(),
        tranche: trancheType,
        amount: amount.toString()
      })
      console.log('[trancheHelpers] Args XDR:', args.map(a => a.toXDR('base64')))

      // Build transaction
      let transaction = new TransactionBuilder(sourceAccount, {
        fee: '100000',
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(contract.call('subscribe', ...args))
        .setTimeout(30)
        .build()

      console.log('[trancheHelpers] Transaction built, simulating...')

      // Simulate transaction to get the real resource fees
      const simulated = await server.simulateTransaction(transaction)

      console.log('[trancheHelpers] Full simulation response:', JSON.stringify(simulated, null, 2))

      if (!rpc.Api.isSimulationSuccess(simulated)) {
        console.error('[trancheHelpers] Simulation failed:', simulated)

        // Extract error details
        let errorMessage = 'Transaction simulation failed'
        if ('error' in simulated) {
          errorMessage += `: ${simulated.error}`
        }
        if ('result' in simulated && simulated.result) {
          errorMessage += ` - ${JSON.stringify(simulated.result)}`
        }

        throw new Error(errorMessage)
      }

      console.log('[trancheHelpers] Simulation successful, preparing transaction...')

      // Prepare the transaction with simulation results
      transaction = rpc.assembleTransaction(transaction, simulated).build()

      return transaction
    } catch (error) {
      console.error('[trancheHelpers] Subscribe error:', error)
      throw error
    }
  },

  // Redeem from a tranche (withdraw)
  async redeem(
    from: string,
    trancheType: TrancheType,
    amount: bigint
  ) {
    try {
      console.log('[trancheHelpers] Redeem - from:', from, 'tranche:', trancheType, 'amount:', amount.toString())

      const server = getSorobanServer()
      const contract = new Contract(TRANCHE_CONTRACT.address)

      // Get account from network
      const sourceAccount = await server.getAccount(from)
            let seq = ''
      if (sourceAccount && typeof sourceAccount === 'object') {
        if ('sequence' in sourceAccount && typeof (sourceAccount as any).sequence === 'string') {
          seq = (sourceAccount as any).sequence
        } else if (typeof (sourceAccount as any).sequenceNumber === 'function') {
          // 某些 SDK 可能以方法提供序列号
          seq = (sourceAccount as any).sequenceNumber()
        }
      }
      console.log('[trancheHelpers] Account loaded, sequence:', seq)

      // Convert from address to Address object
      const fromAddr = new Address(from)

      const args = [
        fromAddr.toScVal(),
        trancheTypeToScVal(trancheType),
        nativeToScVal(amount, { type: 'i128' })
      ]

      console.log('[trancheHelpers] Redeem args:', {
        from: fromAddr.toString(),
        tranche: trancheType,
        amount: amount.toString()
      })
      console.log('[trancheHelpers] Redeem XDR:', args.map(a => a.toXDR('base64')))

      // Build transaction
      let transaction = new TransactionBuilder(sourceAccount, {
        fee: '100000',
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(contract.call('redeem', ...args))
        .setTimeout(30)
        .build()

      console.log('[trancheHelpers] Transaction built, simulating...')

      // Simulate transaction to get the real resource fees
      const simulated = await server.simulateTransaction(transaction)

      console.log('[trancheHelpers] Redeem simulation response:', JSON.stringify(simulated, null, 2))

      if (!rpc.Api.isSimulationSuccess(simulated)) {
        console.error('[trancheHelpers] Simulation failed:', simulated)

        // Extract error details
        let errorMessage = 'Transaction simulation failed'
        if ('error' in simulated) {
          errorMessage += `: ${simulated.error}`
        }
        if ('result' in simulated && simulated.result) {
          errorMessage += ` - ${JSON.stringify(simulated.result)}`
        }

        throw new Error(errorMessage)
      }

      console.log('[trancheHelpers] Simulation successful, preparing transaction...')

      // Prepare the transaction with simulation results
      transaction = rpc.assembleTransaction(transaction, simulated).build()

      return transaction
    } catch (error) {
      console.error('[trancheHelpers] Redeem error:', error)
      throw error
    }
  },

  // Get user's share in a tranche
  async getUserShare(
    userAddress: string,
    trancheType: TrancheType
  ): Promise<string> {
    try {
      const server = getSorobanServer()
      const contract = new Contract(TRANCHE_CONTRACT.address)
      const account = await server.getAccount(userAddress)

      const args = [
        nativeToScVal(userAddress, { type: 'address' }),
        trancheTypeToScVal(trancheType)
      ]

      const transaction = new TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(contract.call('get_user_share', ...args))
        .setTimeout(30)
        .build()

      const result = await server.simulateTransaction(transaction)

      if (rpc.Api.isSimulationSuccess(result)) {
        const share = scValToNative(result.result!.retval)
        return share.toString()
      }

      return '0'
    } catch (error) {
      console.error('Error getting user share:', error)
      return '0'
    }
  },

  // Get total amounts for both tranches
  async getTotals(): Promise<{ senior: string; junior: string }> {
    try {
      const server = getSorobanServer()
      const contract = new Contract(TRANCHE_CONTRACT.address)

      // For read-only operations, we can simulate without a real source account
      // Create a minimal AccountResponse for simulation
      const fakeSource = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

      const transaction = new TransactionBuilder(
        // Use a fake account object for simulation
        new Account(fakeSource, '0'),
        {
          fee: '100',
          networkPassphrase: Networks.TESTNET
        }
      )
        .addOperation(contract.call('get_totals'))
        .setTimeout(30)
        .build()

      const result = await server.simulateTransaction(transaction)

      if (rpc.Api.isSimulationSuccess(result)) {
        const totals = scValToNative(result.result!.retval)
        return {
          senior: totals[0]?.toString() || '0',
          junior: totals[1]?.toString() || '0'
        }
      }

      return { senior: '0', junior: '0' }
    } catch (error) {
      console.error('Error getting totals:', error)
      return { senior: '0', junior: '0' }
    }
  },

  // Get minimum investment amounts
  async getMinimums(): Promise<{ senior: string; junior: string }> {
    try {
      const server = getSorobanServer()
      const contract = new Contract(TRANCHE_CONTRACT.address)

      const fakeSource = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

      const transaction = new TransactionBuilder(
        new Account(fakeSource, '0'),
        {
          fee: '100',
          networkPassphrase: Networks.TESTNET
        }
      )
        .addOperation(contract.call('get_minimums'))
        .setTimeout(30)
        .build()

      const result = await server.simulateTransaction(transaction)

      if (rpc.Api.isSimulationSuccess(result)) {
        const minimums = scValToNative(result.result!.retval)
        return {
          senior: minimums[0]?.toString() || '0',
          junior: minimums[1]?.toString() || '0'
        }
      }

      return { senior: '0', junior: '0' }
    } catch (error) {
      console.error('Error getting minimums:', error)
      return { senior: '0', junior: '0' }
    }
  },

  // Check if contract is paused
  async isPaused(): Promise<boolean> {
    try {
      const server = getSorobanServer()
      const contract = new Contract(TRANCHE_CONTRACT.address)

      const fakeSource = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

      const transaction = new TransactionBuilder(
        new Account(fakeSource, '0'),
        {
          fee: '100',
          networkPassphrase: Networks.TESTNET
        }
      )
        .addOperation(contract.call('is_paused'))
        .setTimeout(30)
        .build()

      const result = await server.simulateTransaction(transaction)

      if (rpc.Api.isSimulationSuccess(result)) {
        return scValToNative(result.result!.retval) === true
      }

      return false
    } catch (error) {
      console.error('Error checking paused status:', error)
      return false
    }
  },

  // Admin function: Approve a pending subscription
  async approveSubscription(
    adminAddress: string,
    userAddress: string,
    trancheType: TrancheType,
    amount: bigint
  ) {
    try {
      console.log('[trancheHelpers] Approve subscription - admin:', adminAddress, 'user:', userAddress, 'tranche:', trancheType, 'amount:', amount.toString())

      const server = getSorobanServer()
      const contract = new Contract(TRANCHE_CONTRACT.address)
      const sourceAccount = await server.getAccount(adminAddress)

      const args = [
        nativeToScVal(userAddress, { type: 'address' }),
        trancheTypeToScVal(trancheType),
        nativeToScVal(amount, { type: 'i128' })
      ]

      let transaction = new TransactionBuilder(sourceAccount, {
        fee: '100000',
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(contract.call('approve_subscription', ...args))
        .setTimeout(30)
        .build()

      console.log('[trancheHelpers] Approval transaction built, simulating...')

      const simulated = await server.simulateTransaction(transaction)
      console.log('[trancheHelpers] Approval simulation response:', JSON.stringify(simulated, null, 2))

      if (!rpc.Api.isSimulationSuccess(simulated)) {
        console.error('[trancheHelpers] Approval simulation failed:', simulated)
        throw new Error('Approval simulation failed')
      }

      transaction = rpc.assembleTransaction(transaction, simulated).build()
      return transaction
    } catch (error) {
      console.error('[trancheHelpers] Approve subscription error:', error)
      throw error
    }
  }
}

// Helper to submit transaction after signing
export const submitSignedTransaction = async (signedXDR: string) => {
  const server = getSorobanServer()
  const transaction = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)

  try {
    const result = await server.sendTransaction(transaction as any)
    return result
  } catch (error) {
    console.error('Error submitting transaction:', error)
    throw error
  }
}

// Helper to format token amounts (7 decimals for Stellar tokens)
export const formatTokenAmount = (amount: string | bigint, decimals: number = 7): string => {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount
  const divisor = BigInt(10 ** decimals)
  const whole = amountBigInt / divisor
  const fraction = amountBigInt % divisor

  if (fraction === BigInt(0)) {
    return whole.toString()
  }

  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${whole}.${fractionStr}`
}

// Helper to parse token amounts to contract format
export const parseTokenAmount = (amount: string, decimals: number = 7): bigint => {
  const [whole, fraction = ''] = amount.split('.')
  const fractionPadded = fraction.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(fractionPadded)
}
