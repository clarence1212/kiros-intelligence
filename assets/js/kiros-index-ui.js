/* K-ARVI interface. Reads window.KARVI_CONFIG, scores with window.KARVI.score.
   Nothing entered here is stored or sent anywhere. */
(function () {
  var cfg = window.KARVI_CONFIG, root = document.getElementById('karvi');
  if (!cfg || !root || !window.KARVI) return;
  var errs = KARVI.validate(cfg);
  if (errs.length && window.console) console.warn('K-ARVI configuration:', errs);

  var state = { step: 0, industry: '', size: '', answers: {} };
  var dims = cfg.dimensions;
  var steps = dims.length;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function track(name) { try { document.dispatchEvent(new CustomEvent('kig:conversion', { detail: { event: name } })); } catch (e) {} }
  function focusTop() { var h = root.querySelector('[data-focus]'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } root.scrollIntoView({ block: 'start' }); }

  function intro() {
    var opts = Object.keys(cfg.industries).map(function (k) { return '<option value="' + k + '"' + (state.industry === k ? ' selected' : '') + '>' + esc(cfg.industries[k].name) + '</option>'; }).join('');
    var sizes = ['Under 50 people', '50 to 249', '250 to 999', '1,000 to 4,999', '5,000 or more'].map(function (s) { return '<option' + (state.size === s ? ' selected' : '') + '>' + s + '</option>'; }).join('');
    root.innerHTML =
      '<div class="k-card"><h2 data-focus>Before you start</h2>' +
      '<p class="k-lead">24 short statements across six dimensions. For each, choose how far it is true of your organisation today. It takes about six minutes.</p>' +
      '<div class="k-fields"><label class="field"><span>Industry <b aria-hidden="true">*</b></span><select id="k-ind" required><option value="">Select your industry</option>' + opts + '</select></label>' +
      '<label class="field"><span>Organisation size (optional)</span><select id="k-size"><option value="">Prefer not to say</option>' + sizes + '</select></label></div>' +
      '<p class="k-err" id="k-err0" role="alert" hidden>Please select an industry.</p>' +
      '<ul class="k-notes"><li>Answer for the organisation as it is now, not as planned.</li><li>No financial or confidential information is requested.</li><li>Your answers stay in this browser window and are not stored or sent.</li></ul>' +
      '<div class="k-nav"><button class="btn primary" type="button" id="k-start">Start the assessment</button></div></div>';
    document.getElementById('k-start').onclick = function () {
      var v = document.getElementById('k-ind').value;
      state.size = document.getElementById('k-size').value;
      if (!v) { var e = document.getElementById('k-err0'); e.hidden = false; document.getElementById('k-ind').focus(); return; }
      state.industry = v; state.step = 1; track('karvi_start'); render(); focusTop();
    };
  }

  function stepView() {
    var d = dims[state.step - 1];
    var qs = cfg.questions.filter(function (q) { return q.dim === d.id; });
    var pct = Math.round((state.step - 1) / steps * 100);
    var html = '<div class="k-progress" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
      '<p class="k-stepline">Step ' + state.step + ' of ' + steps + ' · Weight ' + Math.round(d.weight * 100) + '%</p>' +
      '<h2 data-focus>' + esc(d.name) + '</h2>';
    qs.forEach(function (q, i) {
      html += '<fieldset class="k-q" id="fs-' + q.id + '"><legend><span class="k-qn">' + q.id + '</span>' + esc(q.q) + '<small>' + esc(q.help) + '</small></legend><div class="k-scale">';
      cfg.scale.forEach(function (s) {
        var id = 'q-' + q.id + '-' + s.v;
        html += '<label for="' + id + '"><input type="radio" name="' + q.id + '" id="' + id + '" value="' + s.v + '"' + (state.answers[q.id] === s.v ? ' checked' : '') + '><span>' + esc(s.label) + '</span></label>';
      });
      html += '</div></fieldset>';
    });
    html += '<p class="k-err" id="k-err" role="alert" hidden>Please answer every statement on this step.</p>' +
      '<div class="k-nav"><button class="btn ghost" type="button" id="k-back">Back</button><button class="btn primary" type="button" id="k-next">' + (state.step === steps ? 'See my results' : 'Next') + '</button></div>';
    root.innerHTML = '<div class="k-card">' + html + '</div>';
    root.querySelectorAll('input[type=radio]').forEach(function (r) {
      r.addEventListener('change', function () { state.answers[r.name] = +r.value; var fs = document.getElementById('fs-' + r.name); if (fs) fs.classList.remove('missing'); });
    });
    document.getElementById('k-back').onclick = function () { state.step--; render(); focusTop(); };
    document.getElementById('k-next').onclick = function () {
      var missing = qs.filter(function (q) { return state.answers[q.id] === undefined; });
      if (missing.length) {
        missing.forEach(function (q) { document.getElementById('fs-' + q.id).classList.add('missing'); });
        document.getElementById('k-err').hidden = false;
        var first = document.querySelector('#fs-' + missing[0].id + ' input'); if (first) first.focus();
        return;
      }
      state.step++; if (state.step > steps) track('karvi_complete'); render(); focusTop();
    };
  }

  function radar(r) {
    var n = r.dims.length, cx = 230, cy = 175, R = 110, pts = [], grid = '', axes = '', labels = '';
    function xy(i, v) { var a = (-90 + i * 360 / n) * Math.PI / 180; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; }
    [0.25, 0.5, 0.75, 1].forEach(function (g) {
      var p = []; for (var i = 0; i < n; i++) p.push(xy(i, g).map(function (x) { return x.toFixed(1); }).join(','));
      grid += '<polygon points="' + p.join(' ') + '" class="r-grid"/>';
    });
    r.dims.forEach(function (d, i) {
      var e = xy(i, 1), p = xy(i, d.score / 100), l = xy(i, 1.2);
      axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) + '" class="r-axis"/>';
      pts.push(p[0].toFixed(1) + ',' + p[1].toFixed(1));
      var anchor = Math.abs(l[0] - cx) < 4 ? 'middle' : (l[0] > cx ? 'start' : 'end');
      labels += '<text x="' + l[0].toFixed(1) + '" y="' + (l[1] + 4).toFixed(1) + '" text-anchor="' + anchor + '" class="r-lbl">' + esc(d.name.split(' ')[0]) + ' <tspan class="r-val">' + d.score + '</tspan></text>';
    });
    var dots = pts.map(function (p) { var c = p.split(','); return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.5" class="r-dot"/>'; }).join('');
    return '<svg viewBox="0 0 460 350" class="k-radar" role="img" aria-label="Readiness profile across six dimensions. Scores: ' +
      r.dims.map(function (d) { return d.name + ' ' + d.score; }).join(', ') + '.">' + grid + axes + '<polygon points="' + pts.join(' ') + '" class="r-shape"/>' + dots + labels + '</svg>';
  }

  function bar(label, score, note) {
    return '<div class="k-bar"><div class="k-bar-h"><span>' + esc(label) + '</span><b>' + score + '</b></div><div class="k-bar-t" aria-hidden="true"><i style="width:' + score + '%"></i><em style="left:40%"></em><em style="left:60%"></em></div>' + (note ? '<small>' + esc(note) + '</small>' : '') + '</div>';
  }

  function summaryText(r) {
    var ind = cfg.industries[state.industry] ? cfg.industries[state.industry].name : '';
    var t = 'Kiros AI Readiness & Value Index (preliminary, self-reported)\n' + (ind ? 'Industry: ' + ind + '\n' : '') +
      'Composite readiness: ' + r.composite + '/100 (' + r.band.name + ')\n\nDimensions:\n';
    r.dims.forEach(function (d) { t += '- ' + d.name + ': ' + d.score + '\n'; });
    t += '\nReadiness by value pathway:\n';
    r.pathways.forEach(function (p) { t += '- ' + p.name + ': ' + p.score + ' (' + p.band + ')\n'; });
    t += '\nPriority actions:\n'; r.actions.forEach(function (a) { t += '- ' + a.text + '\n'; });
    t += '\nIndicative only. Based on self-reported answers; not an independently verified audit. Readiness scores are not estimates of financial return.';
    return t;
  }

  function results() {
    var r = KARVI.score(state.answers, cfg);
    var ind = cfg.industries[state.industry];
    var focus = ind && ind.focus.length ? ind.focus.map(function (f) { var p = r.pathways.filter(function (x) { return x.id === f; })[0]; return p ? p.name.toLowerCase() : f; }) : [];
    var ICONS = { revenue: '<path d="M4 20 L10 13 L14 16 L20 8"/><path d="M15 8 H20 V13"/>', cost: '<circle cx="12" cy="12" r="8"/><path d="M8 12 H16"/>',
      capital: '<path d="M5 12 a7 7 0 0 1 12-5"/><path d="M17 3 V7 H13"/><path d="M19 12 a7 7 0 0 1 -12 5"/><path d="M7 21 V17 H11"/>', risk: '<path d="M12 3 L19 6 V12 C19 16.5 16 19.5 12 21 C8 19.5 5 16.5 5 12 V6 Z"/><path d="M9 12 L11 14 L15 10"/>' };
    function ic(k) { return '<svg class="ic sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + ICONS[k] + '</svg>'; }
    var C = 2 * Math.PI * 70, off = C * (1 - r.composite / 100);
    var gauge = '<svg viewBox="0 0 180 180" class="k-gauge" role="img" aria-label="Composite readiness ' + r.composite + ' out of 100, ' + esc(r.band.name) + '">' +
      [40, 60, 80].map(function (t) { var a = (-90 + t * 3.6) * Math.PI / 180; return '<line x1="' + (90 + Math.cos(a) * 60).toFixed(1) + '" y1="' + (90 + Math.sin(a) * 60).toFixed(1) + '" x2="' + (90 + Math.cos(a) * 80).toFixed(1) + '" y2="' + (90 + Math.sin(a) * 80).toFixed(1) + '" class="g-tick"/>'; }).join('') +
      '<circle cx="90" cy="90" r="70" class="g-track"/><circle cx="90" cy="90" r="70" class="g-val" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 90 90)"/>' +
      '<text x="90" y="92" text-anchor="middle" class="g-num">' + r.composite + '</text><text x="90" y="116" text-anchor="middle" class="g-of">OUT OF 100</text></svg>';
    var bandsRow = cfg.bands.map(function (bd) { return '<li class="' + (bd.name === r.band.name ? 'on' : '') + '"><b>' + bd.min + '–' + bd.max + '</b>' + esc(bd.name) + '</li>'; }).join('');
    var dimBars = r.dims.map(function (d) {
      return '<li><div class="db-h"><span>' + esc(d.name) + ' <small>' + Math.round(d.weight * 100) + '%</small></span><b>' + d.score + '</b></div><div class="db-t" aria-hidden="true"><i style="width:' + d.score + '%"></i><em style="left:40%"></em><em style="left:60%"></em></div></li>';
    }).join('');
    var paths = r.pathways.map(function (p) {
      var cls = p.score >= 60 ? 'hi' : (p.score >= 40 ? 'mid' : 'lo');
      return '<div class="kp kp-' + cls + '"><div class="kp-h">' + ic(p.id) + '<h4>' + esc(p.name) + '</h4></div><div class="kp-s"><b>' + p.score + '</b><span>/100</span></div><p class="kp-b">' + esc(p.band) + '</p><div class="db-t" aria-hidden="true"><i style="width:' + p.score + '%"></i><em style="left:40%"></em><em style="left:60%"></em></div><p class="kp-n">' + esc(p.basis) + '</p></div>';
    }).join('');
    var weakest = r.dims.slice().sort(function (a, b) { return a.raw - b.raw; }).slice(0, 2);
    var constraints = r.dims.filter(function (d) { return d.score < 40; });
    var html =
      '<div class="kd-head"><div class="kd-gauge">' + gauge + '</div><div><span class="label">Your indicative result</span><h2 data-focus>Composite AI readiness: ' + esc(r.band.name) + '</h2>' +
      '<p class="k-band">' + esc(r.band.text) + '</p><ol class="kd-bands" aria-label="Provisional maturity bands">' + bandsRow + '</ol>' +
      '<p class="k-small">The composite is the weighted average of the six dimension scores. Bands are provisional, not validated benchmarks.</p></div></div>' +
      '<div class="kd-sec"><h3>Six-dimension readiness profile</h3><div class="kd-two"><ol class="dbars">' + dimBars + '</ol><div>' + radar(r) + '</div></div><p class="k-legend"><em></em>Markers at 40 and 60 show where the bands change. Small figures show each dimension\'s weight.</p></div>' +
      '<div class="kd-sec"><h3>Agent Value Ledger linkage</h3><p class="k-small">Readiness to pursue each financial value pathway. These are readiness scores, not monetary returns or forecasts.</p><div class="kps">' + paths + '</div>' +
      (focus.length ? '<div class="k-context"><b>In ' + esc(ind.name.toLowerCase()) + '</b>, value from AI most often shows up first in ' + focus.slice(0, -1).join(', ') + ' and ' + focus[focus.length - 1] + '. This is context only and does not change your scores.</div>' : '') + '</div>' +
      '<div class="kd-sec"><h3>Strengths and readiness gaps</h3><table class="kd-sum"><tbody>' +
      '<tr><th scope="row">Strongest dimensions</th><td>' + r.strengths.map(function (d) { return esc(d.name) + ' <b>' + d.score + '</b>'; }).join(' · ') + '</td></tr>' +
      '<tr><th scope="row">Weakest dimensions</th><td>' + weakest.map(function (d) { return esc(d.name) + ' <b>' + d.score + '</b>'; }).join(' · ') + '</td></tr>' +
      '<tr><th scope="row">Principal readiness constraints</th><td>' + (constraints.length ? constraints.map(function (d) { return esc(d.name) + ' (below 40)'; }).join(' · ') : (r.gaps.length ? 'No dimension below 40. Gaps below 60: ' + r.gaps.map(function (d) { return esc(d.name); }).join(' · ') : 'No dimension scored below 60.')) + '</td></tr>' +
      '<tr><th scope="row">Suggested improvement priorities</th><td><ol>' + r.actions.map(function (a) { return '<li>' + esc(a.text) + '</li>'; }).join('') + '</ol></td></tr></tbody></table></div>' +
      '<div class="k-disclaimer" role="note"><b>Please read.</b> These results are indicative. They are based on your self-reported answers, use provisional maturity bands that are not scientifically validated benchmarks, and are not an independently verified organisational audit. Readiness scores are not estimates of return on investment.</div>' +
      '<div class="k-cta"><div><h3>Want a verified view?</h3><p>The Enterprise AI Value Creation Assessment replaces self-reported answers with interviews, evidence review, workflow and financial analysis, and turns the results into a prioritised roadmap.</p></div>' +
      '<div class="k-cta-a"><a class="btn primary" href="enterprise-assessment.html" data-track="karvi_to_assessment">About the full assessment</a><a class="btn ghost" href="contact.html?type=assessment" data-track="karvi_to_contact">Request a conversation</a></div></div>' +
      '<div class="k-tools"><button class="btn ghost sm" type="button" id="k-copy">Copy summary</button><button class="btn ghost sm" type="button" id="k-print">Print or save as PDF</button><button class="btn ghost sm" type="button" id="k-restart">Start again</button><span id="k-copied" role="status" class="k-small"></span></div>';
    root.innerHTML = '<div class="k-card k-results">' + html + '</div>';
    document.getElementById('k-print').onclick = function () { window.print(); };
    document.getElementById('k-restart').onclick = function () { state = { step: 0, industry: state.industry, size: state.size, answers: {} }; render(); focusTop(); };
    document.getElementById('k-copy').onclick = function () {
      var t = summaryText(r), s = document.getElementById('k-copied');
      var ok = function () { s.textContent = 'Summary copied.'; };
      try { navigator.clipboard.writeText(t).then(ok, function () { s.textContent = 'Copy is not available here. Use Print instead.'; }); } catch (e) { s.textContent = 'Copy is not available here. Use Print instead.'; }
    };
    root.querySelectorAll('[data-track]').forEach(function (a) { a.addEventListener('click', function () { track(a.getAttribute('data-track')); }); });
  }

  function render() { var lay = root.parentElement; if (lay) lay.classList.toggle('k-done', state.step > steps); if (state.step === 0) intro(); else if (state.step <= steps) stepView(); else results(); }
  render();
})();
