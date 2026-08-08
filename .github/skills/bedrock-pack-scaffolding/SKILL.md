---
name: bedrock-pack-scaffolding
description: 'Create or reorganize Minecraft Bedrock behavior packs, resource packs, and Script API pack foundations. Use for manifests, UUIDs, namespaces, dependencies, development deployment layouts, and distributable pack setup.'
---

# Bedrock Pack Scaffolding

Use this skill when creating or restructuring the foundation of a Bedrock
Add-On.

## Workflow

1. Confirm whether the Add-On needs behavior content, resource content, or
   both. Select stable by default; require an explicit preview target for
   experimental features.
2. Create only the required pack folders and canonical content directories.
   Avoid placeholder folders and assets that do not serve a declared feature.
3. Create manifests with distinct UUIDs for every header and module, accurate
   version arrays, and the narrowest valid engine and module dependency
   requirements.
4. Link the behavior pack to its resource pack when gameplay definitions use
   custom client assets.
5. Establish one lowercase custom namespace and use it consistently in
   manifests, content identifiers, and example assets.
6. Configure the existing project build/deploy workflow or document the
   intended `development_behavior_packs` and `development_resource_packs`
   deployment target.

## Gotchas

- **Never copy UUIDs from a sample or another pack.** Duplicate UUIDs prevent
  reliable pack identification and import.
- **Do not create a script module without its dependencies and entry output.**
  Minecraft loads JavaScript declared by the manifest, not TypeScript source.
- **Do not use manifest format v3 for stable packs by default.** Confirm the
  requested Minecraft target first.

## References

- [Manifest reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/addonsreference/examples/addonmanifest?view=minecraft-bedrock-stable)
- [Getting started](https://learn.microsoft.com/en-us/minecraft/creator/documents/gettingstarted?view=minecraft-bedrock-stable)
