/* Shared sketch builders: the G, a Gough post, a profile picture, an email signature.
   Everything is drawn from Gough's real G path, real wordmark file and real team photos.
   Nothing here is a new logo. */
(function () {
  'use strict';
  var A = (window.GOUGH_CONFIG && window.GOUGH_CONFIG.ASSETS) || 'assets/';
  var G_PATH = 'M16.6071 21.9887C16.672 21.9668 16.7159 21.9058 16.7159 21.8373V10.0463H10.8555C10.2334 10.0463 9.72915 10.5501 9.72915 11.1716C9.72915 11.7931 10.2334 12.2969 10.8555 12.2969H13.0593V18.6574C13.0593 20.5166 12.439 21.169 10.0556 21.169C5.94197 21.169 4.14632 18.0703 4.14632 11.5467C4.14632 5.121 5.25635 2.21801 9.23943 2.21801C11.6414 2.21801 13.0686 3.11502 13.4983 4.88633C13.5961 5.28951 13.933 5.61026 14.3482 5.61026C14.7903 5.61026 15.1488 5.25219 15.1488 4.81048V1.1844C15.1488 1.11913 15.1091 1.06031 15.0484 1.03637C13.2174 0.314565 11.2908 0 9.20678 0C2.77509 0 0 3.58796 0 11.3836C0 19.5054 2.93833 23.387 9.37002 23.387C11.4644 23.387 13.8768 22.9104 16.6071 21.9887Z';

  function g() {
    return '<span class="gm" aria-hidden="true"><svg viewBox="-0.5 -0.5 17.7 24.4"><path d="' + G_PATH + '" fill="currentColor"/></svg></span>';
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var PHOTOS = {
    sarah: { src: A + 'v6/sarah-browne.jpg', alt: 'Sarah Browne, from Gough\u2019s team page' },
    reiq: { src: A + 'real/ig/posts/qld_reiq.jpg', alt: 'Two of the Queensland team at the REIQ stand' },
    awards: { src: A + 'real/ig/posts/nat_nswawards.jpg', alt: 'NSW award winners post' },
    madilyn: { src: A + 'real/ig/posts/qld_madilyn.jpg', alt: 'Madilyn\u2019s promotion post' },
    allan: { src: A + 'real/ig/posts/vic_allan.jpg', alt: 'Welcome, Allan post' },
    building: { src: A + 'final/web-tile-photo.png', alt: 'The office building photo on Gough\u2019s homepage' },
    georgia: { src: A + 'v6/georgia-barton.jpg', alt: 'Georgia Barton' },
    max: { src: A + 'v6/max-penn.jpg', alt: 'Max Penn' }
  };

  /* palette sets used by the sketches */
  var LOOKS = {
    today:   { band: '#003459', fg: '#FFFFFF', sub: '#ECF0F2', page: '#ECF0F2', link: '#21759B', ink: '#051145' },
    light:   { band: '#ECF0F2', fg: '#051145', sub: '#4E4E4E', page: '#FFFFFF', link: '#21759B', ink: '#051145' },
    evolved: { band: '#04224A', fg: '#FFFFFF', sub: '#D7E6F2', page: '#F3F1EC', link: '#1F86C7', ink: '#04224A' }
  };
  var ACCENTS = {
    gold:  { c: '#E8C860', on: '#051145', name: 'Gold', note: 'from your award badges' },
    teal:  { c: '#2BB3A3', on: '#051145', name: 'Teal', note: 'fresh, still sits with navy' },
    coral: { c: '#F07A5E', on: '#051145', name: 'Coral', note: 'warm, most noticeable' }
  };

  /* o: { look, accent, photo, tag, name, role, sketch, gBig } */
  function post(o) {
    o = o || {};
    var L = LOOKS[o.look || 'today'];
    var acc = o.accent ? ACCENTS[o.accent] : null;
    var ph = PHOTOS[o.photo || 'sarah'];
    var style = '--band:' + L.band + ';--band-fg:' + L.fg + ';--band-sub:' + L.sub + (acc ? ';--acc:' + acc.c + ';--acc-fg:' + acc.on : '');
    return '<div class="post' + (acc ? ' has-acc' : '') + (o.gBig ? ' post-big' : '') + '" style="' + style + '">' +
      '<div class="ph"><img src="' + ph.src + '" alt="' + esc(ph.alt) + '" loading="lazy">' + (o.gBig ? '<span class="gm-big">' + g() + '</span>' : '') +
      (o.sketch ? '<span class="sketch-tag">' + (typeof o.sketch === 'string' ? esc(o.sketch) : 'Sketch, to react to') + '</span>' : '') + '</div>' +
      '<div class="band">' + (acc ? '<i class="accbar"></i>' : '') + g() +
      '<span class="tag">' + esc(o.tag || 'Meet the specialist') + '</span>' +
      '<b class="nm">' + esc(o.name || 'Sarah Browne') + '</b>' +
      '<span class="rl">' + esc(o.role || 'Real Estate, North Shore.') + '</span>' +
      '</div></div>';
  }

  /* o: { bg, fg, size (0-1), city, ring, word } */
  function avatar(o) {
    o = o || {};
    if (o.word) {
      return '<div class="av av-word" style="--bg:' + (o.bg || '#003459') + '"><img src="' + A + 'real/2021-09-logo_white_gough.svg" alt="The Gough Recruitment wordmark"></div>';
    }
    var style = '--bg:' + (o.bg || '#003459') + ';--fg:' + (o.fg || '#FFFFFF') + ';--g:' + Math.round((o.size || 0.44) * 100) + '%' + (o.ring ? ';--acc:' + o.ring : '');
    return '<div class="av' + (o.city ? ' with-city' : '') + '" style="' + style + '">' + g() +
      (o.city ? '<span class="city">' + esc(o.city) + '</span>' : '') + (o.ring ? '<span class="ring"></span>' : '') + '</div>';
  }

  /* o: { look, accent, sketch } */
  function signature(o) {
    o = o || {};
    var L = LOOKS[o.look || 'today'];
    var acc = o.accent ? ACCENTS[o.accent] : null;
    var style = '--bar:' + (acc ? acc.c : L.band) + ';--name:' + L.ink + ';--acc:' + (acc ? acc.c : 'transparent') + ';--acc-text:' + L.link;
    return '<div class="sig" style="' + style + '">' + (o.sketch ? '<span class="sketch-tag" style="left:auto;right:10px">Sketch</span>' : '') +
      '<div class="sav"><img src="' + PHOTOS.georgia.src + '" alt="Georgia Barton" loading="lazy"></div>' +
      '<div><b>Georgia Barton</b><span class="r">Associate Director, Real Estate</span>' +
      '<span class="c">0400 000 000 &middot; <em>goughrecruitment.com.au</em></span></div>' +
      '<div class="logo"><img src="' + A + 'real/2021-09-logo_gough.svg" alt="Gough Recruitment"><i></i></div></div>';
  }

  window.GoughSketch = { g: g, post: post, avatar: avatar, signature: signature, PHOTOS: PHOTOS, LOOKS: LOOKS, ACCENTS: ACCENTS, esc: esc, A: A };
})();
