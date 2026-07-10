// Minimal Python→JS transpiler for educational scenarios (Days 1-4).
// Supports: print, variables, for/range, while, if/elif/else, def, return,
// f-strings, basic arithmetic, string/list methods.

function pyStr(v) {
  if (v === null || v === undefined) return 'None'
  if (v === true) return 'True'
  if (v === false) return 'False'
  if (Array.isArray(v)) return '[' + v.map(pyStr).join(', ') + ']'
  return String(v)
}

function makeBuiltins(output) {
  return {
    print: (...args) => {
      if (args.length === 0) { output.push(''); return }
      output.push(args.map(pyStr).join(' '))
    },
    range: (a, b, c) => {
      if (b == null) { b = a; a = 0 }
      if (c == null) c = 1
      const r = []
      for (let i = a; c > 0 ? i < b : i > b; i += c) r.push(i)
      return r
    },
    len: (x) => x.length,
    int: (x) => Math.trunc(Number(x)),
    float: (x) => Number(x),
    str: (x) => pyStr(x),
    abs: Math.abs,
    max: (...a) => a.length === 1 ? Math.max(...a[0]) : Math.max(...a),
    min: (...a) => a.length === 1 ? Math.min(...a[0]) : Math.min(...a),
    sum: (arr) => arr.reduce((a, b) => a + b, 0),
    list: (x) => [...(x ?? [])],
    sorted: (arr) => [...arr].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    reversed: (arr) => [...arr].reverse(),
    enumerate: (arr) => arr.map((v, i) => [i, v]),
    input: () => '',
    round: Math.round,
    pow: Math.pow,
    True: true,
    False: false,
    None: null,
  }
}

function stripComment(line) {
  let inStr = false
  let strChar = ''
  let triple = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (!inStr) {
      if (c === '"' || c === "'") {
        const t = line.slice(i, i + 3)
        if (t === '"""' || t === "'''") { inStr = true; triple = true; strChar = t; i += 2 }
        else { inStr = true; triple = false; strChar = c }
      } else if (c === '#') {
        return line.slice(0, i)
      }
    } else {
      if (triple && line.slice(i, i + 3) === strChar) { inStr = false; triple = false; i += 2 }
      else if (!triple && c === strChar && line[i - 1] !== '\\') { inStr = false }
    }
  }
  return line
}

function transformExpr(s) {
  // f-strings → template literals
  s = s.replace(/f"((?:[^"\\]|\\.)*)"/g, (_, c) =>
    '`' + c.replace(/\{([^}]+)\}/g, (__, e) => '${' + transformExpr(e) + '}') + '`'
  )
  s = s.replace(/f'((?:[^'\\]|\\.)*)'/g, (_, c) =>
    '`' + c.replace(/\{([^}]+)\}/g, (__, e) => '${' + transformExpr(e) + '}') + '`'
  )
  // ponytail: // replacement matches word//word; breaks for "http://..." in strings (fine for day 1-5)
  s = s.replace(/(\w+)\s*\/\/\s*(\w+)/g, 'Math.floor($1 / $2)')
  // Python boolean keywords
  s = s.replace(/\bnot\s+/g, '!')
  s = s.replace(/\band\b/g, '&&')
  s = s.replace(/\bor\b/g, '||')
  s = s.replace(/\bTrue\b/g, 'true')
  s = s.replace(/\bFalse\b/g, 'false')
  s = s.replace(/\bNone\b/g, 'null')
  // String methods
  s = s.replace(/\.upper\(\)/g, '.toUpperCase()')
  s = s.replace(/\.lower\(\)/g, '.toLowerCase()')
  s = s.replace(/\.strip\(\)/g, '.trim()')
  s = s.replace(/\.lstrip\(\)/g, '.trimStart()')
  s = s.replace(/\.rstrip\(\)/g, '.trimEnd()')
  s = s.replace(/\.append\(/g, '.push(')
  s = s.replace(/\.startswith\(/g, '.startsWith(')
  s = s.replace(/\.endswith\(/g, '.endsWith(')
  return s
}

function transformStatement(line, declared) {
  // for x in iterable:
  const forM = line.match(/^for\s+(\w+)\s+in\s+(.+):$/)
  if (forM) {
    declared.add(forM[1])
    return { js: `for (var ${forM[1]} of ${transformExpr(forM[2])}) {`, block: true }
  }
  // while cond:
  const whileM = line.match(/^while\s+(.+):$/)
  if (whileM) return { js: `while (${transformExpr(whileM[1])}) {`, block: true }
  // if cond:
  const ifM = line.match(/^if\s+(.+):$/)
  if (ifM) return { js: `if (${transformExpr(ifM[1])}) {`, block: true }
  // elif cond:
  const elifM = line.match(/^elif\s+(.+):$/)
  if (elifM) return { js: `} else if (${transformExpr(elifM[1])}) {`, block: true }
  // else:
  if (/^else\s*:$/.test(line)) return { js: '} else {', block: true }
  // def name(params):
  const defM = line.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:$/)
  if (defM) {
    declared.add(defM[1])
    defM[2].split(',').map(p => p.trim()).filter(Boolean).forEach(p => declared.add(p))
    return { js: `function ${defM[1]}(${defM[2]}) {`, block: true }
  }
  // return
  if (/^return(\s|$)/.test(line)) {
    return { js: `return ${transformExpr(line.slice(6).trim())};` }
  }
  // pass / break / continue
  if (line === 'pass') return { js: ';' }
  if (line === 'break') return { js: 'break;' }
  if (line === 'continue') return { js: 'continue;' }
  // augmented assignment
  const augM = line.match(/^(\w+)\s*(\+=|-=|\*=|\/=|%=|\*\*=)(.+)$/)
  if (augM) return { js: `${augM[1]} ${augM[2]} ${transformExpr(augM[3])};` }
  // simple assignment (not ==, !=, <=, >=)
  const asgM = line.match(/^(\w+)\s*=(?![=<>!])(.+)$/)
  if (asgM) {
    const kw = declared.has(asgM[1]) ? '' : 'var '
    declared.add(asgM[1])
    return { js: `${kw}${asgM[1]} = ${transformExpr(asgM[2])};` }
  }
  // standalone expression
  return { js: `${transformExpr(line)};` }
}

function transpile(code) {
  const declared = new Set()
  const result = []
  const stack = [] // indent levels of open blocks

  for (const raw of code.split('\n')) {
    const stripped = stripComment(raw).trimEnd()
    if (!stripped.trim()) continue

    const indent = stripped.match(/^(\s*)/)[1].length
    const content = stripped.trim()
    const isElseFamily = /^(elif\b|else\s*:)/.test(content)

    // Close blocks at same or lower indent
    while (stack.length > 0 && indent <= stack[stack.length - 1]) {
      if (!isElseFamily) result.push(' '.repeat(stack[stack.length - 1]) + '}')
      stack.pop()
    }

    const { js, block } = transformStatement(content, declared)
    result.push(' '.repeat(indent) + js)
    if (block) stack.push(indent)
  }

  while (stack.length > 0) {
    result.push(' '.repeat(stack[stack.length - 1]) + '}')
    stack.pop()
  }

  return result.join('\n')
}

export function runPython(code) {
  const output = []
  if (!code.trim()) return { output, errors: [] }

  let js
  try {
    js = transpile(code)
  } catch {
    return { output, errors: ['SyntaxError: Error de sintaxis en el código'] }
  }

  const env = makeBuiltins(output)
  try {
    // eslint-disable-next-line no-new-func
    new Function(...Object.keys(env), js)(...Object.values(env))
  } catch (e) {
    let msg = e.message
    if (e instanceof ReferenceError) {
      const m = msg.match(/(\w+) is not defined/)
      msg = m ? `NameError: el nombre '${m[1]}' no está definido` : `NameError: ${msg}`
    } else if (e instanceof SyntaxError) {
      msg = 'SyntaxError: Error de sintaxis (¿faltan dos puntos o paréntesis?)'
    } else {
      msg = `${e.constructor.name}: ${msg}`
    }
    return { output, errors: [msg] }
  }

  return { output, errors: [] }
}
