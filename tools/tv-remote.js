#!/usr/bin/env node
/* ============================================================
   tv-remote.js  --  send fjernbetjeningstaster til Samsung-TV
   over websocket. Bruges naar fjernbetjeningen mangler taltaster.

   TV'et viser en "Tillad"-dialog foerste gang. Accepter den
   paa skaermen.

   Brug:
     node tools/tv-remote.js probe               # test forbindelse
     node tools/tv-remote.js keys KEY_1 KEY_2    # send taster
     node tools/tv-remote.js digits 12345        # send cifre
   ============================================================ */

const TV_IP = process.env.TV_IP || '192.168.1.68';
const NAME = 'LarsMac';
const TOKEN_FILE = require('path').join(__dirname, '.tv-token');

function appName() {
  return Buffer.from(NAME, 'utf8').toString('base64');
}

function connect() {
  const name = appName();
  let token = '';
  try { token = require('fs').readFileSync(TOKEN_FILE, 'utf8').trim(); } catch (e) {}

  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('timeout -- TV\'et svarede ikke. Taendt? Samme net? "Tillad" trykket?'));
    }, 30000);

    function attempt(scheme) {
      let url = `${scheme}://${TV_IP}:8001/api/v2/channels/samsung.remote.control?name=${name}`;
      if (token) url += `&token=${token}`;
      console.log('  proever ' + scheme + '://…');

      let ws;
      try { ws = new WebSocket(url); }
      catch (e) { return attempt(again(scheme)); }

      ws.addEventListener('message', (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch (e) { return; }
        if (msg.event === 'ms.channel.connect') {
          const data = (msg.data || {});
          if (data.token) {
            try { require('fs').writeFileSync(TOKEN_FILE, data.token); } catch (e) {}
          }
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(ws);
        }
      });

      ws.addEventListener('error', () => {
        if (settled) return;
        const next = again(scheme);
        if (next) attempt(next);
        else {
          settled = true;
          clearTimeout(timer);
          reject(new Error('baade wss:// og ws:// fejlede'));
        }
      });
    }

    /* wss:// virker paa 2016+; ws:// er fallback. */
    function again(scheme) {
      return scheme === 'wss' ? 'ws' : null;
    }

    attempt('wss');
  });
}

function sendKey(ws, key) {
  const payload = JSON.stringify({
    method: 'ms.remote.control',
    params: {
      Cmd: 'Click',
      DataOfCmd: key,
      Option: 'false',
      TypeOfRemote: 'SendRemoteKey'
    }
  });
  ws.send(payload);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const [mode, ...rest] = process.argv.slice(2);
  if (!mode) { console.error('brug: probe | keys <K...> | digits <12345>'); process.exit(1); }

  let keys = [];
  if (mode === 'keys') keys = rest;
  else if (mode === 'digits') keys = rest.join('').split('').map((d) => 'KEY_' + d);

  console.log(`→ forbinder til ${TV_IP} …`);
  if (keys.length) console.log('  (accepter "Tillad" paa TV-skærmen hvis den spoerger)');

  const ws = await connect();
  console.log('✓ forbundet');

  if (mode === 'probe') { ws.close(); return; }

  for (const k of keys) {
    console.log('  sender ' + k);
    sendKey(ws, k);
    await sleep(1300);
  }
  await sleep(600);
  ws.close();
  console.log('✓ færdig');
}

main().catch((e) => { console.error('✗ ' + e.message); process.exit(1); });
