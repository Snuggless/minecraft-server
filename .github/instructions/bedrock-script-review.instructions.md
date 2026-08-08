---
description: 'Review criteria for Minecraft Bedrock Script API changes and script module contracts.'
applyTo: '**/*.ts, **/*.js'
---

# Minecraft Bedrock Script API Review

Review changed Bedrock behavior-pack scripts for runtime failures, unsafe world
lifecycle assumptions, and mismatches between source, emitted output, and
manifest declarations. Apply these checks alongside
`bedrock-scripting.instructions.md`.

## Review Priorities

- Report an `@minecraft/*` import or API member that is incompatible with the
  changed pack's declared stable or Preview target.
- Report a script module whose manifest `entry`, emitted JavaScript path, or
  declared `@minecraft/*` dependency no longer matches the changed source.
- Report unbounded tick work, polling that can use an event subscription, or
  scheduled work that can grow without a stated bound.
- Report code that acts on unavailable world state or retained entity
  references without checking that the target remains valid.
- Report swallowed Script API errors or error messages that omit the failed
  operation or affected identifier when those details are available.
- Report a feature that depends on a one-time tick when it must remain
  repeatable after reload or world lifecycle changes.

## Finding Threshold

- Report only lifecycle and performance risks that the changed control flow can
  actually trigger.
- Do not request a refactor solely for style or replace a bounded event-based
  implementation with a different equivalent pattern.
- Do not require comments for self-explanatory code; report missing
  documentation only for non-obvious public contracts or Bedrock constraints.
