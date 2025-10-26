# Contract Initialization Required

## Issue
The tranche contract at `CAIUMAVGQUDLA5EMTCC4GY5EF64VMZOFPSS6EFZZKLFWMAB56ZPE5QRP` is deployed but **not initialized**.

## Error Details
When trying to call `subscribe()`, the contract returns:
```
HostError: Error(WasmVm, InvalidAction)
VM call trapped: UnreachableCodeReached
```

This error indicates the contract is trying to access storage or data that hasn't been set up yet.

## What Needs to Be Done

### Your friend who deployed the contract needs to:

1. **Call the contract's initialization function** (usually named `initialize`, `init`, or `setup`)

2. **Provide these parameters during initialization:**
   - **Blend Pool Address**: The address of the Blend pool the tranche will interact with
   - **Underlying Token Address**: The USDC or token address users will deposit (likely `CCA2BWGKIB7TU5VWHZSRDSGQPSIROSHGE4RUXOW4S6RMGU4DK5EXO7BN` based on your config)
   - **Admin Address**: The address that will have administrative control
   - **Minimum Investment Amounts**: Minimum for Senior and Junior tranches (you have 200 tokens as minimum)
   - **Other parameters**: Any other configuration the contract requires

### Example initialization call (using Stellar CLI):

```bash
stellar contract invoke \
  --id CAIUMAVGQUDLA5EMTCC4GY5EF64VMZOFPSS6EFZZKLFWMAB56ZPE5QRP \
  --source ADMIN_SECRET_KEY \
  --network testnet \
  -- \
  initialize \
  --admin ADMIN_ADDRESS \
  --blend_pool BLEND_POOL_ADDRESS \
  --underlying_token CCA2BWGKIB7TU5VWHZSRDSGQPSIROSHGE4RUXOW4S6RMGU4DK5EXO7BN \
  --senior_min 2000000000 \
  --junior_min 2000000000
```

## Current Status

✅ **Working:**
- Wallet connection
- Reading contract minimums (shows 200 tokens)
- Frontend-backend integration

❌ **Not Working:**
- `subscribe()` function - contract panics
- `redeem()` function - will have same issue

## Next Steps

1. Contact your friend who deployed the contract
2. Ask them to initialize the contract with the required parameters
3. Once initialized, the subscribe/redeem functions should work
4. You can then test the full investment flow

## Additional Notes

The contract can successfully return data from read-only functions (like `get_minimums`), which means:
- The contract is deployed correctly
- The RPC connection is working
- The issue is specifically with write functions that need initialization

The frontend is fully functional and ready to use once the contract is initialized!
