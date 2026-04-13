# 12 — Release-Prozess

Wie man eine neue Version von Kodo Forge veroeffentlicht.

## TL;DR

```bash
cd platform
npm run release       # bump patch + commit + tag + push
```

GitHub Actions picked den Tag `v*` automatisch auf, baut alle 5 Binaries und
erstellt einen Draft-Release auf GitHub. Danach: Release-Notes pruefen und
"Publish" druecken.

## Versionierung

SemVer nach `platform/package.json`.

| Bump-Typ | Kommando | Wann |
|----------|----------|------|
| Patch (1.0.4 → 1.0.5) | `npm run release` | Bugfixes, kleine Inhalts-Updates |
| Minor (1.0.x → 1.1.0) | `npm run release:minor` | Neue Lektionen, neue Features |
| Major (1.x.x → 2.0.0) | `npm run release:major` | Breaking Changes (Bundle-Format, State-Schema) |

Alle drei Varianten rufen `scripts/release.ts` auf und tun dasselbe:

1. **Working tree check** — bricht ab wenn uncommittete Aenderungen vorhanden sind
2. **Version bumpen** — in `package.json` UND `package-lock.json`
3. **Tag-Check** — bricht ab wenn Tag bereits existiert
4. **Commit** — "Release vX.Y.Z" (wird direkt mit `git commit` gemacht, nicht ueber `npm version`, weil npm version auf manchen Windows-Setups die Git-Ops ueberspringt)
5. **Tag** — `vX.Y.Z`
6. **Push** — `git push origin HEAD` + `git push origin vX.Y.Z`

**Warum nicht `npm version patch`?** Auf manchen Windows-Setups (hier passiert) macht `npm version` nur den File-Bump und ueberspringt Commit+Tag. Der eigene Script umgeht das.

## Was automatisch passiert

Der Push eines `v*`-Tags triggert `.github/workflows/release.yml`:

1. Checkout + Bun Setup
2. `npm install` in `platform/`
3. `bun run build:win` → `platform/dist/kodo-forge.exe`
4. `bun run build:mac` → `kodo-forge-macos-arm64`
5. `bun run build:mac-intel` → `kodo-forge-macos-x64`
6. `bun run build:linux` → `kodo-forge-linux-x64`
7. `bun run build:linux-arm64` → `kodo-forge-linux-arm64`
8. Draft-Release erstellt mit allen 5 Binaries angehaengt

Jeder Build packt vorher via `prebuild:*` Hook die Kurse in
`platform/src/generated/courses-bundle.bin` und embeddet sie in das Binary.

## Vor dem Release — Checkliste

- [ ] `cd platform && npm start` — TUI startet sauber im Dev-Modus
- [ ] `npm run pack` laeuft ohne Fehler (Kurs-Bundle wird korrekt gepackt)
- [ ] `npm run build:win` lokal getestet (optional, der Workflow tut es ohnehin)
- [ ] Keine uncommitteten Aenderungen — `git status` sauber
- [ ] Auf `master` und up-to-date mit `origin/master`

## Nach dem Release — Checkliste

- [ ] GitHub Actions Run gruen: https://github.com/lia-xim/Kodo-Forge-TUI-for-learning-Coding/actions
- [ ] Draft-Release hat alle 5 Binaries angehaengt
- [ ] Release-Notes gepruefen und ggf. editiert (Auto-generated aus Commits)
- [ ] "Publish release" gedrueckt
- [ ] Smoke-Test: Eine Binary runterladen und starten

## Lokaler Build (ohne Tag-Push)

Falls du Binaries nur lokal bauen willst ohne Release auszuloesen:

```bash
cd platform
npm run pack              # (optional — wird via prebuild-Hook automatisch gemacht)
npm run build:win         # einzelnes Target
npm run build:all         # alle 5 Targets
```

Outputs landen in `platform/dist/`.

## Troubleshooting

**Tag wurde gepusht aber kein Workflow-Run:**
Tag muss mit `v` beginnen (z.B. `v1.0.3`). Der `release`-Script macht das automatisch.

**Workflow failed mit "file not found":**
Dateinamen in `release.yml` muessen zu den `build:*` Outputs passen. Siehe
`platform/package.json` scripts section.

**"bundle-manifest.ts not found" im Build:**
`npm run pack` wurde nicht ausgefuehrt. Der `prebuild:*` Hook sollte das tun —
falls er failt, manuell `tsx scripts/pack-courses.ts` laufen lassen.

**Version bump rueckgaengig machen:**
```bash
git tag -d v1.0.5                    # lokalen Tag loeschen
git push origin :refs/tags/v1.0.5    # Remote-Tag loeschen
git reset --hard HEAD~1              # Bump-Commit zurueck (VORSICHT: zerstoert Work)
```

**Tag fehlt obwohl Version gebumpt wurde (alter `npm version`-Bug):**
Frueher stand im `release`-Script `npm version patch`. Auf manchen Windows-Setups
hat das nur die Files bearbeitet aber nicht committet/getaggt. Fix: per Hand
Tag setzen und pushen.
```bash
git tag v1.0.5 HEAD
git push origin v1.0.5
```
Der neue `scripts/release.ts` hat das Problem nicht mehr.

## Referenzen

- `.github/workflows/release.yml` — Workflow-Definition
- `platform/package.json` — Build-Scripts, `release` Script
- `platform/scripts/pack-courses.ts` — Kurs-Bundle-Packer
- `platform/README.md` — User-facing Install-Dokumentation
