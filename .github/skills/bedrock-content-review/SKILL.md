---
name: bedrock-content-review
description: 'Review Minecraft Bedrock Add-On behavior and resource content for malformed JSON, unsupported schemas, identifiers, asset references, pack dependencies, overrides, and stable-versus-preview compatibility.'
---

# Bedrock Content Review

Use this skill to audit or review Bedrock Add-On JSON and asset changes.

## Review Criteria

- Inspect manifests before individual content files. Verify UUID uniqueness,
  module type, script entry, dependencies, and requested version target.
- Check every changed JSON file against the official reference for its exact
  content type and stable or preview status.
- Trace changed custom identifiers through behavior definitions, client
  definitions, resource assets, recipes, loot, spawn rules, and localization.
- Verify each asset path, case, extension, and resource-pack location.
- Identify vanilla overrides and pack-stacking consequences explicitly.
- Separate findings into load-blocking errors, runtime/content errors,
  compatibility risks, and optional improvements.

## Gotchas

- **Do not treat valid JSON as valid content.** Bedrock can parse a file whose
  schema, dependency, identifier, or path is still invalid.
- **Do not report speculative API or schema issues.** Cite the relevant
  stable or preview Microsoft Learn reference for each finding.
- **Do not overlook paired packs.** A behavior change often requires a
  resource definition even when the changed file is behavior JSON.

## References

- [Behavior packs](https://learn.microsoft.com/en-us/minecraft/creator/documents/behaviorpack?view=minecraft-bedrock-stable)
- [Resource packs](https://learn.microsoft.com/en-us/minecraft/creator/documents/resourcepack?view=minecraft-bedrock-stable)
