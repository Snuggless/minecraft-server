---
description: 'Content rules for Minecraft Bedrock Add-On JSON files, including behavior definitions, resource assets, identifiers, and pack references.'
applyTo: '**/*.json'
---

# Minecraft Bedrock Content JSON

Apply these rules only to JSON files that belong to a Minecraft Bedrock Add-On.

## Content Placement

- Put entities, blocks, items, recipes, loot tables, spawn rules, trades,
  features, and gameplay components in the behavior pack.
- Put textures, sounds, geometry, animations, animation controllers, render
  controllers, client entities, UI, and language resources in the resource
  pack.
- Use the exact directory and filename convention required by the official
  reference for the content type. Do not move content into generic folders.

## Identifier and Reference Discipline

- Use a lowercase custom namespace for every new identifier.
- Keep behavior and resource identifiers synchronized where both define the
  same custom item, block, entity, or attachable.
- Update all references when an identifier, asset path, or filename changes.
- Add localization keys for player-facing custom names and descriptions where
  the content type supports them.
- Do not override vanilla identifiers or paths unless that override is the
  requested feature and its pack-stacking impact is understood.

## Schema and Version Discipline

- Check the official reference for the exact target content format before
  editing a schema-sensitive file.
- Keep a file's established `format_version` unless an intentional migration
  is required.
- Do not use preview-only properties in stable content. If preview content is
  intentional, record the required Minecraft Preview version and experiments.
- Retain unknown existing fields when making targeted changes; they can encode
  behavior or compatibility outside the immediate feature.

## Validation

- Validate strict JSON syntax, including commas, quoting, arrays, and objects.
- Confirm every asset path resolves with the expected case and extension.
- Confirm every behavior-to-resource identifier resolves in the paired packs.
- Check Content Log output after testing changes.

## References

- [Add-On reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/addonsreference/examples/addonmanifest?view=minecraft-bedrock-stable)
- [Behavior pack guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/behaviorpack?view=minecraft-bedrock-stable)
- [Resource pack guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/resourcepack?view=minecraft-bedrock-stable)
