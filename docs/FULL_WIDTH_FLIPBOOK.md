# Flipbook: full-width layout and turn rules

Scope: `src/world.js` (book, page turn, figure plate), `src/app.js` (panel-driven `wide`).

## Layout rules (projector / board view)
1. The open spread fills the stage width: `boardFit().wideFit = clamp(0.96 × visibleWidth / 7.35, WIDE_MIN, WIDE_MAX)`.
2. `WIDE_MIN = 1.14`, `WIDE_MAX = 1.35`. Raising `WIDE_MAX` fills more width but stretches print text horizontally; keep it ≤ 1.40.
3. Board view applies `wideFit` every frame, so panel toggles cannot leave a narrow book. Other shots keep the value set by `applyPanels`.
4. Dock panels already span the full viewport width (`.dock-row`, flex 1 each); do not add `max-width` to them.

## Page-turn rules
1. The turning leaf has no line-art placeholder. The figure zone is a plain `#eaf0f6` plate, the same colour as the live 3D clear colour.
2. The live 3D figure is hidden during a turn and fades in (`opacity` 0 → 1 at ×4/s) once the turn commits.
3. Front and back faces are offset along the sheet normal (`+LAYER` / `−LAYER`). The printed bow always bulges upward.
4. Back-face UVs are pre-mirrored, so the reverse of the leaf reads exactly like the settled left page.

## Verify
- `python3 build.py`, then open `index.html`, load a chapter in book view, and press → (ArrowRight).
- Mid-turn: no grid or line drawing on the leaf's figure zone.
- Resting: the spread spans about 90% of the window width at 1440×860.
