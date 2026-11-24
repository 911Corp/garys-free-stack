import { describe, expect, it } from 'vitest';
import { parsePublicApis } from '../scripts/import-public-apis';

describe('public-apis importer', () => {
  it('parses table rows under categories and keeps unknowns null', () => {
    const md = ['### Weather', 'API | Description | Auth | HTTPS | CORS ', '|---|---|---|---|---|',
      '| [Open-Meteo](https://open-meteo.com/) | Global weather forecast API | No | Yes | Yes |',
      '| [Foo](https://foo.example) | Bar, baz | `apiKey` | Yes | Unknown |'].join('\n');
    const out = parsePublicApis(md);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ category: 'Weather', auth: 'none', https: true, cors: 'yes' });
    expect(out[1]).toMatchObject({ auth: 'apiKey', cors: null });
  });
  it('skips non-standard tables (sponsored / MCP sections)', () => {
    const md = ['### APIs Covered Under APILayer Suite!', '| API | Description | Auth | Transport | Install |', '|---|---|---|---|---|',
      '| [X](https://x.example) | d | `apiKey` | `stdio` | [Cursor](https://c.example) |'].join('\n');
    expect(parsePublicApis(md)).toHaveLength(0);
  });
});
