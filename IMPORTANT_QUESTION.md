# Important Question About Contract Flow

## Current Error
When calling `subscribe()`, the contract returns:
```
HostError: Error(WasmVm, InvalidAction)
VM call trapped: UnreachableCodeReached
```

## Your Statement
You said: "once the user subscribes, it needs to be approved. So once the user submits the request, the admin approves that request."

## Questions

### 1. What is the exact contract function name the USER should call?
- Is it `subscribe`?
- Or is it something like `request_subscription` or `create_request`?

### 2. What is the exact contract function name the ADMIN should call to approve?
- Is it `approve_subscription`?
- Or is it something else like `process_request`, `approve`, `finalize_subscription`?

### 3. Does the subscribe function require ADMIN authorization?
- Meaning: Does the admin need to sign the user's subscribe transaction?
- Or does the user sign it themselves and then admin approves separately?

## What I Need

Please check your contract code and tell me:
1. The EXACT function names available on the contract
2. Which address needs to sign which transaction

OR

Share the contract source code (the actual Rust .rs file) so I can see the exact function signatures.

## Temporary Solution

For now, I've added an `approveSubscription` function to the helpers that assumes there's an `approve_subscription` function on the contract. But I need to know the correct function names to make this work properly.
