/**
 * Imports the public-apis/public-apis catalog (MIT License) as an UNVERIFIED layer.
 * Usage: npm run import:public-apis -- [path/to/README.md]
 * Without a path, fetches the README from GitHub (needs network).
 * Entries keep the upstream fields only. Nothing is inferred.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { ImportedApiSchema, type ImportedApi } from '../src/core/schema';

const RAW = 'https://raw.githubusercontent.com/public-apis/public-apis/master/README.md';

function slug(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
const clean = (s: string) => s.replace(/`/g, '').trim();
const yesNo = (s: string): boolean | null => (/^yes$/i.test(s) ? true : /^no$/i.test(s) ? false : null);

export function parsePublicApis(md: string): ImportedApi[] {
  const out: ImportedApi[] = [];
  const seen = new Set<string>();
  let category = '';
  let standardTable = false; // only "| API | Description | Auth | HTTPS | CORS |" tables are imported
  for (const line of md.split('\n')) {
    const h = line.match(/^###\s+(.+)$/);
    if (h) { category = h[1].trim(); standardTable = false; continue; }
    if (/^\|?\s*API\s*\|/i.test(line)) {
      const cols = line.split('|').map((c) => c.trim().toLowerCase()).filter(Boolean);
      standardTable = cols.join(',') === 'api,description,auth,https,cors';
      continue;
    }
    if (!standardTable || /sponsor|apilayer suite/i.test(category)) continue;
    const m = line.match(/^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|/);
    if (!m || !category) continue;
    const [, name, url, desc, auth, https, cors] = m;
    let id = `papi-${slug(category)}-${slug(name)}`;
    while (seen.has(id)) id += '-x';
    seen.add(id);
    const authC = clean(auth);
    const corsC = clean(cors);
    const parsed = ImportedApiSchema.safeParse({
      id, name: name.trim(), description: desc.trim(), category,
      auth: authC === '' ? null : authC === 'No' ? 'none' : authC,
      https: yesNo(clean(https)),
      cors: corsC === '' || /unknown/i.test(corsC) ? null : corsC.toLowerCase(),
      url: url.trim(),
    });
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

async function main() {
  const path = process.argv[2];
  const md = path ? readFileSync(path, 'utf8') : await (await fetch(RAW)).text();
  const apis = parsePublicApis(md);
  const payload = {
    source: 'https://github.com/public-apis/public-apis',
    license: 'MIT',
    importedAt: new Date().toISOString().slice(0, 10),
    status: 'unverified',
    count: apis.length,
    apis,
  };
  writeFileSync('data/imports/public-apis.json', JSON.stringify(payload));
  console.log(`imported ${apis.length} APIs`);
}
if (process.argv[1]?.includes('import-public-apis')) main();
