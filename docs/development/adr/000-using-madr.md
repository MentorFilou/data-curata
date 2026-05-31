---
status: "accepted"
date: 2026-04-30
decision-makers: MentorFilou
consulted: MentorFilou
informed: MentorFilou
---

# Using MADR 4.0.0 for major decisions

## Context and Problem Statement

We need to document impactful architectural decisions (ADRs) that do not link to a specific implementation but rather affect (major) parts of the software as is.
Developers should have a central starting point to find these.

## Decision Drivers

* being introduced to MADR recently

## Considered Options

* MADR (full template)
* MADR minimal 

## Decision Outcome

Chosen option: **MADR (full template)**, because it is a centrally collected list under the `adr/` folder and gives a huge amount of information but still stays clear.
If parts of this template are considered unnecessary for a certain decision we can still skip them for single cases.
Use a copy of `./_template.md` to add in new decisions while respecting the naming of `XXX-kebab-case.md` where XXX bumps from the latest adr index. 

### Consequences

* Good, because we have a **central starting point to find major decisions**.
* Good, because it **communicates major decisions clearly**.
* Bad, because it **only partly addresses clear/direct requirements** - we will consider other formats for these.

### Confirmation

Compliance with this ADR is enforced via the GitHub Actions workflow `.github/workflows/enforce-adr-000-using-madr.yml`, which runs on every pull request. The workflow:

1. Dynamically discovers all ADRs in `docs/development/adr/` by extracting their titles
2. Checks that the PR description contains a "This PR respects Architectural Decisions" section
3. Verifies that all ADR titles are listed with checked boxes `[x]`
4. Fails the check and posts a helpful comment if the section is missing or incomplete

This lightweight approach ensures that contributors acknowledge architectural decisions without requiring trace updates for every general/major decision on every PR.

## Pros and Cons of the Options

### MADR (full template) from 4.0.0

See https://github.com/adr/madr/blob/4.0.0/template/adr-template.md for more information.

* Good, because it is centrally collected under `adr/`.
* Good, because it states the decision clearly.
* Bad, because it is a fairly large document per decision, possibly being repetitive.

### MADR minimal from 4.0.0

See https://github.com/adr/madr/blob/4.0.0/template/adr-template-minimal.md for more information.

* Good, because it is centrally collected under `adr/`.
* Good, because its lightweight.
* Bad, because it can lack in clarity.

## More Information

_None_