
function normalizeList(items = []) {
  return (Array.isArray(items) ? items : [items])
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        return String(
          item.text ||
            item.value ||
            item.normalized ||
            item.principle ||
            item.boundary ||
            item.note ||
            "",
        ).trim();
      }
      return "";
    })
    .filter(Boolean);
}

function formatSimpleListSection(title, items = []) {
  const clean = normalizeList(items);
  if (!clean.length) return `${title}: none`;
  return [title, ...clean.map((item) => `- ${item}`)].join("\n");
}

const GATE_SNAPSHOT_ORDER = [
  "G1_counter_consideration",
  "G2_non_strawman",
  "G3_self_correction",
  "G4_contradiction_handling",
  "G5_reality_contact",
  "G6_non_self_sealing",
];

function extractGateSnapshot(memory = {}, explicitGateSnapshot = null) {
  if (explicitGateSnapshot && typeof explicitGateSnapshot === "object") return explicitGateSnapshot;
  if (!memory || typeof memory !== "object") return null;
  return memory.gate_snapshot || memory.gateStates || memory.gate_states || null;
}

function formatGateSnapshotSection(gateSnapshot = null) {
  const snapshot = gateSnapshot && typeof gateSnapshot === "object" ? gateSnapshot : null;
  if (!snapshot) return "Profiler gate snapshot: none";

  const lines = [
    "Profiler gate snapshot",
    "Read-only prior gate state from the profiler. Use it as context, not as proof about the current text.",
  ];

  for (const gate of GATE_SNAPSHOT_ORDER) {
    const raw = snapshot[gate] && typeof snapshot[gate] === "object" ? snapshot[gate] : {};
    const status = String(raw.status || "dormant").trim() || "dormant";
    const score = Number(raw.score || 0);
    const positiveEvents = Number(raw.positive_events || 0);
    const negativeEvents = Number(raw.negative_events || 0);
    const lastEvidenceSpan = String(raw.last_evidence_span || "").trim() || "none";
    lines.push(
      `- ${gate} | status: ${status} | score: ${score.toFixed(3)} | positive_events: ${positiveEvents} | negative_events: ${negativeEvents} | last_evidence_span: ${lastEvidenceSpan}`
    );
  }

  return lines.join("\n");
}

function formatProfilerMemorySection(memory = {}, explicitGateSnapshot = null) {
  const corePrinciples = normalizeList(memory.core_principles || []);
  const coreBoundaries = normalizeList(memory.core_boundaries || []);
  const metaMarkers = normalizeList(memory.meta_epistemic_markers || []);
  const riskNotes = normalizeList(memory.risk_notes || []);
  const gateSnapshot = extractGateSnapshot(memory, explicitGateSnapshot);

  return [
    formatSimpleListSection("Profiler memory: principles", corePrinciples),
    formatSimpleListSection("Profiler memory: boundaries", coreBoundaries),
    formatSimpleListSection("Profiler memory: meta-epistemic markers", metaMarkers),
    formatSimpleListSection("Profiler memory: risk notes", riskNotes),
    formatGateSnapshotSection(gateSnapshot),
  ].join("\n\n");
}

const CORE_CONTRACT = `EPISTEMIC OCTAHEDRON INTERPRETER CONTRACT
version: 6.2

PURPOSE
The LLM is an extractor and canon optimizer only.
It does not compute final scores, maturity percentages, or final x y z coordinates.

SOURCE DISCIPLINE
Use only the text inside this packet.
Do not browse the web, call tools, or import outside context.
If the input mentions people, events, politics, history, science, or current affairs, extract only what the user text itself supports.

MODEL DEFINITIONS
Active worldview plots live on the octahedron surface where |x| + |y| + |z| = 1.
Axis meanings:
- x negative = practicality
- x positive = empathy
- z negative = knowledge
- z positive = wisdom
- y negative = negative epistemic stability
- y positive = positive epistemic stability

Operational meanings:
- Empathy / Practicality = persons versus functional demands
- Wisdom / Knowledge = deep judgment versus information or technical grasp
- Epistemic stability = coherence, reality-tracking, self-correction, and resistance to delusion

CRITICAL GEOMETRY RULE
A non-null active philosophy that is not near a pure vertex should not be returned as pure vertical-only support.
If the text is active and epistemically positive or negative, but not near peak maturity or near collapse, do not leave all four lateral poles at zero.
Give weak lateral pole support when the text itself gives any real basis for a side, even if the basis is slight and conservative.
This avoids turning active non-peak philosophies into artificial top or bottom vertices after deterministic projection.

EXTRACTION RULES
1. Extract portable philosophical structure, not final verdicts.
2. Prefer under-calling over over-calling.
3. Use evidence_span whenever possible.
4. Only emit triggered gate events when the text gives actual evidence for or against a gate.
5. Silence is neutral. Do not emit gate failures by absence.
6. Do not compute the final plot.
7. Do not let display labels or prior canon wording bias extraction.
8. Use canon memory as context, not as something to parrot back.
9. Thin input should produce conservative values by default.
10. Generic coexistence, civility, tolerance, harmony, pluralism, unity, or balance language may support weak positive values, but does not by itself prove mature integration, strong fairness, or strong gate clearance.
11. Moderate or strong signals require explicit structure in the text itself.
12. Explicit structure includes at least one of:
- a real tradeoff
- a stated constraint
- contradiction handling
- self-correction
- fair characterization of an opposing view
- reality contact tied to consequences, limits, or lived conditions
13. If evidence is too thin for a gate event, prefer local signals, principles, claimed_values, or notes instead.
14. Do not convert a bare coexistence or pluralist claim into G2_non_strawman unless the text actually characterizes another view fairly enough to show contact with it.
15. Do not mark explicit_balance or fair_tradeoff unless both poles or a real tradeoff are present in the text.
16. When using semantic_grid, fill every field every time.
17. Keep support and confidence separate. Support is how much of the construct is present. Confidence is how sure you are that the text supports that assignment.
18. Pure zero across all four lateral poles should be reserved for true null or near-null extraction, not ordinary active philosophy.
19. Dimension consideration is a separate lane from pole support. Do not infer neglect from mere emphasis.
20. Use dimension_consideration to say whether empathy, practicality, wisdom, and knowledge were directly engaged, merely acknowledged, engaged through a real tradeoff, explicitly deprioritized, explicitly rejected, or simply not evidenced in this text.
21. Only use explicitly_deprioritized or explicitly_rejected when the text itself clearly does that. Mere one-sided emphasis, narrow scope, or local silence is not enough.
22. If the text does not clearly engage a dimension, prefer not_evidenced_here rather than guessing.
23. Keep dimension_consideration evidence-based and conservative. It is meant to separate omission from actual neglect.
24. Do not let a single loaded word such as bypass, dismiss, or reject control this lane unless the text itself makes that move clear in context.
25. Return profile_target_frame every time. This says whose philosophy or stance is actually being extracted.
26. profile_target_frame must be one of:
- authorial_endorsement
- self_description
- described_subject
- cautionary_example
- quoted_view
- mixed_or_ambiguous
27. If the text describes a person, type, or case in order to warn against it, profile_target_frame should usually be cautionary_example or described_subject rather than authorial_endorsement.
28. Do not award positive empathy, wisdom, integration, or gate credit to a described subject merely because the narrator clearly sees what that subject is missing.
29. Phrases such as mistakes X for Y, never asks, dismisses, closes himself off, refusal to let uncertainty in, or similar diagnostic language should usually count against the described subject rather than as positive support for the neglected dimension.
30. quoted_view means the text presents a view without clearly endorsing it. mixed_or_ambiguous is only for cases where the frame genuinely cannot be resolved from the excerpt.
31. If a profiler gate snapshot is present in the packet, treat it as read-only prior state, not as proof about the current text.
32. First do a blind local read from the current text alone.
33. Then, if a gate snapshot is present, return gate_update_proposals as a separate state-aware advisory layer relative to that snapshot.
34. Do not let prior gate state override what the current text itself supports.
35. When a text criticizes, diagnoses, or warns about some other person, institution, or system, do not treat that target's epistemic failures as the profiled self by default.
36. For local y signals and triggered gate events, include a target field that says who the signal is about.
37. target must be one of: self, described_other, criticized_system, quoted_view, mixed, unclear.
38. If the passage contains both the author's own stance and a criticized external target, keep them separate at the signal level.

SEMANTIC GRID
Return semantic_grid every time with these eight fields:
- empathy
- practicality
- wisdom
- knowledge
- x_integration
- z_integration
- y_positive
- y_negative

For each field include:
- support from 0.0 to 1.0
- confidence from 0.0 to 1.0
- evidence_spans as an array

GENERAL GRID GUIDANCE
- support = 0.0 is allowed
- confidence may be 0.0 when support = 0.0
- low-depth input should usually stay in the weak range
- active but simple philosophy may still have weak nonzero support on one or more lateral poles

LOW-DEPTH ACTIVE CLAIMS
A short active philosophy may still warrant weak lateral support.
Example class:
- conciliatory pluralist or coexistence claims may weakly support empathy, wisdom, or both if the wording genuinely points that way
- they may also weakly support x_integration
- they may weakly support y_positive
- they usually do not justify strong gate events
- they usually do not justify pure vertical-only output

DIMENSION CONSIDERATION
Return dimension_consideration every time for empathy, practicality, wisdom, and knowledge.
For each dimension include:
- status from:
  - directly_engaged
  - acknowledged
  - tradeoff_engaged
  - explicitly_deprioritized
  - explicitly_rejected
  - not_evidenced_here
- confidence from 0.0 to 1.0
- basis_type from:
  - direct_statement
  - real_tradeoff
  - stated_constraint
  - explicit_dismissal
  - explicit_exclusion
  - none
- evidence_spans as an array
DIMENSION CONSIDERATION GUIDANCE
- directly_engaged means the text substantively works with that dimension.
- acknowledged means the text notices the dimension but does not really work through it.
- tradeoff_engaged means the text explicitly faces that dimension in tension with another concern.
- explicitly_deprioritized means the text clearly pushes that dimension down in importance.
- explicitly_rejected means the text clearly rules that dimension out or treats it as irrelevant.
- not_evidenced_here means the text did not provide enough evidence for the dimension in this excerpt.
- Mere emphasis on one pole does not prove explicit neglect of the opposite pole.
- If the evidence is ambiguous, stay with acknowledged or not_evidenced_here.

PROFILE TARGET FRAME
Return profile_target_frame every time.
Allowed values:
- authorial_endorsement
- self_description
- described_subject
- cautionary_example
- quoted_view
- mixed_or_ambiguous
FRAME GUIDANCE
- authorial_endorsement means the passage itself advances or endorses the stance as its own.
- self_description means the speaker is describing their own philosophy or habits.
- described_subject means the passage profiles some other person or target.
- cautionary_example means the passage uses a target mainly as a warning or negative illustration.
- quoted_view means the view is presented but not clearly owned by the narrator.
- mixed_or_ambiguous is for excerpts where the frame cannot be resolved with confidence.
- When the frame is described_subject, cautionary_example, or quoted_view, keep source and target separate.
- Do not let the narrator's diagnostic clarity leak into positive credit for the target.
- If the passage says someone fails to consider a dimension, do not treat that sentence by itself as evidence that the target considered it.

SCOPE CLASSIFICATION
Always classify the input as one of:
- thought
- stance
- worldview_fragment
- full_profile_import

scope_strength may be:
- low
- medium
- high

STATEMENT MODES
You may emit one or more of:
- literal_claim
- analogy
- rhetorical_generalization
- norm
- self_description

LOCAL EXTRACTION
local_extraction may include:
- principles
- boundaries
- claimed_values
- tradeoffs
- contradictions

AXIS EVENTS
Do not emit final x or z scores.
Emit evidence instead.

For x axis:
- x_pole_evidence with pole = empathy or practicality
- x_integration_events with type = explicit_balance or fair_tradeoff or integrated_tension

For z axis:
- z_pole_evidence with pole = wisdom or knowledge
- z_integration_events with type = explicit_balance or fair_tradeoff or integrated_tension

For every pole evidence item, include:
- strength = weak | moderate | strong
- confidence from 0.5 to 1.0
- evidence_span

If one pole is primary and the other is only acknowledged or counterweighted, do not give them equal default emphasis.
Acknowledging the opposite pole is not the same as weighting it equally.

LOCAL Y SIGNALS
Each local y signal should include:
- type
- strength
- confidence
- target = self | described_other | criticized_system | quoted_view | mixed | unclear
- evidence_span
LOCAL Y SIGNAL TARGET GUIDANCE
- target = self only when the signal is actually about the profiled speaker or endorsed stance.
- target = described_other when the passage diagnoses another person or type.
- target = criticized_system when the passage criticizes an external system, culture, institution, ideology, or environment.
- target = quoted_view when the signal belongs to a quoted or presented view that is not clearly owned by the narrator.
- target = mixed only when the signal genuinely applies to both the profiled self and an external target.
- target = unclear when the excerpt does not let you resolve the signal target safely.
- Do not turn a criticism of some outside target into a self-risk signal merely because the narrator is the one describing it.

Positive signal types may include:
- counter_consideration
- self_correction
- reality_contact
- coherence
- error_awareness
- revision_openness
- non_strawman_fairness

Negative signal types may include:
- false_certainty
- self_sealing
- contradiction_evasion
- reality_detachment
- dogmatic_closure
- collapse_marker
- strawman_dependence
- broad_motive_attribution

META-EPISTEMIC GATES
Use only these six gates:
- G1_counter_consideration
- G2_non_strawman
- G3_self_correction
- G4_contradiction_handling
- G5_reality_contact
- G6_non_self_sealing

Each triggered_gate_event should include:
- gate
- direction = positive or negative only
- strength = weak | moderate | strong
- confidence from 0.5 to 1.0
- novelty from 0.0 to 1.0 when possible
- target = self | described_other | criticized_system | quoted_view | mixed | unclear
- evidence_span
GATE EVENT TARGET GUIDANCE
- target should track who the gate evidence is about, not just who is narrating the passage.
- Do not assign a negative gate event to the profiled self when the failure belongs to a criticized outside target.
- If the excerpt does not clearly resolve the target, prefer unclear over guessing.

GATE SNAPSHOT AND UPDATE PROPOSALS
If a profiler gate snapshot is present in the packet, use it only as read-only prior-state context.
Return gate_update_proposals every time. This is a state-aware advisory layer, not the final state transition.
For each gate_update_proposals item include:
- gate
- local_direction = positive | negative | neutral
- proposed_effect = reopen | reinforce | soften | reverse | no_change
- confidence from 0.0 to 1.0
- evidence_span
- reason
GUIDANCE
- local_direction describes what the current text itself supports for that gate before any state update is applied.
- reopen means the text newly supplies meaningful evidence for a gate that was dormant or weak.
- reinforce means the text pushes in the same direction as the prior state.
- soften means the text partially counters the prior state without clearly flipping it.
- reverse means the text gives strong contrary evidence relative to the prior state.
- no_change means the text gives no meaningful update for that gate.
- If no profiler gate snapshot is present, gate_update_proposals may be empty.
- Do not use the proposal layer to override the blind local read.

PROFILE UPDATE SIGNALS
profile_update_signals may include:
- new_principles
- refined_principles
- new_boundaries
- refined_boundaries
- resolved_contradictions
- introduced_contradictions
- cleared_gates
- failed_gates
- retractions
- restatements
PROFILE UPDATE SIGNAL GUIDANCE
- failed_gates and introduced_contradictions should describe the profiled self only, not a criticized outside target.
- If the failure belongs to some other target in the passage, keep it in local signals or notes instead of treating it as a self-profile update.

SUGGESTED OPTIMIZATION
Look at three things:
- current profile principles and boundaries
- principles and boundaries created from this input
- existing suggested optimization, if any

Then output concise suggested optimization in canonOptimization.
These are suggestions only, not mandatory replacements.
They should compress, merge, or sharpen wording without losing important meaning.

PROFILE SUMMARY LINE
The profile array is display text only.
Keep it plain-language.
Do not put numeric axis values, percentages, coordinates, or projection math in it.

REQUIRED JSON SHAPE
{
  "model": "epistemic_octahedron_interpreter_v3",
  "profiler_mode": "dense_support_v2",
  "analysis_scope": "thought | stance | worldview_fragment | full_profile_import",
  "scope_strength": "low | medium | high",
  "profile_target_frame": "authorial_endorsement | self_description | described_subject | cautionary_example | quoted_view | mixed_or_ambiguous",
  "statement_modes": [],
  "profile": [
    "short display summary only"
  ],
  "semantic_grid": {
    "empathy": { "support": 0.0, "confidence": 0.0, "evidence_spans": [] },
    "practicality": { "support": 0.0, "confidence": 0.0, "evidence_spans": [] },
    "wisdom": { "support": 0.0, "confidence": 0.0, "evidence_spans": [] },
    "knowledge": { "support": 0.0, "confidence": 0.0, "evidence_spans": [] },
    "x_integration": { "support": 0.0, "confidence": 0.0, "evidence_spans": [] },
    "z_integration": { "support": 0.0, "confidence": 0.0, "evidence_spans": [] },
    "y_positive": { "support": 0.0, "confidence": 0.0, "evidence_spans": [] },
    "y_negative": { "support": 0.0, "confidence": 0.0, "evidence_spans": [] }
  },
  "dimension_consideration": {
    "empathy": { "status": "not_evidenced_here", "confidence": 0.0, "basis_type": "none", "evidence_spans": [] },
    "practicality": { "status": "not_evidenced_here", "confidence": 0.0, "basis_type": "none", "evidence_spans": [] },
    "wisdom": { "status": "not_evidenced_here", "confidence": 0.0, "basis_type": "none", "evidence_spans": [] },
    "knowledge": { "status": "not_evidenced_here", "confidence": 0.0, "basis_type": "none", "evidence_spans": [] }
  },
  "local_extraction": {
    "principles": [],
    "boundaries": [],
    "claimed_values": [],
    "tradeoffs": [],
    "contradictions": []
  },
  "axis_events": {
    "x_pole_evidence": [],
    "x_integration_events": [],
    "z_pole_evidence": [],
    "z_integration_events": []
  },
  "local_y_positive_signals": [],
  "local_y_negative_signals": [],
  "triggered_gate_events": [],
  "gate_update_proposals": [],
  "profile_update_signals": {
    "new_principles": [],
    "refined_principles": [],
    "new_boundaries": [],
    "refined_boundaries": [],
    "resolved_contradictions": [],
    "introduced_contradictions": [],
    "cleared_gates": [],
    "failed_gates": [],
    "retractions": [],
    "restatements": []
  },
  "canonOptimization": {
    "principles": [],
    "boundaries": [],
    "notes": []
  },
  "notes": []
}

FINAL INSTRUCTION
Return valid JSON only.`;

export function buildLLMPacket({
  profileText = "",
  currentPrinciples = [],
  currentBoundaries = [],
  suggestedPrinciples = [],
  suggestedBoundaries = [],
  profilerMemory = {},
  gateSnapshot = null,
} = {}) {
  const cleanProfileText = String(profileText || "").trim();
  const sections = [
    "SYSTEM FRAME",
    "You are reading one contract and one schema for the Epistemic Octahedron pipeline.",
    "Interpret the user text semantically and return JSON only.",
    "",
    "CURRENT PROFILE CANON",
    formatSimpleListSection("Current principles", currentPrinciples),
    formatSimpleListSection("Current boundaries", currentBoundaries),
    "",
    "CURRENT SUGGESTED OPTIMIZATION",
    formatSimpleListSection("Suggested principles", suggestedPrinciples),
    formatSimpleListSection("Suggested boundaries", suggestedBoundaries),
    "",
    "PROFILER MEMORY",
    formatProfilerMemorySection(profilerMemory, gateSnapshot),
    "",
    "USER PROFILE INPUT",
    cleanProfileText || "[no profile text provided]",
    "",
    CORE_CONTRACT,
  ];
  return sections.join("\n");
}

function sliderPercentFromAxis(axisValue) {
  const value = Number(axisValue) || 0;
  return (value + 1) * 50;
}

function formatPercent(value) {
  const num = Number(value) || 0;
  return `${num.toFixed(1)}%`;
}

function formatCoord(value) {
  const num = Number(value) || 0;
  return num.toFixed(3).replace("-0.000", "0.000");
}

function formatComputedSection(computed = {}) {
  const point = computed.point || {};
  const x = Number(point.x) || 0;
  const y = Number(point.y) || 0;
  const z = Number(point.z) || 0;
  const coveragePercent = Number(computed.coveragePercent);

  const empathy = sliderPercentFromAxis(x);
  const practicality = 100 - empathy;
  const wisdom = sliderPercentFromAxis(z);
  const knowledge = 100 - wisdom;
  const stability = Math.abs(y) * 100;
  const lines = [
    "Computed profiler values",
    "These percentages are derived directly from the plotted point.",
    "Lateral percentages are stability-percent dependent because higher |Y| compresses lateral movement on the surface.",
    `Empathy percentage: ${formatPercent(empathy)}`,
    `Practicality percentage: ${formatPercent(practicality)}`,
    `Wisdom percentage: ${formatPercent(wisdom)}`,
    `Knowledge percentage: ${formatPercent(knowledge)}`,
    `Epistemic stability percentage: ${formatPercent(stability)} (${y >= 0 ? "positive" : "negative"} direction)`,
  ];
  if (Number.isFinite(coveragePercent)) {
    lines.push(`Coverage percentage: ${formatPercent(coveragePercent)}`);
  }
  lines.push(`X: ${formatCoord(x)}`);
  lines.push(`Y: ${formatCoord(y)}`);
  lines.push(`Z: ${formatCoord(z)}`);
  return lines.join("\n");
}


export function getGateSnapshotFromMemory(profilerMemory = {}) {
  return extractGateSnapshot(profilerMemory) || null;
}

export function buildProfilerAssessmentPacket({
  name = "",
  additionalInfo = "",
  computed = {},
} = {}) {
  const sections = [
    "SYSTEM FRAME",
    "You are reading a finalized profiler snapshot from the Epistemic Octahedron pipeline.",
    "Use this snapshot to describe the compiled philosophy, not the wider system.",
    "",
    "TASK",
    "Write a concise overview of the profile's philosophy from the plotted point and the supplied context.",
    "Do not explain implementation mechanics.",
    "Treat the name as display-only.",
    "Do not invent biography.",
    "Use plain language and low jargon.",
    "Tell the reader at least one thing they may not notice immediately from the coordinates alone.",
    "Connect the interpretation to what the profile seems to care about most.",
    "",
    "GEOMETRY REFERENCE",
    "The plotted point lies on the octahedron surface where |x| + |y| + |z| = 1 whenever the worldview is active enough to project.",
    "x negative = Practicality, x positive = Empathy.",
    "z negative = Knowledge, z positive = Wisdom.",
    "y negative = Negative Epistemic Stability, y positive = Positive Epistemic Stability.",
    "The coordinate origin is the pre-philosophical null state: no active worldview has formed strongly enough to be plotted on the surface.",
    "Epistemic collapse is the lower vertex: maximal active negative epistemic stability.",
    "Objective peak philosophical maturity is the upper vertex: all four lateral tensions considered without passive destabilization by asymmetry.",
    "The epistemic borderline is y = 0: net 0 convergence between positive and negative epistemic stability.",
    "",
    "DEFINITIONS",
    "Empathy / Practicality\t- Ethical and situational orientation toward persons versus functional demands",
    "Wisdom / Knowledge\t- Orientation toward deep judgment versus information, accumulation, or technical grasp",
    "Negative / Positive epistemic stability\t- Degree of reality-tracking, coherence, maturity, resistance to delusion, and ability to self-correct",
    "Epistemic stability is the degree to which an individual’s worldview is able to remain coherent, reality-tracking, self-corrective, and non-delusional under internal reflection and external pressure.",
    "Objective peak philosophical maturity is the state represented by the upper vertex of the Epistemic Octahedron, in which the individual has fully considered empathy, practicality, wisdom, and knowledge, understands the possibility of epistemic failure or collapse, and is not passively destabilized by asymmetry among them.",
    "The most important philosophical move in this framework is the distinction between the null origin, the lower vertex, and the upper vertex.",
    "At the coordinate origin, the horizontal dimensions are not in active tension because no worldview has yet formed strongly enough to be plotted on the surface. This is pre-philosophical nullity, not maturity and not pathology.",
    "At the lower vertex, the worldview is active but maximally negatively stable. This is epistemic collapse, not empty balance and not the null state.",
    "At the upper vertex, the horizontal dimensions are balanced because they have been encountered, processed, and integrated. This is reflective balance rather than undeveloped absence.",
    "The model therefore rejects the idea that all symmetry is equal. Two states can look laterally balanced while being structurally different because one may be null, one collapsed, and one maturely integrated.",
    "The lower half of the Epistemic Octahedron should not be treated as a single pathology. It houses several related but non-identical conditions. These may include:",
    "- distorted reality-tracking,",
    "- immaturity,",
    "- delusion,",
    "- false certainty,",
    "- negative epistemic stability.",
    "These are connected because each reflects some failure of mature epistemic organization, but they should not be collapsed into one label. The graph allows them to occupy different regions in the lower half depending on lateral asymmetry.",
    "Passive ignorance on controversial matters does not by itself imply the lower vertex. If a worldview is active but merely uninformed, hesitant, or underdeveloped, the more appropriate placement is near the equatorial region or only modestly within the lower half. Deeper descent is reserved for cases in which passivity is bound up with stronger epistemic failure, such as distortion, refusal of correction, or false certainty.",
    "Development does not require literal passage through every negatively stable region. The origin is a reference point for non-activated worldview, while empirical plotting may begin near the equator or in the lower positive range once a worldview becomes active enough to plot.",
    "",
    "PROFILE SNAPSHOT",
    `Name: ${String(name || "").trim() || "unspecified"}`,
    `Additional info: ${String(additionalInfo || "").trim() || "none"}`,
    formatComputedSection(computed),
    "",
    "OUTPUT",
    "Return plain prose only.",
    "Keep it concise, specific, grounded in the coordinates, and readable to a non-technical person.",
    "Start off with what popular philosophical term(s) this profile may associate with the set xyz, by making sense of the definitions. take any additional info into consideration, if any.",
  ];
  return sections.join("\n");
}
