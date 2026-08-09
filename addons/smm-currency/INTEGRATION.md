# SMM Currency Integration Guide

## Purpose

Use this guide when a behavior pack needs to read or change balances through
SMM Currency. The stable version 1 protocol uses Bedrock Script API events, so
consumer packs do not import SMM Currency code or read its dynamic properties.

The contract registry in [Mod Contracts](../../docs/mod-contracts.md) remains
the authoritative compatibility record. This guide explains how to implement a
consumer safely.

## Prerequisites

- Deploy and activate the SMM Currency behavior pack before a consumer pack.
- Target Minecraft Bedrock `1.26.30` or later with stable
  `@minecraft/server` `2.8.0`.
- Choose a lowercase, caller-owned response event ID. Its namespace must not
  be `smm-currency`.
- Enforce authorization in the consumer before sending a request. Currency
  accepts requests from trusted callers; it does not decide who may mutate a
  wallet.

Use the following request event exactly:

```text
smm-currency:request-v1
```

Pre-rename request identifiers remain accepted for compatibility, but consumer
packs should publish and target `smm-currency:*` identifiers.

## Request and Response Flow

1. Subscribe to the consumer-owned response event during script startup.
2. Construct a JSON request with a unique `requestId` for the caller.
3. Send it with `system.sendScriptEvent`.
4. Match normal asynchronous responses by `requestId`.
5. Treat `ok: false` as a handled protocol failure, not as a successful
   mutation.

The currency add-on sends each response to the `responseEvent` supplied in the
request. A request with malformed JSON or no valid `responseEvent` cannot
receive a response; inspect the server script log in those cases. Early
validation responses do not include `operation`, and include `requestId` only
when the supplied ID was valid.

## Consumer Example

The following behavior-pack script deposits a reward into a player wallet.
Replace `shops` with the consumer add-on's owned namespace and ensure
`requestId` is unique for each logical mutation.

```javascript
import { system } from "@minecraft/server";

const REQUEST_EVENT = "smm-currency:request-v1";
const RESPONSE_EVENT = "shops:currency-response";

function createRequestId() {
  return `r-${Date.now().toString(36)}-${Math.floor(Math.random() * 0x1000000).toString(36)}`;
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id !== RESPONSE_EVENT) {
    return;
  }

  let response;
  try {
    response = JSON.parse(event.message);
  } catch (error) {
    console.warn(`[shops] Received invalid currency response: ${error}`);
    return;
  }

  if (!response.ok) {
    console.warn(
      `[shops] Currency ${response.operation} ${response.requestId} failed: ${response.code}`
    );
    return;
  }

  console.warn(
    `[shops] Deposited ${response.transaction.amount}${response.currency} into ${response.transaction.to}.`
  );
});

export function rewardPlayer(playerId) {
  const request = {
    version: 1,
    operation: "deposit",
    requestId: createRequestId(),
    callerId: "shops",
    responseEvent: RESPONSE_EVENT,
    address: `player:${playerId}`,
    amount: 12,
    memo: "Shop reward"
  };

  system.sendScriptEvent(REQUEST_EVENT, JSON.stringify(request));
}
```

The response event is asynchronous. Do not assume a balance mutation is
complete until the matching response has `ok: true`. Store the originating
action by `requestId` if the consumer must update player state or UI after the
response arrives.

## Request Schema

Every request contains these fields:

| Field | Type and constraints | Purpose |
| --- | --- | --- |
| `version` | Number, exactly `1` | Selects the stable protocol version. |
| `operation` | `balance`, `history`, `deposit`, `withdraw`, or `transfer` | Chooses the requested action. |
| `requestId` | 1-48 characters matching `^[a-zA-Z0-9][a-zA-Z0-9_-]*$` | Correlates the response and defines mutation idempotency with `callerId`. |
| `callerId` | 1-32 lowercase characters matching `^[a-z0-9][a-z0-9_-]*$` | Identifies the consumer add-on. |
| `responseEvent` | Caller-owned namespaced event ID | Receives the JSON response. |

Wallet addresses are `{entity}:{identifier}` or
`{entity}:{identifier}:{subwallet}`. Each segment is 1-24 lowercase letters,
digits, hyphens, or underscores. For example: `player:dave` and
`clan:mtrs:master`.

Mutation amounts must be positive safe integers in whole emerald units. The
currency symbol in successful responses is `e`. `memo` is optional for
mutations and, when present, must be a string of at most 64 characters.

### Balance

```json
{
  "version": 1,
  "operation": "balance",
  "requestId": "balance-dave-001",
  "callerId": "shops",
  "responseEvent": "shops:currency-response",
  "address": "player:dave"
}
```

A successful response includes `address`, `balance`, and `currency`. Unknown
wallets have a balance of zero.

### History

```json
{
  "version": 1,
  "operation": "history",
  "requestId": "history-dave-001",
  "callerId": "shops",
  "responseEvent": "shops:currency-response",
  "address": "player:dave",
  "limit": 5
}
```

`limit` is optional and ranges from 1 through 5; the default is 5. Use the
optional numeric `nextCursor` returned by a successful response as `cursor` in
the next request. Records are newest first and include `sequence`,
`transactionId`, `callerId`, `type`, `amount`, `from`, `to`, `memo`, and
`timestamp`.

### Deposit and Withdraw

Both operations use `address` and `amount`:

```json
{
  "version": 1,
  "operation": "withdraw",
  "requestId": "purchase-dave-001",
  "callerId": "shops",
  "responseEvent": "shops:currency-response",
  "address": "player:dave",
  "amount": 12,
  "memo": "Shop purchase"
}
```

A deposit creates its target wallet when needed. A withdrawal from an unknown
or underfunded wallet returns `insufficient_funds`.

### Transfer

Transfers use distinct `from` and `to` addresses:

```json
{
  "version": 1,
  "operation": "transfer",
  "requestId": "payout-dave-001",
  "callerId": "shops",
  "responseEvent": "shops:currency-response",
  "from": "clan:mtrs:master",
  "to": "player:dave",
  "amount": 25,
  "memo": "Tournament payout"
}
```

## Response Handling

Responses for requests that pass initial validation contain `version`,
`requestId`, `operation`, `ok`, and `code`.

An early validation response contains `version`, `ok: false`, and `code`. It
includes `requestId` only when that field was validly parsed, and never includes
`operation`. Handle these responses as request-construction failures rather
than matching them to a pending operation.

| Response | Additional fields |
| --- | --- |
| Successful `balance` | `address`, `balance`, `currency` |
| Successful `history` | `address`, `currency`, `records`, optional `nextCursor` |
| Successful mutation | `transaction`, `currency`, plus `fromBalance` and/or `toBalance` |
| Rejected mutation due to insufficient funds | `address`, `balance`, `currency` |

`transaction` contains the immutable record described in the history section.
Consumers should use returned balances rather than recomputing them locally.

## Failure and Retry Rules

Handle these result codes explicitly:

| Code | Consumer action |
| --- | --- |
| `success` | Complete the pending action. |
| `malformed_request`, `unsupported_version`, `invalid_response_event`, `invalid_request_id`, `invalid_caller_id`, `invalid_operation`, `invalid_address`, `invalid_transfer_address`, `invalid_amount`, `invalid_memo`, `invalid_limit`, `invalid_cursor` | Correct the consumer request; do not retry unchanged. |
| `insufficient_funds` | Inform the authorized caller or player; do not retry unchanged. |
| `balance_limit` | Reject the credit; do not retry unchanged. |
| `storage_error` | Keep the same `callerId` and `requestId` for a later retry, then surface an operational failure if it persists. |

For `deposit`, `withdraw`, and `transfer`, the `(callerId, requestId)` pair is
idempotent for the 10,000 most recent mutation outcomes. Retrying a request
with the same pair returns its stored outcome instead of applying another
mutation. Do not reuse a request ID for a different logical operation.

The ledger retains the 10,000 newest successful transactions globally and
prunes older history. Consumers that need durable business records must retain
their own records after receiving a successful response.

## Operational Diagnostics

Restart the world or server after installing or updating SMM Currency; `/reload`
does not load a changed Script API manifest. On an integration failure, inspect
the Bedrock Content Log and script output for the request ID and
`[smm-currency]` messages. Verify that both packs are active, the request
uses `smm-currency:request-v1`, and the response event ID is owned by and
subscribed to by the consumer.
