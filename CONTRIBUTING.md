# Contributing

Thanks for contributing to this Minecraft Bedrock Add-On collection. Keep each
change focused, independently deployable, and documented for the server
operators who will run it.

## Before You Start

1. Check the existing [repository structure](docs/repository-structure.md),
   [architecture](docs/architecture.md), and
   [public contracts](docs/mod-contracts.md).
2. Open an issue or discuss substantial gameplay, compatibility, or
   cross-add-on changes before implementation.
3. Use a focused branch and keep unrelated changes out of the pull request.

## Add-On Contributions

- Put each feature in one lowercase kebab-case
  `addons/smm-<feature-name>/` directory.
- Keep gameplay content in its `behavior_pack/`. Add a `resource_pack/` only
  when the feature owns client assets such as textures, sounds, models, UI, or
  client entities.
- Give every new add-on a completed README based on
  [the add-on README template](docs/templates/addon-readme-template.md).
- Use a lowercase namespace owned by the add-on for custom identifiers.
- Use manifest format version 2 for stable Bedrock content. Generate a unique
  UUID for every manifest header and module, and set `min_engine_version` from
  the features actually used.
- Keep feature-specific code in its owning add-on. Add generic source to
  `packages/server-core/` only when at least two add-ons need it and tooling
  bundles it into every consumer.

## Integrations and Commands

Add-on data, events, scoreboard objectives, dynamic properties, and commands
are private by default. Do not consume another add-on's internals. Register a
public cross-add-on interface in
[mod contracts](docs/mod-contracts.md) before another add-on depends on it.

Follow [the server chat-command grammar](docs/chat-commands.md) for public
chat commands. Document command usage, permissions, and operational effects in
the owning add-on README.

## Documentation

Update documentation with the change:

- Update the owning add-on README when its operation, configuration,
  compatibility, deployment, pack relationship, or public contracts change.
- Update [architecture](docs/architecture.md) and
  [repository structure](docs/repository-structure.md) when the directory
  model or ownership boundaries change.
- Update [mod contracts](docs/mod-contracts.md) for public integration
  changes.
- Follow [the add-on documentation guide](docs/addon-documentation.md) for
  add-on README and code-comment requirements.

## Validation

Before opening a pull request:

1. Validate changed manifests, JSON, UUID uniqueness, identifiers, and asset
   references.
2. Test the affected add-on in isolation and with its declared dependencies.
3. Inspect the Bedrock Content Log for relevant errors and warnings.
4. Record any required reload, restart, new-world, or deployment steps in the
   owning add-on README.

Use the pull request template to describe the change, confirm Bedrock
validation, and assess whether human documentation, contributor instructions,
or a reusable project skill need updates.
