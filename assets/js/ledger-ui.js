/* Agent Value Ledger calculator interface. Uses LEDGER_CONFIG and LEDGER.compute. Nothing is stored or sent. */
(function () {
  var cfg = window.LEDGER_CONFIG, root = document.getElementById('ledger-calc');
  if (!cfg || !root || !window.LEDGER) return;
  var cur = 'US$';
  var vals = {}; cfg.inputs.forEach(function (i) { vals[i.id] = i.value; });
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(n, short) {
    var neg = n < 0, a = Math.abs(n), s;
    if (short && a >= 1e6) s = (a / 1e6).toFixed(2) + 'm';
    else if (short && a >= 1e3) s = (a / 1e3).toFixed(0) + 'k';
    else s = Math.round(a).toLocaleString('en-GB');
    return (neg ? '−' : '') + cur + s;
  }

  function field(i) {
    var id = 'lc-' + i.id;
    if (i.unit === 'toggle') return '<label class="lc-toggle" for="' + id + '"><input type="checkbox" id="' + id + '" data-k="' + i.id + '"' + (vals[i.id] ? ' checked' : '') + '><span>' + esc(i.label) + '</span></label>';
    var suffix = i.unit === '%' ? '%' : (i.unit === 'hours' ? 'hours' : (i.unit === 'years' ? 'years' : ''));
    var prefix = i.unit === 'money' ? '<span class="lc-pre" data-cur>' + esc(cur) + '</span>' : '';
    return '<label class="field lc-f" for="' + id + '"><span>' + esc(i.label) + '</span><span class="lc-in">' + prefix +
      '<input type="number" inputmode="decimal" id="' + id + '" data-k="' + i.id + '" value="' + vals[i.id] + '"' +
      (i.min !== undefined ? ' min="' + i.min + '"' : '') + (i.max !== undefined ? ' max="' + i.max + '"' : '') + ' step="' + (i.step || 1) + '">' +
      (suffix ? '<span class="lc-suf">' + suffix + '</span>' : '') + '</span></label>';
  }

  function build() {
    var g = cfg.groups.map(function (gr) {
      var f = cfg.inputs.filter(function (i) { return i.group === gr.id; }).map(field).join('');
      return '<fieldset class="lc-group"><legend>' + esc(gr.name) + (gr.note ? '<small>' + esc(gr.note) + '</small>' : '') + '</legend>' + f + '</fieldset>';
    }).join('');
    root.innerHTML =
      '<div class="lc-top"><span class="illus">Hypothetical illustration · adjustable</span>' +
      '<label class="field lc-cur" for="lc-cur"><span>Currency label</span><select id="lc-cur"><option>US$</option><option>S$</option><option>A$</option><option>NZ$</option><option value="">None</option></select></label>' +
      '<button class="btn ghost sm" type="button" id="lc-reset">Reset to defaults</button></div>' +
      '<div class="lc-wrap"><form class="lc-inputs" id="lc-form" novalidate onsubmit="return false">' + g + '</form><div class="lc-out" id="lc-out" aria-live="polite"></div></div>';
    root.querySelectorAll('[data-k]').forEach(function (el) {
      el.addEventListener('input', function () {
        var k = el.getAttribute('data-k');
        vals[k] = el.type === 'checkbox' ? (el.checked ? 1 : 0) : (el.value === '' ? 0 : Math.max(0, +el.value));
        out();
      });
    });
    document.getElementById('lc-cur').onchange = function (e) { cur = e.target.value; root.querySelectorAll('[data-cur]').forEach(function (s) { s.textContent = cur; }); out(); };
    document.getElementById('lc-reset').onclick = function () { cfg.inputs.forEach(function (i) { vals[i.id] = i.value; }); var c = cur; build(); document.getElementById('lc-cur').value = c; cur = c; out(); };
    out();
  }

  function chart(r) {
    var W = 520, H = 220, pad = 40, list = r.cumList, n = list.length;
    var max = Math.max.apply(null, list.map(function (x) { return x.cum; }).concat([0]));
    var min = Math.min.apply(null, list.map(function (x) { return x.cum; }).concat([0]));
    if (max === min) max = min + 1;
    var y = function (v) { return pad / 2 + (max - v) / (max - min) * (H - pad); };
    var bw = (W - pad * 2) / n * 0.55, step = (W - pad * 2) / n, bars = '', lbl = '';
    list.forEach(function (p, i) {
      var x = pad + i * step + (step - bw) / 2, y0 = y(0), y1 = y(p.cum);
      bars += '<rect x="' + x.toFixed(1) + '" y="' + Math.min(y0, y1).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(1, Math.abs(y1 - y0)).toFixed(1) + '" class="' + (p.cum < 0 ? 'c-neg' : 'c-pos') + '"/>';
      lbl += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="middle" class="c-x">' + (p.year === 0 ? 'Start' : 'Year ' + p.year) + '</text>';
      lbl += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + ((p.cum < 0 ? y0 - 6 : Math.min(y0, y1) - 5)).toFixed(1) + '" text-anchor="middle" class="c-v">' + esc(money(p.cum, true)) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="lc-chart" role="img" aria-label="Cumulative net cash flow by year: ' + list.map(function (p) { return (p.year === 0 ? 'start' : 'year ' + p.year) + ' ' + money(p.cum, true); }).join(', ') + '.">' +
      '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '" class="c-zero"/>' + bars + lbl + '</svg>';
  }

  function out() {
    var r = LEDGER.compute(vals);
    var pb = r.payback === null ? 'Not within ' + r.years + ' years' : (r.payback < 0.05 ? 'Immediate' : (r.payback * 12).toFixed(0) + ' months');
    var rows = [['Revenue (gross profit)', r.lines.revenue], ['Operating costs', r.lines.cost], ['Risk', r.lines.risk, !vals.riskOn ? 'Excluded' : null], ['Running cost of the agent', -vals.run]];
    var tbl = rows.map(function (x) { return '<tr><th scope="row">' + x[0] + '</th><td class="num' + (x[1] < 0 ? ' neg' : '') + '">' + (x[2] || money(x[1])) + '</td></tr>'; }).join('') +
      '<tr class="tot"><th scope="row">Net annual value at full run rate</th><td class="num">' + money(r.annualNet) + '</td></tr>';
    var yrs = r.flows.map(function (f) { return '<tr><th scope="row">Year ' + f.year + '</th><td class="num">' + money(f.benefit) + '</td><td class="num neg">' + money(-f.run) + '</td><td class="num">' + (f.capital ? money(f.capital) : '–') + '</td><td class="num">' + money(f.net) + '</td><td class="num">' + money(f.cum) + '</td></tr>'; }).join('');
    document.getElementById('lc-out').innerHTML =
      '<div class="lc-tiles"><div><span>Net annual value</span><b>' + money(r.annualNet, true) + '</b><small>At full run rate, after running cost</small></div>' +
      '<div><span>Net present value</span><b' + (r.npv < 0 ? ' class="neg"' : '') + '>' + money(r.npv, true) + '</b><small>Over ' + r.years + ' year' + (r.years > 1 ? 's' : '') + ' at ' + vals.coc + '%</small></div>' +
      '<div><span>Payback</span><b>' + pb + '</b><small>Including implementation cost</small></div>' +
      '<div><span>Total cost of the agent</span><b>' + money(r.totalCost, true) + '</b><small>Implementation plus running cost</small></div></div>' +
      chart(r) +
      '<table class="lc-table"><caption>Annual value by line</caption><tbody>' + tbl + '</tbody></table>' +
      '<p class="k-small">One-off working capital released: ' + money(vals.cash) + ' (added once, in year 1). Its financing value of about ' + money(r.financing) + ' a year is shown for reference and not added again.</p>' +
      '<div class="tscroll"><table class="lc-table lc-years"><caption>Cash flow by year</caption><thead><tr><th scope="col">Year</th><th scope="col" class="num">Benefit</th><th scope="col" class="num">Running cost</th><th scope="col" class="num">Capital</th><th scope="col" class="num">Net</th><th scope="col" class="num">Cumulative</th></tr></thead><tbody>' +
      '<tr><th scope="row">Start</th><td class="num">–</td><td class="num neg">' + money(-vals.build) + '</td><td class="num">–</td><td class="num">' + money(-vals.build) + '</td><td class="num">' + money(-vals.build) + '</td></tr>' + yrs + '</tbody></table></div>';
  }
  build();
})();
