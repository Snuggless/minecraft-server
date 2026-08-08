---
description: 'TypeScript and JavaScript rules for Minecraft Bedrock Script API modules, manifest declarations, compatibility, and world-safe execution.'
applyTo: '**/*.ts, **/*.js'
---

# Minecraft Bedrock Script API

Apply these rules only to TypeScript or JavaScript that executes as a
Minecraft Bedrock behavior-pack script.

## API and Manifest Contract

- Verify every `@minecraft/*` import and API member against the official
  reference for the target stable or preview version before use.
- Keep the script module `entry` path, compiled JavaScript output path, and
  manifest module declaration aligned.
- Declare each required `@minecraft/*` package in the manifest dependencies
  with the compatible version. Do not add a dependency merely because an API
  name appears plausible.
- Use TypeScript when the project already compiles it; Minecraft loads the
  emitted JavaScript, not source TypeScript.

## Runtime Design

- Prefer event subscriptions and scheduled work over polling every tick.
- Keep tick callbacks small, bounded, and idempotent. Yield or batch work that
  could process many blocks, entities, or players.
- Treat world and entity state as transient: validate availability before
  acting and avoid retaining invalid entity references.
- Do not rely on a one-time world tick for features that must be repeatable or
  testable after a reload.
- Use targeted error reporting that identifies the operation and affected
  identifier; do not silently swallow Script API errors.

## Code Documentation

- Follow `docs/addon-documentation.md` for code comments.
- Use JSDoc for exported or externally consumed APIs when their parameters,
  return values, side effects, error behavior, or Bedrock lifecycle constraints
  are not self-evident.
- Use inline comments only to explain intent or non-obvious Bedrock constraints,
  such as verified API compatibility, required reload behavior, scheduling
  bounds, or manifest-to-output dependencies.
- Do not comment syntax, duplicate identifier names, leave commented-out code,
  or add unexplained `TODO` or `FIXME` markers.

## Testing

- Run the existing compile and deployment workflow before in-game testing.
- Reload or recreate the world when the target runtime requires it.
- Inspect the Content Log and script output for module, dependency, import,
  and runtime failures.

## References

- [Introduction to scripting](https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/introduction?view=minecraft-bedrock-stable)
- [TypeScript scripting next steps](https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/next-steps?view=minecraft-bedrock-stable)
