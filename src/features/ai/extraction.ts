import { runAI } from './client';

/**
 * AI entity extraction (PRD §63–§64). Pulls likely NEW characters and locations
 * from a chapter. Per PRD §79/§98 results are suggestions only — the writer
 * reviews and approves before anything is added to the Story Bible.
 */
export interface ExtractedEntity {
  name: string;
  note: string;
}

export interface Extraction {
  characters: ExtractedEntity[];
  locations: ExtractedEntity[];
}

const SYSTEM =
  'You extract story entities from a manuscript chapter. Return ONLY valid JSON ' +
  'of the form {"characters":[{"name":"","note":""}],"locations":[{"name":"","note":""}]}. ' +
  'note = a 3-8 word description. Do NOT include entities already listed as known. ' +
  'No prose, no code fences — JSON only.';

/**
 * Parse the model's reply into an Extraction, tolerating code fences and stray
 * text around the JSON. Exported for unit testing.
 */
export function parseExtraction(raw: string): Extraction {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return { characters: [], locations: [] };
  let data: unknown;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch {
    return { characters: [], locations: [] };
  }
  const norm = (arr: unknown): ExtractedEntity[] =>
    Array.isArray(arr)
      ? arr
          .map((e) => ({
            name: String((e as ExtractedEntity)?.name ?? '').trim(),
            note: String((e as ExtractedEntity)?.note ?? '').trim(),
          }))
          .filter((e) => e.name)
      : [];
  const d = data as { characters?: unknown; locations?: unknown };
  return { characters: norm(d.characters), locations: norm(d.locations) };
}

export async function extractEntities(
  chapterContent: string,
  knownCharacters: string[],
  knownLocations: string[],
): Promise<Extraction> {
  const content = chapterContent.trim();
  if (!content) return { characters: [], locations: [] };
  const prompt =
    `Known characters: ${knownCharacters.join(', ') || '(none)'}\n` +
    `Known locations: ${knownLocations.join(', ') || '(none)'}\n\n` +
    `Chapter:\n"""\n${content.slice(0, 8000)}\n"""`;
  const reply = await runAI({ system: SYSTEM, prompt, temperature: 0.2 });
  return parseExtraction(reply);
}
