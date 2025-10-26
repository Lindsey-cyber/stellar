# Wallet Connection Test Instructions

## Step 1: Open Your Browser

Go to: **http://localhost:3000**

## Step 2: Open Browser Console

Press **F12** (or Cmd+Option+I on Mac)
Click on the **Console** tab

## Step 3: Look for the Debug Panel

You should see a small panel in the bottom-right corner that says:
```
Wallet Debug:
✅ Freighter detected
✅ Freighter API imported
```

OR it might say:
```
Wallet Debug:
❌ Freighter NOT detected
```

## Step 4: Check Console Output

Look in the console for messages starting with `[Debug]` or `[Wallet]`

## What To Tell Me:

1. **What does the debug panel say?**
   - Does it say "Freighter detected" or "Freighter NOT detected"?

2. **Do you have Freighter installed?**
   - Go to your browser extensions
   - Look for "Freighter"
   - Is it there? Is it enabled?

3. **What error message do you see?**
   - In the Tranche Investment section, when you click "Connect Wallet"
   - What exact error message appears?
   - Copy the EXACT text

4. **What's in the console?**
   - Any red error messages?
   - Any `[Wallet]` or `[Debug]` messages?
   - Copy them here

## Quick Freighter Check:

If you DON'T have Freighter installed:
1. Install it from: https://www.freighter.app/
2. Create/import a wallet
3. **IMPORTANT**: Switch to **TESTNET** in Freighter settings
4. Refresh the page

If you DO have Freighter:
1. Click the Freighter icon
2. Make sure it's unlocked (enter password)
3. Go to Settings → Network
4. Make sure it says "TESTNET" (not MAINNET or FUTURENET)
5. Refresh http://localhost:3000

## Then Try Again:

1. Scroll to "Real Tranche Contract Integration"
2. Click "Connect Wallet"
3. Tell me EXACTLY what happens:
   - Does a Freighter popup appear?
   - What error message do you see?
   - What's in the console?

## Most Common Issues:

❌ **"Freighter wallet not detected"** = Freighter not installed
❌ **"Failed to connect"** = Freighter is locked (need to unlock it)
❌ **Popup blocked** = Browser is blocking the Freighter popup
❌ **Wrong network** = Freighter is on MAINNET instead of TESTNET

Please check all these and tell me what you see!
