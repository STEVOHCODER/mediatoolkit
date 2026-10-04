/**
 * Vercel serverless entry: delegates every request to the Express app.
 * Local dev runs `node server/index.js` instead; this file is only for Vercel.
 */
import app from '../server/index.js';

export default function handler(req, res) {
  return app(req, res);
}
