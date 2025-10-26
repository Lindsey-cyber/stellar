import {
  Contract,
  TransactionBuilder,
  Networks,
  xdr,
  scValToNative,
  nativeToScVal,
  rpc
} from '@stellar/stellar-sdk'

import { NETWORK_CONFIG, TOKEN_CONTRACTS, BLEND_CONTRACTS } from '@/config/contracts'

// Initialize Soroban RPC server
export const getSorobanServer = () => {
  if (!rpc || !rpc.Server) {
    console.error('[getSorobanServer] rpc not available:', rpc)
    throw new Error('rpc.Server is not available. Please check @stellar/stellar-sdk installation.')
  }
  return new rpc.Server(NETWORK_CONFIG.sorobanRpc)
}

// Helper to build contract invocation
export const buildContractInvocation = async (
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  sourceAccount: string
) => {
  const server = getSorobanServer()
  const account = await server.getAccount(sourceAccount)

  const contract = new Contract(contractId)

  const transaction = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  return transaction
}

// Token Contract Interactions
export const tokenHelpers = {
  // Get token balance
  async getBalance(tokenAddress: string, accountAddress: string): Promise<string> {
    try {
      const server = getSorobanServer()
      const contract = new Contract(tokenAddress)

      const account = await server.getAccount(accountAddress)

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(
          contract.call(
            'balance',
            nativeToScVal(accountAddress, { type: 'address' })
          )
        )
        .setTimeout(30)
        .build()

      const result = await server.simulateTransaction(transaction)

      if (rpc.Api.isSimulationSuccess(result)) {
        const balance = scValToNative(result.result!.retval)
        return balance.toString()
      }

      return '0'
    } catch (error) {
      console.error('Error getting token balance:', error)
      return '0'
    }
  },

  // Transfer tokens
  async transfer(
    tokenAddress: string,
    from: string,
    to: string,
    amount: bigint
  ) {
    const args = [
      nativeToScVal(from, { type: 'address' }),
      nativeToScVal(to, { type: 'address' }),
      nativeToScVal(amount, { type: 'i128' })
    ]

    return await buildContractInvocation(tokenAddress, 'transfer', args, from)
  },

  // Approve token spending
  async approve(
    tokenAddress: string,
    owner: string,
    spender: string,
    amount: bigint,
    expirationLedger: number
  ) {
    const args = [
      nativeToScVal(owner, { type: 'address' }),
      nativeToScVal(spender, { type: 'address' }),
      nativeToScVal(amount, { type: 'i128' }),
      nativeToScVal(expirationLedger, { type: 'u32' })
    ]

    return await buildContractInvocation(tokenAddress, 'approve', args, owner)
  }
}

// Blend Pool Interactions
export const blendPoolHelpers = {
  // Supply to pool
  async supply(
    poolAddress: string,
    from: string,
    tokenAddress: string,
    amount: bigint
  ) {
    const args = [
      nativeToScVal(from, { type: 'address' }),
      nativeToScVal(tokenAddress, { type: 'address' }),
      nativeToScVal(amount, { type: 'i128' })
    ]

    return await buildContractInvocation(poolAddress, 'supply', args, from)
  },

  // Withdraw from pool
  async withdraw(
    poolAddress: string,
    from: string,
    tokenAddress: string,
    amount: bigint
  ) {
    const args = [
      nativeToScVal(from, { type: 'address' }),
      nativeToScVal(tokenAddress, { type: 'address' }),
      nativeToScVal(amount, { type: 'i128' })
    ]

    return await buildContractInvocation(poolAddress, 'withdraw', args, from)
  },

  // Borrow from pool
  async borrow(
    poolAddress: string,
    from: string,
    tokenAddress: string,
    amount: bigint
  ) {
    const args = [
      nativeToScVal(from, { type: 'address' }),
      nativeToScVal(tokenAddress, { type: 'address' }),
      nativeToScVal(amount, { type: 'i128' })
    ]

    return await buildContractInvocation(poolAddress, 'borrow', args, from)
  },

  // Repay to pool
  async repay(
    poolAddress: string,
    from: string,
    tokenAddress: string,
    amount: bigint
  ) {
    const args = [
      nativeToScVal(from, { type: 'address' }),
      nativeToScVal(tokenAddress, { type: 'address' }),
      nativeToScVal(amount, { type: 'i128' })
    ]

    return await buildContractInvocation(poolAddress, 'repay', args, from)
  },

  // Get pool position
  async getPosition(poolAddress: string, userAddress: string) {
    try {
      const server = getSorobanServer()
      const contract = new Contract(poolAddress)

      const account = await server.getAccount(userAddress)

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(
          contract.call(
            'get_position',
            nativeToScVal(userAddress, { type: 'address' })
          )
        )
        .setTimeout(30)
        .build()

      const result = await server.simulateTransaction(transaction)

      if (rpc.Api.isSimulationSuccess(result)) {
        return scValToNative(result.result!.retval)
      }

      return null
    } catch (error) {
      console.error('Error getting pool position:', error)
      return null
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

// Helper to format token amounts (assuming 7 decimals like most Stellar tokens)
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
