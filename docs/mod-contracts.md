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

No public cross-mod contracts are registered yet.

## Contract Template

Copy this section when registering a public interface.

```markdown
### `<owner>:<contract-name>`

| Field | Value |
| --- | --- |
| Owner | `<mod-name>` |
| Consumers | `<mod-name>` |
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
