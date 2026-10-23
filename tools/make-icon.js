#!/usr/bin/env node
/* Genererer app/icon.png (512x512) uden afhaengigheder.
   Kør: node tools/make-icon.js                                      */

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const S = 512;
const buf = Buffer.alloc(S * S * 4);

function put(x, y, r, g, b, a) {
  const i = (y * S + x) * 4;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
}

/* Signed distance til afrundet rektangel (negativ = indeni). */
function sdRoundRect(px, py, cx, cy, hw, hh, rad) {
  const qx = Math.abs(px - cx) - (hw - rad);
  const qy = Math.abs(py - cy) - (hh - rad);
  const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
  return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(qx, qy), 0) - rad;
}

/* Blød kant over ~1.5px for antialiasing. */
function cover(d) { return Math.max(0, Math.min(1, 0.5 - d / 1.5)); }

function blend(x, y, r, g, b, cov) {
  if (cov <= 0) return;
  const i = (y * S + x) * 4;
  const dstA = buf[i + 3] / 255;
  const outA = cov + dstA * (1 - cov);
  if (outA <= 0) return;
  buf[i]     = Math.round((r * cov + buf[i]     * dstA * (1 - cov)) / outA);
  buf[i + 1] = Math.round((g * cov + buf[i + 1] * dstA * (1 - cov)) / outA);
  buf[i + 2] = Math.round((b * cov + buf[i + 2] * dstA * (1 - cov)) / outA);
  buf[i + 3] = Math.round(outA * 255);
}

const ACCENT = [94, 224, 122];
const TILE_ON = [26, 32, 40];
const TILE_OFF = [22, 27, 34];

/* 2x2 flise-grid, samme sprog som UI'et. */
const T = 168, GAP = 32;
const start = (S - (T * 2 + GAP)) / 2;
const centers = [
  [start + T / 2,             start + T / 2],             /* 0: fremhævet */
  [start + T + GAP + T / 2,   start + T / 2],
  [start + T / 2,             start + T + GAP + T / 2],
  [start + T + GAP + T / 2,   start + T + GAP + T / 2]
];

for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    /* Baggrund: afrundet kvadrat med lodret gradient */
    const d = sdRoundRect(x, y, S / 2, S / 2, S / 2, S / 2, 104);
    const c = cover(d);
    if (c <= 0) continue;

    const t = y / S;
    const base = [
      Math.round(14 + 8 * (1 - t)),
      Math.round(18 + 10 * (1 - t)),
      Math.round(23 + 12 * (1 - t))
    ];
    blend(x, y, base[0], base[1], base[2], c);

    /* Fliser ovenpå */
    for (let k = 0; k < 4; k++) {
      const cd = sdRoundRect(x, y, centers[k][0], centers[k][1], T / 2, T / 2, 34);
      const cc = cover(cd) * c;
      if (cc <= 0) continue;
      const col = (k === 0) ? ACCENT : (k === 3 ? TILE_OFF : TILE_ON);
      blend(x, y, col[0], col[1], col[2], cc);
    }
  }
}

/* ---- Minimal PNG-encoder ---- */

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(b) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

const raw = Buffer.alloc(S * (1 + S * 4));
for (let y = 0; y < S; y++) {
  raw[y * (1 + S * 4)] = 0;
  buf.copy(raw, y * (1 + S * 4) + 1, y * S * 4, (y + 1) * S * 4);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0))
]);

const out = path.join(__dirname, '..', 'app', 'icon.png');
fs.writeFileSync(out, png);
console.log('skrev ' + out + ' (' + png.length + ' bytes)');
