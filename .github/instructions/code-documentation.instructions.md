---
description: 'Code documentation standards for TypeScript, JavaScript, and C# maintained in this repository.'
applyTo: '**/*.ts, **/*.js, **/*.cs'
---

# Code Documentation Standards

Apply the code-commenting rules in `docs/addon-documentation.md` whenever
adding or changing source code.

## Documentation Comments

- Use the language-standard documentation format for exported or externally
  consumed APIs when their contract is not self-evident.
- Use JSDoc for TypeScript and JavaScript APIs. Use XML documentation comments
  for public or protected C# APIs.
- Document parameters, return values, side effects, error behavior, and
  lifecycle constraints only when that information is meaningful to callers.

## Inline Comments

- Write concise, complete sentences that explain intent, a constraint, or a
  compatibility decision.
- Explain non-obvious Bedrock behavior, including API-version requirements,
  reload behavior, scheduling bounds, and manifest-to-output dependencies.
- Keep comments adjacent to the code they describe and update or remove them
  with the associated code.
- Do not restate syntax, narrate self-explanatory code, preserve commented-out
  code, or leave unexplained `TODO` or `FIXME` markers.
