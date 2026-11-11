(function () {
  const $ = s => document.querySelector(s);
  const app = $("#app");
  const h = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const I = key => `<button type="button" class="info" data-info="${key}" aria-label="Explain: ${h(GLOSSARY[key][1])}">i</button>`;

  /* ---------- one list of all methods ---------- */
  const ALL = {};
  METHODS.forEach(m => {
    const x = EXTRA[m.id];
    ALL[m.id] = { ...m, ...x, when: m.short, how: m.analysis, watch: m.wrong, book: true };
  });
  MORE.forEach(m => {
    const statements = m.aim
      ? [{ tag: "🎯", name: "Aim", key: "aim", text: m.aim }]
      : [{ tag: "H0", name: "Null hypothesis", text: m.h0 }, { tag: "H1", name: "Alternative hypothesis", text: m.h1 }];
    ALL[m.id] = { ...m, statements };
  });
  const LIST = FAMILIES.flatMap(f => ORDER[f.id].map(id => ALL[id]));
  const famOf = m => FAMILIES.find(f => f.id === m.f);
  $("#count-pill").textContent = LIST.length + " methods";

  let study = store.get("rm-study2", null) || { ...PRESETS[0] };
  let filter = "all", query = "";
  let path = []; // chooser: [{node, label}], last may hold results

  /* ---------- small pieces ---------- */
  const DATA_E = { Numbers: "🔢", Words: "🗣️", Both: "🔀" };
  const CAUSE_E = { Yes: "✅", Partly: "🟡", No: "❌", Depends: "🟡" };
  function card(m) {
    return `<a class="mcard" href="#/m/${m.id}"><span class="em">${m.e}</span><b>${m.name}</b><p>${m.kid}</p>
      <span class="chips"><span class="chip plain">${DATA_E[m.facts[2]]} ${m.facts[2]}</span>${m.facts[3] === "Yes" ? `<span class="chip">⚡ Shows cause</span>` : ""}</span></a>`;
  }
  function fill(tpl) {
    const cls = { P: "mp", X: "mx", C: "mc", Y: "my" };
    return h(tpl).replace(/\{([PXCY])\}/g, (m, k, pos) => {
      let v = (study[k] || "").trim() || { P: "your group", X: "the new thing", C: "the usual thing", Y: "the result" }[k];
      if (pos === 0) v = v.charAt(0).toUpperCase() + v.slice(1);
      return `<mark class="${cls[k]}">${h(v)}</mark>`;
    });
  }
  const elist = (arr, e) => `<ul class="elist">${arr.map(x => `<li><span>${e}</span><span>${x}</span></li>`).join("")}</ul>`;

  /* ---------- page: all methods ---------- */
  function pageMethods() {
    app.innerHTML = `
      <section class="hero">
        <h1 class="hero-title">Find the right way to <span class="gradient-text">answer your question</span></h1>
        <p class="hero-sub">${LIST.length} research methods, each explained in plain words with pictures, an example, and the question and hypothesis written out for you. Tap any card to open it.</p>
        <div class="hero-actions">
          <a class="btn" href="#/choose">🧭 Help me choose a method</a>
          <input class="search" id="search" type="search" placeholder="🔍 Search, for example: interview, cause, map" value="${h(query)}" aria-label="Search methods">
        </div>
        <div class="chips center" id="filters" role="group" aria-label="Show one family">
          <button class="filter" data-fam="all" aria-pressed="${filter === "all"}">✨ All</button>
          ${FAMILIES.map(f => `<button class="filter" data-fam="${f.id}" aria-pressed="${filter === f.id}">${f.e} ${f.name}</button>`).join("")}
        </div>
      </section>
      <div id="list"></div>
      <p class="footer-note">The twelve designs with detailed diagrams follow David Spiegelhalter, <i>The Art of Statistics</i> (Pelican, 2019). Other examples are well-known published studies, or are marked “Illustration” where they are made up to show the idea. No list of research methods is ever complete: these are the ones used most across the sciences, social sciences and humanities.</p>`;
    drawList();
  }
  function drawList() {
    const q = query.trim().toLowerCase();
    const html = FAMILIES.filter(f => filter === "all" || filter === f.id).map(f => {
      const ms = ORDER[f.id].map(id => ALL[id]).filter(m => !q || (m.name + " " + m.kid + " " + m.when + " " + f.name).toLowerCase().includes(q));
      return ms.length ? `<section class="fam"><div class="fam-head"><h2>${f.e} ${f.name}</h2><p>${f.kid}</p></div><div class="grid">${ms.map(card).join("")}</div></section>` : "";
    }).join("");
    $("#list").innerHTML = html || `<p class="empty">🤔 Nothing matches “${h(query)}”. Try a shorter word, or <a href="#/choose">let the chooser help</a>.</p>`;
  }

  /* ---------- page: one method ---------- */
  const STEPS = ["Problem", "Plan", "Data", "Analysis", "Conclusion"];
  function statementsHtml(m) {
    return `<h3>Your research question ${I("rq")}</h3><p class="rq">${fill(m.q)}</p>
      <div class="hyps">${m.statements.map(s => {
        const key = s.key || { H0: "h0", H1: "h1" }[s.tag];
        return `<div class="hyp"><div class="tag">${s.tag}</div><div><h4>${s.name} ${key ? I(key) : ""}</h4><p>${fill(s.text)}</p></div></div>`;
      }).join("")}</div>${m.hypNote ? `<p class="note">💡 ${m.hypNote}</p>` : ""}`;
  }
  function pageMethod(id) {
    const m = ALL[id]; if (!m) return pageMethods();
    const i = LIST.indexOf(m), prev = LIST[(i + LIST.length - 1) % LIST.length], next = LIST[(i + 1) % LIST.length], f = famOf(m);
    const fields = [["P", "👥 Who are you studying?"], ["X", "✨ What is new or different?"], ["C", "⚖️ Compared with what?"], ["Y", "🎯 What do you measure?"]];
    app.innerHTML = `
      <div class="topbar"><a class="btn-ghost" href="#/methods">⬅ All methods</a><a class="btn-ghost" href="#/choose">🧭 Help me choose</a></div>
      <section class="hero hero-sm">
        <div class="hero-emoji">${m.e}</div>
        <h1 class="hero-title">${m.name}</h1>
        <div class="chips center" style="margin-top:0"><span class="chip">${f.e} ${f.name}</span></div>
      </section>

      <div class="card"><h3>In plain words</h3><p class="kid">${m.kid}</p><p class="when"><b>Use it when:</b> ${m.when}</p></div>

      <div class="kpis">
        <div class="kpi"><div class="k">Time ${I("f_time")}</div><div class="v">${TIME[m.facts[0]]}</div><div class="dots">${"⏳".repeat(m.facts[0])}</div></div>
        <div class="kpi"><div class="k">Cost ${I("f_cost")}</div><div class="v">${COST[m.facts[1]]}</div><div class="dots">${"💰".repeat(m.facts[1])}</div></div>
        <div class="kpi"><div class="k">Data ${I("f_data")}</div><div class="v">${m.facts[2]}</div><div class="dots">${DATA_E[m.facts[2]]}</div></div>
        <div class="kpi accent"><div class="k">Shows cause? ${I("f_cause")}</div><div class="v">${m.facts[3]}</div><div class="dots">${CAUSE_E[m.facts[3]]}</div></div>
      </div>

      <div class="card"><h3>How it works ${I("steps")}</h3>
        <div class="flow">${m.steps.map((s, k) => `${k ? `<span class="arr" aria-hidden="true"></span>` : ""}<div class="step"><span class="n">${k + 1}</span><span class="em">${s[0]}</span><span class="t">${s[1]}</span></div>`).join("")}</div>
      </div>

      ${DIAGRAMS[m.id] ? `<div class="card"><h3>A closer look at the design</h3><div class="diagram" tabindex="0">${DIAGRAMS[m.id]()}</div>
        <div class="legend"><span><i style="background:var(--x)"></i>Got the new thing, or exposed</span><span><i style="background:var(--c)"></i>Comparison</span><span><i style="background:var(--y);box-shadow:inset 0 0 0 1.5px var(--ink)"></i>Outcome happened</span><span><i style="background:var(--n)"></i>Not yet grouped</span></div></div>` : ""}

      <div class="card qh">
        <div>
          <h3>Make it yours ${I("pico")}</h3>
          <p class="sub">Type your own study here. The question and hypotheses on the right rewrite themselves, on every method.</p>
          ${fields.map(fl => `<div class="field"><div class="field-head">${fl[1]}</div><input data-k="${fl[0]}" value="${h(study[fl[0]] || "")}" autocomplete="off" aria-label="${h(fl[1])}"></div>`).join("")}
          <div class="chips">${PRESETS.map((p, k) => `<button type="button" class="chip" data-preset="${k}">${p.label}</button>`).join("")}</div>
        </div>
        <div id="stmt">${statementsHtml(m)}</div>
      </div>

      ${m.tells ? `<div class="two"><div class="card"><h3>👍 What it can tell you</h3><p>${m.tells}</p></div><div class="card"><h3>👎 What it cannot</h3><p>${m.cannot}</p></div></div>` : ""}

      <div class="three">
        <div class="card"><h3>🎒 What you need ${I("need")}</h3>${elist(m.need, "☑️")}</div>
        <div class="card"><h3>🧮 How you analyse it ${I("how")}</h3>${elist(m.how, "▶️")}</div>
        <div class="card"><h3>⚠️ Watch out ${I("watch")}</h3>${elist(m.watch, "⚠️")}</div>
      </div>

      <div class="card"><h3>🌟 Example ${I("example")}</h3>
        ${m.book ? `<p><b>${m.ex.title}</b></p><p class="sub">${m.ex.ref} of The Art of Statistics, as five steps ${I("ppdac")}</p>
          <ol class="ppdac">${m.ex.steps.map((s, k) => `<li><b>${k + 1}. ${STEPS[k]}</b>${s}</li>`).join("")}</ol>` : `<p>${m.ex}</p>`}
      </div>

      <div class="card"><h3>📖 Words to know</h3><div class="chips">${m.terms.map(t => `<button type="button" class="chip" data-info="${t}">${GLOSSARY[t][0]} ${GLOSSARY[t][1]}</button>`).join("")}</div></div>

      <div class="pager"><a class="btn-ghost" href="#/m/${prev.id}">⬅ ${prev.e} ${prev.name}</a><a class="btn-ghost" href="#/m/${next.id}">${next.name} ${next.e} ➡</a></div>`;
  }

  /* ---------- page: help me choose ---------- */
  function pageChoose() {
    const last = path[path.length - 1];
    const results = last && last.results;
    const node = results ? null : CHOOSER[last ? last.next : "start"];
    app.innerHTML = `
      <section class="hero hero-sm">
        <div class="hero-emoji">🧭</div>
        <h1 class="hero-title">${results ? "These methods fit" : node.q}</h1>
        <p class="hero-sub">${results ? "Open any card to see how it works. Not sure? Go back a step and try another answer." : "Tap the answer that fits best. There are at most three questions."}</p>
      </section>
      ${path.length ? `<div class="crumbs">${path.map(p => `<span class="chip">${p.e} ${p.label}</span>`).join("")}<button class="btn-ghost" data-choose="back">⬅ Back a step</button><button class="btn-ghost" data-choose="reset">🔄 Start again</button></div>` : ""}
      ${results ? `<div class="grid">${results.map(id => card(ALL[id])).join("")}</div>`
        : `<div class="opts">${node.opts.map((o, k) => `<button class="opt" data-opt="${k}"><span class="em">${o[0]}</span><b>${o[1]}</b></button>`).join("")}</div>`}`;
  }

  /* ---------- page: numbers ---------- */
  const NS = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
  const fmt = n => n.toLocaleString("en-GB");
  const pct = (v, d = 1) => (v * 100).toFixed(d) + "%";
  function phi(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
  function binom(n, p) { let k = 0; for (let i = 0; i < n; i++) if (Math.random() < p) k++; return k; }
  function trial(n, pc, pt) {
    const a = binom(n, pt), b = binom(n, pc), rt = a / n, rc = b / n, pool = (a + b) / (2 * n);
    const se0 = Math.sqrt(2 * pool * (1 - pool) / n) || 1e-9, se = Math.sqrt(rt * (1 - rt) / n + rc * (1 - rc) / n);
    return { rt, rc, diff: rt - rc, lo: rt - rc - 1.96 * se, hi: rt - rc + 1.96 * se, p: 2 * (1 - phi(Math.abs((rt - rc) / se0))) };
  }
  function icons(rate, cls) {
    const k = Math.round(rate * 100);
    return `<div class="icons" role="img" aria-label="${k} of 100 with the outcome">${Array.from({ length: 100 }, (_, i) => `<i class="${i < k ? "ie" : cls}"></i>`).join("")}</div>`;
  }
  const EFF = [["🥓 Bacon and bowel cancer", 6, 7], ["💊 Statins and heart attacks", 11.8, 8.7], ["💪 Statins and muscle pain", 85, 87]];
  function pageNumbers() {
    app.innerHTML = `
      <section class="hero hero-sm"><div class="hero-emoji">🧮</div><h1 class="hero-title">Try the numbers</h1>
        <p class="hero-sub">Two small machines to play with. One shows why big studies are more trustworthy. The other shows how the same result can sound scary or boring.</p></section>
      <div class="card"><h2>🎲 How big does a study need to be? ${I("power")}</h2>
        <p>Imagine a medicine that really works. Press the button to run a pretend trial. Small trials often miss the effect just by bad luck.</p>
        <div class="controls">
          <label>Without the medicine, how many get ill? (%)<input type="number" id="simC" value="11.8" min="0.1" max="99" step="0.1"></label>
          <label>With the medicine, how many get ill? (%)<input type="number" id="simT" value="8.7" min="0.1" max="99" step="0.1"></label>
          <label><span>People in each group: <output id="simNout">200</output></span><input type="range" id="simN" min="0" max="7" step="1" value="2"></label>
        </div>
        <div class="btns"><button type="button" class="btn" id="simOne">▶️ Run one trial</button><button type="button" class="btn-ghost" id="simMany">⏩ Run 1,000 trials</button></div>
        <div id="simOut" class="out"><p class="sub">Run one trial, then run it again. The answer changes each time even though the truth has not.</p></div>
      </div>
      <div class="card"><h2>📣 One result, four ways to say it ${I("relrisk")}</h2>
        <p>Headlines love “18% higher risk!”. Out of 100 people, that may be just one extra case.</p>
        <div class="btns">${EFF.map((e, i) => `<button type="button" class="btn-ghost" data-eff="${i}">${e[0]}</button>`).join("")}</div>
        <div class="controls">
          <label>Risk in the comparison group (%)<input type="number" id="effC" value="6" min="0.1" max="99.9" step="0.1"></label>
          <label>Risk in the exposed group (%)<input type="number" id="effX" value="7" min="0.1" max="99.9" step="0.1"></label>
        </div>
        <div id="effOut" class="out"></div>
      </div>`;
    renderEff();
  }
  function simInputs() {
    const cl = v => Math.min(0.99, Math.max(0.001, (parseFloat(v) || 0) / 100));
    return { n: NS[+$("#simN").value], pc: cl($("#simC").value), pt: cl($("#simT").value) };
  }
  function simOne() {
    const { n, pc, pt } = simInputs(), r = trial(n, pc, pt), sig = r.p < 0.05;
    $("#simOut").innerHTML = `
      <div class="arms">
        <div class="arm"><h4>With the medicine, ${fmt(n)} people</h4><div class="big">${pct(r.rt)}</div>${icons(r.rt, "ix")}</div>
        <div class="arm"><h4>Without it, ${fmt(n)} people</h4><div class="big">${pct(r.rc)}</div>${icons(r.rc, "ic")}</div>
      </div>
      <p class="sub">Each grid shows the result per 100 people. Yellow dots got ill.</p>
      <p class="verdict">${sig ? "✅ This trial spotted the effect." : "❌ This trial missed it, even though the medicine really works."}
        Difference ${(r.diff * 100).toFixed(1)} points (likely range ${(r.lo * 100).toFixed(1)} to ${(r.hi * 100).toFixed(1)}), P-value ${r.p < 0.0001 ? "below 0.0001" : r.p.toFixed(r.p < 0.01 ? 4 : 2)} ${I("pvalue")}</p>`;
  }
  function simMany() {
    const { n, pc, pt } = simInputs(), diffs = []; let sig = 0;
    for (let i = 0; i < 1000; i++) { const r = trial(n, pc, pt); diffs.push(r.diff * 100); if (r.p < 0.05) sig++; }
    const lo = Math.min(...diffs, 0), hi = Math.max(...diffs, 0), bins = 31, w = (hi - lo) / bins || 1, c = Array(bins).fill(0);
    diffs.forEach(d => c[Math.min(bins - 1, Math.floor((d - lo) / w))]++);
    const mx = Math.max(...c), X = v => 20 + (v - lo) / (hi - lo || 1) * 600, truth = (pt - pc) * 100;
    $("#simOut").innerHTML = `
      <div class="big">${Math.round(sig / 10)} out of 100 trials spotted it</div>
      <div class="hist"><svg viewBox="0 0 640 170" role="img" aria-label="Spread of results across 1,000 pretend trials">
        ${c.map((k, i) => `<rect x="${20 + i * 600 / bins + 1}" y="${130 - k / mx * 110}" width="${600 / bins - 2}" height="${k / mx * 110}" fill="var(--n)"/>`).join("")}
        <line x1="${X(0)}" y1="14" x2="${X(0)}" y2="134" class="axis dash"/><line x1="${X(truth)}" y1="14" x2="${X(truth)}" y2="134" class="fit"/><line x1="20" y1="131" x2="620" y2="131" class="axis"/>
        <text x="${X(0)}" y="150" class="ts" text-anchor="middle">no difference</text><text x="${X(truth)}" y="164" class="ts gxt" text-anchor="middle">the truth: ${truth.toFixed(1)}</text></svg></div>
      <p class="verdict">Each bar counts trials that gave that answer. With ${fmt(n)} people per group, ${fmt(sig)} of 1,000 trials found the effect and ${fmt(1000 - sig)} missed it. Researchers aim for at least 80 out of 100. Slide the group size up and try again.</p>`;
  }
  function renderEff() {
    const cl = v => Math.min(99.9, Math.max(0.1, parseFloat(v) || 0.1)) / 100;
    const c = cl($("#effC").value), x = cl($("#effX").value), d = x - c, rr = x / c, or = (x / (1 - x)) / (c / (1 - c)), nn = d === 0 ? null : Math.round(1 / Math.abs(d)), rel = (rr - 1) * 100;
    $("#effOut").innerHTML = `
      <div class="arms"><div class="arm"><h4>Exposed: ${pct(x)}</h4>${icons(x, "ix")}</div><div class="arm"><h4>Comparison: ${pct(c)}</h4>${icons(c, "ic")}</div></div>
      <table class="tbl">
        <tr><th>Plain difference</th><td><b>${d >= 0 ? "+" : ""}${(d * 100).toFixed(1)} points</b><span>about ${Math.abs(d * 100).toFixed(1)} ${d >= 0 ? "extra" : "fewer"} in every 100 people</span></td></tr>
        <tr><th>Relative risk</th><td><b>${rr.toFixed(2)}</b><span>“${Math.abs(rel).toFixed(0)}% ${rel >= 0 ? "higher" : "lower"}”, the number headlines use</span></td></tr>
        <tr><th>Odds ratio</th><td><b>${or.toFixed(2)}</b><span>${Math.abs(or - rr) > 0.05 ? "far from the relative risk, because the outcome is common" : "close to the relative risk, because the outcome is fairly rare"}</span></td></tr>
        <tr><th>Number needed</th><td><b>${nn ? fmt(nn) : "none"}</b><span>${nn ? "people exposed for one " + (d >= 0 ? "extra case" : "case prevented") : "no difference"}</span></td></tr>
      </table>`;
  }

  /* ---------- page: claims ---------- */
  function pageClaims() {
    const ge = ["🔢", "📰", "🧠"]; let n = 0;
    app.innerHTML = `
      <section class="hero hero-sm"><div class="hero-emoji">✅</div><h1 class="hero-title">Ten questions to ask before you believe a claim</h1>
        <p class="hero-sub">Use these whenever a headline, advert or report says “a study shows…”. Adapted from the checklist that closes The Art of Statistics.</p></section>
      <div class="three">${TEN_QUESTIONS.map((g, k) => `<div class="card"><h2>${ge[k]} ${g.group}</h2><ol class="qlist">${g.items.map(it => `<li><span class="num">${++n}</span><div><strong>${it[0]}</strong><p>${it[1]}</p></div></li>`).join("")}</ol></div>`).join("")}</div>`;
  }

  /* ---------- page: words ---------- */
  const HIDE = new Set(["f_time", "f_cost", "f_data", "f_cause", "steps", "need", "how", "watch", "example"]);
  let wq = "";
  function pageWords() {
    app.innerHTML = `
      <section class="hero hero-sm"><div class="hero-emoji">📖</div><h1 class="hero-title">Research words in plain language</h1>
        <p class="hero-sub">Every word behind the little <span class="info" style="cursor:default">i</span> buttons, in one place.</p>
        <div class="hero-actions"><input class="search" id="wsearch" type="search" placeholder="🔍 Search a word" value="${h(wq)}" aria-label="Search words"></div></section>
      <div class="grid" id="wlist"></div>`;
    drawWords();
  }
  function drawWords() {
    const q = wq.trim().toLowerCase();
    const items = Object.keys(GLOSSARY).filter(k => !HIDE.has(k)).map(k => GLOSSARY[k]).filter(g => !q || (g[1] + " " + g[2]).toLowerCase().includes(q)).sort((a, b) => a[1].localeCompare(b[1]));
    $("#wlist").innerHTML = items.map(g => `<div class="word"><b>${g[0]} ${g[1]}</b><p>${g[2]}</p></div>`).join("") || `<p class="empty">🤔 No word matches “${h(wq)}”.</p>`;
  }

  /* ---------- router ---------- */
  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const page = parts[0] || "methods";
    hidePop();
    document.querySelectorAll(".main-nav a").forEach(a => a.classList.toggle("active", a.dataset.page === (page === "m" ? "methods" : page)));
    if (page === "m") pageMethod(parts[1]);
    else if (page === "choose") pageChoose();
    else if (page === "numbers") pageNumbers();
    else if (page === "claims") pageClaims();
    else if (page === "words") pageWords();
    else pageMethods();
    window.scrollTo(0, 0);
    document.title = (page === "m" && ALL[parts[1]] ? ALL[parts[1]].name + " | " : "") + "Research Methods Explorer";
  }
  window.addEventListener("hashchange", route);

  /* ---------- popover ---------- */
  const pop = $("#popover");
  function hidePop() { pop.hidden = true; }
  function showPop(btn) {
    const g = GLOSSARY[btn.dataset.info]; if (!g) return;
    pop.innerHTML = `<button class="x" aria-label="Close">×</button><b>${g[0]} ${g[1]}</b>${g[2]}`;
    pop.hidden = false;
    const r = btn.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
    let left = Math.min(window.innerWidth - pw - 12, Math.max(12, r.left - 20));
    let top = r.bottom + 8; if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 8);
    pop.style.left = left + "px"; pop.style.top = top + "px";
  }
  document.addEventListener("keydown", e => { if (e.key === "Escape") hidePop(); });
  window.addEventListener("scroll", hidePop, { passive: true });

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const t = e.target;
    const info = t.closest("[data-info]");
    if (info) { e.preventDefault(); showPop(info); return; }
    if (!t.closest("#popover") || t.closest(".x")) hidePop();
    const fam = t.closest("[data-fam]"), preset = t.closest("[data-preset]"), opt = t.closest("[data-opt]"), ch = t.closest("[data-choose]"), eff = t.closest("[data-eff]");
    if (fam) { filter = fam.dataset.fam; document.querySelectorAll("[data-fam]").forEach(b => b.setAttribute("aria-pressed", b.dataset.fam === filter)); drawList(); }
    else if (preset) { study = { ...PRESETS[+preset.dataset.preset] }; store.set("rm-study2", study); route(); }
    else if (opt) {
      const last = path[path.length - 1], node = CHOOSER[last ? last.next : "start"], o = node.opts[+opt.dataset.opt];
      path.push(Array.isArray(o[2]) ? { e: o[0], label: o[1], results: o[2] } : { e: o[0], label: o[1], next: o[2] });
      pageChoose(); window.scrollTo(0, 0);
    }
    else if (ch) { if (ch.dataset.choose === "reset") path = []; else path.pop(); pageChoose(); }
    else if (eff) { const p = EFF[+eff.dataset.eff]; $("#effC").value = p[1]; $("#effX").value = p[2]; renderEff(); }
    else if (t.id === "simOne") simOne();
    else if (t.id === "simMany") simMany();
  });
  document.addEventListener("input", e => {
    const t = e.target;
    if (t.id === "search") { query = t.value; drawList(); }
    else if (t.id === "wsearch") { wq = t.value; drawWords(); }
    else if (t.dataset.k) { study[t.dataset.k] = t.value; store.set("rm-study2", study); const id = location.hash.split("/")[2]; $("#stmt").innerHTML = statementsHtml(ALL[id]); }
    else if (t.id === "simN") $("#simNout").textContent = fmt(NS[+t.value]);
    else if (t.id === "effC" || t.id === "effX") renderEff();
  });

  route();
})();
