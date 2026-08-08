# Architecture

## Purpose

This repository contains a collection of small, interoperable Minecraft
Bedrock Add-Ons for one server. Each add-on owns one focused feature so it can
be developed, tested, released, and replaced without turning the server into
one monolithic pack.

## Directory Model

```text
addons/
└── smm-<feature-name>/
    ├── behavior_pack/
    │   ├── manifest.json
    │   └── scripts/
    ├── resource_pack/        # Only when client assets are required
    │   └── manifest.json
    └── README.md

packages/
└── server-core/              # Shared build-time source only

tools/                         # Build, validation, and deployment automation
docs/                          # Architecture and public integration contracts
worlds/
└── development/               # Development-world configuration
```

## Add-On Model

Every feature lives in one `addons/smm-<feature-name>/` directory, where
`<feature-name>` is lowercase kebab-case. The `smm-` prefix is required for
every add-on directory. A behavior pack owns gameplay behavior, definitions,
and Script API code. A paired resource pack exists only when the feature owns
client assets such as textures, sounds, models, UI, or client entities.

Each pack has its own manifest, header UUID, module UUIDs, version, and
verified minimum Minecraft version. Stable packs use manifest format version
2. A behavior pack declares its paired resource pack as a dependency only when
the behavior content requires those resources.

## Shared Code and Integrations

`packages/server-core/` is reserved for generic source code with at least two
real consumers. Build tooling bundles that source into each consuming behavior
pack; add-ons do not load code from sibling add-ons at runtime.

An add-on's data and commands are private by default. A cross-mod interaction
is supported only when its event, property, scoreboard objective, or command
is recorded in [mod-contracts.md](mod-contracts.md). This preserves feature
boundaries and lets individual add-ons evolve safely.

## Documentation Responsibilities

Each add-on must include a dedicated README that records its purpose, namespace,
required Minecraft version, pack relationship, deployment requirements,
validation expectations, and public contracts. Follow the
[Add-On Documentation and Code Commenting Guide](addon-documentation.md) and
its README template. Update this document when the repository directory model
changes, and update [mod-contracts.md](mod-contracts.md) whenever a public
interface changes.
