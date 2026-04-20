
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

const GATE_STATUS_TO_SCORE = {
  dormant: 0,
  lean_positive: 0.2,
  established_positive: 0.55,
  strong_positive: 0.85,
  lean_negative: -0.2,
  established_negative: -0.55,
  strong_negative: -0.85,
};

function createDormantGateSnapshot() {
  return Object.fromEntries(
    GATE_SNAPSHOT_ORDER.map((gate) => [
      gate,
      {
        score: 0,
        status: "dormant",
        positive_events: 0,
        negative_events: 0,
        last_event_at: null,
        last_evidence_span: null,
      },
    ]),
  );
}

function inferGateSnapshotFromMetaMarkers(memory = {}) {
  const markers = normalizeList(memory.meta_epistemic_markers || []);
  const snapshot = createDormantGateSnapshot();
  let sawGateMarker = false;

  for (const marker of markers) {
    const match = String(marker || "").trim().match(/^(G[1-6]_[^:]+)\s*:\s*([a-z_]+)$/i);
    if (!match) continue;
    const gate = String(match[1] || "").trim();
    const status = String(match[2] || "").trim().toLowerCase();
    if (!GATE_SNAPSHOT_ORDER.includes(gate)) continue;
    if (!Object.prototype.hasOwnProperty.call(GATE_STATUS_TO_SCORE, status)) continue;
    snapshot[gate] = {
      ...snapshot[gate],
      status,
      score: GATE_STATUS_TO_SCORE[status],
    };
    sawGateMarker = true;
  }

  return sawGateMarker ? snapshot : null;
}

function hasProfilerMemoryContent(memory = {}) {
  if (!memory || typeof memory !== "object") return false;
  return [
    "core_principles",
    "core_boundaries",
    "meta_epistemic_markers",
    "risk_notes",
    "gate_snapshot",
    "gateStates",
    "gate_states",
  ].some((key) => Object.prototype.hasOwnProperty.call(memory, key));
}

function extractGateSnapshot(memory = {}, explicitGateSnapshot = null) {
  if (explicitGateSnapshot && typeof explicitGateSnapshot === "object") return explicitGateSnapshot;
  if (!memory || typeof memory !== "object") return null;
  const directSnapshot = memory.gate_snapshot || memory.gateStates || memory.gate_states || null;
  if (directSnapshot && typeof directSnapshot === "object") return directSnapshot;
  const inferredSnapshot = inferGateSnapshotFromMetaMarkers(memory);
  if (inferredSnapshot) return inferredSnapshot;
  if (hasProfilerMemoryContent(memory)) return createDormantGateSnapshot();
  return null;
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
version: 6.9

PURPOSE
You are an extractor and canon optimizer only.
Do not compute final scores, maturity percentages, or final x y z coordinates.
Use only the text inside this packet.
Do not browse, call tools, or import outside context.

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

CORE RULES
1. Extract portable philosophical structure, not verdicts.
2. Prefer conservative extraction when uncertain.
3. Use evidence_span whenever possible.
4. Silence is neutral. Do not emit gate failures from absence alone.
5. Keep support and confidence separate.
6. Thin input should stay conservative by default.
7. Use canon memory as context, not as text to parrot back.
8. Do not let prior canon wording, display labels, or gate snapshot override the current text.
9. If a profiler gate snapshot is present, do a blind local read first, then return gate_update_proposals as a separate advisory layer.
10. If evidence is too thin for a gate event, prefer local signals, principles, claimed_values, or notes.

LATERAL AND INTEGRATION RULES
1. Do not leave all four lateral poles at zero for an active non-null philosophy unless the text is truly near-null.
2. Give weak lateral support when the text gives a real basis for a side, even if slight.
3. Do not mark explicit_balance or fair_tradeoff unless both poles or a real tradeoff are present.
4. Mere emphasis on one pole does not prove neglect of the opposite pole.
5. If the text explicitly states mutual balance, equal standing, non-hierarchy, right proportion, or that neither pole should rule the other, preserve that relation across semantic_grid, axis_events, local_extraction, profile_update_signals, canonOptimization, and notes.
6. Do not let older canon wording quietly reintroduce hierarchy when the current text rejects it.

DIMENSION CONSIDERATION
Return dimension_consideration every time for empathy, practicality, wisdom, and knowledge.
Each dimension must include:
- status = directly_engaged | acknowledged | tradeoff_engaged | explicitly_deprioritized | explicitly_rejected | not_evidenced_here
- confidence
- basis_type = direct_statement | real_tradeoff | stated_constraint | explicit_dismissal | explicit_exclusion | none
- evidence_spans
Guidance:
- Use explicitly_deprioritized or explicitly_rejected only when the text clearly does that.
- Narrow scope, one-sided emphasis, or local silence are not enough.
- Criticizing a distorted, excessive, shallow, or misapplied form of a dimension does not by itself mean the text rejects that dimension in principle.
- Criticizing empathy when detached from consequences, responsibility, or truth is not by itself rejection of empathy as a dimension.
- If unclear, prefer acknowledged or not_evidenced_here.

PROFILE TARGET FRAME AND ATTRIBUTION
Return profile_target_frame every time.
Allowed values:
- authorial_endorsement
- self_description
- described_subject
- cautionary_example
- quoted_view
- mixed_or_ambiguous
Rules:
- Keep source and target separate.
- Do not give positive credit to a described subject merely because the narrator clearly sees what that subject lacks.
- When the passage criticizes or diagnoses another person, institution, or system, do not treat that target's epistemic failures as the profiled self by default.
- For local y signals and triggered gate events, include target = self | described_other | criticized_system | quoted_view | mixed | unclear.

CLAIM COMMITMENTS
Return claim_commitments every time.
Each item must include:
- claim
- commitment = asserted | conditional | hypothetical | quoted | illustrative
- scope_effect = none | contained | widened
- evidence_span
Rules:
- Preserve whether a claim is asserted, conditional, hypothetical, quoted, or illustrative.
- Do not widen scope merely because a named example, event, office, or person appears inside a conditional, hypothetical, or illustrative statement.
- Keep conditional structure portable. Do not treat the antecedent as established unless the text also asserts it.
- Use scope_effect = widened only when a claim introduces a genuinely new domain of justification that the same text does not substantially cover.
- Broad wording, political scale, rhetorical intensity, or emotionally loaded framing alone do not count as widened scope.
- If a claim still functions inside the same governing principle, example, or tradeoff already being handled by the text, prefer scope_effect = contained.

SCOPE PROFILE
Return scope_profile every time.
scope_profile must include:
- claimed_scope = narrow | moderate | broad
- scope_complete_for_text = true | false
- scope_expansion = none | contained | widened
- unresolved_scope_gaps = []
- relevant_gates = []
- irrelevant_gates = []
Rules:
- A text can be eligible for peak maturity within its own claimed scope even if some globally available gates are irrelevant to that scope.
- Do not treat untouched irrelevant gates as hidden maturity defects.
- scope_complete_for_text is true only when the text covers the territory it itself opens.
- If the text opens new territory and clearly leaves part of it unaddressed, set scope_complete_for_text = false and record unresolved_scope_gaps.
- Later texts may resolve earlier scope gaps without treating the earlier worldview as newly unstable in itself.
- Put a gate in relevant_gates only when the current text materially presents evidence that could plausibly clear or fail that gate for the profiled target.
- Mere topical adjacency, broad theme overlap, or general moral disagreement are not enough to make a gate relevant.
- If the current text would leave a gate at neutral or no_change because it does not really bear on that gate, prefer irrelevant_gates.
- If any triggered_gate_event or any non-neutral gate_update_proposal is emitted for the profiled target, that gate must appear in relevant_gates.
- If no clear evidence bears on a gate, place it in irrelevant_gates rather than leaving both arrays empty.

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
Each field must include support, confidence, and evidence_spans.
For y_positive and y_negative in semantic_grid, score the epistemic quality of the profiled target only.
Do not use failures or strengths that belong to criticized systems, described others, or quoted views as semantic_grid support for the profiled target.
Put outside-target epistemic material in targeted local_y signals, triggered_gate_events, gate_update_proposals, and notes instead.
If the passage mainly contains epistemic failure in an outside target, semantic_grid.y_negative for the profiled target should stay at 0.0 unless the profiled target itself also shows negative epistemic evidence.

LOCAL EXTRACTION
local_extraction may include:
- principles
- boundaries
- claimed_values
- tradeoffs
- contradictions

AXIS EVENTS
Do not emit final x or z scores.
For x axis:
- x_pole_evidence with pole = empathy or practicality
- x_integration_events with type = explicit_balance | fair_tradeoff | integrated_tension
For z axis:
- z_pole_evidence with pole = wisdom or knowledge
- z_integration_events with type = explicit_balance | fair_tradeoff | integrated_tension
Pole evidence items must include strength_label, confidence_score_0_to_1, and evidence_span_text.
Use strength_label = weak | moderate | strong.
A real tradeoff can exist even when the text clearly favors one side.
If the text contrasts competing concerns, goods, pressures, or consequences, prefer fair_tradeoff or integrated_tension over zero integration, even when one pole is judged defective.

LOCAL Y SIGNALS
Each local y signal must include:
- type
- strength_label = weak | moderate | strong
- confidence_score_0_to_1
- target
- evidence_span_text
Use local_y signals to record target-specific epistemic material whenever a passage contains both the profiled stance and outside targets.
Positive types may include:
- counter_consideration
- self_correction
- reality_contact
- coherence
- error_awareness
- revision_openness
- non_strawman_fairness
Negative types may include:
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
Each triggered_gate_event must include:
- gate
- direction = positive | negative
- strength_label = weak | moderate | strong
- confidence_score_0_to_1
- novelty_score_0_to_1 when possible
- target
- evidence_span_text
Only emit triggered gate events when the text gives actual evidence.
Do not assign a self-failure when the failure belongs to an outside target.
Recognizing a tradeoff, criticizing a pattern, or describing harmful effects does not by itself make G2_non_strawman relevant or positive.
Use G2_non_strawman only when the text shows fair contact with the other side's actual rationale rather than merely describing its errors, effects, or consequences.
Do not use neutral in triggered_gate_events. If a gate read is neutral, mixed, softened, or no_change, omit it from triggered_gate_events and place it only in gate_update_proposals.

GATE UPDATE PROPOSALS
Return gate_update_proposals every time.
Each item must include:
- gate
- local_direction = positive | negative | neutral
- proposed_effect = reopen | reinforce | soften | reverse | no_change
- confidence_score_0_to_1
- evidence_span_text
- reason
This is a state-aware advisory layer, not the final state transition.

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
Only use failed_gates and introduced_contradictions for the profiled self, not a criticized outside target.

CANON OPTIMIZATION
Use canonOptimization only to compress, merge, or sharpen wording without losing meaning.
Do not reintroduce hierarchy, subordination, or asymmetry when the current text explicitly rejects it.

PROFILE SUMMARY LINE
The profile array is display text only.
Keep it plain-language.
Do not put numeric axis values, percentages, coordinates, or projection math in it.

SCHEMA TYPE LEGEND
- strength_label = weak | moderate | strong
- confidence_score_0_to_1 = decimal from 0.0 to 1.0
- novelty_score_0_to_1 = decimal from 0.0 to 1.0
- evidence_span_text = string

REQUIRED JSON SHAPE
{
  "model": "epistemic_octahedron_interpreter_v3",
  "profiler_mode": "dense_support_v2",
  "analysis_scope": "thought | stance | worldview_fragment | full_profile_import",
  "scope_strength": "low | medium | high",
  "profile_target_frame": "authorial_endorsement | self_description | described_subject | cautionary_example | quoted_view | mixed_or_ambiguous",
  "statement_modes": [],
  "profile": ["short display summary only"],
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
  "claim_commitments": [],
  "scope_profile": {
    "claimed_scope": "narrow | moderate | broad",
    "scope_complete_for_text": true,
    "scope_expansion": "none | contained | widened",
    "unresolved_scope_gaps": [],
    "relevant_gates": [],
    "irrelevant_gates": []
  },
  "local_extraction": {
    "principles": [],
    "boundaries": [],
    "claimed_values": [],
    "tradeoffs": [],
    "contradictions": []
  },
  "axis_events": {
    "x_pole_evidence": [
      { "pole": "empathy | practicality", "strength_label": "weak | moderate | strong", "confidence_score_0_to_1": 0.0, "evidence_span_text": "" }
    ],
    "x_integration_events": [
      { "type": "explicit_balance | fair_tradeoff | integrated_tension", "strength_label": "weak | moderate | strong", "confidence_score_0_to_1": 0.0, "evidence_span_text": "" }
    ],
    "z_pole_evidence": [
      { "pole": "wisdom | knowledge", "strength_label": "weak | moderate | strong", "confidence_score_0_to_1": 0.0, "evidence_span_text": "" }
    ],
    "z_integration_events": [
      { "type": "explicit_balance | fair_tradeoff | integrated_tension", "strength_label": "weak | moderate | strong", "confidence_score_0_to_1": 0.0, "evidence_span_text": "" }
    ]
  },
  "local_y_positive_signals": [
    { "type": "counter_consideration", "strength_label": "weak | moderate | strong", "confidence_score_0_to_1": 0.0, "target": "self | described_other | criticized_system | quoted_view | mixed | unclear", "evidence_span_text": "" }
  ],
  "local_y_negative_signals": [
    { "type": "false_certainty", "strength_label": "weak | moderate | strong", "confidence_score_0_to_1": 0.0, "target": "self | described_other | criticized_system | quoted_view | mixed | unclear", "evidence_span_text": "" }
  ],
  "triggered_gate_events": [
    { "gate": "G1_counter_consideration", "direction": "positive | negative", "strength_label": "weak | moderate | strong", "confidence_score_0_to_1": 0.0, "novelty_score_0_to_1": 0.0, "target": "self | described_other | criticized_system | quoted_view | mixed | unclear", "evidence_span_text": "" }
  ],
  "gate_update_proposals": [
    { "gate": "G1_counter_consideration", "local_direction": "positive | negative | neutral", "proposed_effect": "reopen | reinforce | soften | reverse | no_change", "confidence_score_0_to_1": 0.0, "evidence_span_text": "", "reason": "" }
  ],
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
Return valid JSON only.
use a json code block whenever possible.`;

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

function formatSignedCoord(value) {
  const num = Number(value) || 0;
  const fixed = num.toFixed(3).replace("-0.000", "0.000");
  if (fixed === "0.000") return fixed;
  return num > 0 ? `+${fixed}` : fixed;
}

function formatComputedSection(computed = {}) {
  const params = computed.params || {};
  const semantics = params.semantics || {};
  const uiLike = params.uiLike || {};
  const point = computed.point || {};
  const x = Number(point.x) || 0;
  const y = Number(point.y) || 0;
  const z = Number(point.z) || 0;
  const coveragePercent = Number.isFinite(Number(computed.coveragePercent))
    ? Number(computed.coveragePercent)
    : Number(uiLike.coveragePercent);

  const projectedEmpathy = sliderPercentFromAxis(x);
  const projectedPracticality = 100 - projectedEmpathy;
  const projectedWisdom = sliderPercentFromAxis(z);
  const projectedKnowledge = 100 - projectedWisdom;
  const projectedStability = Math.abs(y) * 100;
  const hasSemanticReadout = [semantics.a, semantics.b, semantics.s].some((value) =>
    Number.isFinite(Number(value)),
  );

  const lines = ["Computed profiler values"];

  if (hasSemanticReadout) {
    lines.push("Semantic layer before surface projection");
    lines.push(`a: ${formatSignedCoord(semantics.a)}`);
    lines.push(`b: ${formatSignedCoord(semantics.b)}`);
    lines.push(`s: ${formatSignedCoord(semantics.s)}`);
    lines.push(
      `Empathy semantic percentage: ${formatPercent(
        uiLike.empathyPercent ?? sliderPercentFromAxis(semantics.a),
      )}`,
    );
    lines.push(
      `Practicality semantic percentage: ${formatPercent(
        uiLike.practicalityPercent ?? (100 - sliderPercentFromAxis(semantics.a)),
      )}`,
    );
    lines.push(
      `Wisdom semantic percentage: ${formatPercent(
        uiLike.wisdomPercent ?? sliderPercentFromAxis(semantics.b),
      )}`,
    );
    lines.push(
      `Knowledge semantic percentage: ${formatPercent(
        uiLike.knowledgePercent ?? (100 - sliderPercentFromAxis(semantics.b)),
      )}`,
    );
    lines.push(
      `Epistemic stability semantic percentage: ${formatPercent(
        Math.abs(Number(uiLike.stabilityPercent ?? ((Number(semantics.s) || 0) * 100))),
      )} (${(Number(semantics.s) || 0) >= 0 ? "positive" : "negative"} direction)`,
    );
    if (Number.isFinite(Number(semantics.yCoverage))) {
      lines.push(`Gate coverage percentage: ${formatPercent((Number(semantics.yCoverage) || 0) * 100)}`);
    }
    lines.push("");
  }

  lines.push("Projected surface point");
  lines.push("These projected percentages are derived from the plotted point after surface normalization.");
  lines.push(
    "Lateral projected percentages compress toward 50% as |Y| increases because the active worldview is being projected onto the octahedron surface.",
  );
  lines.push(`Empathy projected percentage: ${formatPercent(projectedEmpathy)}`);
  lines.push(`Practicality projected percentage: ${formatPercent(projectedPracticality)}`);
  lines.push(`Wisdom projected percentage: ${formatPercent(projectedWisdom)}`);
  lines.push(`Knowledge projected percentage: ${formatPercent(projectedKnowledge)}`);
  lines.push(
    `Epistemic stability projected percentage: ${formatPercent(projectedStability)} (${y >= 0 ? "positive" : "negative"} direction)`,
  );
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
