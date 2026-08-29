import { VR_NPC_DIALOGUE_EN, VR_NPC_DIALOGUE_FR, VR_NPC_DIALOGUE_IT } from './src/data/vrNpcTranslations.js';
function keysOf(o){return Object.keys(o).sort();}
const en = keysOf(VR_NPC_DIALOGUE_EN), it = keysOf(VR_NPC_DIALOGUE_IT), fr = keysOf(VR_NPC_DIALOGUE_FR);
console.log('EN keys == IT keys?', JSON.stringify(en)===JSON.stringify(it));
console.log('EN keys == FR keys?', JSON.stringify(en)===JSON.stringify(fr));
for (const k of en) {
  const e = VR_NPC_DIALOGUE_EN[k], i = VR_NPC_DIALOGUE_IT[k];
  if (!i) { console.log('MISSING IT key', k); continue; }
  if (!!e.dialogue !== !!i.dialogue) console.log('dialogue mismatch', k);
  if (!!e.lines !== !!i.lines) console.log('lines presence mismatch', k);
  if (e.lines && i.lines && e.lines.length !== i.lines.length) console.log('lines length mismatch', k, e.lines.length, i.lines.length);
}
console.log('done');
