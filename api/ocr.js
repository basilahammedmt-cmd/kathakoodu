// Reads the child's Malayalam handwriting from a photo.
import { guard, readJson, claude, send, fail } from './_lib.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  let body;
  try { body = await readJson(req); } catch { return send(res, 400, { error: 'bad_json' }); }
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(body.image || ''));
  if (!m) return send(res, 400, { error: 'image_rejected' });
  if (m[2].length > 3_000_000) return send(res, 413, { error: 'image_rejected' });
  const kind = body.kind === 'poem' ? 'poem' : 'story';
  const prompt = 'This photo shows a piece written by hand in Malayalam by a 9-year-old child (class 4, Kerala). It is a ' + kind +
    '. Transcribe exactly what the child wrote, in Malayalam script. Keep the child\'s own words and sentence order. ' +
    'Do not improve, summarise or add anything. Keep paragraph or stanza breaks as blank lines. Write [?] for any word you cannot read. ' +
    'If the photo is a drawing with no writing, reply with exactly: NO_TEXT. Reply with only the transcription.';
  try {
    const text = await claude([
      { type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } },
      { type: 'text', text: prompt }
    ], 3000);
    send(res, 200, { text });
  } catch (e) { fail(res, e); }
}
