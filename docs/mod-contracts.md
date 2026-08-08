# Mod Contracts

## Purpose

This document is the registry of supported public interfaces between add-ons.
Dynamic properties, scoreboard objectives, Script API events, and commands are
private unless they appear here.

## Contract Registration Rules

- Register a contract before a consuming add-on depends on it.
- Give every contract an owner, a namespaced identifier, and a compatibility
  version.
- State the producer and each known consumer.
- Define payloads, lifecycle, permissions, and failure behavior.
- Record a migration path before changing or removing a contract.
- Keep implementation details and private state out of this registry.

## Registered Contracts

### `snugg-currency:ledger`

| Field | Value |
| --- | --- |
| Owner | `smm-currency` |
| Consumers | Any compatible add-on that needs server currency balances or ledger mutations; known consumer: `smm-mob-rewards` |
| Version | `1` |
| Kind | event |
| Identifier | `snugg-currency:request-v1` |
| Lifecycle | Available while the SMM Currency behavior pack is active. Balances and bounded ledger state persist with the world. |
| Permissions | The caller is responsible for wallet authorization. Operators must restrict `/scriptevent` access to trusted callers. |
| Failure behavior | The service returns a response with `ok: false` and a machine-readable `code`; it does not mutate balances for rejected requests. |

Consumers send a JSON object to `snugg-currency:request-v1`:

```json
{
  "version": 1,
  "operation": "deposit",
  "requestId": "unique-request-001",
  "callerId": "shops",
  "responseEvent": "shops:currency-response",
  "address": "player:dave",
  "amount": 12,
  "memo": "Starter reward"
}
```

`operation` is one of `balance`, `history`, `deposit`, `withdraw`, or
`transfer`. Mutations require a positive safe integer `amount`; `deposit` and
`withdraw` use `address`, while `transfer` uses `from` and `to`. A wallet is
`{entity}:{identifier}` or `{entity}:{identifier}:{subwallet}`. Each segment
contains 1-24 lowercase letters, digits, hyphens, or underscores.

Every request requires a 1-48 character `requestId`, a 1-32 character
lowercase `callerId`, and a caller-owned namespaced `responseEvent`.
`requestId` is idempotent within `callerId` for the most recent 10,000
mutation outcomes. The response event receives:

```json
{
  "version": 1,
  "requestId": "unique-request-001",
  "operation": "deposit",
  "ok": true,
  "code": "success"
}
```

Successful mutation responses include `transaction`, `currency: "e"`, and the
affected `fromBalance` and/or `toBalance`. `balance` responses include
`address`, `balance`, and `currency`. `history` accepts optional `cursor` and
`limit` (1-5), returns newest-first matching records, and supplies
`nextCursor` when another page is available.

Result codes are `success`, `malformed_request`, `unsupported_version`,
`invalid_response_event`, `invalid_request_id`, `invalid_caller_id`,
`invalid_operation`, `invalid_address`, `invalid_transfer_address`,
`invalid_amount`, `invalid_memo`, `invalid_limit`, `invalid_cursor`,
`insufficient_funds`, `balance_limit`, and `storage_error`.

The ledger records the 10,000 newest successful transactions globally, pruning
the oldest record first. It makes no in-game item, entity, or permission
changes.

### Migration

Version 1 is stable for all documented fields and result codes. Future
incompatible protocol changes must use a new request event identifier and
retain version 1 during a documented migration period.

The owning add-on was renamed from `snugg-currency` to `smm-currency`. The
`snugg-currency:*` identifiers remain supported to preserve existing world
ledger data and consumers; this ownership rename does not change the protocol.

### `server-command:chat-routing`

| Field | Value |
| --- | --- |
| Owner | Server command interface |
| Consumers | Add-ons that expose or intentionally consume public chat commands |
| Version | `1` |
| Kind | command |
| Identifier | `server-command:chat-routing` |
| Lifecycle | The routing grammar is evaluated before dispatch. An add-on command exists while its owner documents and supports it. |
| Permissions | The dispatcher and owning add-on enforce the permissions documented for the invoked command. |
| Failure behavior | Reject malformed input and unknown aliases or commands without forwarding them to an add-on. |

The public command grammar is
`{prefix}srv:{mod-alias}:{command} [arguments...]`, defined in
[chat-commands.md](chat-commands.md). The `srv` segment is fixed; each
lowercase kebab-case alias belongs to one add-on. The shared `help` command
provides discovery at `{prefix}srv:{mod-alias}:help`.

### Migration

Keep version 1 compatible while add-ons adopt the guidance. Introduce a new
version and document a migration period before changing the routing grammar,
the fixed `srv` segment, or alias ownership rules.

## Contract Template

Copy this section when registering a public interface.

```markdown
### `<owner>:<contract-name>`

| Field | Value |
| --- | --- |
| Owner | `smm-<feature-name>` |
| Consumers | `smm-<feature-name>` |
| Version | `1` |
| Kind | `event`, `dynamic property`, `scoreboard objective`, or `command` |
| Identifier | `<owner>:<contract-name>` |
| Lifecycle | When it is created, updated, and removed |
| Permissions | Who can read, write, or invoke it |
| Failure behavior | What consumers must do when it is absent or invalid |

Describe the contract payload, constraints, and compatibility guarantees here.

### Migration

Describe the deprecation period, replacement, and removal version here.
```
