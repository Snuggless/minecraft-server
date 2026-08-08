---
name: bedrock-script-api
description: 'Develop, migrate, or debug Minecraft Bedrock Script API TypeScript and JavaScript. Use for @minecraft/server imports, event subscriptions, scheduled work, manifest script modules, dependency versions, compilation, and deployment.'
---

# Bedrock Script API Development

Use this skill for Bedrock behavior-pack scripts.

## Workflow

1. Identify the Minecraft stable or preview target and inspect the current
   manifest modules, package dependencies, compiler output, and deployment
   process.
2. Confirm all `@minecraft/*` imports and members in the appropriate official
   API reference. Record an intentional preview dependency when required.
3. Prefer event-driven handlers and bounded scheduled work. Keep recurring
   callbacks small and make initialization safe when worlds reload.
4. Align TypeScript sources, emitted JavaScript, script `entry`, and manifest
   dependency versions.
5. Build and deploy with the existing project commands, then test in a world
   using the reload behavior appropriate to the change.
6. Diagnose failures from Content Log and script output, preserving the
   failing API, package version, and manifest context.

## Gotchas

- **Do not use a guessed Script API version.** Package availability changes
  across releases; verify it for the exact Minecraft target.
- **Do not use unbounded per-tick scanning.** It can create avoidable runtime
  cost and obscure gameplay bugs.
- **Do not rely on one historical tick for a repeatable feature.** A world
  retains its tick state across reloads.

## References

- [Introduction to scripting](https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/introduction?view=minecraft-bedrock-stable)
- [TypeScript scripting next steps](https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/next-steps?view=minecraft-bedrock-stable)
