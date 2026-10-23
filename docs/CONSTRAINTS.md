# Tizen 3.0 / Chromium M47 — hvad du må og ikke må

Dit TV er en 2017-model. Samsung har låst platformen til **Tizen 3.0 med
Chromium M47** (december 2015). Det er ikke et valg — det er hvad der ligger i
firmware, og det kan ikke opgraderes. Alt nedenfor følger af det.

## CSS — undgå disse

| Funktion | Kræver | Status |
|---|---|---|
| `var(--x)` CSS-variabler | Chrome 49 | **nej** |
| `gap` / `row-gap` i flexbox | Chrome 84 | **nej** |
| CSS Grid | Chrome 57 | **nej** |
| `backdrop-filter` | Chrome 76 | **nej** |
| `:focus-visible` | Chrome 86 | **nej** |
| `position: sticky` | Chrome 56 | **nej** |
| `aspect-ratio` | Chrome 88 | **nej** |
| `min()` / `max()` / `clamp()` | Chrome 79 | **nej** |
| flexbox, `transform`, `transition`, `hsl()`, gradient, `border-radius` | — | **ja** |
| `calc()` (simpel) | Chrome 26 | **ja** |

Derfor bruger `app.css` `display: flex` + `margin-right` i stedet for `gap`,
og accentfarven er hardcodet ét sted frem for en CSS-variabel.

## JS — skriv ES5

M47 har `Promise`, `fetch`, `Map`/`Set`, `Object.assign`, `Array.from` og
`requestAnimationFrame`. Den har **ikke**:

- `class`
- `=>` arrow functions (delvist, men ikke til at regne med)
- destructuring `const {a} = b`
- default-parametre `function f(x = 1)`
- spread `...` på objekter
- `async`/`await`
- `IntersectionObserver`

`./tools/pack.sh` advarer hvis den finder noget af det i `app/js/`.

**Vigtigst:** hvis du tilføjer et bibliotek, skal det være transpileret til
ES5. Et moderne bundlet framework fejler med `TypeError: X is not a function`
allerede inden UI'et rendres — præcis som det skete for Nuvio på en
UE55MU6202. Det er derfor dette projekt har nul afhængigheder.

## Performance på denne SoC

2017-M-serien har en svag ARMv7 SoC. Det der faktisk koster:

- `box-shadow` med blur → CPU-rasterisering. Brug `border` + `background`.
- `filter: blur()` → meget dyrt. Ingen steder.
- Re-layout under tastetryk → derfor er navigation en ren tal-model
  (`focus.js`) der kun rører 2 DOM-noder pr. flytning.
- Store billeder → dette UI har ingen billeder, kun tekst og `hsl()`-farver.

## Tastatur / fjernbetjening

| Taste | keyCode |
|---|---|
| Venstre / Op / Højre / Ned | 37 / 38 / 39 / 40 |
| OK (Enter) | 13 |
| RETUR (Tizen back) | 10009 |
| Rød / Grøn / Gul / Blå | 403 / 404 / 405 / 406 |

Medieknapper skal registreres eksplicit:
`tizen.tvinputdevice.registerKey('MediaPlay')`.

## Hvad der ikke kan lade sig gøre

- **Erstatte Smart Hub.** Der findes ingen officiel vej. En app kan ikke
  registreres som boot-launcher. (`quite-tizen`-projektet gør det med en
  native NUI-app og omdirigerede Home-taster — men native Tizen .NET findes
  ikke på Tizen 3.0.)
- **Auto-start ved tænding.** "Prelaunch" findes, men er forbeholdt apps
  Samsung selv godkender.
- **Roote / flashe.** Ingen kendt metode for M/MU-serien. SamyGO's egen
  konklusion: *"No root is available!"*
- **Lave en hosted app** (der loader kode fra en webserver) — Samsung tillader
  det ikke, og Tizen-API'erne er utilgængelige.

## Usikkert — skal testes på dit TV

`tizen.application.launch(appId)` har **public** privilege, så det er tilladt
at kalde. Om Samsung blokerer app-til-app-start for tredjeparts-apps på
Tizen 3.0 er ikke verificeret. `main.js` fanger fejlen og viser en toast, så
du finder ud af det med det samme. Hvis det ikke virker, er fliserne stadig
brugbare som bogmærker/medieafspiller.
