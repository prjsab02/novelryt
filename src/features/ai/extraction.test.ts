import { describe, it, expect } from 'vitest';
import { parseExtraction } from './extraction';

describe('parseExtraction', () => {
  it('parses clean JSON', () => {
    const r = parseExtraction('{"characters":[{"name":"Arya","note":"a knight"}],"locations":[]}');
    expect(r.characters).toEqual([{ name: 'Arya', note: 'a knight' }]);
    expect(r.locations).toEqual([]);
  });

  it('strips code fences and surrounding prose', () => {
    const raw = 'Here you go:\n```json\n{"characters":[{"name":"Bo"}],"locations":[{"name":"Vale","note":"a valley"}]}\n```';
    const r = parseExtraction(raw);
    expect(r.characters).toEqual([{ name: 'Bo', note: '' }]);
    expect(r.locations[0].name).toBe('Vale');
  });

  it('drops entries without a name and is resilient to junk', () => {
    expect(parseExtraction('not json at all')).toEqual({ characters: [], locations: [] });
    const r = parseExtraction('{"characters":[{"note":"x"},{"name":" K "}],"locations":[]}');
    expect(r.characters).toEqual([{ name: 'K', note: '' }]);
  });
});
