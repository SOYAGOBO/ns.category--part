import { TheoremChallenge, TacticGuideItem } from "./types";

export const LEAN_CHALLENGES: TheoremChallenge[] = [
  {
    id: "and_comm",
    title: "And Commutativity",
    category: "Propositional Logic",
    difficulty: "Beginner",
    description: "Prove that if both P and Q are true, then Q and P are true. This is the commutativity of logical conjunction.",
    starterCode: `theorem and_comm (P Q : Prop) : P ∧ Q → Q ∧ P := by
  intro h
  cases h with
  | intro hp hq =>
    constructor
    · exact hq
    · exact hp`,
    solutionCode: `theorem and_comm (P Q : Prop) : P ∧ Q → Q ∧ P := by
  intro h
  cases h with
  | intro hp hq =>
    constructor
    · exact hq
    · exact hp`,
    tacticsTip: "Use 'intro h' to assume the hypothesis P ∧ Q. Then use 'cases h with | intro hp hq => ...' to split it into individual hypotheses hp and hq. Finally, use 'constructor' to break the goal Q ∧ P into two separate subgoals Q and P."
  },
  {
    id: "or_comm",
    title: "Or Commutativity",
    category: "Propositional Logic",
    difficulty: "Beginner",
    description: "Prove that if P or Q is true, then Q or P is true. You will need to handle cases depending on whether P is true or Q is true.",
    starterCode: `theorem or_comm (P Q : Prop) : P ∨ Q → Q ∨ P := by
  intro h
  cases h with
  | inl hp => 
    -- Case where P is true
    exact Or.inr hp
  | inr hq => 
    -- Case where Q is true
    exact Or.inl hq`,
    solutionCode: `theorem or_comm (P Q : Prop) : P ∨ Q → Q ∨ P := by
  intro h
  cases h with
  | inl hp => exact Or.inr hp
  | inr hq => exact Or.inl hq`,
    tacticsTip: "Use 'intro h' to assume P ∨ Q. Then use 'cases h' (or pattern match) to handle the left injection Or.inl (where P is true) and right injection Or.inr (where Q is true)."
  },
  {
    id: "contrapositive",
    title: "Implication Contrapositive",
    category: "Propositional Logic",
    difficulty: "Intermediate",
    description: "Prove the contrapositive rule of implication: if P implies Q, then not Q implies not P.",
    starterCode: `theorem contrapositive (P Q : Prop) : (P → Q) → ¬Q → ¬P := by
  intro hpq hnq hp
  have hq : Q := hpq hp
  exact hnq hq`,
    solutionCode: `theorem contrapositive (P Q : Prop) : (P → Q) → ¬Q → ¬P := by
  intro hpq hnq hp
  have hq : Q := hpq hp
  exact hnq hq`,
    tacticsTip: "Use 'intro hpq hnq hp' to introduce the three assumptions. '¬P' is definitionally 'P → False'. Use 'have' to apply the implication hpq to hp to get Q, then apply hnq (which is Q → False) to it."
  },
  {
    id: "de_morgan_one",
    title: "De Morgan's Law",
    category: "Propositional Logic",
    difficulty: "Intermediate",
    description: "Prove one direction of De Morgan's laws: if it is not the case that (P or Q) is true, then P is false and Q is false.",
    starterCode: `theorem de_morgan (P Q : Prop) : ¬(P ∨ Q) → ¬P ∧ ¬Q := by
  intro h
  constructor
  · intro hp
    have hpq : P ∨ Q := Or.inl hp
    exact h hpq
  · intro hq
    have hpq : P ∨ Q := Or.inr hq
    exact h hpq`,
    solutionCode: `theorem de_morgan (P Q : Prop) : ¬(P ∨ Q) → ¬P ∧ ¬Q := by
  intro h
  constructor
  · intro hp
    have hpq : P ∨ Q := Or.inl hp
    exact h hpq
  · intro hq
    have hpq : P ∨ Q := Or.inr hq
    exact h hpq`,
    tacticsTip: "Use 'constructor' to prove both conjuncts (¬P and ¬Q) independently. For each, assume the variable and construct an 'Or' hypothesis to trigger a contradiction with ¬(P ∨ Q)."
  },
  {
    id: "add_zero",
    title: "Induction: add_zero",
    category: "Natural Numbers",
    difficulty: "Advanced",
    description: "Prove by mathematical induction that for any natural number n, n + 0 = n.",
    starterCode: `theorem add_zero (n : Nat) : n + 0 = n := by
  induction n with
  | zero => 
    rfl
  | succ d hd => 
    simp [hd]`,
    solutionCode: `theorem add_zero (n : Nat) : n + 0 = n := by
  induction n with
  | zero => rfl
  | succ d hd => simp [hd]`,
    tacticsTip: "Use the 'induction' tactic on n. In the 'zero' base case, use 'rfl' (reflexivity) to simplify 0 + 0 = 0. In the 'succ' inductive step, use 'simp [hd]' to apply the induction hypothesis hd."
  },
  {
    id: "anomaly_resolution",
    title: "Anomaly Resolution",
    category: "Presheaf Coherence",
    difficulty: "Advanced",
    description: "Verify the core soundness of the Teramorphism Presheaf Anomaly Resolution framework. Prove that cascading resolutions preserve section structure when there is no broken state, and that identical sections are inherently coherent on overlaps (Test 16).",
    starterCode: `/-!
# Anomaly Resolution Module

This module provides comprehensive anomaly detection, classification, and resolution
strategies for the teramorphism presheaf architecture. It extends the core framework
with multi-level anomaly handling, cascading resolution, and global coherence verification.
-/

/-- Severity level for anomalies -/
inductive AnomalySeverity where
  | trivial : AnomalySeverity
  | minor : AnomalySeverity
  | critical : AnomalySeverity
  deriving DecidableEq, Repr

/-- Source classification of anomalies -/
inductive AnomalySource where
  | spin_mismatch : AnomalySource
  | type_violation : AnomalySource
  | morphism_failure : AnomalySource
  | gluing_conflict : AnomalySource
  | restriction_incompatibility : AnomalySource
  deriving DecidableEq, Repr

/-- Detailed anomaly classification -/
structure AnomalyDescriptor (U : GeometricOpenSet) where
  id : Nat
  severity : AnomalySeverity
  source : AnomalySource
  is_broken : Bool
  is_propagating : Bool
  description : String

namespace AnomalyDescriptor

/-- Check if an anomaly requires immediate intervention -/
def requiresIntervention {U : GeometricOpenSet} (anomaly : AnomalyDescriptor U) : Prop :=
  anomaly.is_broken ∧ (anomaly.severity = AnomalySeverity.critical ∨ anomaly.is_propagating)

/-- Classify anomaly by severity -/
def classifySeverity {U : GeometricOpenSet} (anomaly : AnomalyDescriptor U) : AnomalySeverity :=
  anomaly.severity

/-- Check if anomaly is from spin mismatch -/
def isSpinMismatch {U : GeometricOpenSet} (anomaly : AnomalyDescriptor U) : Prop :=
  anomaly.source = AnomalySource.spin_mismatch

end AnomalyDescriptor

namespace LocalResolution

/-- Strategy 1: Simple joker promotion -/
def promoteToJoker {U : GeometricOpenSet} (sec : SheafSection U)
    (anomaly : AnomalyDescriptor U) : SheafSection U :=
  if anomaly.is_broken then
    { val := { sec.val with morph_type := MorphismType.joker } }
  else
    sec

/-- Strategy 2: Spin normalization -/
def normalizeSpin {U : GeometricOpenSet} (sec : SheafSection U)
    (anomaly : AnomalyDescriptor U) : SheafSection U :=
  if anomaly.source = AnomalySource.spin_mismatch then
    { val := Teramorphism.spinLeftToRight sec.val }
  else
    sec

/-- Strategy 3: Morphism type reset -/
def resetMorphismType {U : GeometricOpenSet} (sec : SheafSection U)
    (anomaly : AnomalyDescriptor U) : SheafSection U :=
  if anomaly.source = AnomalySource.type_violation then
    { val := { sec.val with morph_type := MorphismType.standard } }
  else
    sec

/-- Strategy 4: Cascading resolution (try multiple strategies) -/
def cascadingResolve {U : GeometricOpenSet} (sec : SheafSection U)
    (anomaly : AnomalyDescriptor U) : SheafSection U :=
  let step1 := normalizeSpin sec anomaly
  let step2 := resetMorphismType step1 anomaly
  let step3 := promoteToJoker step2 anomaly
  step3

/-- Lemma: cascading resolution maintains structure -/
lemma cascadingResolve_preserves_identity {U : GeometricOpenSet}
    (sec : SheafSection U) (anomaly : AnomalyDescriptor U)
    (h : ¬anomaly.is_broken) :
    cascadingResolve sec anomaly = sec := by
  simp [cascadingResolve, promoteToJoker, h]

end LocalResolution

namespace CoherenceVerification

/-- Check if two sections cohere on their overlap -/
def sectionsCohere {U V : GeometricOpenSet}
    (sU : SheafSection U) (sV : SheafSection V) : Prop :=
  sU.restrict (GeometricOpenSet.overlapLe_left U V) =
  sV.restrict (GeometricOpenSet.overlapLe_right U V)

/-- Verify coherence of identical sections on trivial overlap -/
theorem identical_sections_cohere {U : GeometricOpenSet}
    (sec : SheafSection U) :
    sectionsCohere sec sec := by
  simp [sectionsCohere]

end CoherenceVerification`,
    solutionCode: `/-!
# Anomaly Resolution Module

This module provides comprehensive anomaly detection, classification, and resolution
strategies for the teramorphism presheaf architecture. It extends the core framework
with multi-level anomaly handling, cascading resolution, and global coherence verification.
-/

/-- Severity level for anomalies -/
inductive AnomalySeverity where
  | trivial : AnomalySeverity
  | minor : AnomalySeverity
  | critical : AnomalySeverity
  deriving DecidableEq, Repr

/-- Source classification of anomalies -/
inductive AnomalySource where
  | spin_mismatch : AnomalySource
  | type_violation : AnomalySource
  | morphism_failure : AnomalySource
  | gluing_conflict : AnomalySource
  | restriction_incompatibility : AnomalySource
  deriving DecidableEq, Repr

/-- Detailed anomaly classification -/
structure AnomalyDescriptor (U : GeometricOpenSet) where
  id : Nat
  severity : AnomalySeverity
  source : AnomalySource
  is_broken : Bool
  is_propagating : Bool
  description : String

namespace AnomalyDescriptor

/-- Check if an anomaly requires immediate intervention -/
def requiresIntervention {U : GeometricOpenSet} (anomaly : AnomalyDescriptor U) : Prop :=
  anomaly.is_broken ∧ (anomaly.severity = AnomalySeverity.critical ∨ anomaly.is_propagating)

/-- Classify anomaly by severity -/
def classifySeverity {U : GeometricOpenSet} (anomaly : AnomalyDescriptor U) : AnomalySeverity :=
  anomaly.severity

/-- Check if anomaly is from spin mismatch -/
def isSpinMismatch {U : GeometricOpenSet} (anomaly : AnomalyDescriptor U) : Prop :=
  anomaly.source = AnomalySource.spin_mismatch

end AnomalyDescriptor

namespace LocalResolution

/-- Strategy 1: Simple joker promotion -/
def promoteToJoker {U : GeometricOpenSet} (sec : SheafSection U)
    (anomaly : AnomalyDescriptor U) : SheafSection U :=
  if anomaly.is_broken then
    { val := { sec.val with morph_type := MorphismType.joker } }
  else
    sec

/-- Strategy 2: Spin normalization -/
def normalizeSpin {U : GeometricOpenSet} (sec : SheafSection U)
    (anomaly : AnomalyDescriptor U) : SheafSection U :=
  if anomaly.source = AnomalySource.spin_mismatch then
    { val := Teramorphism.spinLeftToRight sec.val }
  else
    sec

/-- Strategy 3: Morphism type reset -/
def resetMorphismType {U : GeometricOpenSet} (sec : SheafSection U)
    (anomaly : AnomalyDescriptor U) : SheafSection U :=
  if anomaly.source = AnomalySource.type_violation then
    { val := { sec.val with morph_type := MorphismType.standard } }
  else
    sec

/-- Strategy 4: Cascading resolution (try multiple strategies) -/
def cascadingResolve {U : GeometricOpenSet} (sec : SheafSection U)
    (anomaly : AnomalyDescriptor U) : SheafSection U :=
  let step1 := normalizeSpin sec anomaly
  let step2 := resetMorphismType step1 anomaly
  let step3 := promoteToJoker step2 anomaly
  step3

/-- Lemma: cascading resolution maintains structure -/
lemma cascadingResolve_preserves_identity {U : GeometricOpenSet}
    (sec : SheafSection U) (anomaly : AnomalyDescriptor U)
    (h : ¬anomaly.is_broken) :
    cascadingResolve sec anomaly = sec := by
  simp [cascadingResolve, promoteToJoker, h]

end LocalResolution

namespace CoherenceVerification

/-- Check if two sections cohere on their overlap -/
def sectionsCohere {U V : GeometricOpenSet}
    (sU : SheafSection U) (sV : SheafSection V) : Prop :=
  sU.restrict (GeometricOpenSet.overlapLe_left U V) =
  sV.restrict (GeometricOpenSet.overlapLe_right U V)

/-- Verify coherence of identical sections on trivial overlap -/
theorem identical_sections_cohere {U : GeometricOpenSet}
    (sec : SheafSection U) :
    sectionsCohere sec sec := by
  simp [sectionsCohere]

end CoherenceVerification`,
    tacticsTip: "To prove identical_sections_cohere, utilize 'simp [sectionsCohere]' which unfolds the definition of overlap-restricted sections, and simplifies equality of identical terms reflexively."
  },
  {
    id: "topos_subclassifier",
    title: "Topos Subclassifier Consistency",
    category: "Topos Theory",
    difficulty: "Intermediate",
    description: "In topos theory, a subobject classifier acts as a truth value object. If we model a conversion 's = 1 - q' as logical negation 's = ¬q', verify that applying this conversion twice remains consistent (i.e., ¬¬q ↔ q) under classical assumptions (q ∨ ¬q).",
    starterCode: `/-!
# Topos Subclassifier Consistency

We verify that a boolean subobject classifier remains 
consistent when applying a conversion simulating s = 1 - q.
Here, we model the conversion structurally as logical negation.
-/

def convert (q : Prop) : Prop := ¬q

def is_consistent (q : Prop) : Prop := convert (convert q) ↔ q

theorem subclassifier_consistency (q : Prop) (hq : q ∨ ¬q) : is_consistent q := by
  dsimp [is_consistent, convert]
  cases hq with
  | inl h_true =>
    -- Case where q is true
    constructor
    · intro _
      exact h_true
    · intro _
      intro hnq
      exact hnq h_true
  | inr h_false =>
    -- Case where q is false
    constructor
    · intro hnnq
      -- TODO: derive False from hnnq (¬¬q) and h_false (¬q)
      _
    · intro hq
      -- TODO: derive False from h_false (¬q) and hq (q)
      _`,
    solutionCode: `/-!
# Topos Subclassifier Consistency

We verify that a boolean subobject classifier remains 
consistent when applying a conversion simulating s = 1 - q.
Here, we model the conversion structurally as logical negation.
-/

def convert (q : Prop) : Prop := ¬q

def is_consistent (q : Prop) : Prop := convert (convert q) ↔ q

theorem subclassifier_consistency (q : Prop) (hq : q ∨ ¬q) : is_consistent q := by
  dsimp [is_consistent, convert]
  cases hq with
  | inl h_true =>
    -- Case where q is true
    constructor
    · intro _
      exact h_true
    · intro _
      intro hnq
      exact hnq h_true
  | inr h_false =>
    -- Case where q is false
    constructor
    · intro hnnq
      -- Prove q from ¬¬q and ¬q
      have f : False := hnnq h_false
      exact False.elim f
    · intro hq
      -- Prove ¬¬q from q and ¬q
      have f : False := h_false hq
      exact False.elim f`,
    tacticsTip: "Use 'dsimp' to unfold the definitions. Then use 'cases' on the classical assumption 'hq'. In the contradictory cases, derive False by applying the negation hypothesis, then use 'exact False.elim f' to close the goal."
  }
];

export const TACTIC_GUIDE: TacticGuideItem[] = [
  {
    name: "intro",
    syntax: "intro h",
    description: "Introduces variables or hypotheses from the goal's target into the local context.",
    example: "intro h",
    explanation: "If the current goal is 'P → Q', running 'intro h' moves 'h : P' to your hypotheses, leaving 'Q' as the new goal to prove."
  },
  {
    name: "exact",
    syntax: "exact h",
    description: "Closes the current goal if a local hypothesis matches the goal precisely.",
    example: "exact hp",
    explanation: "If your goal is 'P' and you have a hypothesis 'hp : P', 'exact hp' immediately fulfills and closes this goal."
  },
  {
    name: "cases",
    syntax: "cases h with | inl h1 => ... | inr h2 => ...",
    description: "Performs case analysis or destructures an inductive hypothesis (such as Or, And, or custom structures).",
    example: "cases h with | intro hp hq => ...",
    explanation: "For an 'And' hypothesis 'h : P ∧ Q', 'cases' extracts both conjuncts 'hp : P' and 'hq : Q'. For an 'Or' hypothesis, it splits the proof into two separate branches."
  },
  {
    name: "constructor",
    syntax: "constructor",
    description: "Applies the constructor of an inductive datatype, breaking conjunctions or equivalence goals into subgoals.",
    example: "constructor",
    explanation: "If the goal is 'P ∧ Q', 'constructor' creates two subgoals: one to prove 'P' and another to prove 'Q'."
  },
  {
    name: "rfl",
    syntax: "rfl",
    description: "Closes equality goals (a = b) by reflexivity, provided both sides simplify definitionally to the exact same term.",
    example: "rfl",
    explanation: "If proving '0 + 0 = 0' or 'x = x', 'rfl' simplifies and closes the goal immediately."
  },
  {
    name: "rw (rewrite)",
    syntax: "rw [h]",
    description: "Replaces occurrences of the left-hand side of an equality 'h : a = b' with the right-hand side in the goal.",
    example: "rw [add_comm]",
    explanation: "If you have a theorem 'add_comm : x + y = y + x', 'rw [add_comm]' rewrites any matching term 'A + B' to 'B + A' in your goal."
  },
  {
    name: "simp",
    syntax: "simp [h]",
    description: "The simplifier. Rewrites terms using a database of standard equations plus any custom rules provided in the brackets.",
    example: "simp [hd]",
    explanation: "Simplifies algebraic expressions or structures. Passing '[hd]' instructs the simplifier to use your inductive hypothesis 'hd' during reduction."
  },
  {
    name: "apply",
    syntax: "apply h",
    description: "Applies an implication or function to rewrite the goal backwards.",
    example: "apply hpq",
    explanation: "If the goal is 'Q' and you have 'hpq : P → Q', running 'apply hpq' turns the goal into 'P'."
  },
  {
    name: "have",
    syntax: "have h : T := proof",
    description: "Introduces an intermediate proof step or sub-theorem into the local context.",
    example: "have hq : Q := hpq hp",
    explanation: "Creates a new helper assumption 'hq : Q' using an existing implication 'hpq' applied to 'hp'."
  }
];
