/* Shared interface: mobile menu, copy buttons, ledger category tabs, delegation helper and the enquiry form.
   The enquiry form opens a pre-filled email. Nothing is stored or sent by this site. */
(function () {
  var b = document.querySelector('.menu-btn'), n = document.getElementById('mnav');
  if (b && n) b.addEventListener('click', function () { var o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o ? 'true' : 'false'); b.textContent = o ? 'Close' : 'Menu'; });
  function track(name) { try { document.dispatchEvent(new CustomEvent('kig:conversion', { detail: { event: name } })); } catch (e) {} }

  document.querySelectorAll('.copy').forEach(function (c) {
    c.addEventListener('click', function () {
      var t = c.getAttribute('data-copy');
      try { navigator.clipboard.writeText(t).then(function () { c.textContent = 'Copied'; setTimeout(function () { c.textContent = 'Copy'; }, 1600); }); } catch (e) {}
    });
  });

  /* Tabs (ledger categories). Arrow keys move between tabs. */
  document.querySelectorAll('[role=tablist]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role=tab]'));
    function sel(t) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { sel(t); });
      t.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
        if (j === null) return; e.preventDefault(); j = (j + tabs.length) % tabs.length; sel(tabs[j]); tabs[j].focus();
      });
    });
  });

  /* Delegation helper: suggests a category from five yes/no answers. Rules are in the data-rules attribute. */
  var dq = document.getElementById('dquiz');
  if (dq) {
    var res = document.getElementById('dquiz-out');
    dq.addEventListener('change', function () {
      var a = {}, all = true;
      dq.querySelectorAll('fieldset').forEach(function (f) { var c = f.querySelector('input:checked'); if (!c) all = false; else a[f.getAttribute('data-k')] = c.value === 'yes'; });
      if (!all) { res.innerHTML = '<p>Answer all five questions to see a suggested category.</p>'; return; }
      var cat, why;
      if (a.ind) { cat = 'People decide'; why = 'Decisions with legal or similarly significant effects on individuals should remain with a person, with AI informing only.'; }
      else if (a.val || a.reg || !a.rev) { cat = 'Agent recommends'; why = 'Material, regulated or hard-to-reverse decisions need a named person to authorise them.'; if (a.val && !a.rev && a.reg) { cat = 'People decide'; why = 'High consequence, low reversibility and regulation together point to a human-reserved decision.'; } }
      else if (!a.evd) { cat = 'Agent recommends, for now'; why = 'Low-risk and reversible, but without a track record. Start with recommendations and move outward once evidence builds.'; }
      else { cat = 'Agent acts'; why = 'Reversible, lower-consequence work with a track record can be executed within predefined limits, with monitoring.'; }
      res.innerHTML = '<p class="dq-cat">' + cat + '</p><p>' + why + '</p><p class="k-small">A starting point for discussion, not a determination. Context, regulation and your own risk appetite decide the final placement.</p>';
      track('delegation_helper_used');
    });
  }

  /* Enquiry form -> pre-filled email. */
  var f = document.getElementById('enquiry');
  if (f) {
    var q = new URLSearchParams(location.search).get('type');
    if (q) { var s = f.querySelector('#e-type'); if (s && s.querySelector('option[value="' + q + '"]')) s.value = q; }
    var started = Date.now();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('e-msg'), errs = [];
      f.querySelectorAll('.field').forEach(function (x) { x.classList.remove('bad'); });
      if (f.querySelector('#e-web').value) return;                    // honeypot: bots fill hidden fields
      if (Date.now() - started < 3000) { msg.textContent = 'Please take a moment to review your details, then submit again.'; return; }
      f.querySelectorAll('[required]').forEach(function (el) {
        var ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
        if (ok && el.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        if (!ok) { errs.push(el); var w = el.closest('.field') || el.closest('.consent'); if (w) w.classList.add('bad'); }
      });
      if (errs.length) { msg.textContent = 'Please complete the highlighted fields.'; errs[0].focus(); return; }
      var v = function (id) { var el = f.querySelector('#' + id); return el ? el.value.trim() : ''; };
      var pri = Array.prototype.map.call(f.querySelectorAll('input[name=priority]:checked'), function (c) { return c.value; }).join(', ');
      var typeEl = f.querySelector('#e-type'), typeTxt = typeEl.options[typeEl.selectedIndex].text;
      var body = 'Name: ' + v('e-name') + '\nRole: ' + v('e-role') + '\nOrganisation: ' + v('e-org') + '\nCountry: ' + v('e-country') +
        '\nOrganisation size: ' + v('e-size') + '\nSector: ' + v('e-sector') + '\nEnquiry: ' + typeTxt + '\nAI priorities: ' + (pri || 'Not specified') +
        '\n\n' + v('e-text') + '\n\n(Sent from the enquiry form at kiros-intelligence.com)';
      var href = 'mailto:' + f.getAttribute('data-to') + '?subject=' + encodeURIComponent('Enquiry: ' + typeTxt + ' | ' + v('e-org')) + '&body=' + encodeURIComponent(body);
      track('enquiry_submitted');
      msg.innerHTML = 'Your email app should now open with your enquiry ready to send. If it does not, write to <a href="mailto:' + f.getAttribute('data-to') + '">' + f.getAttribute('data-to') + '</a>.';
      window.location.href = href;
    });
  }
})();
