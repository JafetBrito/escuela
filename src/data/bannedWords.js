// Diccionario base de palabras prohibidas (español + inglés). Para AGREGAR más:
//  • sin publicar código: un admin las escribe en DevToolsPanel → "🚫 Palabras
//    prohibidas" (se guardan en la base y aplican a todos al instante), o
//  • aquí mismo, una palabra más en la lista.
//
// Escríbelas en minúsculas y SIN acentos. El filtro ya detecta variantes con
// acentos, mayúsculas, letras repetidas (puuuta), números por letras (put4),
// símbolos (p.u.t.a) y letras separadas (p u t a).
// Reglas de cada entrada:
//   'palabra'  → coincide con esa palabra completa.
//   'palab*'   → coincide con cualquier palabra que EMPIECE así (pendej* → pendejo, pendejada…).
//   '~palabra' → coincide si la palabra la CONTIENE (solo para palabras muy
//                distintivas, como fuck, que casi no aparecen dentro de otras).
// Cuidado con las palabras cortas o que aparecen dentro de palabras normales
// (ej. "verga" dentro de "vergüenza"): usa la forma exacta, no 'verg*'.
export const BANNED_WORDS = [
  // ── Español ────────────────────────────────────────────────────────────
  'puta', 'putas', 'puto', 'putos', 'putazo', 'putada', 'putero', 'hijueputa', 'hijodeputa', 'hdp', 'hdtp', 'ptm',
  'pendej*', 'cabron*', 'chinga*', 'chingon', 'chingones', 'mierda*', 'mamada*', 'mamon', 'mamones',
  'verga', 'vergas', 'vergazo', 'culero', 'culeros', 'culera', 'culo', 'culos',
  'pinche', 'pinches', 'ctm', 'ctmr', 'conchatumadre', 'conchetumare', 
  'joto', 'jotos', 'maricon*', 'marica', 'maricas', 'puñeta', 'puneta', 'gilipollas', 'gilipuertas',
  'imbecil', 'imbeciles', 'estupido', 'estupida', 'estupidos', 'estupidas', 'idiota', 'idiotas', 'pelotudo', 'boludo', 
  'follar', 'porno', 'porn', 
   'malparido', 'malparidos', 'gonorrea', 'huevon', 'huevones', 'weon', 'weón', 'cagar', 'cagada', 'cagado',
  // ── Inglés ─────────────────────────────────────────────────────────────
  '~fuck', 'fck', 'fuk', 'shit', 'shits', 'bullshit', 'bitch*', 'asshole', 'assholes', 'dickhead',
  'cunt', 'cunts', 'pussy', 'bastard*', 'slut*', 'whore*', 'motherf*', 'wtf', 'stfu', 'pornhub',
  'nigger', 'niggers', 'nigga', 'niggas', 'faggot*', 'fag', 'fags', 'retard', 'retards', 'retarded', 'kys',
]
