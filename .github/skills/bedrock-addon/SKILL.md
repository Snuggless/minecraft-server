---
name: bedrock-addon
description: 'Implement or change Minecraft Bedrock Add-Ons spanning behavior packs, resource packs, manifests, assets, and Script API code. Use for custom entities, items, blocks, gameplay, textures, sounds, and pack integration.'
---

# Bedrock Add-On Workflow

Use this skill for an end-to-end Minecraft Bedrock Add-On feature or fix.

## Workflow

1. Inspect the pack layout, `manifest.json` files, namespaces, dependency
   links, and existing build or deployment scripts before changing content.
2. Identify the target as stable or preview. Consult the corresponding
   Microsoft Learn content and Script API reference before writing
   version-sensitive JSON or code.
3. Map the complete change: behavior definitions, resource assets, manifest
   dependencies, localization, and script modules as applicable.
4. Make the smallest coherent change set. Preserve existing identifiers,
   formats, and compatibility unless migration is deliberate.
5. Validate JSON, manifests, UUID uniqueness, identifiers, asset paths, and
   cross-pack references. Run the project's existing build or deployment
   command when present.
6. Test the feature in Minecraft and review the Content Log. Report whether
   the test requires a reload, a world restart, or a new world.

## Gotchas

- **Do not assume JSON support from Java Edition documentation.** Bedrock pack
  schemas, directory layouts, and identifiers are separate.
- **Resource pack stacking is an override mechanism.** A reused path can
  replace a later or earlier pack asset depending on activation order.
- **Manifest v3 is not a blanket upgrade.** It was introduced for Minecraft
  Preview 1.21.110 and later; confirm the requested target before using it.

## References

- [Microsoft Learn Add-On documentation](https://learn.microsoft.com/en-us/minecraft/creator/)
- [Content Error Log](https://learn.microsoft.com/en-us/minecraft/creator/documents/contenterrorlog?view=minecraft-bedrock-stable)
