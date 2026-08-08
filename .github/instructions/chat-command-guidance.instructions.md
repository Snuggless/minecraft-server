---
description: 'Apply the server chat-command grammar and ownership rules to add-on command implementations and documentation.'
applyTo: 'addons/**, docs/**'
---

# Server Chat Command Guidance

Use [Server Chat Commands](../../docs/chat-commands.md) as the authoritative
definition for publicly documented server chat commands.

## Command Structure

- Format every public chat command as
  `{prefix}srv:{mod-alias}:{command} [arguments...]`.
- Use the fixed lowercase `srv` namespace.
- Use lowercase kebab-case aliases and command names matching
  `^[a-z][a-z0-9-]*$`.
- Use the server-configured prefix; use `!` only as the documented default
  when no deployment-specific prefix is supplied.
- Do not add colons, whitespace, or aliases to the routing portion of a
  command.

## Add-On Ownership

- Keep commands and their parsing logic inside the owning add-on.
- Register a new alias before documenting it as public, and do not reuse an
  alias owned by another add-on.
- Provide `{prefix}srv:{mod-alias}:help` for every command-owning add-on.
- Document command arguments, required permissions, state-changing effects,
  and user-visible failures in the owning add-on README.
- Do not implement an inter-add-on command dependency unless its contract is
  registered in `docs/mod-contracts.md`.

## Change Checklist

- Update `docs/chat-commands.md` when changing shared command grammar,
  compatibility, or routing behavior.
- Update the owning add-on README when adding, removing, or changing a public
  command.
- Update `docs/mod-contracts.md` before another add-on consumes a public
  command.
- Do not add a shared chat dispatcher, package, manifest dependency, or
  runtime import unless the feature explicitly requires one.

## Examples

```text
!srv:spawn:set
!srv:spawn:help
```

Avoid formats such as `!spawn:set`, `!srv:Spawn:set`, and
`!srv:spawn:set:home`.
