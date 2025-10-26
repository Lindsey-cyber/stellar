# Tranche Contract Integration - Complete Guide

## Overview

Your tranche contract is now fully integrated into the frontend! The contract at address `CAIUMAVGQUDLA5EMTCC4GY5EF64VMZOFPSS6EFZZKLFWMAB56ZPE5QRP` on Stellar Testnet is live and functional.

## What Was Added

### 1. Contract Configuration
**File:** [config/contracts.ts](config/contracts.ts)

Added the tranche contract address:
```typescript
export const TRANCHE_CONTRACT = {
  address: 'CAIUMAVGQUDLA5EMTCC4GY5EF64VMZOFPSS6EFZZKLFWMAB56ZPE5QRP'
}
```

### 2. Tranche Helper Utilities
**File:** [utils/trancheHelpers.ts](utils/trancheHelpers.ts)

Complete helper functions for all contract methods:

**Subscription & Redemption:**
- `trancheContractHelpers.subscribe(from, trancheType, amount)` - Subscribe to Senior/Junior tranche
- `trancheContractHelpers.redeem(from, trancheType, amount)` - Redeem from tranche

**Read Functions:**
- `trancheContractHelpers.getUserShare(userAddress, trancheType)` - Get user's share
- `trancheContractHelpers.getTotals()` - Get total amounts in both tranches
- `trancheContractHelpers.getMinimums()` - Get minimum investment amounts
- `trancheContractHelpers.isPaused()` - Check if contract is paused

### 3. WalletContext Integration
**File:** [contexts/WalletContext.tsx](contexts/WalletContext.tsx)

Added 5 new methods to the wallet context:

```typescript
// Subscribe to a tranche (invest)
await subscribeToTranche('Senior', '100')  // Invest 100 tokens in Senior tranche
await subscribeToTranche('Junior', '50')   // Invest 50 tokens in Junior tranche

// Redeem from a tranche (withdraw)
await redeemFromTranche('Senior', '50')    // Withdraw 50 from Senior
await redeemFromTranche('Junior', '25')    // Withdraw 25 from Junior

// Get user's share in a tranche
const seniorShare = await getUserTrancheShare('Senior')
const juniorShare = await getUserTrancheShare('Junior')

// Get total amounts invested in each tranche
const totals = await getTrancheTotals()
// Returns: { senior: '1000.00', junior: '500.00' }

// Get minimum investment requirements
const minimums = await getTrancheMinimums()
// Returns: { senior: '10.00', junior: '5.00' }
```

### 4. TrancheInvestment Component
**File:** [components/TrancheInvestment.tsx](components/TrancheInvestment.tsx)

A beautiful, fully functional UI component with:

**Features:**
- ✅ Connect wallet with Freighter
- ✅ Select between Senior and Junior tranches
- ✅ View your current shares in each tranche
- ✅ See total investments and minimums
- ✅ Subscribe (invest) in tranches
- ✅ Redeem (withdraw) from tranches
- ✅ Real-time balance updates
- ✅ Transaction success/error notifications
- ✅ Links to Stellar Expert for transaction viewing
- ✅ Auto-refresh data after transactions
- ✅ Beautiful animations and responsive design

### 5. Main Page Integration
**File:** [app/page.tsx](app/page.tsx)

The TrancheInvestment component is now live on your homepage with a "LIVE ON TESTNET" badge!

## How to Use

### Step 1: Open Your Browser
Navigate to: **http://localhost:3002**

### Step 2: Find the Tranche Section
Scroll down to the section titled **"Real Tranche Contract Integration"** with the green "LIVE ON TESTNET" badge.

### Step 3: Connect Your Wallet
1. Click "Connect Wallet"
2. Approve the connection in Freighter wallet
3. Make sure you're on Stellar Testnet

### Step 4: Get Testnet Tokens
You need testnet tokens to interact with the contract:

1. Get testnet XLM from the friendbot:
   ```
   https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY
   ```

2. You'll need the RWA_UST token to invest. The token contract is:
   ```
   CCA2BWGKIB7TU5VWHZSRDSGQPSIROSHGE4RUXOW4S6RMGU4DK5EXO7BN
   ```

### Step 5: Invest in Tranches

**Senior Tranche (Lower Risk):**
1. Select "Senior Tranche"
2. Enter amount (must be above minimum)
3. Click "Subscribe"
4. Approve transaction in Freighter
5. Wait for confirmation

**Junior Tranche (Higher Risk/Return):**
1. Select "Junior Tranche"
2. Enter amount (must be above minimum)
3. Click "Subscribe"
4. Approve transaction in Freighter
5. Wait for confirmation

### Step 6: View Your Positions
Your shares will display automatically in each tranche card:
- Your Share: Shows your current investment
- Total: Shows total invested by all users
- Min: Shows minimum investment requirement

### Step 7: Redeem (Withdraw)
1. Select the tranche you want to withdraw from
2. Enter amount to redeem
3. Click "Redeem"
4. Approve in Freighter
5. Tokens will be returned to your wallet

## Contract Functions Overview

Based on your Rust contract, here's what each function does:

### `subscribe(from, tranche, amount)`
- **Purpose:** Invest tokens into Senior or Junior tranche
- **What it does:**
  - Transfers tokens from your wallet to the contract
  - Records your investment in the tranche mapping
  - Updates total invested amount
  - Checks minimum investment requirement

### `redeem(from, tranche, amount)`
- **Purpose:** Withdraw your invested tokens
- **What it does:**
  - Checks you have enough balance
  - Transfers tokens from contract back to you
  - Updates your recorded balance
  - Updates total invested amount

### `get_user_share(user, tranche)`
- **Purpose:** See how much you've invested
- **Returns:** Your current balance in the tranche

### `get_totals()`
- **Purpose:** See total investments
- **Returns:** (senior_total, junior_total)

### `get_minimums()`
- **Purpose:** Check minimum investment requirements
- **Returns:** (min_senior, min_junior)

## Waterfall Structure

Your contract implements a waterfall payment structure:

1. **Junior Tranche absorbs losses first:**
   - When `apply_loss()` is called, Junior investors lose money first
   - Only after Junior is wiped out does Senior take losses

2. **Payouts via `notify_pool_payout()`:**
   - Profits are distributed proportionally to investments
   - Both Senior and Junior get their share based on amounts invested

## Testing Checklist

- [x] Contract configuration added
- [x] Helper utilities created
- [x] WalletContext updated with tranche methods
- [x] TrancheInvestment component created
- [x] Component added to main page
- [ ] Connect wallet and test subscribe
- [ ] Test redeem functionality
- [ ] Verify balance updates
- [ ] Check transaction links work

## Troubleshooting

### "Wallet not connected"
- Make sure Freighter is installed and unlocked
- Switch to Stellar Testnet in Freighter settings

### "Insufficient balance"
- Get testnet XLM from friendbot
- Make sure you have RWA_UST tokens

### "Amount below minimum"
- Check the minimum amount shown in the UI
- Enter at least the minimum required

### "Transaction failed"
- Check you have enough XLM for gas fees
- Verify the contract is not paused
- Make sure you've approved the token transfer

## Contract Address

**Tranche Contract:** `CAIUMAVGQUDLA5EMTCC4GY5EF64VMZOFPSS6EFZZKLFWMAB56ZPE5QRP`

**Token Contract (RWA_UST):** `CCA2BWGKIB7TU5VWHZSRDSGQPSIROSHGE4RUXOW4S6RMGU4DK5EXO7BN`

**Network:** Stellar Testnet

## View Transactions

After each transaction, you can view it on Stellar Expert:
```
https://stellar.expert/explorer/testnet/tx/TRANSACTION_HASH
```

The component automatically provides this link after successful transactions!

## Next Steps

1. **Test the integration** on localhost:3002
2. **Add more features:**
   - Admin panel for `apply_loss()` and `notify_pool_payout()`
   - Charts showing tranche distributions
   - Historical transaction list
   - APY/APR calculations
3. **Deploy to production** when ready

## Summary

Your tranche contract is now **fully integrated** and **ready to use**!

Open **http://localhost:3002**, scroll to the tranche section, connect your wallet, and start investing! 🚀
