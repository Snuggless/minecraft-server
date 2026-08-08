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
