# SorobanRpc Server Error - FIXED!

## The Problem
You were getting: **"Cannot read properties of undefined (reading 'Server')"**

This happened because `SorobanRpc` wasn't being imported correctly from `@stellar/stellar-sdk`.

## The Fix

Changed the imports in both helper files:

### Before (Broken):
```typescript
import {
  Contract,
  SorobanRpc,
  // ...
} from '@stellar/stellar-sdk'
```

### After (Fixed):
```typescript
import * as StellarSdk from '@stellar/stellar-sdk'

const {
  Contract,
  SorobanRpc,
  // ...
} = StellarSdk
```

## Files Fixed:
1. ✅ [utils/trancheHelpers.ts](utils/trancheHelpers.ts)
2. ✅ [utils/contractHelpers.ts](utils/contractHelpers.ts)
3. ✅ Added debug logging to TrancheInvestment component

## How to Test Now:

### Step 1: Refresh the Page
Go to **http://localhost:3000** and do a hard refresh:
- **Windows/Linux**: Ctrl + Shift + R
- **Mac**: Cmd + Shift + R

### Step 2: Open Console
Press F12 and go to Console tab

### Step 3: Connect Your Wallet
1. Scroll to "Real Tranche Contract Integration"
2. Click "Connect Wallet"
3. You should see in console:
   ```
   [Wallet] Requesting access...
   [Wallet] Successfully connected: GXXX...
   ```

### Step 4: Watch Data Load
After connecting, you should see:
```
[TrancheInvestment] Loading data...
[TrancheInvestment] Data loaded: { senior: "0", junior: "0", ... }
```

This means the contract reads are working!

### Step 5: Try Subscribe
1. Select "Senior Tranche" or "Junior Tranche"
2. Enter amount: `10000.04` (or any amount)
3. Click "Subscribe"
4. Watch console:
   ```
   [TrancheInvestment] Subscribing to: Senior Amount: 10000.04
   ```
5. Freighter popup should appear
6. Sign the transaction
7. You should see:
   ```
   [TrancheInvestment] Subscribe success, hash: XXX...
   ```

### Step 6: Check Transaction
If successful, you'll see:
- Transaction hash displayed with green checkmark
- Link to view on Stellar Expert
- Your shares update automatically

## What You'll See in Console:

**Good (Working):**
```
[TrancheInvestment] Loading data...
[TrancheInvestment] Data loaded: { senior: "0", junior: "0", totalsData: {...}, minimumsData: {...} }
[TrancheInvestment] Subscribing to: Senior Amount: 10000.04
[Wallet] freighter sign -> { signedTxXdr: "..." }
[TrancheInvestment] Subscribe success, hash: abc123...
```

**Bad (Still Broken):**
```
[TrancheInvestment] Loading data...
[TrancheInvestment] Failed to load data: Cannot read properties of undefined...
```

If you still see the "undefined" error, tell me and I'll debug further!

## Common Issues:

### Issue 1: "Not connected"
**Solution:** Make sure you connected your wallet first!

### Issue 2: "Amount must > 0"
**Solution:** The contract requires amount > 0. Make sure you entered a number.

### Issue 3: "Amount below minimum"
**Solution:** Check the "Min" value for your selected tranche and enter at least that amount.

### Issue 4: Transaction fails
**Possible reasons:**
- Insufficient token balance (need RWA_UST tokens)
- Insufficient XLM for gas fees
- Contract is paused
- Wrong network (must be on testnet)

## Next: Getting Test Tokens

To actually test subscribe/redeem, you need:

1. **Testnet XLM** (for gas fees)
   - Get from: https://friendbot.stellar.org/?addr=YOUR_ADDRESS

2. **RWA_UST tokens** (to invest)
   - Token contract: `CCA2BWGKIB7TU5VWHZSRDSGQPSIROSHGE4RUXOW4S6RMGU4DK5EXO7BN`
   - You might need to ask your friend who deployed the contract to send you some test tokens

## Test NOW!

1. Refresh http://localhost:3000
2. Open console
3. Connect wallet
4. Watch the console logs
5. Try to subscribe

Tell me what you see in the console!
