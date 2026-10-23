/* ============================================================
   ui.js  --  Bygger DOM én gang ud fra TV_CONFIG og holder
   styr paa fokus-klassen. Ingen re-render under navigation.
   ============================================================ */

var UI = (function () {

  var root, clockEl, toastEl, toastTimer;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* Bygger alle fliser. Returnerer rows som item-arrays. */
  function build(stage, config) {
    var model = [];
    var i, j;

    for (i = 0; i < config.rows.length; i++) {
      var spec = config.rows[i];
      var rowEl = el('div', 'row');

      var head = el('div', 'row-head');
      head.appendChild(el('span', 'row-label', spec.label));
      rowEl.appendChild(head);

      var track = el('div', 'row-track');
      var items = [];

      for (j = 0; j < spec.items.length; j++) {
        var item = spec.items[j];
        var tile = el('div', 'tile');

        var badge = el('div', 'tile-badge');
        badge.style.background = 'hsl(' + (item.hue == null ? 220 : item.hue) + ',58%,42%)';
        badge.appendChild(el('span', 'tile-initial', item.label.charAt(0)));
        tile.appendChild(badge);

        var meta = el('div', 'tile-meta');
        meta.appendChild(el('div', 'tile-label', item.label));
        if (item.sub) meta.appendChild(el('div', 'tile-sub', item.sub));
        tile.appendChild(meta);

        item.el = tile;
        items.push(item);
        track.appendChild(tile);
      }

      rowEl.appendChild(track);
      stage.appendChild(rowEl);
      model.push(items);
    }

    return model;
  }

  /* Saet fokus-klasse. Kun 2 DOM-beroeringer pr. flyt. */
  function applyFocus(grid, prev) {
    if (prev && prev.el) prev.el.classList.remove('focused');
    var cur = grid.current();
    if (cur && cur.el) cur.el.classList.add('focused');
  }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.add('hidden');
    }, 2600);
  }

  function tickClock() {
    if (!clockEl) return;
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    clockEl.textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function init(config) {
    root = document.getElementById('root');
    clockEl = document.getElementById('clock');
    toastEl = document.getElementById('toast');

    document.getElementById('title').textContent = config.title;

    var stage = document.getElementById('stage');
    var model = build(stage, config);

    tickClock();
    setInterval(tickClock, 10000);

    return new Grid(model);
  }

  return { init: init, applyFocus: applyFocus, toast: toast };
})();
