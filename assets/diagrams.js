/* SVG design diagrams. One colour language everywhere:
   .gx exposed / intervention, .gc comparison, .gn not yet grouped, .ev outcome occurred. */

const W = 760, H = 350;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const T = (x, y, s, cls = "", a = "start") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${a}">${esc(s)}</text>`;
const lines = (x, y, arr, cls = "", a = "start", lh = 16) => arr.map((s, i) => T(x, y + i * lh, s, cls, a)).join("");
const box = (x, y, w, h, cls = "bx") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="${cls}"/>`;
const arrow = (x1, y1, x2, y2, cls = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ar ${cls}" marker-end="url(#ah)"/>`;
const defs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ahp"/></marker></defs>`;
const svg = (body, label) => `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${defs}${body}</svg>`;

function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

/* grid of people; cls(i) returns class per dot */
function people(x, y, cols, rows, cls, r = 4.6, gap = 13) {
  let o = "";
  for (let i = 0; i < cols * rows; i++) {
    o += `<circle cx="${x + (i % cols) * gap + r}" cy="${y + Math.floor(i / cols) * gap + r}" r="${r}" class="${cls(i)}"/>`;
  }
  return o;
}
function mark(n, k, seed) { // choose k of n indices
  const r = rng(seed), idx = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return new Set(idx.slice(0, k));
}

/* Shared two-group, forward-in-time layout */
function twoArm(o) {
  const evT = mark(40, o.evTop, 7), evB = mark(40, o.evBot, 11);
  const mixed = mark(40, 20, 5);
  let b = "";
  b += box(8, 122, 122, 86) + lines(69, 150, o.left, "tl", "middle");
  b += people(34, 176, 6, 2, i => o.random ? "gn" : (mixed.has(i) ? "gx" : "gc"), 4, 12);
  b += arrow(132, 165, 160, 165);
  b += `<circle cx="190" cy="165" r="28" class="${o.random ? "node rnd" : "node"}"/>` + lines(190, o.split.length > 1 ? 162 : 169, o.split, "tn", "middle", 13);
  b += lines(190, 212, o.splitNote, "ts", "middle", 14);
  b += arrow(214, 148, 258, 92) + arrow(214, 182, 258, 238);
  b += T(264, 48, o.top, "tl gxt") + people(264, 58, 8, 5, () => "gx");
  b += T(264, 208, o.bottom, "tl gct") + people(264, 218, 8, 5, () => "gc");
  b += arrow(378, 90, 506, 90) + arrow(378, 250, 506, 250);
  b += lines(442, 152, o.mid, "ts", "middle", 15);
  b += people(516, 58, 8, 5, i => evT.has(i) ? "ev" : "gx") + people(516, 218, 8, 5, i => evB.has(i) ? "ev" : "gc");
  b += T(636, 84, o.resTop, "tbig") + lines(636, 102, o.resTopSub, "ts");
  b += T(636, 244, o.resBot, "tbig") + lines(636, 262, o.resBotSub, "ts");
  // time axis with where the researcher stands
  b += `<line x1="264" y1="326" x2="620" y2="326" class="axis" marker-end="url(#ah)"/>` + T(264, 343, "exposure decided", "ts") + T(620, 343, "outcomes counted", "ts", "end");
  const px = o.stand === "end" ? 568 : 316;
  b += `<path d="M${px} 320l-6 -10h12z" class="pin"/>` + T(px, 304, o.standLabel, "ts pinl", "middle");
  return svg(b, o.label);
}

const DIAGRAMS = {
  rct: () => twoArm({
    label: "Randomised controlled trial: eligible people are allocated by chance to statin or placebo, followed for five years, and outcomes compared.",
    random: true, left: ["Eligible people", "who consent"], split: ["chance"], splitNote: ["random", "allocation"],
    top: "Allocated a statin", bottom: "Allocated a placebo", mid: ["same care,", "everyone blinded,", "five years"],
    evTop: 3, evBot: 5, resTop: "8.7%", resTopSub: ["had a heart", "attack"], resBot: "11.8%", resBotSub: ["had a heart", "attack"],
    stand: "start", standLabel: "you start here"
  }),
  ab: () => twoArm({
    label: "A/B test: visitors are split at random between two versions and their behaviour is compared.",
    random: true, left: ["Arriving users", "or units"], split: ["chance"], splitNote: ["assigned", "unknowingly"],
    top: "Version B (new)", bottom: "Version A (current)", mid: ["same period,", "one measure", "fixed in advance"],
    evTop: 9, evBot: 6, resTop: "rate B", resTopSub: ["did the thing", "you measure"], resBot: "rate A", resBotSub: ["did the thing", "you measure"],
    stand: "start", standLabel: "you start here"
  }),
  cohort: () => twoArm({
    label: "Prospective cohort: people already exposed or unexposed are recruited and followed forward until outcomes occur.",
    random: false, left: ["People without", "the outcome"], split: ["self-", "selected"], splitNote: ["not assigned", "by you"],
    top: "Exposed", bottom: "Not exposed", mid: ["follow forward", "for years,", "lose nobody"],
    evTop: 8, evBot: 4, resTop: "risk", resTopSub: ["in the exposed"], resBot: "risk", resBotSub: ["in the unexposed"],
    stand: "start", standLabel: "you start here"
  }),
  retro: () => twoArm({
    label: "Retrospective cohort: the researcher stands in the present and rebuilds the cohort and its exposures from past records.",
    random: false, left: ["Cohort found", "in old records"], split: ["self-", "selected"], splitNote: ["recorded", "at the time"],
    top: "Exposed, per records", bottom: "Not exposed, per records", mid: ["already happened:", "trace it through", "the records"],
    evTop: 8, evBot: 4, resTop: "risk", resTopSub: ["in the exposed"], resBot: "risk", resBotSub: ["in the unexposed"],
    stand: "end", standLabel: "you start here, looking back"
  }),
  natural: () => twoArm({
    label: "Natural experiment: nature or policy allocates the exposure in a way unrelated to the outcome, and groups are compared.",
    random: true, left: ["A whole", "population"], split: ["nature's", "lottery"], splitNote: ["gene variant,", "rule or accident"],
    top: "Happened to get more exposure", bottom: "Happened to get less", mid: ["nobody chose,", "so groups should", "be alike"],
    evTop: 7, evBot: 4, resTop: "outcome", resTopSub: ["in this group"], resBot: "outcome", resBotSub: ["in this group"],
    stand: "end", standLabel: "you arrive afterwards"
  }),

  casecontrol: () => {
    const exC = mark(40, 24, 3), exK = mark(40, 12, 9);
    let b = "";
    b += T(516, 48, "Cases: outcome occurred", "tl") + people(516, 58, 8, 5, () => "ev");
    b += T(516, 208, "Controls: matched, no outcome", "tl") + people(516, 218, 8, 5, () => "gn");
    b += arrow(506, 90, 378, 90, "back") + arrow(506, 250, 378, 250, "back");
    b += lines(442, 150, ["look back at", "each person's", "past exposure"], "ts", "middle", 15);
    b += T(264, 48, "Cases' past", "tl") + people(264, 58, 8, 5, i => exC.has(i) ? "gx" : "gc");
    b += T(264, 208, "Controls' past", "tl") + people(264, 218, 8, 5, i => exK.has(i) ? "gx" : "gc");
    b += T(20, 84, "24 of 40", "tbig") + lines(20, 102, ["had been exposed"], "ts");
    b += T(20, 244, "12 of 40", "tbig") + lines(20, 262, ["had been exposed"], "ts");
    b += box(8, 128, 232, 62, "bx hl") + lines(124, 152, ["Odds ratio = (24/16) ÷ (12/28) = 3.5", "illustrative numbers"], "ts", "middle", 18);
    b += `<line x1="620" y1="326" x2="264" y2="326" class="axis" marker-end="url(#ah)"/>` + T(264, 343, "past exposure", "ts") + T(620, 343, "outcome known", "ts", "end");
    b += `<path d="M568 320l-6 -10h12z" class="pin"/>` + T(568, 304, "you start here", "ts pinl", "middle");
    return svg(b, "Case-control study: start from cases and matched controls, look back to compare how many were exposed.");
  },

  cross: () => {
    const r = rng(42); let b = "";
    b += `<rect x="60" y="30" width="330" height="250" class="plot"/>`;
    for (let i = 0; i < 70; i++) {
      const a = r(), y = 0.25 + a * 0.45 + (r() - 0.5) * 0.3;
      b += `<circle cx="${70 + a * 310}" cy="${270 - y * 230}" r="4" class="gn"/>`;
    }
    b += `<line x1="70" y1="212" x2="380" y2="108" class="fit"/>`;
    b += T(225, 302, "Age when measured", "ts", "middle") + `<text transform="translate(44 155) rotate(-90)" class="ts" text-anchor="middle">Ear length</text>`;
    b += T(60, 20, "Everyone measured once, at the same moment", "tl");
    b += T(430, 46, "Three stories fit the same snapshot", "tl");
    [["Ears keep growing", "as each man ages"], ["Older generations", "always had bigger ears"], ["Men with small ears", "die earlier"]].forEach((s, i) => {
      b += box(430, 62 + i * 74, 300, 60) + `<circle cx="456" cy="${92 + i * 74}" r="13" class="node"/>` + T(456, 97 + i * 74, "?", "tn", "middle") + lines(480, 87 + i * 74, s, "ts", "start", 17);
    });
    b += T(430, 302, "A snapshot cannot tell these apart.", "ts");
    return svg(b, "Cross-sectional study: a scatter of ear length against age at one moment, with three competing explanations.");
  },

  survey: () => {
    const st = [["Target population", "everyone you want", "to speak about", 150, 10], ["Study population", "those who could", "have been sampled", 120, 8], ["Sample", "those selected", "who took part", 80, 6], ["Recorded data", "what they", "actually said", 50, 4]];
    const gaps = [["Who is left off", "the list?"], ["Random selection?", "Who declined?"], ["Honest, accurate", "answers?"]];
    let b = "", x = 14;
    st.forEach((s, i) => {
      const w = 150, cx = x + w / 2;
      b += T(cx, 34, s[0], "tl", "middle") + lines(cx, 52, [s[1], s[2]], "ts", "middle", 15);
      const cols = s[4] + 1, rows = Math.max(2, Math.round(s[3] / 22));
      const gw = cols * 13;
      b += people(cx - gw / 2, 86 + (7 - rows) * 6.5, cols, rows, () => i === 3 ? "ev" : "gn");
      if (i < 3) {
        b += arrow(x + w + 4, 130, x + w + 40, 130);
        b += lines(x + w + 22, 196, gaps[i], "ts warn", "middle", 15);
      }
      x += 190;
    });
    b += `<path d="M660 252 H90" class="ar back" marker-end="url(#ah)"/>` + T(375, 244, "Inference runs back this way, one stage at a time", "tl", "middle");
    b += T(375, 284, "Sampling takes you from left to right. Each arrow is a place where bias can enter,", "ts", "middle");
    b += T(375, 302, "and the margin of error covers only the chance involved in drawing the sample.", "ts", "middle");
    return svg(b, "Sample survey: target population, study population, sample and recorded data, with bias entering between each stage and inference running back.");
  },

  admin: () => {
    const cyl = (x, y, l1, l2) => `<path d="M${x} ${y}v62a55 14 0 0 0 110 0v-62" class="bx"/><ellipse cx="${x + 55}" cy="${y}" rx="55" ry="14" class="bx"/>` + lines(x + 55, y + 36, [l1, l2], "ts", "middle", 15);
    let b = "";
    b += T(20, 30, "Records kept for other purposes", "tl");
    b += cyl(20, 60, "Tax and", "census register") + cyl(20, 190, "Health or", "cancer register");
    b += arrow(134, 100, 196, 150) + arrow(134, 224, 196, 176);
    b += `<circle cx="226" cy="163" r="28" class="node"/>` + lines(226, 160, ["link", "by ID"], "tn", "middle", 13);
    b += arrow(256, 163, 296, 163);
    b += box(300, 96, 190, 134) + T(395, 122, "One table, whole population", "tl", "middle");
    b += people(318, 136, 12, 6, i => (i === 17 || i === 52) ? "ev" : (i % 12 < 5 ? "gx" : "gc"));
    b += T(395, 250, "no sampling, so no sampling error", "ts", "middle");
    b += T(530, 30, "What the records can miss", "tl");
    [["Events that happened", 200], ["Events that reached the system", 150], ["Events that were recorded", 110]].forEach((s, i) => {
      b += `<rect x="530" y="${52 + i * 62}" width="${s[1]}" height="22" rx="4" class="${i === 2 ? "bar ev" : "bar"}"/>` + T(530, 92 + i * 62, s[0], "ts");
    });
    b += lines(530, 250, ["If recording differs between", "groups, so will the results."], "ts warn", "start", 16);
    return svg(b, "Administrative data study: registers are linked into one table covering a whole population, but only recorded events are counted.");
  },

  meta: () => {
    const st = [[-0.42, 0.34, 5], [-0.12, 0.3, 6], [-0.3, 0.2, 9], [0.06, 0.38, 5], [-0.26, 0.14, 12], [-0.2, 0.24, 8], [-0.34, 0.28, 6]];
    const X = v => 440 + v * 300; let b = "";
    b += T(20, 30, "Every eligible study, one row each", "tl");
    st.forEach((s, i) => {
      const y = 56 + i * 27;
      b += T(20, y + 5, `Trial ${i + 1}`, "ts") + `<line x1="${X(s[0] - s[1])}" y1="${y}" x2="${X(s[0] + s[1])}" y2="${y}" class="ci"/><rect x="${X(s[0]) - s[2] / 2}" y="${y - s[2] / 2}" width="${s[2]}" height="${s[2]}" class="sq"/>`;
    });
    b += `<line x1="440" y1="40" x2="440" y2="276" class="axis dash"/>`;
    b += `<path d="M${X(-0.33)} 252L${X(-0.24)} 242L${X(-0.15)} 252L${X(-0.24)} 262z" class="dia"/>` + T(20, 257, "Pooled estimate", "tl");
    b += `<line x1="200" y1="276" x2="680" y2="276" class="axis"/>`;
    b += T(300, 296, "favours the intervention", "ts", "middle") + T(440, 296, "no effect", "ts", "middle") + T(590, 296, "favours the control", "ts", "middle");
    b += T(20, 320, "Schematic. Bigger squares are larger studies; lines are confidence intervals; the diamond is the pooled result.", "ts");
    return svg(b, "Meta-analysis forest plot: individual trials with confidence intervals and a pooled diamond to the left of the no-effect line.");
  },

  regression: () => {
    const r = rng(77); let b = "";
    const px = v => 80 + v * 380, py = v => 280 - v * 240;
    b += `<rect x="80" y="40" width="380" height="240" class="plot"/>`;
    b += `<line x1="${px(0)}" y1="${py(0)}" x2="${px(1)}" y2="${py(1)}" class="axis dash"/>`;
    b += `<line x1="${px(0)}" y1="${py(0.26)}" x2="${px(1)}" y2="${py(0.74)}" class="fit"/>`;
    for (let i = 0; i < 80; i++) {
      const x = 0.08 + r() * 0.84, y = Math.min(0.96, Math.max(0.04, 0.26 + 0.48 * x + (r() + r() - 1) * 0.2));
      if (i < 5) b += `<line x1="${px(x)}" y1="${py(y)}" x2="${px(x)}" y2="${py(0.26 + 0.48 * x)}" class="resid"/>`;
      b += `<circle cx="${px(x)}" cy="${py(y)}" r="4" class="gn"/>`;
    }
    b += T(270, 304, "Father's height", "ts", "middle") + `<text transform="translate(62 160) rotate(-90)" class="ts" text-anchor="middle">Son's height</text>`;
    b += T(80, 26, "Each point is one father and son", "tl");
    const k = [["fit", "Best-fit line", "smallest squared error overall"], ["axis dash", "Line of equality", "son exactly as tall as father"], ["resid", "Residual", "what the line fails to explain"]];
    k.forEach((s, i) => { b += `<line x1="490" y1="${70 + i * 54}" x2="530" y2="${70 + i * 54}" class="${s[0]}"/>` + T(542, 68 + i * 54, s[1], "tl") + T(542, 86 + i * 54, s[2], "ts"); });
    b += box(490, 220, 256, 60, "bx hl") + lines(502, 244, ["The fitted line is flatter than equality:", "regression to the mean."], "ts", "start", 18);
    return svg(b, "Regression: scatter of sons' against fathers' heights with a best-fit line flatter than the line of equality.");
  },

  predict: () => {
    let b = "";
    b += T(20, 30, "Cases with known outcomes", "tl");
    b += `<rect x="20" y="44" width="300" height="34" rx="6" class="bar gxb"/><rect x="324" y="44" width="138" height="34" rx="6" class="bar gcb"/>`;
    b += T(170, 66, "Training set: 897 passengers", "tw", "middle") + T(393, 66, "Test set: 412", "tw", "middle");
    b += arrow(170, 82, 170, 118) + arrow(416, 82, 416, 222, "dash");
    b += box(60, 122, 262, 120) + T(170, 144, "Build the algorithm", "tl", "middle");
    // small tree
    b += `<path d="M170 156L120 186M170 156L220 186M120 186L96 216M120 186L144 216" class="ar"/>`;
    [[170, 156], [120, 186], [220, 186], [96, 216], [144, 216]].forEach((p, i) => { b += `<circle cx="${p[0]}" cy="${p[1]}" r="7" class="${i > 1 ? (i === 3 ? "ev" : "gn") : "node"}"/>`; });
    b += T(214, 216, "tune with", "ts") + T(214, 231, "cross-validation", "ts");
    b += arrow(324, 248, 352, 248);
    b += box(356, 226, 120, 44) + lines(416, 244, ["Predict the", "held-back cases"], "ts", "middle", 15);
    b += arrow(478, 248, 520, 248);
    b += box(524, 196, 222, 104, "bx hl") + T(635, 220, "Compare with what happened", "tl", "middle") + T(635, 256, "0.82", "tbig", "middle") + T(635, 278, "area under the ROC curve", "ts", "middle");
    b += lines(524, 60, ["The test set is locked away until", "the very end. Performance on the", "training set flatters the algorithm."], "ts warn", "start", 17);
    b += T(20, 300, "Baseline to beat: give everyone the overall 39% survival rate.", "ts");
    return svg(b, "Prediction algorithm: data split into training and test sets; the algorithm is built on training data and judged on the held-back test set.");
  }
};
