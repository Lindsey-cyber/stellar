# 🐛 Contract Bug Report

## Issue
The deployed tranche contract at `CAIUMAVGQUDLA5EMTCC4GY5EF64VMZOFPSS6EFZZKLFWMAB56ZPE5QRP` is **panicking** on both `initialize` and `subscribe` function calls.

## Error Details

### Initialize Error
```
HostError: Error(WasmVm, InvalidAction)
VM call trapped: UnreachableCodeReached
```

**Function Call:**
```
initialize(
  admin: SC566PQX2UK4X7JXEF7UU7PE5IYCDGPE6C6VQH26RHLYNFKEEAWGSHHV,
  token: CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA,
  pool: CD24SABPPEFJHQ4D5UEVAV52SUYHDERKKBNWX2PUGVPSJ6NCOEJVBLTQ,
  min_senior: 20000000,
  min_junior: 10000000
)
```

### Subscribe Error
```
HostError: Error(WasmVm, InvalidAction)
VM call trapped: UnreachableCodeReached
```

**Function Call:**
```
subscribe(
  from: GCBMVBCJSIXUUNJ6IZL5C2EM3EJA5VUBNRORIA3QMJT6Y4PRW4P32S6N,
  tranche: Senior,
  amount: 200000000
)
```

## What "UnreachableCodeReached" Means

In Soroban contracts, this error occurs when:

1. **`.unwrap()` on None** - Code tries to unwrap an Option that is None
   ```rust
   let value = some_option.unwrap(); // Panics if None
   ```

2. **`.expect()` failure** - Similar to unwrap with a custom message
   ```rust
   let value = some_option.expect("Should have value"); // Panics if None
   ```

3. **Panic macros**
   ```rust
   panic!("Something went wrong");
   unreachable!();
   ```

4. **Failed assertions**
   ```rust
   assert!(condition, "Condition failed");
   ```

5. **Calling non-existent contracts** - If the contract tries to call the token or pool contract and they don't exist

## Possible Causes

### 1. Missing Contract Dependencies
The token contract (`CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`) or pool contract (`CD24SABPPEFJHQ4D5UEVAV52SUYHDERKKBNWX2PUGVPSJ6NCOEJVBLTQ`) might not exist on testnet.

**How to check:**
```bash
stellar contract invoke \
  --id CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA \
  --network testnet \
  -- --help

stellar contract invoke \
  --id CD24SABPPEFJHQ4D5UEVAV52SUYHDERKKBNWX2PUGVPSJ6NCOEJVBLTQ \
  --network testnet \
  -- --help
```

If these commands fail, the contracts don't exist.

### 2. Contract Storage Issues
The contract might be trying to read from storage that hasn't been initialized.

**Common pattern in initialize:**
```rust
// BAD - This panics if key doesn't exist
let existing = env.storage().get(&DataKey::Admin).unwrap();

// GOOD - Check first
if env.storage().has(&DataKey::Admin) {
    // Handle already initialized
}
```

### 3. Wrong Contract Interface
The token or pool contracts might not implement the expected interface (e.g., missing `transfer`, `balance`, etc.)

### 4. Authorization Issues
The contract might use `require_auth!` incorrectly or expect auth from a different address.

## What to Check in Your Code

### In the `initialize` function:
1. Are you trying to call methods on the token contract immediately?
2. Are you using `.unwrap()` anywhere?
3. Do you check if the contract is already initialized?
4. Are you storing values correctly?

### In the `subscribe` function:
1. Do you check if the contract is initialized first?
2. Are you trying to transfer tokens without proper approval?
3. Do you use `.unwrap()` when getting storage values?

## Recommended Fixes

### 1. Add Proper Error Handling
```rust
// Instead of:
let admin = env.storage().get(&DataKey::Admin).unwrap();

// Use:
let admin = env.storage()
    .get(&DataKey::Admin)
    .ok_or(Error::NotInitialized)?;
```

### 2. Check Initialization State
```rust
pub fn initialize(env: Env, admin: Address, token: Address, pool: Address, min_senior: i128, min_junior: i128) {
    // Check if already initialized
    if env.storage().instance().has(&DataKey::Admin) {
        panic_with_error!(&env, Error::AlreadyInitialized);
    }

    // Store values
    env.storage().instance().set(&DataKey::Admin, &admin);
    env.storage().instance().set(&DataKey::TokenContract, &token);
    env.storage().instance().set(&DataKey::PoolContract, &pool);
    // ... etc
}
```

### 3. Validate Contract Addresses
Before storing contract addresses, verify they exist by trying to call a simple method on them.

### 4. Use Proper Error Types
Define and use custom error types instead of panicking:
```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    InvalidContract = 3,
}
```

## Next Steps

1. **Review the contract source code** - Look for `.unwrap()`, `panic!`, `unreachable!`
2. **Add logging** - Use `log!` macro to see where it fails
3. **Test locally** - Use `cargo test` with the Soroban test framework
4. **Deploy a fixed version** or provide us with working contract addresses

## Frontend Status

✅ **The frontend is fully functional and ready to use!**
- Wallet connection works
- All contract integration is complete
- Transaction building and signing works
- Just waiting for a working contract

Once you fix and redeploy the contract (or provide a working contract address), everything will work immediately! 🚀

---

**Current Contract Address:**
`CAIUMAVGQUDLA5EMTCC4GY5EF64VMZOFPSS6EFZZKLFWMAB56ZPE5QRP`

**Network:** Stellar Testnet
