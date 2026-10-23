# Home — custom UI til Samsung UE55MU7005

En hurtig, minimal hjemmeskærm-app til dit TV (2017, 4K UHD, Tizen 3.0), bygget
til at blive udvidet. Ingen frameworks, ingen build-step, ingen afhængigheder.

Verificeret hardware og netværksdetaljer: `docs/DEVICE.md`.

```
app/            <-- det der ender på TV'et
  config.js     <-- DET ENESTE du behøver at redigere
  index.html
  css/app.css
  js/focus.js   navigation
  js/ui.js      DOM-byg
  js/main.js    taster, actions, skalering
  config.xml    Tizen widget-manifest
  icon.png      genereret
tools/
  dev.sh        lokal server
  pack.sh       .wgt-pakning + ES5-check
  list-apps.sh  find rigtige app-ID'er på dit TV
  make-icon.js  ikon-generator
```

## Kom i gang (2 minutter)

```bash
./tools/dev.sh          # → http://localhost:8099
```

Brug piletaster + Enter + Esc i browseren. Det er **præcis samme kode** der
kører på TV'et — layoutet skaleres fra 1920×1080 med `transform: scale()`, så
du ser det samme i et vilkårligt browservindue. Ingen TV nødvendig under
udvikling.

## Tilpas den

Alt indhold ligger i `app/js/config.js`:

```js
{ type: 'app',   label: 'Netflix', appId: '11101200001', hue: 356 }
{ type: 'video', label: 'Server',  url: 'http://…/film.mp4', hue: 190 }
{ type: 'info',  label: 'Om' }
```

| felt    | betydning                                        |
|---------|--------------------------------------------------|
| `type`  | `app` starter en TV-app · `video` afspiller URL · `info` viser besked |
| `label` | stor tekst                                       |
| `sub`   | lille tekst under                                |
| `hue`   | 0–360, farven på badge-firkanten                 |
| `appId` | kun for `app` — se nedenfor                      |
| `url`   | kun for `video` (mp4 eller HLS `.m3u8`)          |

Farvetema: søg efter `#5ee07a` i `app/css/app.css` — det er det ene sted.
Fliser er 328×176 px, 5 pr. række. Skal du have 6, ændr bredden i `.tile`.

### appId — gæt ikke

ID'erne i `config.js` er **eksempler**. Find de rigtige på dit TV:

```bash
~/tizen-studio/tools/sdb connect <TV-IP>:26101
./tools/list-apps.sh
```

## Installér på TV'et

To veje. Læs `docs/INSTALL.md` — den korte version:

**A. Direkte (kræver Tizen Studio + Samsung-certifikat).** En `.wgt` skal
signeres med et Samsung TV-certifikat der indeholder TV'ets DUID. Signaturen
skal laves i Tizen Studios Certificate Manager — tredjeparts-signering fejler
med `install failed[118]` på netop denne TV-generation.

**B. TizenBrew.** Et hjemmeskærm-app-skal der kan loade vilkårlige
web-moduler, og som er bekræftet kørende på 2017 M-serien (UE55MU6202).
God fallback hvis signaturen driller.

## Hvad dette ikke er

Det er **ikke** custom firmware, og det **erstatter ikke** Smart Hub. Du kan
ikke boote ind i den, og den kan ikke starte automatisk. Du åbner den fra
Smart Hub som enhver anden app — til gengæld er den ~30 KB mod Smart Hubs
flere hundrede, og du bestemmer selv hvad der er på skærmen.

Se `docs/CONSTRAINTS.md` for hvad Tizen 3.0 / Chromium 47 kan og ikke kan.
