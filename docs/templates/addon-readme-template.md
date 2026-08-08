# `<Add-On Name>`

## Purpose

Describe the gameplay problem this add-on owns and its intended outcome.

## Compatibility

| Item | Value |
| --- | --- |
| Namespace | `<namespace>` |
| Minecraft Bedrock target | `<version>` |
| Release channel | `stable` or `preview` |
| Behavior pack | `<pack name>` |
| Resource pack | `<pack name>` or `Not required` |

State any compatibility limits, experiments, or required world settings.

## Pack Relationship

Describe which pack folders this add-on contains and why. If it has a resource
pack, state whether the behavior pack depends on it and identify the gameplay
content that requires its assets.

## Installation and Deployment

1. Describe the required pack installation or deployment step.
2. Describe the required world activation or configuration step.
3. State whether the change requires `/reload`, a world restart, or a new
   world.

## Configuration and Operations

Document operator-visible configuration, commands, permissions, migration
steps, and expected failure behavior. State `None` when no configuration or
operational action is required.

## Public Contracts

List only interfaces intended for use by other add-ons. Each contract must
also be registered in [mod-contracts.md](../../docs/mod-contracts.md).

When this add-on is a core service or exposes a supported public cross-add-on
API, link to its `INTEGRATION.md` guide. The guide must provide consumer setup,
complete usage examples, permissions, failures, compatibility, and migration
details.

State `None. This add-on exposes no public cross-mod contracts.` when
applicable.

## Validation and Diagnostics

Describe how to validate the add-on and the expected Content Log outcome.
Include relevant identifiers or log locations that help diagnose failures.
