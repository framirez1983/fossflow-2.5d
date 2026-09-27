# FossFLOW 2.5D

> Isometric diagramming in the browser. An independent continuation of [FossFLOW](https://github.com/agisota/FossFLOW).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

FossFLOW 2.5D is a privacy-first, open-source Progressive Web App for drawing
isometric diagrams — network topologies, floor plans, data-centre layouts and
technical schematics. It runs entirely in your browser and works offline. Your
diagrams stay on your machine unless you explicitly turn on Server Storage.

## Highlights

- **Rotatable isometric views** — four orientations, with a compass that shows
  where geographic North lies relative to the rotated scene.
- **Multi-View** — several named views per document, switchable from the bottom bar.
- **Portable `.fossflow` files** — a self-contained project format that keeps a
  diagram, its icons and its colours in one file.
- **Server Storage** — optional filesystem-backed saving, with HTTP basic auth
  and rate limiting, for people who want their diagrams across devices.
- **Icon Library** — a reusable set of custom icons kept on your server, copied
  into a document when used so shared files stay self-contained.
- **Export** — PNG and SVG that match what you see in the editor.
- **Rectangle Lock** — freeze a grouping rectangle's position and size while
  keeping it selectable and unlockable.
- **Offline PWA** — installable, and usable with no network at all.

## Contents

- [Install](#install)
- [Concepts](#concepts)
- [Files and storage](#files-and-storage)
- [Export](#export)
- [Localization](#localization)
- [Development](#development)
- [Project heritage and attribution](#project-heritage-and-attribution)
- [Contributing](#contributing)
- [License](#license)

## Install

### Docker (recommended)

Server Storage is enabled by default and diagrams are written to `./diagrams`
on the host.

```bash
git clone https://github.com/framirez1983/fossflow-2.5d.git
cd fossflow-2.5d
docker compose up
```

Then open <http://localhost>.

To disable server storage and keep everything in the browser:

```bash
ENABLE_SERVER_STORAGE=false docker compose up
```

#### HTTP basic authentication (optional)

Set both variables to protect the instance:

```bash
HTTP_AUTH_USER=admin HTTP_AUTH_PASSWORD=secret docker compose up
```

> If either variable is empty, the app is reachable without a login.

### Local development

Requires Node `>=24`.

```bash
git clone https://github.com/framirez1983/fossflow-2.5d.git
cd fossflow-2.5d
npm ci
npm run build:lib     # required first time
npm run build:app
npm run dev
```

Open <http://localhost:3000>.

## Concepts

### Views

A document can hold several named **views**. Each view has its own items,
connectors, text boxes and rectangles, and you switch between them from the
bottom bar. Use views to keep, for example, a physical layout and a logical
topology in one file.

### Rotatable isometric views

The view orientation (NE, NW, SE, SW) is stored per view. The compass in the
lower-left control bar shows where North actually points for the current
orientation — it is derived from the isometric projection, not a decorative
label.

Panning is convenient from the cursor: dragging empty canvas pans and returns
to Select on release. Choosing the Hand tool explicitly keeps the editor in Pan
until you switch back.

### Rectangles

Rectangles are grouping and area surfaces. **Lock position** freezes a
rectangle's geometry while leaving it visible, selectable and unlockable, so it
cannot be moved or resized by accident. Objects still place and interact on top
of a locked rectangle, and other objects above it keep interaction priority.

### Mouse model

| Action | Result |
| --- | --- |
| Left click | Select, manipulate, deselect |
| Right click | Contextual creation menu (Add Node, Add Rectangle) |
| Drag empty canvas | Transient pan, returns to Select |
| Left drag on an object | Move the object |

### Icon Library

Custom icons can be kept in a reusable library on your server and reused across
diagrams. Using an icon copies it into the current document, so a shared
`.fossflow` file never depends on the server. Uploads are sanitized and limited
to 1 MiB, and icons that reference external resources are rejected.

## Files and storage

FossFLOW can keep your work in three places:

- **`.fossflow` files** — the canonical editable project format. A single
  self-contained file holding the diagram, its icons and its colours.
- **Server Storage** — an optional backend that writes diagrams to disk, so you
  can open them from another device. Off unless you enable it.
- **Session storage** — the browser-only fallback, cleared when the tab closes.

Legacy `.json` exports from earlier FossFLOW versions are still accepted on
import and upload.

## Export

Export to PNG or SVG, with options for the grid, background colour, expanded
labels, label background opacity and export scale. Exports match the editor,
including for rotated views.

## Localization

The interface is available in 12 languages: Bengali, English, Spanish, French,
Hindi, Indonesian, Italian, Polish, Portuguese, Russian, Turkish and Simplified
Chinese. The language can be changed from the toolbar.

## Development

This is an npm workspaces monorepo:

| Package | Description |
| --- | --- |
| `packages/fossflow-lib` | Publishable `fossflow` React library (Rslib) |
| `packages/fossflow-app` | The PWA itself (RSBuild) |
| `packages/fossflow-backend` | Optional storage backend (plain Node, no build) |

```bash
npm run dev            # app dev server
npm run dev:lib        # library watch mode
npm run dev:backend    # backend, for filesystem storage

npm run build          # build:lib then build:app
npm run build:lib
npm run build:app

npm test               # unit tests
npm run lint           # TypeScript --noEmit check
```

`npm run build` must build the library before the app, because the app consumes
the local `fossflow` workspace package. See [AGENTS.md](AGENTS.md) for the
finer architectural notes and [FOSSFLOW_ENCYCLOPEDIA.md](FOSSFLOW_ENCYCLOPEDIA.md)
for a broader tour of the codebase.

## Project heritage and attribution

FossFLOW 2.5D is an **independent continuation** of the FossFLOW project. It
builds directly on the work of others:

- **Isoflow**, by [Mark Mankarious](https://github.com/markmanx/isoflow) — the
  isometric diagramming library this project is built on. The `fossflow` library
  in this repository is a fork of it, and the original MIT copyright notice is
  retained verbatim in [LICENSE](LICENSE).
- **FossFLOW**, by [Stan Smith](https://github.com/agisota/FossFLOW) — the
  Progressive Web App that this project continues, including the bulk of the
  code and the history recorded in [CHANGELOG.md](CHANGELOG.md) below the
  `1.0.0` entry.

We are grateful to both projects and to everyone who contributed to them. FossFLOW
2.5D is released under the same MIT licence as its predecessors.

This project is **not affiliated with, nor endorsed by**, the original
maintainers. Please report FossFLOW 2.5D-specific issues here; issues belonging
to the original FossFLOW or Isoflow projects should go to those projects.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for
guidelines, the commit convention, and the development workflow.

## License

MIT. See [LICENSE](LICENSE).

The MIT copyright notice for the original Isoflow work by Mark Mankarious is
preserved unchanged.
