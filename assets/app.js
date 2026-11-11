(function () {
  const $ = s => document.querySelector(s);
  const h = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  let goal = "all";
  let current = METHODS.find(m => "#" + m.id === location.hash) || METHODS[0];
  let study = store.get("rm-study", null) || { ...PRESETS[0] };

  /* ---------- chooser ---------- */
  function renderGoals() {
    $("#goals").innerHTML = GOALS.map(g => `<button type="button" data-goal="${g.id}" aria-pressed="${g.id === goal}">${g.label}</button>`).join("");
  }
  function renderTiles() {
    $("#tiles").innerHTML = Object.keys(FAMILIES).map(f => `
      <div class="fam"><h3>${FAMILIES[f]}</h3><div class="tilerow">${METHODS.filter(m => m.family === f).map(m => {
        const fits = goal === "all" || m.goals.includes(goal);
        return `<button type="button" class="tile${fits ? "" : " dim"}" data-id="${m.id}" aria-current="${m.id === current.id}"><strong>${m.name}</strong><span>${m.short}</span></button>`;
      }).join("")}</div></div>`).join("");
  }

  /* ---------- templates ---------- */
  function fill(tpl) {
    const cls = { P: "mp", X: "mx", C: "mc", Y: "my" };
    return h(tpl).replace(/\{([PXCY])\}/g, (m, k, pos) => {
      let v = (study[k] || "").trim() || { P: "your population", X: "the exposure", C: "the comparison", Y: "the outcome" }[k];
      if (pos === 0) v = v.charAt(0).toUpperCase() + v.slice(1);
      return `<mark class="${cls[k]}">${h(v)}</mark>`;
    });
  }
  function renderStatements() {
    const m = current;
    $("#stmt").innerHTML = `
      <h3>Research question</h3>
      <p class="rq">${fill(m.q)}</p>
      <div class="hyps">${m.statements.map(s => `<div class="hyp"><div class="tag">${s.tag}</div><div><h4>${s.name}</h4><p>${fill(s.text)}</p></div></div>`).join("")}</div>
      <p class="note">${m.hypNote}</p>`;
  }

  /* ---------- sheet ---------- */
  const STEPS = ["Problem", "Plan", "Data", "Analysis", "Conclusion"];
  function renderSheet() {
    const m = current, i = METHODS.indexOf(m);
    const prev = METHODS[(i + METHODS.length - 1) % METHODS.length], next = METHODS[(i + 1) % METHODS.length];
    const fields = [["P", "lp", "Population"], ["X", "lx", "Intervention or exposure"], ["C", "lc", "Comparison"], ["Y", "ly", "Outcome"]];
    $("#sheet").innerHTML = `
      <div class="sheet-head">
        <span class="fam-tag">${FAMILIES[m.family].split(":")[0]}</span>
        <h2>${m.name}</h2>
        <p>${m.short}</p>
      </div>

      <div class="panel">
        <div class="diagram" tabindex="0">${DIAGRAMS[m.id]()}</div>
        <div class="legend">
          <span><i style="background:var(--x)"></i>Intervention or exposed</span>
          <span><i style="background:var(--c)"></i>Comparison</span>
          <span><i style="background:var(--y);box-shadow:inset 0 0 0 1.5px var(--ink)"></i>Outcome occurred or was recorded</span>
          <span><i style="background:var(--n)"></i>Not yet grouped</span>
        </div>
      </div>

      <div class="panel qh">
        <div class="study">
          <h3>Write it for your own study</h3>
          <p class="small">Fill these in and the question and hypotheses rewrite themselves for every design.</p>
          ${fields.map(f => `<label>${f[2]}<input class="${f[1]}" data-k="${f[0]}" value="${h(study[f[0]] || "")}" autocomplete="off"></label>`).join("")}
          <div class="presets">${PRESETS.map((p, k) => `<button type="button" data-preset="${k}">${p.label}</button>`).join("")}</div>
        </div>
        <div class="stmt" id="stmt"></div>
      </div>

      <div class="panel cancant">
        <div><h3>What it can tell you</h3><p>${m.tells}</p></div>
        <div><h3>What it cannot</h3><p>${m.cannot}</p></div>
      </div>

      <div class="panel three">
        <div class="need"><h3>What you need</h3><ul>${m.need.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div><h3>How you analyse it</h3><ul>${m.analysis.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div class="wrong"><h3>What goes wrong</h3><ul>${m.wrong.map(x => `<li>${x}</li>`).join("")}</ul></div>
      </div>

      <div class="panel">
        <h3>Worked example: ${m.ex.title}</h3>
        <p class="exref">${m.ex.ref} of The Art of Statistics, laid out as the Problem, Plan, Data, Analysis, Conclusion cycle</p>
        <ol class="ppdac">${m.ex.steps.map((s, k) => `<li><b>${STEPS[k]}</b><p>${s}</p></li>`).join("")}</ol>
      </div>

      <div class="pager">
        <button type="button" data-id="${prev.id}">Previous: ${prev.name}</button>
        <button type="button" data-id="${next.id}">Next: ${next.name}</button>
      </div>`;
    renderStatements();
  }

  function select(id, scroll) {
    current = METHODS.find(m => m.id === id) || current;
    history.replaceState(null, "", "#" + current.id);
    renderTiles(); renderSheet();
    if (scroll) $("#sheet").scrollIntoView();
  }

  document.addEventListener("click", e => {
    const g = e.target.closest("[data-goal]"), t = e.target.closest("[data-id]"), p = e.target.closest("[data-preset]");
    if (g) { goal = g.dataset.goal; renderGoals(); renderTiles(); }
    else if (t) select(t.dataset.id, true);
    else if (p) { study = { ...PRESETS[+p.dataset.preset] }; store.set("rm-study", study); renderSheet(); }
  });
  document.addEventListener("input", e => {
    const k = e.target.dataset && e.target.dataset.k;
    if (k) { study[k] = e.target.value; store.set("rm-study", study); renderStatements(); }
  });
  window.addEventListener("hashchange", () => {
    const m = METHODS.find(x => "#" + x.id === location.hash);
    if (m && m !== current) select(m.id, true);
  });

  /* ---------- trial simulator ---------- */
  const NS = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
  const fmt = n => n.toLocaleString("en-GB");
  const pct = (v, d = 1) => (v * 100).toFixed(d) + "%";
  function phi(z) { // standard normal CDF
    const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
  function binom(n, p) { let k = 0; for (let i = 0; i < n; i++) if (Math.random() < p) k++; return k; }
  function trial(n, pc, pt) {
    const a = binom(n, pt), b = binom(n, pc), rt = a / n, rc = b / n, pool = (a + b) / (2 * n);
    const se0 = Math.sqrt(2 * pool * (1 - pool) / n) || 1e-9, se = Math.sqrt(rt * (1 - rt) / n + rc * (1 - rc) / n);
    const z = (rt - rc) / se0;
    return { rt, rc, diff: rt - rc, lo: rt - rc - 1.96 * se, hi: rt - rc + 1.96 * se, p: 2 * (1 - phi(Math.abs(z))) };
  }
  function simInputs() {
    const clamp = v => Math.min(0.99, Math.max(0.001, (parseFloat(v) || 0) / 100));
    return { n: NS[+$("#simN").value], pc: clamp($("#simC").value), pt: clamp($("#simT").value) };
  }
  function icons(rate, cls) {
    const k = Math.round(rate * 100);
    return `<div class="icons" role="img" aria-label="${k} of 100 with the outcome">${Array.from({ length: 100 }, (_, i) => `<i class="${i < k ? "ie" : cls}"></i>`).join("")}</div>`;
  }
  function pText(p) { return p < 0.0001 ? "below 0.0001" : p.toFixed(p < 0.01 ? 4 : 2); }

  $("#simN").addEventListener("input", () => { $("#simNout").textContent = fmt(NS[+$("#simN").value]); });
  $("#simOne").addEventListener("click", () => {
    const { n, pc, pt } = simInputs(), r = trial(n, pc, pt);
    const sig = r.p < 0.05;
    $("#simOut").innerHTML = `
      <div class="arms">
        <div class="arm"><h4>Intervention arm, ${fmt(n)} people</h4><div class="big">${pct(r.rt)}</div>${icons(r.rt, "ix")}</div>
        <div class="arm"><h4>Control arm, ${fmt(n)} people</h4><div class="big">${pct(r.rc)}</div>${icons(r.rc, "ic")}</div>
      </div>
      <p class="small">Each grid shows the observed rate per 100 people. Yellow means the outcome occurred.</p>
      <p class="verdict">Observed difference ${(r.diff * 100).toFixed(1)} percentage points (95% interval ${(r.lo * 100).toFixed(1)} to ${(r.hi * 100).toFixed(1)}), P-value ${pText(r.p)}.
      ${sig ? "This trial would be declared statistically significant." : "This trial would not reach significance, although the true risks you set really do differ by " + ((pt - pc) * 100).toFixed(1) + " points."}</p>`;
  });
  $("#simMany").addEventListener("click", () => {
    const { n, pc, pt } = simInputs(), diffs = []; let sig = 0, wrong = 0;
    for (let i = 0; i < 1000; i++) { const r = trial(n, pc, pt); diffs.push(r.diff * 100); if (r.p < 0.05) sig++; if (Math.sign(r.diff) !== Math.sign(pt - pc) && r.diff !== 0) wrong++; }
    const lo = Math.min(...diffs, 0), hi = Math.max(...diffs, 0), bins = 31, w = (hi - lo) / bins || 1, c = Array(bins).fill(0);
    diffs.forEach(d => c[Math.min(bins - 1, Math.floor((d - lo) / w))]++);
    const mx = Math.max(...c), X = v => 20 + (v - lo) / (hi - lo || 1) * 600, truth = (pt - pc) * 100;
    const bars = c.map((k, i) => `<rect x="${20 + i * 600 / bins + 1}" y="${130 - k / mx * 110}" width="${600 / bins - 2}" height="${k / mx * 110}" fill="var(--n)"/>`).join("");
    $("#simOut").innerHTML = `
      <div class="big">${(sig / 10).toFixed(0)}% reached P &lt; 0.05</div>
      <div class="hist"><svg viewBox="0 0 640 170" role="img" aria-label="Histogram of observed differences across 1,000 simulated trials">${bars}
        <line x1="${X(0)}" y1="14" x2="${X(0)}" y2="134" class="axis dash"/><line x1="${X(truth)}" y1="14" x2="${X(truth)}" y2="134" class="fit"/>
        <line x1="20" y1="131" x2="620" y2="131" class="axis"/>
        <text x="${X(0)}" y="150" class="ts" text-anchor="middle">no difference</text><text x="${X(truth)}" y="164" class="ts gxt" text-anchor="middle">true difference ${truth.toFixed(1)}</text>
        <text x="20" y="150" class="ts">${lo.toFixed(1)}</text><text x="620" y="150" class="ts" text-anchor="end">${hi.toFixed(1)}</text></svg></div>
      <p class="verdict">Across 1,000 simulated trials with ${fmt(n)} people per arm, ${fmt(sig)} detected the effect. That share is the trial's power. ${fmt(1000 - sig)} would have missed a difference that is really there${wrong ? ", and " + fmt(wrong) + " pointed in the wrong direction" : ""}. Trials are usually planned for at least 80% power.</p>`;
  });

  /* ---------- effect measures ---------- */
  const EFF = [["Bacon and bowel cancer", 6, 7], ["Statins and heart attacks", 11.8, 8.7], ["Statins and muscle pain", 85, 87]];
  $("#effPresets").innerHTML = EFF.map((e, i) => `<button type="button" class="ghost" data-eff="${i}">${e[0]}</button>`).join("");
  function renderEff() {
    const c = Math.min(99.9, Math.max(0.1, parseFloat($("#effC").value) || 0.1)) / 100, x = Math.min(99.9, Math.max(0.1, parseFloat($("#effX").value) || 0.1)) / 100;
    const d = x - c, rr = x / c, or = (x / (1 - x)) / (c / (1 - c)), nn = d === 0 ? null : Math.round(1 / Math.abs(d));
    const rel = (rr - 1) * 100;
    $("#effOut").innerHTML = `
      <div class="arms">
        <div class="arm"><h4>Exposed: ${pct(x)} of 100</h4>${icons(x, "ix")}</div>
        <div class="arm"><h4>Comparison: ${pct(c)} of 100</h4>${icons(c, "ic")}</div>
      </div>
      <table class="eff">
        <tr><th>Absolute difference</th><td><b>${d >= 0 ? "+" : ""}${(d * 100).toFixed(1)} points</b><span>about ${Math.abs(d * 100).toFixed(1)} ${d >= 0 ? "extra" : "fewer"} cases in every 100 people</span></td></tr>
        <tr><th>Relative risk</th><td><b>${rr.toFixed(2)}</b><span>${rel >= 0 ? "a " + rel.toFixed(0) + "% increase" : "a " + Math.abs(rel).toFixed(0) + "% reduction"}, the figure headlines prefer</span></td></tr>
        <tr><th>Odds ratio</th><td><b>${or.toFixed(2)}</b><span>${Math.abs(or - rr) > 0.05 ? "far from the relative risk, because the outcome is common" : "close to the relative risk, because the outcome is fairly rare"}</span></td></tr>
        <tr><th>Number needed</th><td><b>${nn ? fmt(nn) : "n/a"}</b><span>${nn ? "people exposed for one " + (d >= 0 ? "extra case" : "case prevented") : "no difference"}</span></td></tr>
      </table>`;
  }
  $("#effC").addEventListener("input", renderEff); $("#effX").addEventListener("input", renderEff);
  $("#effPresets").addEventListener("click", e => { const b = e.target.closest("[data-eff]"); if (!b) return; const p = EFF[+b.dataset.eff]; $("#effC").value = p[1]; $("#effX").value = p[2]; renderEff(); });

  /* ---------- ten questions ---------- */
  let qn = 0;
  $("#tenq").innerHTML = TEN_QUESTIONS.map(g => `<div><h3>${g.group}</h3><ol>${g.items.map(it => `<li><b class="num">${++qn}</b><div><strong>${it[0]}</strong><p>${it[1]}</p></div></li>`).join("")}</ol></div>`).join("");

  renderGoals(); renderTiles(); renderSheet(); renderEff();
})();
