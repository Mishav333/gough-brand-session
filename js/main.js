/* Gough brand session page: assets, reveal, progress rail, and the 10-minute click-through. */
(function () {
  'use strict';
  var CFG = window.GOUGH_CONFIG || {};
  var S = window.GoughSketch;
  var esc = S.esc;
  var A = S.A;
  var STORE = 'gough-brand-session-2026-10-v4';

  /* ---------- assets, staging, deadline ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-a]'), function (el) { el.src = A + el.getAttribute('data-a'); });
  var stg = document.getElementById('staging');
  if (stg && CFG.STAGING) stg.hidden = false;
  if (CFG.DEADLINE_TEXT) Array.prototype.forEach.call(document.querySelectorAll('.js-deadline'), function (el) { el.textContent = CFG.DEADLINE_TEXT; });

  /* ---------- reveal ---------- */
  var rvs = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(rvs, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(rvs, function (el) { el.classList.add('rv-in'); });
  }

  /* ---------- progress rail ---------- */
  var beats = Array.prototype.slice.call(document.querySelectorAll('[data-beat]'));
  var segWrap = document.getElementById('rail-segs');
  var railLabel = document.getElementById('rail-label');
  beats.forEach(function () { var i = document.createElement('i'); i.className = 'rail-seg'; segWrap.appendChild(i); });
  var segs = segWrap.children;
  function rail() {
    var mid = window.innerHeight * 0.4, cur = 0;
    beats.forEach(function (b, i) { if (b.getBoundingClientRect().top <= mid) cur = i; });
    for (var i = 0; i < segs.length; i++) segs[i].className = 'rail-seg' + (i < cur ? ' passed' : i === cur ? ' active' : '');
    railLabel.textContent = beats[cur].getAttribute('data-beat');
  }
  window.addEventListener('scroll', rail, { passive: true });
  window.addEventListener('resize', rail);
  rail();

  /* ---------- click-through state ---------- */
  function blank() {
    return { name: '', role: '', q1: {}, q2: {}, q3: null, q4: {}, q5: [], q5_other: '', q6: null,
      q7: { is: ['', '', ''], never: ['', '', ''] }, q8: null, q9: { trust: '', avoid: '' },
      q10: { rank: [], camera: ['', ''], dates: '' }, why: '', step: 0,
      /* send status: '' (not sent), 'confirmed' (collector proved it stored the row),
         'unconfirmed' (request may have arrived, but no proof), 'rejected' (collector said no),
         'failed' (never reached the collector). Only 'confirmed' ever says "received". */
      status: '', receipt: '', sent_at: '', err: '',
      /* rev goes up on every edit. A receipt only counts for the exact rev that was sent
         (confirmed_rev). notice explains a result that arrived for answers since changed. */
      rev: 0, confirmed_rev: -1, notice: '' };
  }
  var st;
  try { st = JSON.parse(localStorage.getItem(STORE)) || blank(); } catch (e) { st = blank(); }
  var b0 = blank();
  Object.keys(b0).forEach(function (k) { if (st[k] === undefined) st[k] = b0[k]; });
  /* older saved state used a bare 'sent' flag, which was never proof of storage */
  if (st.sent !== undefined) { if (st.sent && st.status !== 'confirmed') st.status = 'unconfirmed'; delete st.sent; }
  /* a receipt saved without the rev it belongs to (r2 and older) is never trusted */
  if (st.status === 'confirmed' && st.confirmed_rev !== st.rev) { st.status = 'unconfirmed'; st.receipt = ''; st.err = 'No confirmation came back.'; }
  function confirmed() { return st.status === 'confirmed' && !!st.receipt && st.confirmed_rev === st.rev; }
  /* the answers exactly as they would be sent, used to check a reply still matches them */
  function answersKey() { return JSON.stringify([st.name, st.role, st.q1, st.q2, st.q3, st.q4, st.q5, st.q5_other, st.q6, st.q7, st.why, st.q8, st.q9, st.q10]); }
  function touched() { st.rev = (Number(st.rev) || 0) + 1; st.status = ''; st.receipt = ''; st.notice = ''; }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(st)); } catch (e) { /* private mode: keep in memory */ } }

  /* ---------- question data ---------- */
  var Q1 = [['established_fresh', 'Established', 'Fresh'], ['corporate_personal', 'Corporate', 'Personal'], ['calm_energetic', 'Calm', 'Energetic'],
    ['premium_approachable', 'Premium', 'Approachable'], ['serious_warm', 'Serious', 'Warm'], ['specialist_network', 'Specialist', 'Big network']];

  var Q2 = [
    { id: 'tone', h: 'Navy-led or light-led?', a: { l: 'Navy-led', o: { look: 'today' } }, b: { l: 'Light-led', o: { look: 'light' } } },
    { id: 'accent', h: 'No accent, or an accent colour?', a: { l: 'No accent', o: { look: 'today' } }, b: { l: 'With an accent', o: { look: 'today', accent: 'gold' } } },
    { id: 'photo', h: 'Portrait, or candid at work?', a: { l: 'A portrait', o: { look: 'today', photo: 'sarah' } }, b: { l: 'Candid, at work', o: { look: 'today', photo: 'reiq', tag: 'Inside Gough', name: 'At the REIQ stand', role: 'Our Queensland team, out at an industry event.' } } },
    { id: 'g', h: 'The G small, or the G large?', a: { l: 'G small', o: { look: 'today' } }, b: { l: 'G large', o: { look: 'today', gBig: true } } }
  ];

  var Q3 = [
    [1, 'Tidy up', 'Same look, used properly everywhere.'],
    [2, 'Tidy up, plus a little polish', 'Most people won\u2019t notice. The team will.'],
    [3, 'A clear refresh', 'Recognisably Gough, visibly sharper.'],
    [4, 'Fresh, still familiar', 'Clients notice something has changed, in a good way.'],
    [5, 'Noticeably fresh', 'People can tell something changed.']
  ];

  var Q4 = [
    { id: 'colour', t: 'Colour', s: 'Navy, Gough blue, Mist, Steel', vis: '<span class="ker-vis swx"><i style="background:#003459"></i><i style="background:#21759B"></i><i style="background:#ECF0F2"></i><i style="background:#AEB7BF"></i></span>', o: [['keep', 'Keep'], ['evolve', 'Evolve'], ['unsure', 'Not sure']] },
    { id: 'logo', t: 'Logo', s: 'The wordmark and the G', vis: '<span class="ker-vis"><img src="' + A + 'real/2021-09-logo_gough.svg" alt=""></span>', o: [['keep', 'Keep'], ['evolve', 'Evolve'], ['unsure', 'Not sure']] },
    { id: 'accent', t: 'Accent colour', s: 'None today. Keep it that way, or add one?', vis: '<span class="ker-vis" style="background:#FFFFFF;border:1.5px dashed #AEB7BF"></span>', o: [['keep', 'Keep none'], ['evolve', 'Add one'], ['unsure', 'Not sure']] }
  ];

  var Q5 = [
    ['name', 'The name', '<b style="font-family:var(--f-display);color:var(--navy);font-size:12px">Gough</b>'],
    ['g', 'The G', '<span style="width:14px;color:var(--navy)">' + S.g() + '</span>'],
    ['navy', 'Navy', '<i style="display:block;width:100%;height:100%;background:#003459"></i>'],
    ['blue', 'Gough blue', '<i style="display:block;width:100%;height:100%;background:#21759B"></i>'],
    ['type', 'The headline type', '<b style="font-family:var(--f-display);font-weight:800;color:var(--navy);font-size:17px">Aa</b>'],
    ['wordmark', 'The wordmark', '<img src="' + A + 'real/2021-09-logo_gough.svg" alt="" style="width:34px">']
  ];

  var Q6 = [
    { id: 'same', t: 'One identical Gough everywhere', d: 'Every account looks the same. The name says which state.', avs: [{}, {}, {}, {}] },
    { id: 'city', t: 'One Gough, with the city name', d: 'Same G and colours. The state is added under the G.', avs: [{}, { city: 'QLD' }, { city: 'VIC' }, { city: 'PERTH' }] },
    { id: 'state', t: 'Each state with its own variation', d: 'Same G. Each state gets its own colour from the palette.', avs: [{}, { bg: '#21759B' }, { bg: '#051145' }, { bg: '#4E6E86' }] }
  ];
  var Q6L = ['Main', 'QLD', 'VIC', 'Perth'];

  var Q8 = [
    ['sarah', 'A portrait'], ['awards', 'Awards night'], ['madilyn', 'A promotion post'],
    ['reiq', 'The REIQ stand'], ['allan', 'A welcome post'], ['building', 'The building on your homepage']
  ];

  var Q10 = [
    ['career', 'Career reality', 'What property, construction and development jobs are really like.'],
    ['market', 'Market insight', 'Pay and hiring trends, from your own data.'],
    ['access', 'Recruiter access', 'Consultants answer real questions on camera.'],
    ['inside', 'Inside Gough', 'Offices, teams and events.']
  ];

  /* ---------- helpers ---------- */
  function filled(list) { return list.filter(function (w) { return String(w || '').trim(); }).length; }
  function q7Filled() { return filled(st.q7.is) + filled(st.q7.never); }
  function q7Left() {
    var a = filled(st.q7.is), b = filled(st.q7.never);
    if (a === 3 && b === 3) return 'All six filled.';
    return 'Gough is: ' + a + ' of 3. Gough is never: ' + b + ' of 3.';
  }
  function on(p) { return p ? 'true' : 'false'; }
  function head(n, q, help) {
    return '<p class="ct-n">' + n + '</p><h2 class="ct-q" id="ct-title">' + q + '</h2>' + (help ? '<p class="ct-help">' + help + '</p>' : '');
  }
  function field(label, key, val, ph, tag) {
    if (tag === 'textarea') return '<label class="field"><span>' + label + '</span><textarea data-k="' + key + '" placeholder="' + esc(ph || '') + '">' + esc(val) + '</textarea></label>';
    return '<label class="field"><span>' + label + '</span><input type="text" data-k="' + key + '" value="' + esc(val) + '" placeholder="' + esc(ph || '') + '" autocomplete="off"></label>';
  }
  function getPath(path) {
    var parts = path.split('.'), o = st;
    for (var i = 0; i < parts.length; i++) o = o[parts[i]];
    return o == null ? '' : o;
  }
  function setPath(path, v) {
    var parts = path.split('.'), o = st;
    for (var i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = v;
  }

  /* ---------- screens ---------- */
  var screens = [
    { id: 'intro', count: false,
      html: function () {
        return head('Gough brand session', 'Your 5 minutes', 'Seven quick questions about how Gough should look and sound. There are no wrong answers. Only the MV Advisory team sees individual answers. At the session we show what the group said.') +
          '<ul class="ct-intro-list"><li>Mostly tapping. Two questions ask for a few words.</li><li>Your progress saves on this device, so you can stop and come back.</li><li>Please finish by ' + esc(CFG.DEADLINE_TEXT || 'Fri 16 Oct, 5pm AEDT') + '.</li></ul>' +
          field('Your name', 'name', st.name, 'First and last name') + field('Your role', 'role', st.role, 'For example, GM QLD and VIC');
      },
      valid: function () { return st.name.trim().length > 1; } },

    { id: 'q1', html: function () {
        return head('Question 1 of 7', 'Someone finds Gough for the first time. What should they feel?', 'Pick one side of each pair. Tap the middle if it\u2019s truly both.') +
          '<div class="pairs">' + Q1.map(function (p) {
            var v = st.q1[p[0]];
            return '<div class="pair" role="group" aria-label="' + p[1] + ' or ' + p[2] + '">' +
              '<button type="button" class="opt" data-set="q1.' + p[0] + '" data-v="a" aria-pressed="' + on(v === 'a') + '">' + p[1] + '</button>' +
              '<button type="button" class="opt mid" data-set="q1.' + p[0] + '" data-v="mid" aria-pressed="' + on(v === 'mid') + '">Both</button>' +
              '<button type="button" class="opt" data-set="q1.' + p[0] + '" data-v="b" aria-pressed="' + on(v === 'b') + '">' + p[2] + '</button></div>';
          }).join('') + '</div>';
      },
      valid: function () { return Q1.every(function (p) { return st.q1[p[0]]; }); } },

    { id: 'q3', html: function () {
        return head('Question 2 of 7', 'How far should Gough move?', 'Gough stays Gough either way. This is about how much people notice.') +
          '<div class="scale">' + Q3.map(function (s) {
            return '<button type="button" class="opt" data-set="q3" data-v="' + s[0] + '" data-num="1" aria-pressed="' + on(st.q3 === s[0]) + '"><em>' + s[0] + '</em><span>' + s[1] + '<small>' + s[2] + '</small></span></button>';
          }).join('') + '</div>';
      },
      valid: function () { return !!st.q3; } },

    { id: 'q5', html: function () {
        return head('Question 3 of 7', 'What must never change?', 'Tick everything that would feel wrong to lose. This becomes the "Gough stays Gough" page of your guide.') +
          '<div class="ticks">' + Q5.map(function (t) {
            return '<button type="button" class="opt tick" data-tick="' + t[0] + '" aria-pressed="' + on(st.q5.indexOf(t[0]) > -1) + '"><span class="vis">' + t[2] + '</span>' + t[1] + '</button>';
          }).join('') + '</div>' + field('Something else?', 'q5_other', st.q5_other, 'Optional');
      },
      valid: function () { return st.q5.length > 0 || st.q5_other.trim().length > 0; } },

    { id: 'q7', html: function () {
        return head('Question 4 of 7', 'Gough in three words. Never in three words.', 'Fill all six boxes: three words Gough is, and three words Gough is never. Single words are perfect. This sets the voice for every caption and the new website.') +
          '<p class="ct-help" style="margin-top:22px;color:var(--ink);font-family:var(--f-display);font-weight:700">Gough is</p><div class="trio">' +
          [0, 1, 2].map(function (i) { return '<label class="field" style="margin-top:8px"><span class="sr">Word ' + (i + 1) + '</span><input type="text" data-k="q7.is.' + i + '" value="' + esc(st.q7.is[i]) + '" placeholder="Word ' + (i + 1) + '" autocomplete="off"></label>'; }).join('') +
          '</div><p class="ct-help" style="margin-top:22px;color:var(--ink);font-family:var(--f-display);font-weight:700">Gough is never</p><div class="trio">' +
          [0, 1, 2].map(function (i) { return '<label class="field" style="margin-top:8px"><span class="sr">Never word ' + (i + 1) + '</span><input type="text" data-k="q7.never.' + i + '" value="' + esc(st.q7.never[i]) + '" placeholder="Word ' + (i + 1) + '" autocomplete="off"></label>'; }).join('') + '</div>' +
          '<p class="ct-help q7-left" id="q7-left" aria-live="polite">' + q7Left() + '</p>';
      },
      valid: function () { return q7Filled() === 6; } },

    { id: 'why', html: function () {
        return head('Question 5 of 7', 'Why do clients and candidates choose Gough over another recruiter?', 'In your own words. A sentence or two is plenty.') +
          field('Why Gough', 'why', st.why, 'What they tell you, or what you hear most often', 'textarea');
      },
      valid: function () { return String(st.why || '').trim().length > 2; } },
    { id: 'q8', html: function () {
        return head('Question 6 of 7', 'Which photo is most Gough?', 'All six are yours, from your Instagram and website. Pick one.') +
          '<div class="photos">' + Q8.map(function (p) {
            var ph = S.PHOTOS[p[0]];
            return '<button type="button" class="pick" data-set="q8" data-v="' + p[0] + '" aria-pressed="' + on(st.q8 === p[0]) + '"><img src="' + ph.src + '" alt="' + esc(ph.alt) + '" loading="lazy"><span class="pick-l">' + p[1] + '</span></button>';
          }).join('') + '</div>';
      },
      valid: function () { return !!st.q8; } },

    { id: 'q10', optional: true, html: function () {
        return head('Question 7 of 7', 'One brand you admire. One look you\u2019d hate Gough to be mistaken for.', 'Any industry. A name or a link is enough. Optional, but it helps us build the reference board for the session.') +
          field('A brand you admire', 'q9.trust', st.q9.trust, 'Name or link. Optional') +
          field('A look you\u2019d hate Gough to be mistaken for', 'q9.avoid', st.q9.avoid, 'Name or link. Optional');
      },
      valid: function () { return true; } },
    { id: 'review', count: false, html: function () {
        var live = !!CFG.ANSWERS_ENDPOINT;
        return head('Nearly done', 'Send your answers?', 'You can go back and change anything first.') +
          (live ? '' : '<div class="ct-note warn"><b>Preview only.</b> Answer collection is not switched on yet, so nothing will be sent. Your answers stay on this device.</div>') +
          (st.notice ? '<div class="ct-note warn">' + esc(st.notice) + '</div>' : '') +
          '<div class="ct-summary">' + esc(summary()) + '</div>';
      },
      valid: function () { return true; } },

    { id: 'done', count: false, html: function () {
        var live = !!CFG.ANSWERS_ENDPOINT;
        var copy = '<div class="ct-recover"><button type="button" class="ct-copy" data-copy="1">Copy my answers</button> <span class="ct-copied" id="ct-copied" aria-live="polite"></span></div>';
        var rest = copy + '<div class="ct-summary">' + esc(summary()) + '</div>';
        if (confirmed()) return head('Thank you', 'That\u2019s it. See you in Sydney.', 'Your answers are in. We\u2019ll open the session with what the group said.') + '<div class="ct-note ok">Received ' + esc(st.sent_at || '') + '. Reference ' + esc(st.receipt) + '. Changed your mind? Go back, edit and send again. We use your latest answers.</div>';
        if (!live) return head('Preview', 'That\u2019s the end of the click-through.', 'This is a preview. Nothing was sent, and your answers stay on this device.') + '<div class="ct-note warn">When answer collection is switched on, this screen tells you once we have confirmed your answers were saved.</div>';
        if (st.status === 'unconfirmed') return head('Not confirmed', 'We can\u2019t confirm your answers arrived.', 'They may have reached us, but no confirmation came back. Please send again. Your answers are saved on this device, and sending twice is fine: we use your latest answers.') + (st.err && st.err !== 'No confirmation came back.' ? '<div class="ct-note warn">' + esc(st.err) + '</div>' : '') + rest;
        if (st.status === 'rejected') return head('Not sent', 'Your answers didn\u2019t go through.', 'Our side didn\u2019t accept them this time. Please try again in a minute. Your answers are saved on this device. If it keeps happening, copy your answers and paste them into a reply to Misha.') + '<div class="ct-note warn">' + esc(st.err || 'Not accepted.') + '</div>' + rest;
        return head('Not sent', 'Your answers didn\u2019t send.', 'Check your connection and try again. Your answers are saved on this device. If it keeps happening, copy your answers and paste them into a reply to Misha.') + '<div class="ct-note warn">' + esc(st.err || 'Couldn\u2019t reach us.') + '</div>' + rest;
      },
      valid: function () { return true; } }
  ];
  var QCOUNT = screens.filter(function (s) { return s.count !== false; }).length;

  function label(list, id) { for (var i = 0; i < list.length; i++) if (list[i][0] === id) return list[i][1]; return id; }
  function summary() {
    var L = [];
    L.push('Name: ' + st.name + (st.role ? ' (' + st.role + ')' : ''));
    L.push('1. Feel: ' + Q1.map(function (p) { var v = st.q1[p[0]]; return v === 'a' ? p[1] : v === 'b' ? p[2] : v === 'mid' ? p[1] + '/' + p[2] : '-'; }).join(', '));
    L.push('2. How far: ' + (st.q3 ? st.q3 + ' of 5, ' + Q3[st.q3 - 1][1] : '-'));
    L.push('3. Never change: ' + st.q5.map(function (k) { return label(Q5, k); }).join(', ') + (st.q5_other ? (st.q5.length ? ', ' : '') + st.q5_other : ''));
    L.push('4. Gough is: ' + st.q7.is.filter(Boolean).join(', ') + '. Never: ' + (st.q7.never.filter(Boolean).join(', ') || '-'));
    L.push('5. Why Gough: ' + (st.why || '-'));
    L.push('6. Photo: ' + (st.q8 ? label(Q8, st.q8) : '-'));
    L.push('7. Admire: ' + (st.q9.trust || '-') + '. Avoid: ' + (st.q9.avoid || '-'));
    return L.join('\n');
  }

  /* ---------- render + events ---------- */
  var ct = document.getElementById('ct');
  var body = document.getElementById('ct-body');
  var btnNext = document.getElementById('ct-next');
  var btnBack = document.getElementById('ct-back');
  var prog = document.getElementById('ct-prog');
  var count = document.getElementById('ct-count');
  var skip = document.getElementById('ct-skip');
  var lastFocus = null;

  function render(keepScroll) {
    var s = screens[st.step];
    var y = body.scrollTop;
    body.innerHTML = '<section class="ct-screen on" data-screen="' + s.id + '">' + s.html() + '</section>';
    if (keepScroll) body.scrollTop = y; else body.scrollTop = 0;
    var qi = screens.slice(0, st.step + 1).filter(function (x) { return x.count !== false; }).length;
    prog.style.width = (s.id === 'intro' ? 0 : s.id === 'review' || s.id === 'done' ? 100 : Math.round((qi - 1) / QCOUNT * 100)) + '%';
    count.textContent = s.count === false ? '' : qi + ' of ' + QCOUNT;
    btnBack.disabled = st.step === 0 || sending;
    if (sending) Array.prototype.forEach.call(body.querySelectorAll('button:not([data-copy]), input, textarea'), function (el) { if (el.tagName === 'BUTTON') el.disabled = true; else el.readOnly = true; });
    ct.setAttribute('aria-busy', sending ? 'true' : 'false');
    skip.textContent = s.optional ? 'Optional' : '';
    if (s.id === 'q7') skip.textContent = q7Filled() + ' of 6 words';
    if (sending) btnNext.textContent = 'Sending\u2026';
    else if (s.id === 'review') btnNext.textContent = CFG.ANSWERS_ENDPOINT ? 'Send my answers' : 'Finish preview';
    else if (s.id === 'done') btnNext.textContent = (CFG.ANSWERS_ENDPOINT && !confirmed()) ? 'Try sending again' : 'Back to the page';
    else if (s.id === 'intro') btnNext.textContent = 'Start';
    else btnNext.textContent = 'Next';
    refreshNext();
  }
  function refreshNext() { btnNext.disabled = sending || !screens[st.step].valid(); }

  function go(d) {
    st.step = Math.max(0, Math.min(screens.length - 1, st.step + d));
    save(); render(false); focusHeading();
  }
  function focusHeading() { var h = body.querySelector('.ct-q'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }

  /* Send contract v2. A CORS POST with Content-Type text/plain: no preflight,
     and the reply IS readable. The collector must answer HTTP 200 with JSON
     { ok: true, submission_id: <our id echoed>, receipt: <its row id> }, and only after the row
     is written. Anything else is never shown as received. */
  function newId() {
    try { if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID(); } catch (e) { /* fall through */ }
    return 'sid-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }
  var sending = false, sendSeq = 0;
  function send() {
    if (sending) return;
    sending = true;
    var seq = ++sendSeq, rev = st.rev, snap = answersKey();
    var out = { status: '', receipt: '', err: '' };
    var id = newId();
    var payload = { v: 2, form: 'gough-brand-session-2026-10', submission_id: id, submitted_at: new Date().toISOString(), name: st.name, role: st.role,
      answers: { q1: st.q1, q3: st.q3, q5: st.q5, q5_other: st.q5_other, q7: st.q7, why: st.why, q8: st.q8, q9: st.q9 },
      ua: navigator.userAgent };
    st.status = ''; st.receipt = ''; st.err = ''; st.notice = '';
    st.step = screens.length - 2; render(true);
    var ms = Number(CFG.SEND_TIMEOUT_MS) || 20000;
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, ms) : null;
    var reached = false;
    fetch(CFG.ANSWERS_ENDPOINT, { method: 'POST', mode: 'cors', redirect: 'follow', cache: 'no-store',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        reached = true;
        if (res.type === 'opaque' || res.type === 'opaqueredirect') { out.status = 'unconfirmed'; out.err = 'No confirmation came back.'; return; }
        if (!res.ok) { out.status = 'rejected'; out.err = 'Not accepted (error ' + res.status + ').'; return; }
        return res.text().then(function (t) {
          var j = null;
          try { j = JSON.parse(t); } catch (e) { j = null; }
          if (j && j.ok === true && j.submission_id === id && j.receipt) {
            out.status = 'confirmed'; out.receipt = String(j.receipt).slice(0, 60);
            out.sent_at = new Date().toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
          } else if (j && j.ok === false) {
            out.status = 'rejected'; out.err = 'Not accepted' + (j.error ? ': ' + String(j.error).slice(0, 120) : '.');
          } else {
            out.status = 'unconfirmed'; out.err = 'The reply didn\u2019t confirm your answers were saved.';
          }
        });
      })
      .catch(function (e) {
        var aborted = e && e.name === 'AbortError';
        var offline = !reached && !aborted && navigator.onLine === false;
        /* Only a device that is offline is a sure "never left". A timeout, a blocked or unreadable
           reply, or a dropped connection proves nothing either way, so it is "unconfirmed". */
        out.status = offline ? 'failed' : 'unconfirmed';
        out.err = offline ? 'This device is offline.' : aborted ? 'No reply within ' + Math.round(ms / 1000) + ' seconds.' : 'No confirmation came back.';
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        if (seq !== sendSeq) return;
        sending = false;
        if (st.rev !== rev || answersKey() !== snap) {
          /* The answers changed while this send was in flight (another tab, or any path the
             lock missed). Its reply is about the OLD answers, so it never confirms these. */
          st.status = ''; st.receipt = ''; st.err = '';
          st.notice = 'Your answers changed while they were sending, so these answers are not confirmed yet. Please send again.';
          if (st.step >= screens.length - 1) st.step = screens.length - 2;
        } else {
          st.status = out.status; st.receipt = out.receipt; st.err = out.err;
          if (out.status === 'confirmed') { st.confirmed_rev = rev; st.sent_at = out.sent_at; }
          st.step = screens.length - 1;
        }
        save(); render(false);
        if (isOpen()) focusHeading();
      });
  }
  function copyAnswers() {
    var txt = 'Gough brand session answers\n' + summary();
    function done(ok) { var out = document.getElementById('ct-copied'); if (out) out.textContent = ok ? 'Copied. Paste it into a reply to Misha.' : 'Couldn\u2019t copy. Select the answers below and copy them.'; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); });
    else done(false);
  }

  btnNext.addEventListener('click', function () {
    var s = screens[st.step];
    if (sending || !s.valid()) return;
    if (s.id === 'review') { if (CFG.ANSWERS_ENDPOINT) { send(); } else { go(1); } return; }
    if (s.id === 'done') { if (CFG.ANSWERS_ENDPOINT && !confirmed()) send(); else closeCT(); return; }
    go(1);
  });
  btnBack.addEventListener('click', function () { if (!sending) go(-1); });

  /* A re-render replaces the clicked button. Put focus back on its replacement. */
  var KEY_ATTRS = ['data-set', 'data-v', 'data-tick', 'data-rank', 'data-rank-reset'];
  function keyOf(b) { return KEY_ATTRS.map(function (a) { return b.hasAttribute(a) ? a + '=' + b.getAttribute(a) : ''; }).join('|'); }
  function refocus(key, fallbackSel) {
    var all = body.querySelectorAll('button');
    for (var i = 0; i < all.length; i++) if (keyOf(all[i]) === key) { all[i].focus({ preventScroll: true }); return; }
    var f = fallbackSel && body.querySelector(fallbackSel);
    if (f) f.focus({ preventScroll: true }); else focusHeading();
  }

  body.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-copy')) { copyAnswers(); return; }
    if (sending) return;
    var key = keyOf(b);
    if (b.hasAttribute('data-set')) {
      var v = b.getAttribute('data-v');
      setPath(b.getAttribute('data-set'), b.hasAttribute('data-num') ? Number(v) : v);
    } else if (b.hasAttribute('data-tick')) {
      var k = b.getAttribute('data-tick'), i = st.q5.indexOf(k);
      if (i > -1) st.q5.splice(i, 1); else st.q5.push(k);
    } else if (b.hasAttribute('data-rank')) {
      var r = b.getAttribute('data-rank'), j = st.q10.rank.indexOf(r);
      if (j > -1) st.q10.rank.splice(j, 1); else st.q10.rank.push(r);
    } else if (b.hasAttribute('data-rank-reset')) {
      st.q10.rank = [];
    } else { return; }
    touched(); save(); render(true);
    refocus(key, '[data-rank]');
  });
  body.addEventListener('input', function (e) {
    var k = e.target.getAttribute('data-k');
    if (!k) return;
    if (sending) { e.target.value = getPath(k); return; }
    setPath(k, e.target.value); touched(); save(); refreshNext();
    if (k.indexOf('q7.') === 0) { var l = document.getElementById('q7-left'); if (l) l.textContent = q7Left(); skip.textContent = q7Filled() + ' of 6 words'; }
  });

  /* Modal: everything outside the dialog is inert while it is open, and Tab / Shift+Tab wrap
     inside it (the wrap also covers browsers without inert support). */
  var inerted = [];
  function setBackground(off) {
    if (off) {
      inerted = Array.prototype.filter.call(document.body.children, function (el) { return el !== ct && el.tagName !== 'SCRIPT' && !el.inert; });
      inerted.forEach(function (el) { el.inert = true; el.setAttribute('aria-hidden', 'true'); });
    } else {
      inerted.forEach(function (el) { el.inert = false; el.removeAttribute('aria-hidden'); });
      inerted = [];
    }
  }
  function focusables() {
    return Array.prototype.filter.call(ct.querySelectorAll('button, [href], input, textarea, select, [tabindex]'), function (el) {
      return !el.disabled && el.getAttribute('tabindex') !== '-1' && el.getClientRects().length > 0;
    });
  }
  function isOpen() { return ct.classList.contains('open'); }
  function openCT() {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    /* reopen on the review screen unless there is a real send result to show */
    if (st.step >= screens.length - 1 && !confirmed() && !(CFG.ANSWERS_ENDPOINT && st.status)) st.step = screens.length - 2;
    ct.classList.add('open'); document.body.classList.add('ct-lock'); setBackground(true); render(false);
    focusHeading();
  }
  function closeCT() {
    if (!isOpen()) return;
    ct.classList.remove('open'); document.body.classList.remove('ct-lock'); setBackground(false);
    var back = (lastFocus && lastFocus !== document.body && document.contains(lastFocus)) ? lastFocus : document.querySelector('.js-open-ct');
    if (back) back.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !isOpen()) return;
    var f = focusables();
    if (!f.length) { e.preventDefault(); return; }
    var first = f[0], last = f[f.length - 1], a = document.activeElement, i = f.indexOf(a);
    if (e.shiftKey && i <= 0) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (i === -1 || a === last)) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('focusin', function (e) { if (isOpen() && !ct.contains(e.target)) { var f = focusables(); if (f.length) f[0].focus(); } });
  Array.prototype.forEach.call(document.querySelectorAll('.js-open-ct'), function (b) { b.addEventListener('click', openCT); });
  document.getElementById('ct-x').addEventListener('click', closeCT);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) closeCT(); });
  if (location.hash === '#start-10') openCT();

  window.addEventListener('storage', function (e) {
    if (e.key !== STORE || !e.newValue) return;
    var n; try { n = JSON.parse(e.newValue); } catch (x) { return; }
    if (!n || typeof n !== 'object') return;
    Object.keys(b0).forEach(function (k) { if (n[k] === undefined) n[k] = b0[k]; });
    n.step = st.step;
    st = n;
    if (isOpen()) render(true);
  });

  /* test hook for QA, harmless in production */
  window.__goughCT = { state: function () { return JSON.parse(JSON.stringify(st)); }, summary: summary, screens: screens.map(function (s) { return s.id; }), confirmed: confirmed, sending: function () { return sending; } };
})();
