# Module 3 brief — The catalog (shared/static.ts)

## Teaching arc
- **Metaphor:** A musical score — fixed notation that any orchestra can play and produce the same symphony. The catalog is our musical score; computeVectors is the orchestra.
- **Opening hook:** "The product spec isn't in PowerPoint. It's in 1,526 lines of TypeScript. If you change one weight, the score moves — and the test suite catches it."
- **Key insight:** Encoding the spec as data means you can hash it, version it, validate it, and refuse to compute against an unknown shape. PowerPoint can't do any of that.

## Module position: 3 of 12
- Previous: M2 (the cast)
- Next: M4 (the math that consumes this catalog)

## What's in the catalog
- 100 questions, each with: id, text, pillarId, dimensionId, weight, rubric (1-5 levels)
- 10 pillars: Leadership & Governance, Strategy & Integration, Scope/Context/Criteria, Risk Identification, Risk Assessment, Risk Treatment, Monitoring & Review, Recording & Reporting, Risk Culture, Continuous Improvement
- 10 pillar weights summing to 1.0 — Leadership 0.20, Risk Assessment 0.20, … Continuous Improvement 0.02
- 4 dimensions: People, Process, Technology, Governance
- 4 benchmark profiles: Target / Industry / Peer / External — each is a map from pillarId → target score
- PILLAR_PROVENANCE: per-pillar standards alignment (ISO 31000 / COSO ERM / NIST RMF / RIMS RMM rationale)
- DIMENSION_PROVENANCE: same, per dimension
- MATURITY_LEVELS: 1=Initial, 2=Developing, 3=Defined, 4=Managed, 5=Optimized

## Required interactive elements
- 1+ translation-block (a real question entry → "what each field does")
- 1+ pattern-cards (the 4 benchmark profiles, each as a card)
- 1+ flow-animation (operator chooses Generation → catalog scopes the questions → engine produces score) OR badge-list (the 5 maturity levels)
- 1+ callout-accent (provenance = patent claim 13)
- 1 quiz

## Code snippet to translate (real, from shared/static.ts)
```ts
{
  id: 1,
  text: "Is there a formally approved ERM policy?",
  pillarId: "lead",
  dimensionId: "Governance",
  weight: 1.0,
  rubric: {
    1: "No formal policy exists.",
    2: "Draft policy circulates internally.",
    3: "Approved policy with annual review cadence.",
    4: "Policy integrated into operations, KPIs measure adherence.",
    5: "Policy continuously evolves; benchmarked against peers."
  }
}
```

## Code snippet for benchmark profiles
```ts
export const BENCHMARKS: Record<string, Record<string, number>> = {
  target:   { lead: 4.5, strat: 4.2, ... },
  industry: { lead: 4.0, strat: 3.8, ... },
  peer:     { lead: 3.7, strat: 3.5, ... },
  external: { lead: 4.3, strat: 4.0, ... },
};
```

## Provenance example (real, from shared/static.ts)
```ts
PILLAR_PROVENANCE.lead = {
  weight: 0.20,
  standards: "ISO 31000 §5.4, COSO ERM 2017 Component 1, NIST RMF Prepare step",
  rationale: "Leadership commitment is the precondition for every other pillar..."
}
```

## Quiz scenario
"You want to add a new pillar called 'Cyber Risk' to the catalog. What 4 places need updates so the engine still works?"
Correct answer: PILLARS array, PILLAR_WEIGHTS (must still sum to 1.0), PILLAR_PROVENANCE entry, BENCHMARKS rows for all 4 profiles. Plus questions tagged with the new pillarId.

## Glossary terms
- pillarId / dimensionId — the foreign keys that wire questions to their pillar and dimension
- benchmark profile — a target score per pillar, used to compute "gap" and "aligned"
- maturity rubric — per-question, per-level (1-5) anchor text describing what each score means

## Reference sections
- references/interactive-elements.md: Code↔English, Pattern Cards, Flow Animation OR Badge Lists, Callout Boxes, Multiple-Choice Quizzes, Glossary Tooltips
