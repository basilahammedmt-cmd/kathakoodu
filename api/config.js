// Tells the app whether Claude is set up and whether a class code is needed. Never returns secrets.
import { send } from './_lib.js';
export default function handler(req, res) {
  send(res, 200, { ai: !!process.env.ANTHROPIC_API_KEY, needCode: !!process.env.CLASS_CODE });
}
