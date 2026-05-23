# Diagrams

| File | What it shows |
|---|---|
| `architecture.png` / `.mmd` | System layout — browser → Vercel edge → functions → /shared engines → Supabase Postgres + Storage |
| `functional-flow.png` / `.mmd` | End-to-end sequence: login → run assessment with file upload → finalize → Live Brief → evidence download → PDF export |

`.mmd` files are the editable Mermaid source. `.png` files are the rendered output (good for embedding in slide decks, GitHub READMEs, screenshots).

To re-render after editing a `.mmd`:

```bash
npx @mermaid-js/mermaid-cli -i docs/architecture.mmd -o docs/architecture.png -s 2
```

Or open the `.mmd` in any Mermaid live editor (https://mermaid.live).
