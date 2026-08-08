# Copilot Repository Instructions

Read `AGENTS.md` before planning or editing this repository. It defines the
required multi-add-on architecture, integration boundaries, and documentation
rules.

For Bedrock pack, JSON, or Script API changes, read the applicable scoped
instruction file in `.github/instructions/` and load the relevant project
skill from `.github/skills/`. Use current Microsoft Learn documentation as the
source of truth for Bedrock schemas, manifests, and API versions.

Keep changes within the owning add-on unless the task intentionally creates or
changes a documented integration contract. Target stable Minecraft Bedrock by
default and do not add a resource pack, script module, dependency, or shared
package without a feature that requires it.

Every new add-on requires its own `addons/<mod-name>/README.md`. Follow
`docs/addon-documentation.md` and
`docs/templates/addon-readme-template.md`; keep the README current when its
operation, compatibility, configuration, deployment, or public contracts
change. Comment code using the standards in `docs/addon-documentation.md`:
document public contracts and non-obvious intent, but do not narrate
self-explanatory code.

Before completing a feature or preparing a pull request, assess whether it
requires human documentation, scoped instructions, or a project skill. Update
only the guidance categories made necessary by the change, and explain
inapplicable categories in the pull request.
