/* ============================================================
   main.js  --  Tastatur/fjernbetjening, skalering, actions.
   ============================================================ */

var App = (function () {

  var grid, playerEl, videoEl, playerMsg, inPlayer = false;

  /* ---- Tizen 3.0 keycodes ---- */
  var KEY = {
    LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
    ENTER: 13,
    BACK: 10009,     /* Tizen TV return */
    ESC: 27,
    RED: 403, GREEN: 404, YELLOW: 405, BLUE: 406,
    PLAY: 415, PAUSE: 19, STOP: 413
  };

  /* ---- Skalér 1920x1080 til faktisk viewport ----
     Gør at du kan udvikle i en vilkaarlig browservindue
     og faa praecis samme layout som paa TV'et. */
  function fit() {
    var root = document.getElementById('root');
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    root.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }

  /* ---- Start en anden app ---- */
  function launchApp(appId) {
    if (!appId) return;
    var t = window.tizen;
    if (!t || !t.application || !t.application.launch) {
      UI.toast('Kan ikke starte apps udenfor TV: ' + appId);
      return;
    }
    try {
      t.application.launch(appId, null, function (err) {
        UI.toast('Kunne ikke aabne: ' + (err && err.message ? err.message : appId));
      });
    } catch (e) {
      UI.toast('Fejl: ' + e.message);
    }
  }

  /* ---- Player ---- */
  function openPlayer(url) {
    if (!url) return;
    inPlayer = true;
    document.getElementById('home').classList.add('hidden');
    playerEl.classList.remove('hidden');
    playerMsg.textContent = url;
    videoEl.src = url;
    var p = videoEl.play();
    if (p && p.catch) {
      p.catch(function () {
        playerMsg.textContent = 'Afspilning afvist. Kontrollér URL og netvaerk.\n' + url;
      });
    }
  }

  function closePlayer() {
    inPlayer = false;
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.load();
    playerEl.classList.add('hidden');
    document.getElementById('home').classList.remove('hidden');
  }

  /* ---- Aktiver fokuseret flise ---- */
  function activate() {
    var item = grid.current();
    if (!item) return;

    if (item.type === 'app') {
      launchApp(item.appId);
    } else if (item.type === 'video') {
      openPlayer(item.url);
    } else if (item.type === 'url') {
      openPlayer(item.url);
    } else {
      UI.toast(item.label + ' -- ikke koblet op endnu');
    }
  }

  function onKey(e) {
    var k = e.keyCode;
    var handled = true;

    if (inPlayer) {
      if (k === KEY.BACK || k === KEY.ESC) {
        closePlayer();
      } else if (k === KEY.PLAY) {
        videoEl.play();
      } else if (k === KEY.PAUSE) {
        videoEl.pause();
      } else {
        handled = false;
      }
      if (handled) e.preventDefault();
      return;
    }

    var prev = grid.current();

    switch (k) {
      case KEY.LEFT:  grid.move(0, -1); break;
      case KEY.RIGHT: grid.move(0, 1);  break;
      case KEY.UP:    grid.move(-1, 0); break;
      case KEY.DOWN:  grid.move(1, 0);  break;
      case KEY.ENTER:
        activate();
        e.preventDefault();
        return;
      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
      UI.applyFocus(grid, prev);
    }
  }

  function start() {
    grid = UI.init(TV_CONFIG);

    playerEl = document.getElementById('player');
    videoEl = document.getElementById('video');
    playerMsg = document.getElementById('player-msg');

    /* Registrér ekstra fjernbetjeningsknapper hvis muligt. */
    try {
      if (window.tizen && tizen.tvinputdevice) {
        tizen.tvinputdevice.registerKey('MediaPlay');
        tizen.tvinputdevice.registerKey('MediaPause');
      }
    } catch (e) { /* ikke kritisk */ }

    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('keydown', onKey);

    /* Start med fokus paa förste flise. */
    var first = grid.current();
    if (first && first.el) first.el.classList.add('focused');

    /* Fyld skaermen med én frame, saa vi ikke viser hvid flash. */
    document.body.classList.add('ready');
  }

  return { start: start };
})();

window.onload = function () { App.start(); };
