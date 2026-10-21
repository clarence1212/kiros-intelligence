/* Agent Value Ledger calculation. Pure function: compute(values) -> result.
   Cash-flow view: year 0 = implementation cost; years 1..N = benefits x ramp - running cost;
   the one-off working-capital release is added once, in year 1. */
(function (root) {
  function compute(v) {
    var pct = function (x) { return (x || 0) / 100; };
    var lines = {
      revenue: (v.revScope || 0) * pct(v.revUplift) * pct(v.margin),
      cost: (v.hours || 0) * (v.rate || 0) * pct(v.capture),
      risk: v.riskOn ? (v.risk || 0) : 0
    };
    var annual = lines.revenue + lines.cost + lines.risk;
    var financing = (v.cash || 0) * pct(v.coc);          // shown for information, not added to cash flows
    var years = Math.max(1, Math.min(10, Math.round(v.years || 1)));
    var d = pct(v.coc), flows = [], cum = -(v.build || 0), npv = -(v.build || 0), payback = null;
    var cumList = [{ year: 0, cum: cum }];
    for (var t = 1; t <= years; t++) {
      var ramp = t === 1 ? pct(v.ramp) : 1;
      var benefit = annual * ramp;
      var cf = benefit - (v.run || 0) + (t === 1 ? (v.cash || 0) : 0);
      var prev = cum; cum += cf; npv += cf / Math.pow(1 + d, t);
      if (payback === null && cum >= 0 && cf > 0) payback = (t - 1) + (prev < 0 ? (-prev / cf) : 0);
      flows.push({ year: t, benefit: benefit, run: v.run || 0, capital: t === 1 ? (v.cash || 0) : 0, net: cf, cum: cum });
      cumList.push({ year: t, cum: cum });
    }
    if (payback === null && (v.build || 0) === 0 && flows.length && flows[0].net > 0) payback = 0;
    var totalCost = (v.build || 0) + (v.run || 0) * years;
    return { lines: lines, annual: annual, annualNet: annual - (v.run || 0), financing: financing, flows: flows, cumList: cumList,
             npv: npv, total: cum, payback: payback, years: years, totalCost: totalCost };
  }
  root.LEDGER = { compute: compute };
})(typeof window !== 'undefined' ? window : this);
