---
description: 'Review criteria for Minecraft Bedrock Add-On JSON and manifest changes.'
applyTo: '**/*.json'
---

# Minecraft Bedrock Content Review

Review changed Bedrock JSON for defects that prevent a pack from loading,
resolve an unintended definition or asset, or require unsupported Minecraft
features. Apply these checks alongside `bedrock-content.instructions.md`.

## Review Priorities

- Report malformed JSON, invalid manifest structure, duplicate UUIDs, invalid
  module types, or broken module entry paths.
- Report new preview-only content in stable packs unless the change explicitly
  declares the Minecraft Preview requirement and required experiments.
- Report an incompatible `format_version`, `min_engine_version`, or Script API
  dependency version when the changed feature requires a different version.
- Report behavior content placed in a resource pack, resource content placed in
  a behavior pack, or a missing behavior-to-resource dependency when changed
  behavior requires the paired assets.
- Trace each changed custom identifier, filename, and asset path through its
  declarations and references. Report references that no longer resolve.
- Report a new vanilla identifier or path override unless the change explicitly
  intends the override and explains the pack-stacking impact.

## Finding Threshold

- Report only defects supported by the changed file and its repository
  references.
- Do not flag retained, unrelated legacy fields or request a broad content
  format upgrade.
- Treat absent Content Log evidence as a finding only when the pull request
  claims in-game validation or changes a manifest load boundary.
