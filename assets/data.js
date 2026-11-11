/* Content for the Research Methods explorer.
   Worked examples and figures are drawn from David Spiegelhalter,
   "The Art of Statistics: Learning from Data" (Pelican, 2019).
   Placeholders: {P} population, {X} exposure/intervention, {C} comparison, {Y} outcome. */

const PRESETS = [
  { label: "🍎 School breakfast",
    P: "primary school children", X: "a free school breakfast", C: "no breakfast at school", Y: "their reading scores" },
  { label: "💊 Statins and heart attacks",
    P: "adults at raised risk of heart attack or stroke", X: "a daily statin", C: "a placebo",
    Y: "the risk of a heart attack within five years" },
  { label: "📱 Study-supporter texts",
    P: "students retaking GCSE maths or English", X: "a nominated study supporter who receives encouraging texts",
    C: "no study supporter", Y: "the pass rate" },
  { label: "🏭 Factory energy audits",
    P: "small textile factories", X: "a subsidised energy audit", C: "no audit",
    Y: "electricity use per unit of output" }
];

const METHODS = [
  {
    id: "rct", name: "Randomised controlled trial", family: "experiment", goals: ["cause"],
    short: "Allocate people by chance to the intervention or a control, then compare outcomes.",
    tells: "The average causal effect of being offered the intervention, because chance balances the groups on everything, including factors nobody has measured.",
    cannot: "What would happen to one specific person, or whether the effect holds in people unlike those in the trial.",
    q: "Among {P}, does being allocated {X} rather than {C} change {Y}?",
    statements: [
      { tag: "H0", name: "Null hypothesis", text: "Being allocated {X} rather than {C} makes no difference to {Y}." },
      { tag: "H1", name: "Alternative hypothesis", text: "Being allocated {X} changes {Y} by an amount that is plausible and worth having. State that amount before the trial starts." }
    ],
    hypNote: "The protocol fixes the null, the alternative, the significance threshold and the power in advance. Together they dictate the sample size.",
    need: [
      "A control group, ideally given a placebo that looks identical",
      "Random allocation, often in blocks so the arms stay balanced",
      "Blinding of participants, of staff, and of whoever assesses outcomes",
      "Both groups treated the same in every other respect",
      "Follow-up of everyone, including those who drop out",
      "A sample size worked out from the effect you want to detect",
      "Ethical approval and informed consent"
    ],
    analysis: [
      "Count people in the group they were allocated to, whether or not they complied (intention to treat)",
      "Report absolute and relative risk differences with confidence intervals",
      "Test the null with a P-value, which was pre-specified along with the main outcome"
    ],
    wrong: [
      "People switching arms dilutes the measured effect",
      "Drop-outs who leave because of side effects",
      "Unblinded assessors nudging results towards what they expect",
      "Too small a sample, so a real effect is missed",
      "Leaning on one trial instead of all of them"
    ],
    ex: {
      title: "Heart Protection Study: do statins reduce heart attacks and strokes?", ref: "Chapters 4 and 10",
      steps: [
        "Does a daily statin reduce heart attacks and strokes in people at raised risk?",
        "Randomly allocate 20,536 people to 40 mg of simvastatin a day or a dummy tablet. Participants and clinic staff are blinded. The size was chosen to give over 90% power at p < 0.01 for a reduction of about 25% in coronary deaths.",
        "Five years of follow-up, 99.6% complete, recording heart attacks, strokes and deaths in 10,269 people allocated the statin and 10,267 allocated placebo.",
        "Compared by allocated group: heart attack 8.7% against 11.8%, stroke 4.3% against 5.7%, death from any cause 12.9% against 14.7%.",
        "A 27% relative reduction in heart attacks, which is 3.1 percentage points: about 30 people take a statin for five years to prevent one heart attack. Because 18% of the statin group stopped and 32% of the placebo group started taking statins, the effect of actually taking the drug is larger."
      ]
    }
  },
  {
    id: "ab", name: "A/B test", family: "experiment", goals: ["cause"],
    short: "A randomised trial run on users or services: show alternatives at random and measure behaviour.",
    tells: "Which version performs better on the measured behaviour, even when the difference is small, because samples can be huge.",
    cannot: "Why one version wins, or whether a short-term measure such as clicks reflects what you care about in the long run.",
    q: "When {P} are randomly given {X} instead of {C}, does {Y} change?",
    statements: [
      { tag: "H0", name: "Null hypothesis", text: "{Y} is the same whether {P} get {X} or {C}." },
      { tag: "H1", name: "Alternative hypothesis", text: "{Y} differs between {X} and {C}." }
    ],
    hypNote: "Running many tests on many measures makes false alarms near certain. Decide the one measure that counts, or demand a stricter threshold.",
    need: [
      "Two or more versions that differ in one deliberate way",
      "A system that assigns each unit at random and remembers the assignment",
      "One primary measure fixed before the test",
      "Enough traffic or participants to detect a small difference",
      "A stopping rule decided in advance"
    ],
    analysis: [
      "Difference in rates or means between versions, with an interval",
      "A significance test, corrected when many comparisons are made",
      "Repeat in sequence: each winner becomes the next control"
    ],
    wrong: [
      "Peeking and stopping as soon as the result looks good",
      "Testing many outcomes and reporting the one that worked",
      "Statistically significant differences too small to matter"
    ],
    ex: {
      title: "Web layouts, study supporters and body-worn cameras", ref: "Chapter 4",
      steps: [
        "Which page layout keeps visitors longer? Does a text-message nudge help students pass? The question is always whether a change you control makes a difference.",
        "Direct users at random to alternative layouts without their knowing. In policy trials, half of students retaking GCSE maths or English were randomly allocated to nominate a study supporter who received encouraging texts.",
        "Time spent on pages and click-throughs for websites; exam results for the students.",
        "Compare the versions directly. Large samples mean even small differences are detected reliably.",
        "Students with a study supporter had a 27% higher pass rate. A series of A/B tests leads quickly to an optimised design, but teams new to trials must learn the perils of multiple comparisons."
      ]
    }
  },
  {
    id: "cross", name: "Cross-sectional study", family: "observe", goals: ["associate", "describe"],
    short: "Measure exposure and outcome in a group of people at a single moment.",
    tells: "Whether two things go together in the population right now, quickly and cheaply.",
    cannot: "Which came first. A snapshot cannot separate change within people from differences between generations or survivors.",
    q: "Measured at one moment among {P}, is {Y} different for those with {X} than for those with {C}?",
    statements: [
      { tag: "H0", name: "Null hypothesis", text: "Among {P}, there is no association between having {X} and {Y}." },
      { tag: "H1", name: "Alternative hypothesis", text: "Among {P}, {Y} is associated with having {X}." }
    ],
    hypNote: "The hypotheses are about association only. Rejecting the null says nothing yet about cause.",
    need: [
      "A defined population and a sample that represents it",
      "Reliable, valid measurement of exposure and outcome at the same visit",
      "Measurements of likely confounders such as age",
      "No follow-up, which is why it is fast"
    ],
    analysis: [
      "Correlation, or a difference in means or proportions between groups",
      "Look at the relationship within levels of a confounder (stratification)",
      "Regression to adjust for several factors at once"
    ],
    wrong: [
      "Reverse causation: the outcome may have produced the exposure",
      "Confounders and unmeasured lurking factors",
      "Survivors differ from those no longer around to be measured",
      "Simpson's paradox: the direction can flip once you split by a third factor"
    ],
    ex: {
      title: "Why do old men have big ears?", ref: "Chapter 4",
      steps: [
        "Old men often seem to have big ears. Is that real, and why?",
        "See whether age is correlated with adult ear length in the present-day population.",
        "Medical researchers in the UK and Japan measured ear length in men of different ages at one point in time.",
        "A clear positive correlation between age and ear length.",
        "Ear length is associated with age, but three stories fit: ears keep growing, older generations always had bigger ears, or small-eared men die earlier. Other designs are needed to tell them apart, so the cycle starts again."
      ]
    }
  },
  {
    id: "survey", name: "Sample survey", family: "observe", goals: ["describe"],
    short: "Ask a random sample, then reason step by step back to the whole population.",
    tells: "An estimate of a population quantity with a margin of error, if the sample is random and people answer truthfully.",
    cannot: "Anything about cause. And no margin of error accounts for biased questions or for people who decline to answer.",
    q: "What is {Y} among all {P}, and how precisely can we say?",
    statements: [
      { tag: "Est.", name: "Quantity to estimate", text: "The true value of {Y} across the whole target population of {P}." },
      { tag: "±", name: "Uncertainty to report", text: "A margin of error around the estimate. For a percentage from a random sample of n people it is at most about ±100/√n points, so ±3 points for n = 1,000." }
    ],
    hypNote: "Most surveys estimate rather than test. A hypothesis appears only when you compare groups or years, and then the null is “no difference”.",
    need: [
      "A clear target population and a list to sample from",
      "Random selection, for example of households",
      "Neutral question wording, tested beforehand",
      "A high response rate, and a check on who declined",
      "Weighting when the sample differs from the population"
    ],
    analysis: [
      "Summaries: proportions, medians and the spread of answers",
      "Margins of error from probability theory or bootstrap resampling",
      "Walk through four stages: recorded data, truth in the sample, study population, target population"
    ],
    wrong: [
      "Volunteer samples, which represent nobody in particular",
      "Framing and priming in the question wording",
      "Answers bent by memory, rounding and social acceptability",
      "Non-response by people who differ from those who take part"
    ],
    ex: {
      title: "Natsal-3: how many sexual partners have people in Britain had?", ref: "Chapters 2, 3 and 7",
      steps: [
        "What is the pattern of sexual partnerships across Britain, not just among people willing to say?",
        "Draw a random sample of households and interview people confidentially. The third survey was carried out around 2010 and cost £7 million.",
        "Reported lifetime numbers of opposite-sex partners, with a response rate of about 66%.",
        "A long-tailed distribution with heaping on round numbers. The median reported was 8 for men and 5 for women. Bootstrap resampling gives the margin of error on the summaries.",
        "The weak links are whether reports are accurate (men seem to overstate, women to understate) and whether those who agreed resemble those who did not. Careful design makes the last step, to all of Britain, the safest one."
      ]
    }
  },
  {
    id: "cohort", name: "Prospective cohort study", family: "observe", goals: ["associate", "cause"],
    short: "Recruit people before the outcome happens, record exposures, and follow them forward.",
    tells: "How often the outcome arises in exposed and unexposed people, with the exposure clearly measured first.",
    cannot: "Rule out that the groups differed in other ways from the start. Nobody was randomised.",
    q: "Among {P} followed forward in time, do those who have {X} go on to differ in {Y} from those who have {C}?",
    statements: [
      { tag: "H0", name: "Null hypothesis", text: "After allowing for known confounders, {Y} is the same in {P} with {X} and those with {C}." },
      { tag: "H1", name: "Alternative hypothesis", text: "After allowing for known confounders, {Y} still differs between those with {X} and those with {C}." }
    ],
    hypNote: "Even a tiny P-value only rules out chance. Judge causation with the Bradford Hill considerations: size of effect, timing, dose response, mechanism, and replication.",
    need: [
      "A cohort free of the outcome at the start",
      "Exposure measured at baseline, before anyone knows the outcome",
      "Baseline data on likely confounders",
      "Years of follow-up with few people lost",
      "Outcomes assessed the same way in both groups"
    ],
    analysis: [
      "Risk or rate in each group, relative risk and absolute difference",
      "Adjust for confounders by stratifying or with regression",
      "Leave out early events that may reflect pre-existing illness"
    ],
    wrong: [
      "Confounding by factors nobody measured",
      "Reverse causation: early illness changes the exposure",
      "People lost to follow-up",
      "Cost and time: you may wait decades"
    ],
    ex: {
      title: "Following young men's ears, and the trouble with non-drinkers", ref: "Chapter 4",
      steps: [
        "Do ears really grow with age, or do men with small ears die earlier?",
        "The book's thought experiment: follow young men through their lives, measuring their ears along the way.",
        "Repeated ear measurements and dates of death over many decades.",
        "Check whether each man's ears grew, and whether small-eared men died sooner.",
        "This would settle the question but takes a lifetime. Real cohorts on alcohol show the risk: non-drinkers have higher death rates than moderate drinkers, partly because people already ill stop drinking. Careful analyses exclude ex-drinkers and the first few years of events."
      ]
    }
  },
  {
    id: "retro", name: "Retrospective cohort study", family: "observe", goals: ["associate", "cause"],
    short: "Define the cohort and its exposures from past records, then trace what happened since.",
    tells: "The same comparison as a prospective cohort, in a fraction of the time, when good records already exist.",
    cannot: "Go beyond what the old records happened to capture. You cannot measure what nobody wrote down.",
    q: "In existing records of {P}, did those who had {X} go on to differ in {Y} from those who had {C}?",
    statements: [
      { tag: "H0", name: "Null hypothesis", text: "In the records, {Y} did not differ between {P} who had {X} and those who had {C}, once known confounders are allowed for." },
      { tag: "H1", name: "Alternative hypothesis", text: "{Y} differed between those who had {X} and those who had {C}." }
    ],
    hypNote: "Write the hypothesis and analysis plan before opening the outcome data. With records in hand it is tempting to go looking for a story.",
    need: [
      "Historical records that identify a whole cohort",
      "Exposure information recorded at the time, not recalled later",
      "A way to trace outcomes for everyone in the cohort",
      "Enough recorded detail to adjust for confounders"
    ],
    analysis: [
      "Same measures as a prospective cohort: risks, rates, relative risk",
      "Adjust for whatever confounders the records hold",
      "Check how missing records could bias the comparison"
    ],
    wrong: [
      "Records kept for another purpose, with gaps and inconsistencies",
      "Key confounders never recorded",
      "Retrospectively altered or selectively surviving records",
      "Trying many analyses and reporting the striking one"
    ],
    ex: {
      title: "Old photographs of men who are old now", ref: "Chapter 4",
      steps: [
        "Did the ears of today's old men grow, or were they always that size?",
        "The book's thought experiment: take men who are old now and work out their past ear size from earlier evidence such as photographs.",
        "Past photographs matched to present-day measurements for the same men.",
        "Compare each man's earlier and current ear length.",
        "Much faster than waiting a lifetime, but it rests entirely on whether old photographs allow a fair measurement."
      ]
    }
  },
  {
    id: "casecontrol", name: "Case-control study", family: "observe", goals: ["associate", "cause"],
    short: "Start from people with the outcome, find comparable people without it, and look back for the exposure.",
    tells: "Whether an exposure was more common among cases, efficiently, even when the outcome is rare.",
    cannot: "Give the absolute risk of the outcome. You chose how many cases to include, so only the odds ratio is meaningful.",
    q: "Looking back from the outcome: among {P}, had the cases been exposed to {X} more often than matched controls?",
    statements: [
      { tag: "H0", name: "Null hypothesis", text: "The odds of past exposure to {X} are the same in cases and controls (odds ratio = 1). Cases and controls are defined by the outcome: {Y}." },
      { tag: "H1", name: "Alternative hypothesis", text: "Past exposure to {X} is more or less common in cases than in controls (odds ratio ≠ 1)." }
    ],
    hypNote: "For rare outcomes the odds ratio is close to the relative risk. For common outcomes the two can differ a lot, so say which one you are reporting.",
    need: [
      "A clear definition of a case and a source of cases",
      "Controls from the same population, matched on age and other key predictors",
      "Exposure history gathered the same way for both groups",
      "Ideally, exposure records made before the outcome"
    ],
    analysis: [
      "Odds ratio of exposure in cases against controls, with an interval",
      "Matched analysis when controls were individually matched",
      "Regression to adjust for remaining differences"
    ],
    wrong: [
      "Controls who are not truly comparable to the cases",
      "Cases remembering past exposures more thoroughly than controls",
      "Mistaking an odds ratio for a relative risk",
      "Confounders that matching did not cover"
    ],
    ex: {
      title: "Men who died, and matched men who survived", ref: "Chapter 4",
      steps: [
        "Do men with smaller ears die earlier, as a traditional Chinese belief about big ears and long life would suggest?",
        "The book's thought experiment: take men who died, find living men matched for age and other known predictors of longevity, and compare their ears.",
        "Ear size for each man who died and for his matched survivor.",
        "See whether the survivors had bigger ears than the men who died.",
        "A quick test of the survival explanation. Its strength depends on how well the survivors are matched to the men who died."
      ]
    }
  },
  {
    id: "natural", name: "Natural experiment", family: "observe", goals: ["cause"],
    short: "Use an accident of nature or policy that allocated the exposure almost at random.",
    tells: "Something close to a causal effect when you could never randomise, as long as the allocation really was unrelated to the outcome.",
    cannot: "Prove that the allocation was as good as random. That assumption cannot be fully tested.",
    q: "Where something outside anyone's choice decided who got {X} and who got {C}, did {Y} differ among {P}?",
    statements: [
      { tag: "H0", name: "Null hypothesis", text: "{P} who happened to receive {X} have the same {Y} as those who happened to receive {C}." },
      { tag: "H1", name: "Alternative hypothesis", text: "{Y} differs between the two groups, and since chance-like allocation balanced everything else, {X} is the likely cause." }
    ],
    hypNote: "The statistical test is ordinary. The argument that matters is why the allocation behaves like a coin flip.",
    need: [
      "A source of variation in the exposure that people did not choose",
      "Evidence that it is unrelated to other causes of the outcome",
      "A reason to believe it affects the outcome only through the exposure",
      "Usually a very large sample, since such effects are weak"
    ],
    analysis: [
      "Compare outcomes across the naturally allocated groups",
      "Scale the difference by how much the allocation shifted the exposure",
      "Check the balance of other characteristics, as in a trial"
    ],
    wrong: [
      "Allocation that only looks random",
      "The allocating factor affecting the outcome by another route",
      "Results that hold only for people whose exposure was shifted"
    ],
    ex: {
      title: "Mendelian randomisation: randomised at conception", ref: "Chapter 4",
      steps: [
        "What is the effect of a lifelong exposure that could never be allocated in a trial?",
        "Many genes are spread essentially at random through the population, so it is as if each of us were randomised to our version at conception. Compare people by a gene variant that shifts the exposure.",
        "Genetic variants, the exposure they influence, and health outcomes across a large population.",
        "Compare outcomes between people carrying different versions of the gene.",
        "The book introduces this only briefly, as one imaginative way to get nearer to causation without randomising. It notes that handling causation without randomisation remains contested."
      ]
    }
  },
  {
    id: "admin", name: "Administrative data study", family: "observe", goals: ["describe", "associate"],
    short: "Analyse routine records that already cover everyone, such as registers, claims or police reports.",
    tells: "What was recorded for a whole population, with no sampling error and at low cost.",
    cannot: "Tell you what truly happened when recording practice varies. Counts reflect the system as well as the world.",
    q: "In routine records covering all {P}, how does {Y} vary between those with {X} and those with {C}?",
    statements: [
      { tag: "H0", name: "Null hypothesis", text: "In the records, {Y} does not vary with {X} once other recorded factors are allowed for." },
      { tag: "H1", name: "Alternative hypothesis", text: "{Y} varies with {X}, and the pattern is not produced by who gets recorded." }
    ],
    hypNote: "With millions of records almost any difference is statistically significant. Ask whether it is large enough to matter and whether recording could explain it.",
    need: [
      "Access, permissions and a lawful basis to use the records",
      "A way to link records for the same person across sources",
      "Understanding of how and why each item gets recorded",
      "Stable definitions over the period studied"
    ],
    analysis: [
      "Rates and trends for the whole population",
      "Regression to adjust for recorded confounders",
      "Cross-check against a survey that measures the same thing"
    ],
    wrong: [
      "Ascertainment bias: some groups are more likely to be diagnosed or recorded",
      "Changes in recording practice mistaken for real change",
      "Tiny effects reported as findings because they are significant",
      "Headlines that turn a small association into a cause"
    ],
    ex: {
      title: "Does going to university increase the risk of a brain tumour?", ref: "Chapters 4, 5 and 10",
      steps: [
        "Is socioeconomic position related to being diagnosed with a brain tumour?",
        "Link Swedish national registers covering the complete eligible population, with no sampling involved.",
        "3,715 brain tumours diagnosed in over 2,000,000 men during 18 years, roughly 1 in 600.",
        "Regression adjusting for potential confounders found a slightly raised rate of diagnosis among men of higher socioeconomic position.",
        "The association is real in the records but small, and wealthier, better-educated people may simply be more likely to be diagnosed and registered. The headline about university causing tumours was not supported. Crime figures show the same issue: police records and the national crime survey can move in opposite directions."
      ]
    }
  },
  {
    id: "meta", name: "Systematic review and meta-analysis", family: "synth", goals: ["combine", "cause"],
    short: "Find every sound study of a question and pool their results into one estimate.",
    tells: "The best overall estimate of an effect, with far more precision than any single study.",
    cannot: "Repair the studies it includes. Biased or selectively published studies give a biased pooled answer.",
    q: "Across every sound study of {X} against {C} in {P}, what is the pooled effect on {Y}, and do the studies agree?",
    statements: [
      { tag: "H0", name: "Null hypothesis", text: "Pooled across all studies, {X} has no effect on {Y} compared with {C}." },
      { tag: "H1", name: "Alternative hypothesis", text: "The pooled effect of {X} on {Y} is not zero. A second question is whether the effect is the same in every study." }
    ],
    hypNote: "The search strategy and inclusion rules are written down before any results are seen, like a trial protocol.",
    need: [
      "A precise question and inclusion criteria fixed in advance",
      "A search wide enough to find unpublished and negative studies",
      "An assessment of each study's quality",
      "Comparable outcome measures across the studies"
    ],
    analysis: [
      "Weight each study by its precision and combine",
      "Show every study and the pooled estimate with intervals",
      "Examine whether the studies disagree more than chance allows"
    ],
    wrong: [
      "Publication bias: negative results never submitted or printed",
      "Mixing studies too different to combine",
      "Pooling poor studies and trusting the precise-looking answer"
    ],
    ex: {
      title: "Twenty-seven statin trials pooled", ref: "Chapter 4",
      steps: [
        "One trial shows a drug worked in one group in one place. What does all the evidence say about statins in people at lower risk?",
        "A systematic review that includes every randomised trial done, then formally combines them.",
        "Twenty-seven randomised trials with more than 170,000 participants.",
        "Rather than comparing allocated groups directly, the reviewers related each trial's effect to its average reduction in LDL cholesterol, which allows for non-compliance.",
        "A 21% reduction in major vascular events for each 1 mmol/L reduction in LDL cholesterol. Studies this large, combined, cannot be put down to chance."
      ]
    }
  },
  {
    id: "regression", name: "Regression modelling", family: "synth", goals: ["associate", "predict"],
    short: "Fit a model of how an outcome varies with one or more explanatory variables.",
    tells: "How much the outcome changes, on average, with each explanatory variable when the others are held fixed.",
    cannot: "Turn association into cause by itself. Adjustment only covers the confounders you measured and modelled.",
    q: "Among {P}, how much does {Y} change with {X}, holding other measured factors constant?",
    statements: [
      { tag: "H0", name: "Null hypothesis", text: "The coefficient for {X} is zero: once the other factors in the model are accounted for, {Y} does not vary with {X}." },
      { tag: "H1", name: "Alternative hypothesis", text: "The coefficient for {X} is not zero." }
    ],
    hypNote: "A coefficient that is not significantly different from zero has not been shown to be zero. Report the estimate and its interval.",
    need: [
      "One response variable and the explanatory variables you believe matter",
      "The right model for the response: linear for measurements, logistic for yes or no, others for counts and survival times",
      "Enough data for the number of variables",
      "Checks of the residuals, the part the model fails to explain"
    ],
    analysis: [
      "Least-squares or similar fitting to estimate coefficients",
      "Standard errors and intervals, from theory or by bootstrapping",
      "Compare observed values with fitted ones to see where the model fails"
    ],
    wrong: [
      "Reading coefficients as causal effects",
      "Regression to the mean mistaken for a real change",
      "Unmeasured confounders left out of the adjustment",
      "Trying many models and keeping the one that looks best"
    ],
    ex: {
      title: "Galton's heights of parents and children", ref: "Chapters 5, 7 and 9",
      steps: [
        "How well does a parent's height predict the adult height of their child?",
        "Use Francis Galton's family records and fit a straight line by least squares.",
        "Heights of 465 fathers and sons, and of 433 mothers and daughters.",
        "The best-fit line is flatter than the line of equality. For mothers and daughters the gradient is 0.33, with a 95% interval from 0.22 to 0.44 by bootstrap.",
        "Tall parents tend to have children slightly shorter than themselves and short parents slightly taller ones. This is regression to the mean, and it needs no causal explanation."
      ]
    }
  },
  {
    id: "predict", name: "Prediction algorithm", family: "synth", goals: ["predict"],
    short: "Train an algorithm on past cases and judge it on cases it has never seen.",
    tells: "How accurately outcomes for new cases can be predicted from what is known beforehand.",
    cannot: "Explain why. Good predictors need not be causes, and complex algorithms can fit noise.",
    q: "Using what is known beforehand about each of {P}, how well can we predict {Y} for new cases?",
    statements: [
      { tag: "Goal", name: "Performance target", text: "Accuracy and calibration on a test set of {P} that played no part in building the algorithm." },
      { tag: "Base", name: "Baseline to beat", text: "A naive rule, such as giving every case the overall average for {Y}. An algorithm that cannot beat this has learned nothing." }
    ],
    hypNote: "There is usually no null hypothesis. The discipline comes from holding back a test set and never tuning on it.",
    need: [
      "Cases with known outcomes and candidate predictor variables",
      "A split into training and test sets, made before any modelling",
      "A performance measure chosen in advance",
      "Cross-validation to tune complexity without touching the test set"
    ],
    analysis: [
      "Classification trees, logistic regression and more complex methods",
      "Accuracy, the area under the ROC curve, and calibration of probabilities",
      "Compare against the naive baseline and against simpler models"
    ],
    wrong: [
      "Over-fitting: adapting to the training data so closely that new cases are predicted worse",
      "A test set that leaked into model building",
      "Training data that do not resemble the cases you will meet",
      "Opaque algorithms nobody can question"
    ],
    ex: {
      title: "Who survived the Titanic?", ref: "Chapter 6",
      steps: [
        "Can we predict which passengers survived the sinking?",
        "Gather the available passenger data and try a range of techniques, keeping a test set aside.",
        "1,309 passengers with name, title, gender, age, class of travel, fare, family and port of boarding. 897 form the training set and the rest the test set.",
        "A simple classification tree reaches an area under the ROC curve of 0.82 on the test set. An over-fitted tree does worse.",
        "The simple tree held its own against far more complex algorithms, and it can be explained. The naive baseline is to give everyone the overall 39% survival rate."
      ]
    }
  }
];

/* Paraphrased from the book's closing checklist, Chapter 13. */
const TEN_QUESTIONS = [
  { group: "How trustworthy are the numbers?", items: [
    ["How rigorously was the study done?", "Look for an appropriate design, a pre-registered protocol, a representative sample, randomisation and a fair comparison."],
    ["How uncertain are the findings?", "Check margins of error, confidence intervals, sample size and whether many comparisons were made."],
    ["Is the summary appropriate?", "Check the averages, the spread, and whether risks are given in absolute as well as relative terms."]
  ]},
  { group: "How trustworthy is the source?", items: [
    ["How reliable is the source?", "Consider conflicts of interest and whether the work was independently reviewed."],
    ["Is the story being spun?", "Watch for framing, emotional anecdotes, misleading graphs and exaggerated headlines."],
    ["What am I not being told?", "Think of cherry-picked results, missing information and the studies that were never published."]
  ]},
  { group: "How trustworthy is the interpretation?", items: [
    ["How does it fit with what else is known?", "Consider the context, sensible comparators and what other studies found."],
    ["What explanation is claimed?", "Ask whether correlation is passed off as causation, and whether regression to the mean, confounding or reverse causation could account for it."],
    ["How relevant is it to the audience?", "Ask whether the people studied resemble those the claim is applied to."],
    ["Is the effect important?", "A statistically significant effect can be too small to matter in practice."]
  ]}
];
