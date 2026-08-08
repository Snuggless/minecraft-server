# Snugg Currency

## Purpose

Snugg Currency is the server's core currency ledger. It stores balances in
whole emerald units (`e`) and exposes a versioned Script API event contract for
other add-ons to query balances and record deposits, withdrawals, and
transfers. It does not add, remove, or otherwise affect in-game items.

## Compatibility

| Item | Value |
| --- | --- |
| Namespace | `snugg-currency` |
| Minecraft Bedrock target | `1.26.30` or later |
| Release channel | Stable |
| Behavior pack | `addons/snugg-currency/behavior_pack` |
| Resource pack | Not required |

The behavior pack depends on stable `@minecraft/server` `2.8.0`.

## Pack Relationship

This add-on contains one behavior pack and no resource pack. The ledger has no
client assets, gameplay definitions, or resource references.

## Installation and Deployment

1. Deploy `behavior_pack` to the Bedrock server's behavior-pack location.
2. Activate **Snugg Currency** for the server world before add-ons that use
   its public event contract.
3. Restart the world or server after installing or updating the behavior pack.
   `/reload` is not sufficient for a new or changed Script API manifest.

## Configuration and Operations

There is no operator configuration. Balances begin at zero. A deposit creates
the addressed wallet; a withdrawal or transfer from an unknown wallet fails as
an insufficient-funds request.

Wallets use `{entity}:{identifier}` or
`{entity}:{identifier}:{subwallet}`. Each segment is 1-24 lowercase letters,
digits, hyphens, or underscores. Examples include `player:dave` and
`clan:mtrs:master`.

The ledger accepts only positive, whole emerald amounts. It does not determine
whether a caller may access a wallet; consuming add-ons must enforce their own
authorization before sending a request. Server operators should also limit
access to `/scriptevent`, because the protocol intentionally trusts callers.

The ledger retains the 10,000 newest successful transactions globally and
prunes the oldest record when that limit is exceeded. It retains the 10,000
newest mutation outcomes for idempotent retries; older request IDs may be
processed as new requests.

## Public Contracts

The version 1 `snugg-currency:ledger` event contract is registered in
[mod-contracts.md](../../docs/mod-contracts.md). Consumers send JSON requests
to `snugg-currency:request-v1` and specify a caller-owned response event ID.

## Validation and Diagnostics

Validate the behavior-pack manifest and JavaScript before deployment. After a
world restart, inspect the Bedrock Content Log and script output for
`snugg-currency` manifest, module, or storage errors. A successful request
returns a JSON response on the caller-supplied event; malformed requests and
storage failures produce an explicit result code where a valid response event
was supplied.
