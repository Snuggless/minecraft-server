# Server Chat Commands

## Purpose

This document defines the public chat-command shape used to route a server
command to its owning add-on. It is a documentation contract only: this
repository does not currently provide a chat bridge, parser, or dispatcher.

## Command Grammar

```text
{prefix}srv:{mod-alias}:{command} [arguments...]
```

| Segment | Rule | Example |
| --- | --- | --- |
| `{prefix}` | The server-configured command prefix. Use `!` unless the deployment documents another value. | `!` |
| `srv` | Fixed, lowercase server-command namespace. | `srv` |
| `{mod-alias}` | The lowercase kebab-case alias owned by one add-on. It matches `^[a-z][a-z0-9-]*$`. | `spawn` |
| `{command}` | The lowercase kebab-case operation name owned by that add-on. It matches `^[a-z][a-z0-9-]*$`. | `set` |
| `[arguments...]` | Optional, command-specific arguments documented by the owning add-on. | `home` |

The first three colon-delimited segments are required. Do not add aliases,
commands, or arguments containing spaces or additional colons. Preserve the
exact lowercase spelling in documentation, implementations, and examples.

## Examples

```text
!srv:spawn:set
!srv:spawn:help
!srv:spawn:set home
```

## Ownership and Discovery

- One add-on owns exactly one registered `mod-alias`; no other add-on may use
  it.
- Each add-on owns and documents the commands below its alias.
- Every command-owning add-on implements and documents
  `{prefix}srv:{mod-alias}:help` as the discovery entry point. The response
  lists the available commands, concise usage, required permissions, and the
  configured prefix.
- A command that changes server state documents its required permission and
  failure response in the owning add-on README.
- Add-ons do not call or depend on another add-on's commands unless the
  specific integration is registered in [mod-contracts.md](mod-contracts.md).

## Parsing and Failure Behavior

A future dispatcher must accept a command only when the fixed `srv` segment,
alias, and command all conform to this grammar. It must reject malformed
commands, unknown aliases, and unknown commands without forwarding them to an
add-on. The deployment or owning add-on must document the user-visible error
and permission-denied responses.

Command implementations must not assume that `!` is hard-coded. They receive
or display the configured prefix supplied by their chat-command integration.

## Adding or Changing a Command

1. Select an unclaimed lowercase kebab-case alias for a new add-on, or use the
   alias already owned by the add-on.
2. Add the command and its `help` output in the owning add-on.
3. Update the owning `addons/smm-<feature-name>/README.md` with usage, arguments,
   permissions, and operational effects.
4. Register a public cross-add-on command integration in
   [mod-contracts.md](mod-contracts.md) before another add-on consumes it.
5. Update this document when the shared grammar, routing semantics, or
   compatibility rules change.
