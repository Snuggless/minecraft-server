---
description: 'Rules for creating, reviewing, and debugging Minecraft Bedrock Add-Ons, including pack manifests, compatibility, and official reference use.'
applyTo: '**'
---

# Minecraft Bedrock Add-On Development

Apply these rules only when the workspace contains Minecraft Bedrock behavior
packs, resource packs, skin packs, world templates, or Script API code.

## Source and Compatibility Rules

- Treat [Microsoft Learn](https://learn.microsoft.com/en-us/minecraft/creator/)
  as the source of truth for current schemas, component names, event names, and
  Script API versions. Check the relevant stable or preview reference before
  adding or changing version-sensitive content.
- Target stable Minecraft by default. Use preview or experimental content only
  when the request explicitly requires it, and label that requirement in the
  changed manifest, documentation, or release notes.
- Do not invent JSON properties, component names, or Script API signatures.
- Preserve `min_engine_version`, manifest format, and module dependency
  versions unless the change requires an intentional compatibility change.
  State the required Minecraft version when changing any of them.

## Pack Boundaries and Manifests

- Keep gameplay definitions in behavior packs and visual, audio, client, UI,
  and localization assets in resource packs.
- In this repository, each feature owns
  `addons/smm-<feature-name>/behavior_pack/` and an optional paired
  `addons/smm-<feature-name>/resource_pack/`. Do not add content to a shared
  repository-wide pack.
- Use lowercase kebab-case `smm-<feature-name>` directories and a lowercase
  namespace owned by that mod. Keep every feature independently deployable and
  versionable.
- Give every manifest header and module a distinct UUID. Never reuse a UUID
  from another pack, module, or template.
- Use a unique, lowercase namespace for custom identifiers. Keep identifiers,
  filenames, and cross-pack references consistent.
- Declare behavior-to-resource pack dependencies whenever behavior content
  requires matching resource assets.
- Treat `manifest.json` as a load boundary: validate JSON structure, module
  types, UUIDs, versions, dependencies, and script entries before concluding
  a change is complete.
- Use manifest format version 2 for stable packs. Do not introduce manifest
  version 3 unless preview support is explicitly requested.

## Add-On Integration Boundaries

- Do not use direct runtime imports between add-ons. Minecraft loads each pack
  independently.
- Keep shared source build-time-only in `packages/server-core/`, and bundle it
  into every consuming behavior pack.
- Treat dynamic properties, scoreboard objectives, Script API events, and
  commands as private unless they are registered in `docs/mod-contracts.md`.
- Document every supported public interface before another mod consumes it.
- Give every core service add-on, and every add-on that exposes a supported
  public cross-mod API, an `INTEGRATION.md` guide beside its README. Link it
  from the README and include exact consumer-facing identifiers, setup,
  examples, permissions, failures, and compatibility or migration constraints.

## Content Quality

- Preserve vanilla behavior unless the feature intentionally overrides it.
  Explain the scope and compatibility risk of every override.
- Add or update every referenced asset and definition together. Do not leave
  dangling texture, geometry, animation, render controller, sound, loot,
  recipe, item, block, entity, or localization references.
- Account for resource-pack stacking: a later pack overrides content with the
  same path or identifier.
- Prefer the smallest coherent set of pack changes. Do not upgrade unrelated
  content formats or dependencies while implementing a feature.

## Validation and Diagnostics

- Validate JSON and trace each changed identifier from its declaration to all
  resource or behavior references.
- Use the Content Log as primary evidence for pack load failures, missing
  assets, malformed content, and warnings. Do not infer a fix without
  inspecting the reported path, identifier, and error.
- Test in a fresh or appropriately reloaded world. State whether a world
  restart, `/reload`, or a new world is required for the changed content.

## Official References

- [Add-On getting started](https://learn.microsoft.com/en-us/minecraft/creator/documents/gettingstarted?view=minecraft-bedrock-stable)
- [Manifest reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/addonsreference/examples/addonmanifest?view=minecraft-bedrock-stable)
- [Behavior packs](https://learn.microsoft.com/en-us/minecraft/creator/documents/behaviorpack?view=minecraft-bedrock-stable)
- [Resource packs](https://learn.microsoft.com/en-us/minecraft/creator/documents/resourcepack?view=minecraft-bedrock-stable)
- [Content Error Log](https://learn.microsoft.com/en-us/minecraft/creator/documents/contenterrorlog?view=minecraft-bedrock-stable)
