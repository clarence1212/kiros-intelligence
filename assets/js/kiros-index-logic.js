/* K-ARVI scoring logic. Pure functions, no page access, so it can be tested on its own.
   score(answers, config) -> result object. answers: { questionId: 0..4 } */
(function (root) {
  function round(n) { return Math.round(n); }
  function bandFor(score, bands) {
    for (var i = 0; i < bands.length; i++) { if (score >= bands[i].min && score <= bands[i].max) return bands[i]; }
    return bands[bands.length - 1];
  }
  function maxScale(cfg) { var m = 0; cfg.scale.forEach(function (s) { if (s.v > m) m = s.v; }); return m; }

  function validate(cfg) {
    var errs = [], ids = {}, w = 0;
    cfg.dimensions.forEach(function (d) { w += d.weight; });
    if (Math.abs(w - 1) > 0.001) errs.push('Dimension weights add up to ' + w.toFixed(3) + ', not 1.');
    cfg.questions.forEach(function (q) { ids[q.id] = true; });
    cfg.pathways.forEach(function (p) {
      var pw = 0;
      Object.keys(p.parts).forEach(function (k) { pw += p.parts[k]; if (!ids[k]) errs.push('Pathway ' + p.id + ' uses unknown question ' + k + '.'); });
      if (Math.abs(pw - 1) > 0.001) errs.push('Pathway ' + p.id + ' weights add up to ' + pw.toFixed(3) + ', not 1.');
    });
    return errs;
  }

  function score(answers, cfg) {
    var top = maxScale(cfg);
    var dims = cfg.dimensions.map(function (d) {
      var qs = cfg.questions.filter(function (q) { return q.dim === d.id; });
      var sum = 0, n = 0;
      qs.forEach(function (q) { if (answers[q.id] !== undefined) { sum += answers[q.id]; n++; } });
      var s = n ? (sum / n) / top * 100 : 0;
      return { id: d.id, name: d.name, weight: d.weight, score: round(s), raw: s, answered: n, total: qs.length };
    });
    var composite = 0;
    dims.forEach(function (d) { composite += d.raw * d.weight; });
    composite = round(composite);

    var pathways = cfg.pathways.map(function (p) {
      var s = 0;
      Object.keys(p.parts).forEach(function (k) { s += ((answers[k] || 0) / top) * p.parts[k]; });
      s = round(s * 100);
      return { id: p.id, name: p.name, score: s, band: bandFor(s, cfg.pathwayBands).name, basis: p.basis };
    });

    var sorted = dims.slice().sort(function (a, b) { return b.raw - a.raw; });
    var strengths = sorted.filter(function (d) { return d.score >= 60; }).slice(0, 2);
    if (!strengths.length) strengths = sorted.slice(0, 1);
    var gaps = sorted.slice().reverse().filter(function (d) { return d.score < 60; }).slice(0, 3);

    var actions = [];
    gaps.forEach(function (d) {
      var list = cfg.actions[d.id] || [];
      var take = d.score < 40 ? 2 : 1;
      list.slice(0, take).forEach(function (a) { actions.push({ dim: d.name, text: a }); });
    });
    if (!actions.length) {
      actions.push({ dim: 'Next step', text: 'Select the two or three highest-value opportunities and build a full Agent Value Ledger case for each.' });
      actions.push({ dim: 'Next step', text: 'Confirm your delegation map and monitoring before scaling agents further.' });
    }

    return { composite: composite, band: bandFor(composite, cfg.bands), dims: dims, pathways: pathways,
             strengths: strengths, gaps: gaps, actions: actions.slice(0, 5) };
  }

  root.KARVI = { score: score, validate: validate, bandFor: bandFor };
})(typeof window !== 'undefined' ? window : this);
