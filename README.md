# Research methods, visualised

An interactive explorer of quantitative research designs. Pick a design and see:

- a diagram of how the study is put together
- how its research question and hypotheses are written (fill in your own population, exposure, comparison and outcome and they rewrite themselves)
- what you need, how you analyse it, and what goes wrong
- a worked example laid out as Problem, Plan, Data, Analysis, Conclusion

Twelve designs are covered: randomised controlled trial, A/B test, cross-sectional study, sample survey, prospective and retrospective cohort, case-control, natural experiment, administrative data study, systematic review and meta-analysis, regression modelling, and prediction algorithms. Two calculators (trial size and power; absolute risk, relative risk and odds ratio) and a ten-question checklist for judging claims are included.

Examples and figures follow David Spiegelhalter, *The Art of Statistics: Learning from Data* (Pelican, 2019).

Live site: https://ambar5ingh.github.io/Research-methods/

## Running locally

It is a static site with no build step. Open `index.html` in a browser.

- `assets/data.js` holds the content for each design
- `assets/diagrams.js` draws the SVG diagrams
- `assets/app.js` handles the interface and calculators
