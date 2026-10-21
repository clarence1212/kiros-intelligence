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
    var n = r.dims.length, cx = 230, cy = 175, R = 120, pts = [], grid = '', axes = '', labels = '';
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
    var dimRows = r.dims.map(function (d) { return '<tr><th scope="row">' + esc(d.name) + '</th><td>' + Math.round(d.weight * 100) + '%</td><td class="num">' + d.score + '</td></tr>'; }).join('');
    var html =
      '<div class="k-result-head"><div><span class="label">Your indicative result</span><h2 data-focus>Composite AI readiness: <span class="k-score">' + r.composite + '</span><span class="k-of">/100</span></h2>' +
      '<p class="k-band"><b>' + esc(r.band.name) + '.</b> ' + esc(r.band.text) + '</p></div></div>' +
      '<div class="k-grid"><div class="k-panel"><h3>Six-dimension profile</h3>' + radar(r) +
      '<table class="k-table"><caption class="sr-only">Dimension scores</caption><thead><tr><th scope="col">Dimension</th><th scope="col">Weight</th><th scope="col" class="num">Score</th></tr></thead><tbody>' + dimRows + '</tbody></table></div>' +
      '<div class="k-panel"><h3>Readiness by value pathway</h3><p class="k-small">How ready the organisation is to pursue each Agent Value Ledger category. This is readiness, not a forecast of financial value.</p>' +
      r.pathways.map(function (p) { return bar(p.name + ' · ' + p.band, p.score, p.basis); }).join('') +
      '<p class="k-legend"><em></em>Markers at 40 and 60 show where the pathway bands change.</p>' +
      (focus.length ? '<div class="k-context"><b>In ' + esc(ind.name.toLowerCase()) + '</b>, value from AI most often shows up first in ' + focus.slice(0, -1).join(', ') + ' and ' + focus[focus.length - 1] + '. This is context only and does not change your scores.</div>' : '') +
      '</div></div>' +
      '<div class="k-grid k-three"><div class="k-panel"><h3>Principal strengths</h3><ul>' + r.strengths.map(function (d) { return '<li><b>' + esc(d.name) + '</b> (' + d.score + ')</li>'; }).join('') + '</ul></div>' +
      '<div class="k-panel"><h3>Significant gaps</h3>' + (r.gaps.length ? '<ul>' + r.gaps.map(function (d) { return '<li><b>' + esc(d.name) + '</b> (' + d.score + ')</li>'; }).join('') + '</ul>' : '<p>No dimension scored below 60.</p>') + '</div>' +
      '<div class="k-panel"><h3>Suggested priority actions</h3><ol>' + r.actions.map(function (a) { return '<li>' + esc(a.text) + '</li>'; }).join('') + '</ol></div></div>' +
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
