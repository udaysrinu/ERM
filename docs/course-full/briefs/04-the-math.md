# Module 4 brief — The math (shared/engines.ts)

## Teaching arc
- **Metaphor:** Pour-over coffee recipe. Same beans + same grind + same water + same time = same cup. Anywhere, anytime.
- **Opening hook:** "Four functions. Two hundred lines. The entire patent moat."
- **Key insight:** Pure functions can't lie. No Date.now(), no random, no DB calls inside the engine. That's WHY same inputs always produce same output.

## Module position: 4 of 12
- Previous: M3 (the catalog) — we now have the inputs
- Next: M5 (signatures) — we hash the inputs to make reproducibility tactile

## The 4 functions, in order
1. **computeVectors(responses)** → { pillarScores, dimensionScores, overallScore }
2. **computeAnalytics(pillarScores, benchmarkType)** → { analytics, benchmarkAverage, averageGap, systemIntegrity }
3. **computeDrift(currentPillarScores, priorPillarScores)** → { driftProfile, regressions }
4. **generateRoadmap(pillarScores, benchmarkType)** → ranked actions with phase tags

## Required interactive elements
- 1+ flow-steps (the 4 functions in order)
- 1+ translation-block (real computeVectors code → 5-step plain English)
- 1+ flow-animation (Postgres → Function → engines → JSON, with packets)
- 1+ callout-accent (pure functions = patent moat, enforced by tests)
- 1 quiz (why no Date.now in engine)

## Real code snippet for translation (from shared/engines.ts:51)
```ts
export function computeVectors(responses) {
  // Step A — dimension averages
  for (const r of responses) {
    const q = QUESTIONS_BY_ID.get(r.questionId);
    dimSums.set(q.dimensionId, sum + r.score);
  }

  // Step B — pillar aggregates (weighted)
  for (const r of responses) {
    cellSums.set(key, sum + r.score * q.weight);
  }

  // Step C — overall = sum(pillarScore * pillarWeight)
  const overallScore = PILLAR_IDS.reduce(
    (sum, pid) => sum + pillarScores.get(pid) * PILLAR_WEIGHTS[pid], 0
  );

  return { pillarScores, dimensionScores, overallScore };
}
```

## Plain-English translation
- "Take 100 answers in. Return 1 overall + 10 pillar + 4 dimension scores."
- Step A: group answers by dimension and average. 4 dimension scores.
- Step B: for each pillar, weight each answer by its question weight, then aggregate. 10 pillar scores.
- Step C: weighted average of 10 pillars → overall score. Leadership weighted higher than Continuous Improvement.
- "Notice: no Date.now(), no random, no API call. Pure inputs in, pure output out. THAT'S why it's reproducible."

## Flow animation (8 steps)
1. Operator finalized 100 responses. Stored in Postgres.
2. Function reads raw responses. (packet: actor-1 → actor-2)
3. computeVectors → 1 overall, 10 pillar, 4 dimension scores. (packet: actor-2 → actor-3)
4. computeAnalytics → compare each pillar to the Industry benchmark.
5. computeDrift → diff against the previous assessment for this BU.
6. generateRoadmap → sort improvement actions by uplift ÷ effort.
7. Engine returns the JSON. (packet: actor-3 → actor-2)
8. Function ships JSON to browser. (packet: actor-2 → actor-4)

Actors: 1=Postgres, 2=Function, 3=/shared engines, 4=Browser

## Quiz scenario
"Why do we deliberately NOT include the current date inside computeVectors?"
Correct: Determinism — same inputs must always produce same output, Date.now() returns different values each call.
Wrong: performance, timezone bugs, "time isn't relevant"

## Glossary terms
- pure function — output depends only on inputs; no random, no time, no DB

## Reference sections
- references/interactive-elements.md: Code↔English, Flow Diagrams, Flow Animation, Callout Boxes, Multiple-Choice Quizzes, Glossary Tooltips
