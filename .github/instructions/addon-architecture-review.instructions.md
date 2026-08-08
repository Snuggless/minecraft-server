---
description: 'Review criteria for add-on boundaries, shared source, contracts, and operational documentation.'
applyTo: 'addons/**, packages/**, tools/**, docs/**'
---

# Bedrock Add-On Architecture Review

Review changed add-on, shared-source, tooling, and documentation files for
violations of the repository's independently deployable add-on model. Apply
these checks alongside `addon-monorepo.instructions.md`.

## Review Priorities

- Report gameplay or client assets placed outside the owning
  `addons/<mod-name>/` pack structure, including shared repository-wide packs.
- Report direct runtime imports between add-ons or a feature-specific addition
  to `packages/server-core/`.
- Report a shared-source addition without at least two genuine build-time
  consumers, or source that is not bundled into each consuming behavior pack.
- Report consumption of another add-on's private namespace, files, dynamic
  properties, scoreboards, events, or commands.
- Report a changed public cross-mod interface that lacks its owner, consumers,
  compatibility version, lifecycle, or migration plan in
  `docs/mod-contracts.md`.
- Report a new add-on without its README, or a change to documented operation,
  compatibility, configuration, deployment, pack relationship, or public
  contract that leaves the owning README inaccurate.
- Report a changed directory model without a corresponding
  `docs/architecture.md` update.

## Finding Threshold

- Treat an integration as public only when another add-on consumes or is
  intended to consume it; do not require a contract for private internals.
- Do not require documentation updates when changed implementation details do
  not affect the documented behavior or operational workflow.
- Do not request a repository-wide reorganization when the changed feature
  remains within its owning add-on boundary.
