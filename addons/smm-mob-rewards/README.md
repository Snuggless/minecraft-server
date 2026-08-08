# SMM Mob Rewards

## Purpose

SMM Mob Rewards awards emerald currency to players who kill always-hostile
Minecraft mobs. It owns the reward policy and sends deposits to the existing
SMM Currency ledger; it does not store balances or add client assets.

## Compatibility

| Item | Value |
| --- | --- |
| Namespace | `smm-mob-rewards` |
| Minecraft Bedrock target | `1.26.30` or later |
| Release channel | Stable |
| Behavior pack | `addons/smm-mob-rewards/behavior_pack` |
| Resource pack | Not required |

The behavior pack depends on stable `@minecraft/server` `2.8.0` and on SMM
Currency version `1.0.0`.

## Pack Relationship

This add-on contains one behavior pack and no resource pack because it has no
client assets. Its manifest requires the SMM Currency behavior pack, whose
public Script Event ledger contract it uses. It sends deposits to
`snugg-currency:request-v1` and receives asynchronous results on its
caller-owned `smm-mob-rewards:currency-response-v1` event.

## Installation and Deployment

1. Deploy and activate `addons/smm-currency/behavior_pack` for the server
   world.
2. Deploy and activate `addons/smm-mob-rewards/behavior_pack` for the same
   world.
3. Restart the world or server after installing or changing either behavior
   pack. `/reload` is not sufficient for a new or changed Script API manifest.

## Configuration and Operations

Configure whole-emerald rewards in
`behavior_pack/scripts/main.js` by changing `REWARD_AMOUNTS`. Each key is an
always-hostile vanilla entity identifier and each value must be a positive
safe integer. Entities absent from the table earn no reward.

Rewards apply only when the killing damage source is a player or a projectile
owned by a player. The allowlist intentionally excludes neutral,
player-provoked, and conditionally hostile mobs, including endermen, piglins,
spiders, wolves, and wardens. Deposits target the SMM Currency wallet
`player:{playername}`, where the player name is normalized to lowercase.
A player name that cannot satisfy SMM Currency's lowercase 1-24 character
wallet-segment rules is skipped and logged as a warning. Invalid reward values
are skipped and reported as script errors during pack startup.

## Public Contracts

None. This add-on exposes no public cross-mod contracts. It consumes the
version 1 `snugg-currency:ledger` contract registered in
[mod-contracts.md](../../docs/mod-contracts.md). Implementation requirements
for the currency request, response, idempotency, and error handling are in the
[SMM Currency Integration Guide](../smm-currency/INTEGRATION.md).

## Validation and Diagnostics

Validate the manifest and JavaScript before deployment. After a world restart,
kill a configured mob with a direct player attack and a player-owned projectile,
then verify the `player:{playername}` balance through SMM Currency. Review the
Bedrock Content Log and script output for `smm-mob-rewards` manifest or
currency-reward errors.
