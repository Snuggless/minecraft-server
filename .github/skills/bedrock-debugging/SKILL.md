---
name: bedrock-debugging
description: 'Diagnose Minecraft Bedrock Add-On import, manifest, content, asset, and Script API failures. Use for Content Log errors, packs not appearing, missing textures or definitions, module load issues, and runtime script problems.'
---

# Bedrock Add-On Debugging

Use this skill when a Bedrock Add-On fails to import, load, render, behave, or
run scripts as expected.

## Diagnostic Workflow

1. Capture the exact symptom, Minecraft target, active packs, world settings,
   and whether the issue occurs on stable or preview.
2. Inspect Content Log messages first. Preserve the reported file path,
   identifier, line or property, and surrounding warnings.
3. For packs that do not appear, validate manifests, UUIDs, folder location,
   module types, and JSON syntax.
4. For loaded packs with missing content, trace the identifier and asset path
   across behavior and resource packs, including activation order.
5. For scripts, inspect manifest script entries, dependency versions, compiled
   output paths, runtime errors, and the world reload requirement.
6. Make the narrowest evidence-based correction, retest, and confirm that the
   original log entry is gone or intentionally explained.

## Troubleshooting

| Symptom | Focus |
| --- | --- |
| Pack is absent from world settings | Manifest JSON, UUIDs, pack folder, module type |
| Pack loads but has missing visuals | Resource asset path, client definition, pack order |
| Custom gameplay does not run | Behavior identifier, component schema, paired pack dependency |
| Script does not start | Script module entry, compiled JavaScript, `@minecraft/*` dependency |
| Content Log warning or error | Exact path and schema field reported by the log |

## Gotchas

- **Do not dismiss warnings as harmless without reading them.** Warnings can
  identify unsupported content that later becomes unstable or unpredictable.
- **Do not diagnose only from screenshots or symptoms.** Content Log evidence
  supplies the parser or runtime context needed for a reliable fix.

## References

- [Content Error Log](https://learn.microsoft.com/en-us/minecraft/creator/documents/contenterrorlog?view=minecraft-bedrock-stable)
