# Repository Guidance

This repository hosts a collection of small, interoperable Minecraft Bedrock
Add-Ons for one server. Keep each feature independently understandable,
deployable, and versionable rather than growing a single monolithic pack.

Read this file before changing repository structure. For Bedrock pack content,
also follow the applicable files in `.github/instructions/` and the relevant
project skill in `.github/skills/`.

## Repository Layout

```text
addons/smm-<feature-name>/
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/
├── resource_pack/        # Only when the mod owns client assets
│   └── manifest.json
└── README.md

packages/server-core/     # Shared source bundled into individual add-ons
tools/                    # Build, validation, and deployment automation
docs/                     # Architecture and supported integration contracts
worlds/development/       # Development-world configuration only
```

Create one lowercase kebab-case folder prefixed with `smm-` per feature under
`addons/`, such as `addons/smm-currency/`. Keep all gameplay behavior, scripts,
and behavior definitions in that mod's
`behavior_pack/`. Add `resource_pack/` only when the mod owns textures,
sounds, models, client entities, UI, or other resource content.

## Pack and Versioning Rules

- Target stable Minecraft Bedrock by default. Do not use preview or
  experimental features unless the task explicitly requires them.
- Use manifest format version 2 for stable packs. Manifest format version 3 is
  preview-only.
- Give every manifest header and module a newly generated, distinct UUID. Do
  not copy UUIDs from another mod, sample, or template.
- Set `min_engine_version` from the verified feature target. Do not copy an
  arbitrary legacy engine version.
- Declare a behavior-pack dependency on the paired resource pack only when the
  behavior content requires its assets.
- Use a lowercase namespace owned by the mod for all custom identifiers, such
  as `server_economy:wallet`.

Consult the relevant current Microsoft Learn reference before editing
version-sensitive manifests, schemas, or Script API declarations.

## Mod Boundaries and Integrations

- Do not import code from one add-on into another at runtime.
- Put reusable TypeScript source in `packages/server-core/` only when it is
  generic and is bundled into each consuming behavior pack during its build.
- Keep feature-specific gameplay logic inside its owning add-on.
- Treat dynamic properties, scoreboard objectives, Script API events, and
  commands as private unless registered in `docs/mod-contracts.md`.
- Document every supported public integration in `docs/mod-contracts.md` before
  another mod consumes it.
- Every core service add-on, and every add-on that exposes a supported public
  cross-mod API, must include `INTEGRATION.md` beside its README. The guide
  must show consumers how to use the API safely and link to its registered
  contracts; the contract registry remains the concise compatibility source of
  truth.
- Do not use another mod's private namespace, filesystem paths, or internal
  data conventions.

## Documentation and Validation

- Give each mod a `README.md` that states its purpose, namespace, public
  contracts, pack relationship, deployment requirements, and required
  Minecraft version.
- Update `docs/architecture.md` when the repository structure changes.
- Update `docs/mod-contracts.md` whenever a public cross-mod interface is
  added, changed, or removed.
- Validate JSON and every identifier or asset reference. Inspect the Bedrock
  Content Log after in-game testing.

## Pull Request Guidance Review

Before completing a feature or preparing a pull request, consider whether the
change requires contributor guidance:

- Add or update human documentation when the feature introduces a user-facing
  workflow, configuration, operational step, or architectural concept.
- Add or update scoped instructions when the change establishes a durable
  repository convention, constraint, or repeatable development workflow.
- Add or update a skill when agents need a focused, reusable workflow that
  cannot be captured clearly by scoped instructions alone.
- Do not create documentation, instructions, or skills merely to satisfy this
  review. Record why each category is not needed in the pull request when it
  does not apply.
