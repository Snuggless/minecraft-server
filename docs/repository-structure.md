# Repository Structure Guide

## Purpose

This repository contains several small Minecraft Bedrock Add-Ons for one
server. Each add-on owns one feature, allowing contributors to develop,
release, and replace features without coupling unrelated gameplay systems.

Follow these rules when adding a feature or moving existing content.

## Required Layout

```text
addons/
└── <mod-name>/
    ├── behavior_pack/
    │   ├── manifest.json
    │   └── scripts/
    ├── resource_pack/        # Only when the mod owns client assets
    │   └── manifest.json
    └── README.md

packages/
└── server-core/              # Shared build-time source only

tools/                         # Build, validation, and deployment automation
docs/                          # Shared contributor and contract documentation
worlds/
└── development/               # Development-world configuration
```

Create one lowercase kebab-case directory per feature under `addons/`, such
as `addons/player-homes/`. Do not create a shared behavior pack or resource
pack for unrelated features.

## Choosing Pack Folders

Every add-on has a `behavior_pack/` for gameplay definitions, loot, recipes,
spawn rules, and Script API code. Create `resource_pack/` only when the mod
also owns textures, sounds, models, animations, client entities, UI, or other
client-facing assets.

When both packs exist, keep them paired inside the same mod directory. The
behavior pack must declare a dependency on its resource pack when its gameplay
content requires those assets.

## Naming and Manifests

Use a lowercase namespace owned by the mod for custom identifiers. For example,
the `player-homes` mod might use `server_homes:home_marker`.

Each behavior and resource pack owns a separate `manifest.json`. Generate a new
UUID for every manifest header and module; never reuse one from another pack or
template. Stable packs use manifest format version 2 and must declare the
appropriate minimum Minecraft version for the feature.

## Sharing Code and Features

Keep feature-specific code in its owning add-on. `packages/server-core/` is
reserved for generic TypeScript source that has at least two real consumers.
Build tooling must bundle that shared source into every consuming behavior
pack because Minecraft does not load code from sibling add-ons at runtime.

An add-on's events, dynamic properties, scoreboard objectives, and commands
are private by default. Before another mod depends on one, register it in
[mod-contracts.md](mod-contracts.md) with an owner, consumers, compatibility
version, lifecycle, and migration plan.

## Contributor Checklist

1. Create or identify the owning `addons/<mod-name>/` directory.
2. Add only the required behavior and resource pack folders.
3. Give the mod a README with its purpose, namespace, Minecraft version, pack
   relationship, deployment requirements, and public contracts.
4. Validate manifests, UUID uniqueness, JSON, references, and asset paths.
5. Test the mod alone and with its declared dependencies, then inspect the
   Bedrock Content Log.
6. Update [architecture.md](architecture.md) for layout changes and
   [mod-contracts.md](mod-contracts.md) for public integrations.
7. Before opening a pull request, assess whether the change needs human
   documentation, repository instructions, or an agent skill. Add or update
   only the guidance that the feature genuinely requires.
