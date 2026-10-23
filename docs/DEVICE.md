# Verificeret hardware

Hentet direkte fra TV'et via `http://192.168.1.68:8001/api/v2/` — ikke gætteri.

## Mål-TV

| Felt | Værdi |
|---|---|
| `modelName` | **UE55MU7005** |
| `model` (intern) | `17_KANTM_UHD` |
| `name` | [TV] Samsung 7 Series (55) |
| `resolution` | 3840×2160 (4K UHD) |
| `networkType` | wireless |
| `OS` | Tizen (3.0 / Chromium M47) |
| `countryCode` | DK |
| `duid` | `uuid:2c5c925b-8889-430f-b43b-fe8f197b5354` |
| `wifiMac` | `54:BD:79:C8:DA:06` |
| IP | 192.168.1.68 |
| `developerMode` | `0` (skal slås til) |

Bemærk: modellen er **MU**7005, ikke M7005. 2017'ernes `MU`-serie er UHD,
mens `M7` uden U er en anden (buet FHD) produktlinje.

## Panel 4K — hvorfor UI'et stadig er 1920×1080

Samsung kører alle web-apps i **1920×1080 logisk** uanset panelopløsning, og
op-skalerer selv. Kilde: Samsungs *General Specifications* — "Resolution /
Application: 1920x1080 (All models)".

Derfor er 3840×2160 ikke noget vi skal forholde os til i CSS'en. `#root` er
1920×1080, og TV'et klarer resten. Et 4K-panel giver skarpere tekst fordi
op-skalereringen er 2× heltal.

## Åbne porte på TV'et

| Port | Tjeneste |
|---|---|
| 26101 | sdb — **lukket** (kræver developer mode) |
| 8001 | Samsung remote API (`/api/v2/`) |
| 8002 | remote (secure) |
| 9197 | Samsung websocket / DMR |
| 7676 | DLNA (AllShare) |
| 8080 | http |

## Andet Samsung-TV på nettet

`192.168.1.72` — `TQ55S85FAUXXC`, 55" OLED, 2024, Tizen 8 / Chromium M108.
Langt mere kapabel: understøtter moderne JS, CSS-variabler, Grid og flexbox
`gap`. Denne app kører uændret der, men kunne udvides meget længere.
