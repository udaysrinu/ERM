# Module 2 brief — The cast

## Teaching arc
- **Metaphor:** A newsroom (NOT a restaurant — overused). Each actor has a role producing a "story" (the maturity report).
- **Opening hook:** "Every system is a small theater company. Knowing who plays which role lets you tell AI 'put that logic in X, not Y' and have it actually mean something."
- **Key insight:** /shared/ is the single source of truth. Both backend AND frontend import from it. This pattern is called "extract a kernel" — every serious software business eventually does it.

## Module position: 2 of 12
- Previous: M1 (the product)
- Next: M3 dives into the catalog (one of the actors)

## The 6 actors
1. **Browser SPA (Reporter)** — React 19 in `src/`, captures answers, shows the story
2. **Vercel Edge (Newsstand)** — caches finished stories worldwide
3. **Vercel Functions (Fact-checker)** — stateless, in `api/`, runs the engines
4. **/shared engines (Style guide)** — `shared/{static,engines,signatures}.ts`, the rule book
5. **Supabase Postgres (Archive)** — 2 tables: assessments + responses
6. **Supabase Storage (Evidence locker)** — private bucket with signed URLs

## Required interactive elements
- 1+ pattern-cards (one per actor — 6 cards)
- 1+ translation-block (the file tree → plain English)
- 1+ chat-window (group chat: 8 messages showing the analysis fetch flow)
- 1+ callout-accent (why /shared/ matters — extract-a-kernel insight)
- 1 quiz

## Group chat scenario (8 messages)
0. Browser: "User clicked Generation. I need its analysis."
1. Edge: "Got it cached from 20s ago — here." (cache hit story)
2. Browser: "Cache miss this time. Edge, fresh one please."
3. Function: "Booting. Postgres, give me responses for TXSEEDGEN3."
4. Postgres: "Here's 100 rows: questionId, score, note, evidencePath, timestamp."
5. Function: "/shared, run the math: vectors, drift, roadmap, signatures."
6. /shared: "Done. Overall 2.90. Risk Treatment regressed −1.00. Hash 80df5740…. Pure functions; same input every time produces this exact JSON."
7. Function: "Edge — cache 30s private. Browser — render Today."

## Glossary terms
- BU — Business Unit (Generation, Transmission, etc — 6 in the demo)

## File tree to translate
```
ERM-repo/
├── src/             // Browser SPA
├── api/             // Vercel Functions
├── shared/          // Engines (single source of truth)
└── vercel.json      // Edge cache rules
```

## Quiz scenario
"You're telling AI to 'make the score include attached evidence file count.' Where does the change go?"
Correct answer: shared/engines.ts (the kernel). Wrong answers: src screen, api endpoint, Postgres procedure.

## Reference sections
- references/interactive-elements.md sections: Pattern Cards, Code↔English Translation, Group Chat Animation, Callout Boxes, Multiple-Choice Quizzes, Glossary Tooltips
