# Wallet Connection Fix - Quick Guide

## What I Fixed

1. ✅ **Fixed `connect()` function** - Properly handles Freighter API responses
2. ✅ **Fixed `getAccountBalance()`** - Now accepts address parameter for immediate balance fetch
3. ✅ **Added Freighter detection** - Shows helpful error if Freighter not installed
4. ✅ **Added DEBUG mode** - Created `.env.local` with debug logging enabled
5. ✅ **Better error messages** - Clear explanations for each error type

## How to Test the Fix

### Step 1: Restart Your Dev Server
The `.env.local` file needs to be loaded, so restart Next.js:

```bash
# Stop the current server (Ctrl+C in the terminal running it)
# Or kill it:
pkill -f next-server

# Then start it again:
npm run dev
```

### Step 2: Open Browser Console
1. Open http://localhost:3002 (or 3003)
2. Press **F12** or **Cmd+Option+I** to open DevTools
3. Go to the **Console** tab

### Step 3: Try Connecting
1. Scroll to the Tranche Investment section
2. Click "Connect Wallet"
3. Watch the console for debug logs like:
   ```
   [Wallet] Requesting access...
   [Wallet] requestAccess response: {...}
   [Wallet] getAddress response: {...}
   [Wallet] Successfully connected: GXXX...
   ```

## Common Issues & Solutions

### Issue 1: "Freighter wallet not detected"
**Solution:**
- Install Freighter: https://www.freighter.app/
- Make sure it's enabled in your browser extensions
- Refresh the page after installing

### Issue 2: "Failed to connect to Freighter. Make sure Freighter is unlocked"
**Solution:**
- Click the Freighter extension icon
- Enter your password to unlock it
- Try connecting again

### Issue 3: Connection works but no balance shows
**Solution:**
- Make sure you're on **Stellar Testnet** (check Freighter settings)
- Get testnet XLM: https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY
- Click "Refresh Data" button

### Issue 4: Console shows errors
**What to check:**
1. Look for the error message in console
2. Check if Freighter popup appeared (might be blocked)
3. Make sure you approved the connection request
4. Try refreshing the page and connecting again

## Debug Logs Explained

When DEBUG mode is on, you'll see these logs:

```javascript
// 1. Connection attempt starts
[Wallet] Requesting access...

// 2. Freighter responds (should have no error)
[Wallet] requestAccess response: { error: null }

// 3. Gets your address (should have address field)
[Wallet] getAddress response: {
  error: null,
  address: "GXXX..."
}

// 4. Success!
[Wallet] Successfully connected: GXXX...
```

If you see an error at any step, that tells us exactly where it failed!

## Quick Test Checklist

- [ ] Freighter extension installed
- [ ] Freighter unlocked (green icon)
- [ ] On Stellar Testnet network
- [ ] Dev server restarted (to load .env.local)
- [ ] Browser console open
- [ ] Can see debug logs
- [ ] Connect button clicked
- [ ] Freighter popup appeared
- [ ] Approved connection
- [ ] See success message

## Still Not Working?

If it's still not working after the steps above:

1. **Check the exact error message** in the console
2. **Take a screenshot** of the console errors
3. **Check Freighter's network** - click the Freighter icon, go to Settings → Network, make sure it says "TESTNET"
4. **Try a different browser** - Sometimes browser extensions conflict
5. **Clear cache** - Hard refresh with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## What the Code Does Now

**Before (broken):**
```typescript
const resp = await requestAccess()
// ❌ Wrong: casting response incorrectly
setPublicKey((resp as any).address || null)
```

**After (fixed):**
```typescript
const resp = await requestAccess()
// ✅ Check for errors
if (resp.error) throw new Error(...)

// ✅ Get address separately
const addressResp = await getAddress()
if (addressResp.error) throw new Error(...)

// ✅ Set the address
setPublicKey(addressResp.address)
```

## Next Steps After Connection Works

Once connected, you should see:
- Your wallet address displayed
- Your XLM balance
- Ability to click "Subscribe" or "Redeem"
- Tranche shares showing

Then you can test the actual contract interactions!
