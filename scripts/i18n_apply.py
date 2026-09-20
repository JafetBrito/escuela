"""Aplica traducciones en línea a archivos JSX/JS: cada texto en español se
envuelve en tr('español', 'english') (ver src/i18n/index.js).

Uso desde otro script de Python:
    from i18n_apply import apply
    apply('src/components/x/Page.jsx', {'Guardar': 'Save', 'Cancelar': 'Cancel'})

Reconoce el contexto de cada aparición:
  - "texto" en un atributo JSX (title="..." placeholder="...") -> title={tr("texto", "text")}
  - 'texto' / "texto" / `texto` en JS                          -> tr('texto', 'text')
  - texto suelto entre etiquetas JSX                           -> {tr('texto', 'text')}
No toca lo que ya está dentro de tr(...) ni dentro de t('clave').
Los textos con {interpolaciones} en JSX se traducen a mano.
"""
import re

NL = chr(10)


def _q(s):
    return "'" + s.replace(chr(92), chr(92) * 2).replace("'", chr(92) + "'").replace(NL, ' ') + "'"


def _add_import(src, path, import_path):
    if re.search(r"\btr\b[^\n]*from '[^']*i18n'", src):
        return src
    m = re.search(r"import\s*\{([^}]*)\}\s*from\s*'([^']*/i18n)'", src)
    if m:  # ya importa de i18n: sumar tr a esa misma línea
        return src[:m.start(1)] + m.group(1).rstrip() + ', tr ' + src[m.end(1):]
    depth = path.replace(chr(92), '/').count('/') - 1  # src/x/y.jsx -> un ../ por nivel bajo src
    rel = import_path or (('../' * depth + 'i18n') if depth else './i18n')
    last = 0
    for mm in re.finditer(r"^import [^\n]*\n", src, re.M):
        last = mm.end()
    return src[:last] + "import { tr } from '" + rel + "'" + NL + src[last:]


def apply(path, mapping, import_path=None):
    src = open(path, encoding='utf-8').read()
    total = 0
    # los textos más largos primero, para que uno no rompa a otro que lo contiene
    for es, en in sorted(mapping.items(), key=lambda kv: -len(kv[0])):
        out, i = [], 0
        while True:
            j = src.find(es, i)
            if j < 0:
                out.append(src[i:])
                break
            end = j + len(es)
            prev = src[j - 1] if j else ''
            nxt = src[end] if end < len(src) else ''
            before = src[max(0, j - 8):j]
            # ya traducido (dentro de tr( ... ) o de t(' ... '))
            if re.search(r"tr\(\s*['\"`]$", before) or before.endswith("t('") or before.endswith('t("') or re.search(r"tr\('[^']*', '$", src[max(0, j - 400):j]):
                out.append(src[i:end]); i = end; continue
            if prev in '\'"`' and nxt == prev:
                before_quote = src[j - 2] if j >= 2 else ''
                if prev == '"' and before_quote == '=':               # atributo JSX
                    out.append(src[i:j - 1] + '{tr(' + _q(es) + ', ' + _q(en) + ')}')
                else:                                                  # literal JS
                    out.append(src[i:j - 1] + 'tr(' + _q(es) + ', ' + _q(en) + ')')
                i = end + 1
                total += 1
            elif prev == '>' and nxt == '<':                            # texto entre dos etiquetas (mismo renglón)
                out.append(src[i:j] + '{tr(' + _q(es) + ', ' + _q(en) + ')}')
                i = end
                total += 1
            elif nxt in '<{\n' and (prev in '>}\n ' or prev == ''):   # texto JSX
                ls = src.rfind(NL, 0, j) + 1
                le = src.find(NL, j)
                line = src[ls:le if le >= 0 else len(src)]
                if re.fullmatch(r"\s*(?:<[^>]*>)*\s*" + re.escape(es) + r"\s*(?:<[^>]*>)*\s*", line):
                    out.append(src[i:j] + '{tr(' + _q(es) + ', ' + _q(en) + ')}')
                    i = end
                    total += 1
                else:
                    out.append(src[i:end]); i = end
            else:
                out.append(src[i:end]); i = end
        src = ''.join(out)
    if total:
        src = _add_import(src, path, import_path)
    open(path, 'w', encoding='utf-8').write(src)
    return total
