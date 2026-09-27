# Semantic Release Setup

This document explains how FossFLOW versions and releases, and when that
process is run by hand rather than automatically.

## Overview

FossFLOW uses [semantic-release](https://github.com/semantic-release/semantic-release) to:
- Calculate a version number from commit messages
- Update the version in every workspace `package.json`
- Generate CHANGELOG.md
- Create a git tag
- Create a GitHub release with notes

Releasing is **manual**. The release workflow only runs when a human starts it
from the Actions tab. A normal push to `master` never triggers a release.

**npm publishing is disabled.** The `@semantic-release/npm` plugin is not
configured, and all four workspace packages are marked `"private": true`, so
there is no code path that can publish to npm.

## How It Works

### 1. Commit Messages Drive Versioning

When you commit code using conventional commits, the commit type determines the version bump:

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | Minor (1.0.0 → 1.1.0) | New features |
| `fix:` | Patch (1.0.0 → 1.0.1) | Bug fixes |
| `perf:` | Patch (1.0.0 → 1.0.1) | Performance improvements |
| `refactor:` | Patch (1.0.0 → 1.0.1) | Code refactoring |
| `feat!:` or `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) | Breaking changes |
| `docs:`, `style:`, `test:`, `chore:` | No bump | Non-code changes |

### 2. Manual Workflow

No push releases anything. To cut a release:

1. **Push your work** to `master`. CI runs tests, and other workflows may run,
   but nothing releases.
2. **Start the release by hand**: open the Actions tab, select the **Release**
   workflow, and click **Run workflow**. The workflow is triggered only by
   `workflow_dispatch`.
3. **Semantic-release analyzes** the commits since the last release tag.
4. **If a version bump is warranted**, semantic-release:
   - Calculates the new version number
   - Updates `package.json` in all workspace packages
   - Regenerates CHANGELOG.md
   - Creates a git tag (e.g. `v1.2.0`)
   - Commits the changes with `[skip ci]`
   - Pushes the commit and tag to GitHub
   - Creates a GitHub release with the generated notes

If no commit warrants a bump, the run ends without creating a release. That is
not an error.

Note that the `docker.yml` workflow builds an image but does **not** publish it
to any registry, and no workflow triggers on tags.

### 3. Multiple Package Versioning

FossFLOW is a monorepo with multiple packages. All packages are versioned together:
- Root `package.json`
- `packages/fossflow-lib/package.json`
- `packages/fossflow-app/package.json`
- `packages/fossflow-backend/package.json`

The `scripts/update-version.js` script syncs version numbers across all packages.

### The first FossFLOW 2.5D release is NOT cut by semantic-release

`v1.0.0` must be created **by hand**, and this is deliberate.

semantic-release derives the next version from the most recent release tag it
can find on the release branch. This repository's history is inherited from
upstream FossFLOW, which carried its own `v1.x.y` tags. With no tag of our own
as a baseline, semantic-release resolves the previous release incorrectly and
would compute the wrong next version — for example starting from nothing and
proposing `0.1.0` rather than `1.0.0`.

Running it would then also:
- rewrite all four `package.json` files down to that incorrect version
- regenerate `CHANGELOG.md`, overwriting the hand-written `1.0.0` section

So the first release is:

1. Commit the release-prep work to `master`.
2. Create the `v1.0.0` tag manually on that commit.
3. Create the GitHub Release manually.
4. Only from then on, use the **Release** workflow for `1.1.0` and later, with
   `v1.0.0` present as a correct baseline.

## Configuration Files

### `.releaserc.json`

Main semantic-release configuration:
- Defines the release branch (`master` only)
- Configures commit analysis rules
- Sets up changelog generation
- Defines which files to commit
- Points `repositoryUrl` at `https://github.com/framirez1983/fossflow-2.5d.git`
- Does **not** include `@semantic-release/npm`, so npm publishing is off

### `.github/workflows/release.yml`

GitHub Actions workflow that:
- Is triggered only by `workflow_dispatch`, never by a push or by another
  workflow
- Executes `npx semantic-release`
- Uses `GITHUB_TOKEN` for GitHub API access
- Requires no registry credentials; there is no `NPM_TOKEN` and no npm step

### Package privacy

All four workspace packages are `"private": true`:

| Package | Name |
|---|---|
| root | `fossflow-monorepo` |
| `packages/fossflow-lib` | `fossflow` |
| `packages/fossflow-app` | `fossflow-app` |
| `packages/fossflow-backend` | `fossflow-backend` |

There is no `publish:lib` script and no `publishConfig`. The `fossflow` name on
npm belongs to the upstream project, so it is deliberately not claimable from
this repository.

### `scripts/update-version.js`

Node.js script that updates version numbers in all package.json files simultaneously.

## Example Release Flow

In every scenario below, pushing to `master` changes nothing on its own. The
**Release** workflow must be started manually afterwards.

### Scenario: Adding a New Feature

```bash
# Make your changes
git add .
git commit -m "feat(connector): add multi-point connector routing"
git push origin master

# Then: Actions -> Release -> Run workflow
```

**Result:**
- Tests run and pass on the push
- No release happens until the workflow is started by hand
- Once started, semantic-release detects the `feat:` commit
- Version bumps from 1.0.0 → 1.1.0
- CHANGELOG.md updated with a new entry
- Git tag `v1.1.0` created
- GitHub release created

### Scenario: Fixing a Bug

```bash
git commit -m "fix(export): resolve image export quality issue"
git push origin master

# Then: Actions -> Release -> Run workflow
```

**Result:**
- Version bumps from 1.1.0 → 1.1.1
- Patch release created

### Scenario: Breaking Change

```bash
git commit -m "feat(api)!: redesign node creation API

BREAKING CHANGE: createNode() now requires nodeType parameter"
git push origin master

# Then: Actions -> Release -> Run workflow
```

**Result:**
- Version bumps from 1.1.1 → 2.0.0
- Major release created with the breaking change highlighted

### Scenario: Documentation Update

```bash
git commit -m "docs: update installation instructions"
git push origin master
```

**Result:**
- No version bump
- No release created, even if the workflow is started manually
- Changes still merged to `master`

## Manual Testing Locally

You can test semantic-release locally without publishing:

```bash
# Dry run (no changes made)
npx semantic-release --dry-run

# See what version would be released
npx semantic-release --dry-run --no-ci
```

## Troubleshooting

### No Release Created

Check if:
- You actually started the **Release** workflow from the Actions tab; a push
  alone never releases
- Commits follow the conventional commit format
- Commits include version-bumping types (`feat`, `fix`, etc.)
- You're on the `master` branch

### Version Not Updated

Ensure:
- `scripts/update-version.js` has execute permissions
- Script is referenced in `.releaserc.json` under `@semantic-release/exec`

### Computed Version Looks Wrong

If the proposed version is not what you expected, check which release tag
semantic-release used as its baseline. This is the known hazard described in
[the first release section](#the-first-fossflow-25d-release-is-not-cut-by-semantic-release):
an unexpected baseline usually means an inherited upstream tag is being picked
up. Stop the run and tag manually rather than letting it rewrite the manifests.

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/semantic-release/)
- [Keep a Changelog](https://keepachangelog.com/)

## Maintaining This System

### Updating Semantic Release

```bash
npm update semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/exec
```

### Adding New Commit Types

Edit `.releaserc.json` under `releaseRules` to add custom commit type behaviors.

### Changing Release Branch

Edit the `branches` array in `.releaserc.json`. The release workflow itself is
not branch-gated: it is `workflow_dispatch`-only, so the branch is whatever ref
the run is started from.
