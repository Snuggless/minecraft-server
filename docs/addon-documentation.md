# Add-On Documentation and Code Commenting Guide

## Purpose

This guide defines the documentation and code-commenting baseline for humans
and AI contributors. It keeps every Minecraft Bedrock Add-On understandable,
operable, and safe to change without relying on tribal knowledge.

## Required Add-On Documentation

Every new add-on shall include a dedicated `addons/<mod-name>/README.md` before
it is merged. Start from the
[add-on README template](templates/addon-readme-template.md) and replace all
placeholders. Do not create an add-on with an empty, generic, or copied README.

The README must document:

- the add-on's purpose and the gameplay problem it owns;
- its lowercase namespace and custom identifiers that users or operators need;
- the supported Minecraft Bedrock version and whether it targets stable or
  preview;
- its behavior-pack and resource-pack relationship, including why a resource
  pack or dependency is required when present;
- installation, deployment, configuration, and required reload, restart, or
  new-world steps;
- test and diagnostic expectations, including Content Log review;
- supported public contracts, with a link to
  [mod-contracts.md](mod-contracts.md), or an explicit statement that none
  exist; and
- operational limitations, known compatibility concerns, and upgrade actions
  when they affect users or server operators.

Update an add-on README whenever its supported Minecraft version, deployment
steps, configuration, pack relationship, public contract, or operational
behavior changes. Keep implementation details in source code and public,
cross-add-on interfaces in [mod-contracts.md](mod-contracts.md).

## Repository Documentation

Update the shared documentation in the same change when applicable:

| Change | Required documentation |
| --- | --- |
| Directory layout or ownership boundary | [architecture.md](architecture.md) and [repository-structure.md](repository-structure.md) |
| Public event, dynamic property, scoreboard objective, or command | [mod-contracts.md](mod-contracts.md) before another add-on consumes it |
| Public server chat command | [chat-commands.md](chat-commands.md), the owning add-on README, and `mod-contracts.md` when another add-on consumes it |
| Contributor workflow or durable repository convention | This guide or the relevant `.github/instructions/` file |
| Reusable AI workflow that needs more than an instruction | The relevant `.github/skills/` skill |

Documentation must describe the current behavior, use exact identifiers and
paths, and distinguish required steps from optional examples. Remove stale
instructions as part of the behavior change that makes them obsolete.

## Code Comments

Follow Microsoft guidance for readable code and documentation comments. Write
comments as complete, concise sentences and place them next to the behavior
they explain. Comments must explain intent, a non-obvious constraint, or a
public contract; they must not narrate syntax or repeat an obvious identifier.

- Document exported or externally consumed functions, types, configuration
  values, and contracts with the language's standard documentation format.
- For TypeScript and JavaScript, use JSDoc for exported APIs when parameter,
  return-value, side-effect, or error behavior is not self-evident.
- For C#, use XML documentation comments for public or protected APIs,
  including meaningful `param`, `returns`, `exception`, and `remarks` content
  where applicable.
- Add inline comments for Bedrock-specific constraints, such as a verified
  Script API version, an intentional scheduling boundary, a required reload,
  a manifest-to-output path dependency, or a compatibility workaround.
- Keep comments accurate when changing code. Delete comments that no longer
  describe the implementation.

Avoid comments that merely restate code, commented-out code, unexplained
`TODO` or `FIXME` markers, and broad historical narratives. Track deferred
work through the repository's issue process with a clear owner and outcome.

See [Common C# code conventions](https://learn.microsoft.com/dotnet/csharp/fundamentals/coding-style/coding-conventions)
for Microsoft's general coding-convention guidance.
