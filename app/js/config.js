/* ============================================================
   config.js  --  DET ENESTE du behoever at redigere.
   ------------------------------------------------------------
   appId'erne nedenfor er laest direkte ud af TV'et med
   "vd_applist" -- de er verificerede, ikke gaettede.
   Vil du have flere, saa slaa dem op med tools/list-apps.sh.

   Skriv ES5. Ingen arrow functions, klasser, destructuring
   eller default-params. TV'et koerer Chromium 47.
   ============================================================ */

var TV_CONFIG = {

  title: 'STUE',

  /* Raekker af fliser. Max 5 pr. raekke (328px hver). */
  rows: [

    {
      label: 'Dine apps',
      items: [
        { type: 'app', label: 'TV 2 PLAY',  sub: 'Dit mest brugte', appId: '3202204027042', hue: 358 },
        { type: 'app', label: 'YouTube',    sub: 'Video',          appId: '111299001912',  hue: 0   },
        { type: 'app', label: 'DRTV',       sub: 'Public service', appId: '3201901017732', hue: 205 },
        { type: 'app', label: 'Netflix',    sub: 'Film & serier',  appId: '11101200001',   hue: 356 },
        { type: 'app', label: 'Spotify',    sub: 'Musik',          appId: '3201606009684', hue: 141 }
      ]
    },

    {
      label: 'Streaming',
      items: [
        { type: 'app', label: 'Disney+',     sub: '', appId: '3201901017640', hue: 223 },
        { type: 'app', label: 'Prime Video', sub: '', appId: '3201512006785', hue: 195 },
        { type: 'app', label: 'Viaplay',     sub: '', appId: '11111300404',   hue: 350 },
        { type: 'app', label: 'discovery+',  sub: '', appId: '3201803015944', hue: 218 },
        { type: 'app', label: 'Apple TV',    sub: '', appId: '3202106024097', hue: 0   }
      ]
    },

    {
      label: 'Andet',
      items: [
        { type: 'app',   label: 'Internet', sub: 'Browser',  appId: 'org.tizen.browser', hue: 200 },
        // type:'video' afspiller en direkte URL (mp4 / HLS .m3u8)
        // i appens egen player. Ret url til din server.
        { type: 'video', label: 'Server',   sub: 'Mediebibliotek',
          url: 'http://192.168.1.20:8099/media/test.mp4', hue: 190 },
        { type: 'info',  label: 'Om',       sub: 'Version og info', hue: 220 }
      ]
    }

  ]
};
