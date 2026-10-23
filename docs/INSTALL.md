# Installation på UE55M7005

Tizen 3.0, 2017. Apps skal være signeret med et certifikat der indeholder
TV'ets **DUID** — ellers afviser TV'et pakken.

---

## Forberedelse (gælder begge veje)

1. **Sæt fast IP på TV'et** i din router. Ellers skal du gentage alt ved nyt
   DHCP-lease.
2. **Slå developer mode til:** `Smart Hub → Apps` → tryk **`12345`** på
   fjernbetjeningen → *Developer mode* = **On** → indtast **din Mac's IP** i
   *Host PC IP* → **OK**.
3. **Genstart TV'et** (vigtigt — developer mode bider ikke før).
4. Slå "Kendt enhed" / tillad forbindelse når TV'et spørger, og accepter
   forbindelsen på TV-skærmen når `sdb` forbinder.

---

## Vej A — direkte med Tizen Studio

```bash
# 1. Hent Tizen Studio (CLI-only er nok) + "TV Extension"
#    https://developer.tizen.org/development/tizen-studio/download
#    Installerer til ~/tizen-studio

export PATH="$HOME/tizen-studio/tools:$HOME/tizen-studio/tools/ide/bin:$PATH"

# 2. Forbind
sdb connect <TV-IP>:26101
sdb devices                 # dit TV skal stå som "device"
sdb shell 0 getduid         # notér DUID — skal bruges i certifikatet

# 3. Lav et Samsung TV-certifikat
#    Certificate Manager (GUI) -> New -> Samsung -> TV
#    Alle tre trin (author + distributor) skal laves:
#      - Samsung-konto
#      - device ID = TV'ets DUID fra ovenfor

# 4. Pak og signér
cd /Users/larshansen/Developer/samsung_fw
tizen package -t wgt -s <cert-profil-navn> -- app

# 5. Installér og start
tizen install -n app/*.wgt
tizen run -p Home00001.Home
```

Hvis `tizen install` fejler med `install failed[118]`: signaturen er lavet
uden om Tizen Studios Certificate Manager. Det er den fejl der ramte Nuvio
på netop 2017-TVer. Løsningen er at signere i Certificate Manager, ikke med
tredjepartsværktøj.

Logs:
```bash
sdb shell 0 vd_applist
sdb dlog | grep -i -E 'Home00001|WAS|error'
```

---

## Vej B — TizenBrew (fallback)

[TizenBrew](https://github.com/reisxd/TizenBrew) er et shell-app til Samsung
Tizen-TVer der kan loade web-moduler fra GitHub. Det er **bekræftet kørende på
2017 M-serien** (UE55MU6202), også hvor fritstående `.wgt`-install fejlede.

1. Installér TizenBrew via dens installer (bruger `vd_appinstall`).
2. Læg dette projekt i et Git-repo.
3. Tilføj repoet som modul i TizenBrew og peg på `app/index.html`.

Fordelen: moduler er hosted, så du kan opdatere ved bare at pushe. Ulempen:
du rammer stadig Chromium M47, og du er afhængig af et tredjeparts-shell.

Fordi `app/` er helt statisk (ingen serverkode, ingen npm) passer den direkte
ind som modul. Se TizenBrews README for det præcise modulformat.

---

## Efter installation

- **Appen kan ikke auto-starte.** Du åbner den fra Smart Hub. Flyt den op
  som første ikon.
- **Developer mode-certifikater kan udløbe.** Bliver appen fjernet eller
  holder op med at starte efter en måned, geninstallér.
- **Slå Samsung-annoncering fra** ved at blokere Samsung-domæner i
  router/Pi-hole. Det gør Smart Hub mærkbart hurtigere, fordi fliserne ikke
  længere henter promoveret indhold.

## Fejlfinding

| Symptom | Årsag |
|---|---|
| `sdb devices` tom | developer mode ikke aktivt, eller forkert Host PC IP på TV |
| `install failed[118]` | certifikat ikke lavet i Certificate Manager |
| App starter, hvid skærm | ES6+ i JS — kør `./tools/pack.sh` og læs advarslen |
| `TypeError: X is not a function` | transpileret bibliotek der bruger nyere JS |
| Piletaster gør intet | `hwkey-event="enable"` mangler i `config.xml` |
| Fliserne starter ikke apps | `application.launch` blokeret — se `docs/CONSTRAINTS.md` |
