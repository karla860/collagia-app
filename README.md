# Collagia · Attributes prototype

Clickable prototype of the Collagia Attributes feature (today's Label Library). Task: SIG-6087.

## Run it

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765. Double-clicking `index.html` works too: the Nike catalogue also ships as `assets/nike/catalog.js`, because browsers block loading JSON from file://.

If you edit `assets/nike/catalog.json`, regenerate the script copy:

```bash
ruby -e 'j=File.read("assets/nike/catalog.json"); File.write("assets/nike/catalog.js", "window.NIKE_CATALOG = " + j.strip + ";\n")'
```

## What's where

| Open | What it is |
| --- | --- |
| http://localhost:8765 | The Oct 19 version. Starts on the study board |
| http://localhost:8765/?tour=1 | Same, with the guided tour (34 short steps). `?tour=27` opens on step 27 |
| http://localhost:8765/#card | Jump straight to a screen: `#board`, `#home`, `#create`, `#card`, `#study`, `#access`, `#settings` |
| http://localhost:8765/karla-oct15.html | Karla's Oct 15/16 version, unchanged, for comparing |
| http://localhost:8765/oct15/import-preview.html | Karla's import preview on its own (her 5 layouts are in the top bar) |

Inside the Oct 19 version, press ⌘K (bottom right) for the guide: every screen in order, plus the tour.

## Files

- `index.html`, `oct17/`: the Oct 19 version. Plain JS, no build step
- `tour/`: the guided tour that sits on top of it
- `oct15/`: Karla's version, untouched
- `karla-oct15.html`: Karla's original `index.html`, so both can run side by side
- `assets/nike/`: 320 real men's shoes from nike.com/gb (names, style codes, prices, photos). Sales numbers are simulated
- `REVIEW.md`: what changed from the Oct 16 version and why

Designs: Figma "🖼️ Collagia - App" › Phase 3: Attributes Portal.
