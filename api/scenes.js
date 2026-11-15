// Turns the child's text into 4–6 short scenes for the fixed cast.
import { guard, readJson, claude, send, fail } from './_lib.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  let body;
  try { body = await readJson(req); } catch { return send(res, 400, { error: 'bad_json' }); }
  const text = String(body.text || '').slice(0, 6000).trim();
  if (!text) return send(res, 400, { error: 'no_text' });
  const title = String(body.title || '').slice(0, 120);
  const poem = body.kind === 'poem';
  const prompt = 'You turn a Kerala class 4 child\'s own ' + (poem ? 'poem' : 'story') + ' into a short animated script for 9-year-olds. ' +
    'Keep the meaning, events and as many of the child\'s own words as possible; do not add new events or morals. ' +
    (poem ? 'For a poem, the characters recite the child\'s lines as written, split across scenes. ' : '') +
    'Make 4 to 6 scenes, each with 1 to 3 short spoken lines in simple Malayalam (under 90 characters each). ' +
    'The fixed cast (use these ids for "who"): mittu = talkative parrot who usually narrates, appu = gentle baby elephant, ' +
    'meenu = curious 9-year-old girl, kunjan = mischievous squirrel. If the story has its own animals or people, give their lines to the closest cast member. ' +
    '"place" must be one of: forest, river, school, home, sky. ' +
    'Reply with only JSON of the form {"scenes":[{"place":"forest","lines":[{"who":"mittu","text":"..."}]}]}.' +
    '\n\nTitle: ' + title + '\n\nText:\n' + text;
  try {
    const out = await claude([{ type: 'text', text: prompt }], 3000);
    const a = out.indexOf('{'), b = out.lastIndexOf('}');
    let parsed = null;
    try { parsed = JSON.parse(out.slice(a, b + 1)); } catch { parsed = null; }
    if (!parsed || !Array.isArray(parsed.scenes)) return send(res, 502, { error: 'failed' });
    send(res, 200, { scenes: parsed.scenes });
  } catch (e) { fail(res, e); }
}
