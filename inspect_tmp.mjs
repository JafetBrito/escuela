import { en } from './src/i18n/locales/en.js';
import { fr } from './src/i18n/locales/fr.js';
import { es } from './src/i18n/locales/es.js';
import { it } from './src/i18n/locales/it.js';
function structure(obj) {
  if (Array.isArray(obj)) return `Array(${obj.length})`;
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) out[k] = structure(obj[k]);
    return out;
  }
  return typeof obj;
}
function diff(a, b, path = 'vr') {
  const diffs = [];
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) diffs.push(`${path}: type mismatch array vs non-array`);
    else if (a.length !== b.length) diffs.push(`${path}: array length ${a.length} vs ${b.length}`);
    return diffs;
  }
  if (a && typeof a === 'object' && b && typeof b === 'object') {
    const ak = Object.keys(a), bk = Object.keys(b);
    for (const k of ak) if (!bk.includes(k)) diffs.push(`${path}.${k}: missing in second`);
    for (const k of bk) if (!ak.includes(k)) diffs.push(`${path}.${k}: extra in second`);
    for (const k of ak) if (bk.includes(k)) diffs.push(...diff(a[k], b[k], `${path}.${k}`));
    return diffs;
  }
  if (typeof a !== typeof b) diffs.push(`${path}: type ${typeof a} vs ${typeof b}`);
  return diffs;
}
console.log('=== EN vs FR structural diff ===');
console.log(diff(en.vr, fr.vr));
console.log('=== EN vs IT structural diff ===');
console.log(diff(en.vr, it.vr));

