---
description: 'Repository structure rules for independently deployable Minecraft Bedrock add-ons, shared build-time code, tooling, and integration contracts.'
applyTo: 'addons/**, packages/**, tools/**, docs/**'
---

# Bedrock Add-On Monorepo Structure

This repository contains small Minecraft Bedrock Add-Ons that cooperate on a
single server. Keep every feature self-contained and make cross-mod
dependencies explicit.

## Add-On Ownership

- Create one lowercase kebab-case feature directory prefixed with `smm-` at
  `addons/smm-<feature-name>/`.
- Place gameplay content in `behavior_pack/`.
- Create `resource_pack/` only when the mod owns client assets such as
  textures, sounds, models, UI, or client entities.
- Keep each pack's `manifest.json` inside its owning add-on. Do not create a
  shared manifest or a repository-wide behavior/resource pack.
- Add a dedicated `README.md` to every new mod before it is merged. Follow
  `docs/addon-documentation.md` and
  `docs/templates/addon-readme-template.md`; it must describe the purpose,
  namespace, compatibility target, public contracts, pack relationship,
  deployment, validation, and operational requirements.

## Shared Source and Runtime Boundaries

- Keep feature-specific code in the owning add-on.
- Put only generic, reusable TypeScript source in `packages/server-core/`.
- Bundle shared source into every consuming behavior pack. Minecraft cannot
  load code directly from a sibling add-on or repository package at runtime.
- Do not create a shared package until at least two mods have a genuine shared
  build-time need.

## Cross-Mod Contracts

- Do not consume another mod's internal files, namespaces, dynamic properties,
  scoreboards, events, or commands.
- Register every public cross-mod interface in `docs/mod-contracts.md` before
  another mod depends on it.
- Include the owner, consumers, version compatibility, and migration plan for
  every changed or removed contract.
- Require `addons/smm-<feature-name>/INTEGRATION.md` for every core service
  add-on and every add-on that exposes a supported public cross-mod API. Link
  it from the add-on README and keep it aligned with the contract registry.
- Use the integration guide for consumer setup, public identifiers, payloads or
  command arguments, complete examples, permissions, failure behavior, and
  compatibility or migration constraints. Do not require it for non-core
  add-ons with no supported public cross-mod API.
- Prefer small, namespaced interfaces with explicit ownership over implicit
  shared state.

## Documentation and Validation

- Update `docs/architecture.md` when the directory model changes.
- Update the owning add-on README whenever its configuration, compatibility,
  deployment, behavior, pack relationship, or public contract changes.
- Keep tooling under `tools/` and development-world configuration under
  `worlds/development/`; do not place server-specific tooling inside an add-on.
- Validate the changed pack in isolation and alongside declared dependencies.
- Check the Content Log after testing and record any required world restart or
  reload in the owning mod's README when relevant.
- Before preparing a pull request, assess whether the feature changes a
  contributor workflow, repository convention, or reusable agent workflow.
  Update human documentation, scoped instructions, or a skill only when the
  assessment identifies a real need.
