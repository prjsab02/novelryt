# GLOSSARY.md

> Bridges technical and non-technical contributors. Plain-language explanations.

| Term | Category | Definition / simple explanation |
|---|---|---|
| Story Bible | Product | The living reference of everything in a story (characters, places, lore). NovelRyt maintains it automatically; the writer can always edit it. |
| Story Intelligence | Product | AI-extracted, structured knowledge about the manuscript (who/what/where/when). |
| AI Gateway | Technical | The single component all AI requests pass through. Picks an API key, retries, and fails over. |
| Multi-key pool | Technical | A set of Gemini API keys used in rotation to extend free-tier quota and add failover. |
| StorageAdapter | Technical | The interface that hides where data lives (IndexedDB now, Firebase later), so features don't care. |
| Local-first / offline-first | Technical | Data is saved on the device first; the app works without internet; cloud sync is optional. |
| Dexie | Technical | A small library that makes the browser's IndexedDB database easy to use. |
| PWA | Technical | Progressive Web App — a website installable like a native app, works offline. |
| Retrieval context | AI | Only the relevant slices of a project sent to the AI, instead of the whole novel, to save tokens. |
| Token conservation | AI | Designing AI use to spend as few tokens as possible (free-tier sustainability). |
| Plot hole | Domain | A logical gap that breaks the story's internal consistency. |
| Character arc | Domain | How a character changes from beginning to end of the story. |
| Scene / Chapter / Book / Project | Domain | Nesting units of a manuscript, smallest to largest. |
