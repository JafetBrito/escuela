import { useState, useRef, useEffect, useCallback } from 'react'

// ── Virtual filesystem ────────────────────────────────────────────────────────
const buildFs = () => ({
  type: 'dir',
  children: {
    home: {
      type: 'dir',
      children: {
        estudiante: {
          type: 'dir',
          children: {
            'notas.txt':  { type: 'file', content: 'Mis primeros apuntes de Bash\nAprendí ls y cd hoy!\nPráctica hace al maestro.' },
            'datos.txt':  { type: 'file', content: 'manzana\nbanana\npera\nmanzana\nuva\nbanana\nmanzana' },
            'hola.sh':    { type: 'file', content: '#!/bin/bash\necho "¡Hola Mundo desde Bash!"', perms: '-rwxr-xr--' },
            ejercicios: {
              type: 'dir',
              children: {
                'practica1.txt': { type: 'file', content: 'Ejercicio 1: Lista todos los archivos del directorio actual.' },
                'practica2.txt': { type: 'file', content: 'Ejercicio 2: Crea un directorio llamado mi-proyecto.' },
              },
            },
            proyecto: {
              type: 'dir',
              children: {
                'main.sh': { type: 'file', content: '#!/bin/bash\necho "Mi primer script de Bash"\necho "Fecha: $(date)"', perms: '-rwxr-xr--' },
              },
            },
          },
        },
      },
    },
    etc: {
      type: 'dir',
      children: {
        hostname: { type: 'file', content: 'oliver-academy' },
      },
    },
    var: {
      type: 'dir',
      children: {
        log: {
          type: 'dir',
          children: {
            'app.log': { type: 'file', content: '2024-01-15 10:00 Inicio del sistema\n2024-01-15 10:01 Conexión establecida\n2024-01-15 10:05 Usuario conectado: estudiante\n2024-01-15 10:10 ERROR: archivo no encontrado\n2024-01-15 10:15 Proceso completado OK' },
          },
        },
      },
    },
  },
})

// ── FS helpers ────────────────────────────────────────────────────────────────
function resolvePath(fs, cwd, raw) {
  const parts = raw.startsWith('/')
    ? raw.split('/').filter(Boolean)
    : [...cwd, ...raw.split('/').filter(Boolean)]
  const resolved = []
  for (const p of parts) {
    if (p === '..') { resolved.pop() }
    else if (p !== '.') resolved.push(p)
  }
  let node = fs
  for (const part of resolved) {
    if (!node || node.type !== 'dir' || !node.children[part]) return null
    node = node.children[part]
  }
  return { node, path: resolved }
}

function cwdStr(cwd) {
  if (cwd.length === 0) return '/'
  return '/' + cwd.join('/')
}

function relativeHome(cwd) {
  if (cwd[0] === 'home' && cwd[1] === 'estudiante') {
    const rest = cwd.slice(2)
    return '~' + (rest.length ? '/' + rest.join('/') : '')
  }
  return cwdStr(cwd)
}

const HOME_PATH = ['home', 'estudiante']

// ── Command executor ──────────────────────────────────────────────────────────
function runCommand(cmd, cwd, fs, setFs, setCwd, history) {
  const parts  = cmd.match(/(?:[^\s"']|"[^"]*"|'[^']*')+/g) || []
  const clean  = parts.map((p) => p.replace(/^['"]|['"]$/g, ''))
  const [bin, ...args] = clean

  if (!bin) return { lines: [] }

  const err  = (msg) => ({ lines: [{ text: `bash: ${bin}: ${msg}`, cls: 'text-red-400' }] })
  const ok   = (lines) => ({ lines })

  switch (bin) {
    case 'pwd':
      return ok([{ text: cwdStr(cwd) }])

    case 'whoami':
      return ok([{ text: 'estudiante' }])

    case 'hostname':
      return ok([{ text: 'oliver-academy' }])

    case 'date':
      return ok([{ text: new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' }) }])

    case 'clear':
      return { lines: [], clear: true }

    case 'echo': {
      const text = args.join(' ')
      const redirect = text.match(/^(.*?)\s*(>>|>)\s*(\S+)$/)
      if (redirect) {
        const [, content, op, fname] = redirect
        const parent = resolvePath(fs, cwd, '.')
        if (!parent) return err('directorio no encontrado')
        const newFs = JSON.parse(JSON.stringify(fs))
        const par   = resolvePath(newFs, cwd, '.')
        const node  = par.node
        if (node.children[fname] && node.children[fname].type !== 'file')
          return err(`${fname}: es un directorio`)
        const prev = node.children[fname]?.content ?? ''
        node.children[fname] = {
          type: 'file',
          content: op === '>>' ? (prev ? prev + '\n' + content : content) : content,
        }
        setFs(newFs)
        return ok([])
      }
      return ok([{ text: text.replace(/^\$(\w+)/g, '') }])
    }

    case 'ls': {
      const flags  = args.filter((a) => a.startsWith('-')).join('')
      const target = args.find((a) => !a.startsWith('-')) ?? '.'
      const res    = resolvePath(fs, cwd, target)
      if (!res || res.node.type !== 'dir') return err(`${target}: No existe el archivo o directorio`)
      const entries = Object.entries(res.node.children).sort(([a], [b]) => a.localeCompare(b))
      if (flags.includes('l')) {
        return ok(entries.map(([name, node]) => {
          const isDir  = node.type === 'dir'
          const perms  = node.perms ?? (isDir ? 'drwxr-xr-x' : '-rw-r--r--')
          const size   = isDir ? '-' : String(node.content?.length ?? 0)
          const cls    = isDir ? 'text-blue-400 font-bold' : 'text-text'
          return { text: `${perms} estudiante staff ${size.padStart(6)} ${name}${isDir ? '/' : ''}`, cls }
        }))
      }
      const line = entries.map(([name, node]) => {
        const isDir = node.type === 'dir'
        return { text: isDir ? name + '/' : name, cls: isDir ? 'text-blue-400 font-bold' : 'text-text', inline: true }
      })
      return ok(line.length ? [{ inline: line }] : [{ text: '' }])
    }

    case 'cd': {
      const target = args[0] ?? '~'
      let dest
      if (target === '~' || target === '')  dest = HOME_PATH
      else if (target === '-')              dest = cwd  // simplification: stay
      else {
        const res = resolvePath(fs, cwd, target)
        if (!res || res.node.type !== 'dir') return err(`${target}: No existe el archivo o directorio`)
        dest = res.path
      }
      setCwd(dest)
      return ok([])
    }

    case 'mkdir': {
      if (!args.length) return err('missing operand')
      const recursive = args.includes('-p')
      const dirs = args.filter((a) => !a.startsWith('-'))
      const newFs = JSON.parse(JSON.stringify(fs))
      const lines = []
      for (const dir of dirs) {
        const parts2 = dir.split('/').filter(Boolean)
        let node = resolvePath(newFs, cwd, '.').node
        for (const p of parts2) {
          if (!node.children[p]) {
            node.children[p] = { type: 'dir', children: {} }
          } else if (node.children[p].type !== 'dir') {
            lines.push({ text: `mkdir: no se puede crear el directorio '${p}': El archivo ya existe`, cls: 'text-red-400' })
            break
          }
          node = node.children[p]
        }
      }
      setFs(newFs)
      return ok(lines)
    }

    case 'touch': {
      if (!args.length) return err('missing file operand')
      const newFs = JSON.parse(JSON.stringify(fs))
      const parent = resolvePath(newFs, cwd, '.')
      for (const fname of args) {
        if (!parent.node.children[fname])
          parent.node.children[fname] = { type: 'file', content: '' }
      }
      setFs(newFs)
      return ok([])
    }

    case 'rm': {
      if (!args.length) return err('missing operand')
      const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-f')
      const files = args.filter((a) => !a.startsWith('-'))
      const newFs = JSON.parse(JSON.stringify(fs))
      const lines = []
      for (const fname of files) {
        const res = resolvePath(newFs, cwd, fname)
        if (!res) { lines.push({ text: `rm: no se puede borrar '${fname}': No existe`, cls: 'text-red-400' }); continue }
        if (res.node.type === 'dir' && !recursive) {
          lines.push({ text: `rm: no se puede borrar '${fname}': Es un directorio`, cls: 'text-red-400' }); continue
        }
        const par = resolvePath(newFs, cwd, res.path.slice(0, -1).join('/') || '.')
        const key = res.path[res.path.length - 1]
        delete par.node.children[key]
      }
      setFs(newFs)
      return ok(lines)
    }

    case 'rmdir': {
      if (!args.length) return err('missing operand')
      const newFs = JSON.parse(JSON.stringify(fs))
      const lines = []
      for (const fname of args) {
        const res = resolvePath(newFs, cwd, fname)
        if (!res || res.node.type !== 'dir') { lines.push({ text: `rmdir: error al borrar '${fname}'`, cls: 'text-red-400' }); continue }
        if (Object.keys(res.node.children).length > 0) {
          lines.push({ text: `rmdir: error al borrar '${fname}': El directorio no está vacío`, cls: 'text-red-400' }); continue
        }
        const par = resolvePath(newFs, cwd, res.path.slice(0, -1).join('/') || '.')
        delete par.node.children[res.path[res.path.length - 1]]
      }
      setFs(newFs)
      return ok(lines)
    }

    case 'cp': {
      if (args.length < 2) return err('missing destination file operand')
      const [src, dest] = args.filter((a) => !a.startsWith('-'))
      const srcRes = resolvePath(fs, cwd, src)
      if (!srcRes || srcRes.node.type !== 'file') return err(`${src}: No existe o es un directorio`)
      const newFs = JSON.parse(JSON.stringify(fs))
      const destRes = resolvePath(newFs, cwd, dest)
      const parent  = resolvePath(newFs, cwd, dest.split('/').slice(0, -1).join('/') || '.')
      const fname   = dest.split('/').pop()
      if (destRes?.node.type === 'dir') {
        destRes.node.children[src.split('/').pop()] = JSON.parse(JSON.stringify(srcRes.node))
      } else if (parent) {
        parent.node.children[fname] = JSON.parse(JSON.stringify(srcRes.node))
      }
      setFs(newFs)
      return ok([])
    }

    case 'mv': {
      if (args.length < 2) return err('missing destination file operand')
      const [src, dest] = args
      const srcRes = resolvePath(fs, cwd, src)
      if (!srcRes) return err(`${src}: No existe`)
      const newFs   = JSON.parse(JSON.stringify(fs))
      const srcNode = JSON.parse(JSON.stringify(srcRes.node))
      const srcPar  = resolvePath(newFs, cwd, srcRes.path.slice(0, -1).join('/') || '.')
      delete srcPar.node.children[srcRes.path[srcRes.path.length - 1]]
      const destRes = resolvePath(newFs, cwd, dest)
      if (destRes?.node.type === 'dir') {
        destRes.node.children[src.split('/').pop()] = srcNode
      } else {
        const par   = resolvePath(newFs, cwd, dest.split('/').slice(0, -1).join('/') || '.')
        const fname = dest.split('/').pop()
        if (par) par.node.children[fname] = srcNode
        else return err(`${dest}: directorio no encontrado`)
      }
      setFs(newFs)
      return ok([])
    }

    case 'cat': {
      if (!args.length) return err('missing file operand')
      const lines = []
      for (const fname of args) {
        const res = resolvePath(fs, cwd, fname)
        if (!res) { lines.push({ text: `cat: ${fname}: No existe el archivo o directorio`, cls: 'text-red-400' }); continue }
        if (res.node.type === 'dir') { lines.push({ text: `cat: ${fname}: Es un directorio`, cls: 'text-red-400' }); continue }
        res.node.content.split('\n').forEach((l) => lines.push({ text: l }))
      }
      return ok(lines)
    }

    case 'head': {
      const n    = parseInt(args.find((a) => a.startsWith('-'))?.slice(1) ?? '10') || 10
      const fname = args.find((a) => !a.startsWith('-'))
      if (!fname) return err('missing file operand')
      const res = resolvePath(fs, cwd, fname)
      if (!res || res.node.type !== 'file') return err(`${fname}: No existe`)
      return ok(res.node.content.split('\n').slice(0, n).map((l) => ({ text: l })))
    }

    case 'tail': {
      const n    = parseInt(args.find((a) => a.startsWith('-'))?.slice(1) ?? '10') || 10
      const fname = args.find((a) => !a.startsWith('-'))
      if (!fname) return err('missing file operand')
      const res = resolvePath(fs, cwd, fname)
      if (!res || res.node.type !== 'file') return err(`${fname}: No existe`)
      return ok(res.node.content.split('\n').slice(-n).map((l) => ({ text: l })))
    }

    case 'wc': {
      const flag  = args.find((a) => a.startsWith('-')) ?? '-l'
      const fname = args.find((a) => !a.startsWith('-'))
      if (!fname) return err('missing file operand')
      const res = resolvePath(fs, cwd, fname)
      if (!res || res.node.type !== 'file') return err(`${fname}: No existe`)
      const lines2 = res.node.content.split('\n')
      if (flag === '-l') return ok([{ text: `${lines2.length} ${fname}` }])
      if (flag === '-c') return ok([{ text: `${res.node.content.length} ${fname}` }])
      if (flag === '-w') return ok([{ text: `${res.node.content.split(/\s+/).filter(Boolean).length} ${fname}` }])
      return ok([{ text: `${lines2.length} ${res.node.content.split(/\s+/).filter(Boolean).length} ${res.node.content.length} ${fname}` }])
    }

    case 'grep': {
      const flags2  = args.filter((a) => a.startsWith('-')).join('')
      const posArgs = args.filter((a) => !a.startsWith('-'))
      if (posArgs.length < 2) return err('usage: grep [FLAGS] PATTERN FILE')
      const [pattern, fname] = posArgs
      const res = resolvePath(fs, cwd, fname)
      if (!res || res.node.type !== 'file') return err(`${fname}: No existe`)
      const regex  = new RegExp(pattern, flags2.includes('i') ? 'gi' : 'g')
      const lns    = res.node.content.split('\n')
      if (flags2.includes('c')) return ok([{ text: String(lns.filter((l) => regex.test(l)).length) }])
      const invert = flags2.includes('v')
      const withN  = flags2.includes('n')
      const matches = lns
        .map((l, i) => ({ line: l, idx: i + 1, match: regex.test(l) }))
        .filter(({ match }) => invert ? !match : match)
      if (!matches.length) return ok([])
      return ok(matches.map(({ line, idx }) => ({
        text: withN ? `${idx}:${line}` : line,
        cls: 'text-green-300',
      })))
    }

    case 'sort': {
      const fname = args.find((a) => !a.startsWith('-'))
      if (!fname) return err('missing file operand')
      const res = resolvePath(fs, cwd, fname)
      if (!res || res.node.type !== 'file') return err(`${fname}: No existe`)
      const sorted = [...res.node.content.split('\n')].sort()
      return ok(sorted.map((l) => ({ text: l })))
    }

    case 'uniq': {
      const fname = args[0]
      if (!fname) return err('missing file operand')
      const res = resolvePath(fs, cwd, fname)
      if (!res || res.node.type !== 'file') return err(`${fname}: No existe`)
      const unique = [...new Set(res.node.content.split('\n'))]
      return ok(unique.map((l) => ({ text: l })))
    }

    case 'chmod': {
      if (args.length < 2) return err('missing operand')
      return ok([{ text: `permisos cambiados: ${args[1]}`, cls: 'text-green-400' }])
    }

    case 'find': {
      const root   = args.find((a) => !a.startsWith('-')) ?? '.'
      const nameFlag = args.indexOf('-name')
      const typeFlag = args.indexOf('-type')
      const pattern2 = nameFlag >= 0 ? args[nameFlag + 1] : null
      const typeFilter = typeFlag >= 0 ? args[typeFlag + 1] : null
      const res = resolvePath(fs, cwd, root)
      if (!res || res.node.type !== 'dir') return err(`${root}: No existe`)
      const results = []
      const walk = (node, path) => {
        if (!node.children) return
        for (const [name, child] of Object.entries(node.children)) {
          const fullPath = path + '/' + name
          const matches2 = (!pattern2 || new RegExp('^' + pattern2.replace(/\*/g, '.*') + '$').test(name))
            && (!typeFilter || (typeFilter === 'd' ? child.type === 'dir' : child.type === 'file'))
          if (matches2) results.push(fullPath)
          if (child.type === 'dir') walk(child, fullPath)
        }
      }
      walk(res.node, root === '.' ? '.' : '/' + res.path.join('/'))
      return ok(results.length ? results.map((r) => ({ text: r })) : [])
    }

    case 'history':
      return ok(history.slice(-20).map((h, i) => ({ text: `  ${i + 1}  ${h}` })))

    case 'help':
      return ok([
        { text: 'Comandos disponibles:', cls: 'text-primary font-bold' },
        { text: '  pwd, ls, cd, mkdir, touch, rm, rmdir, cp, mv' },
        { text: '  cat, head, tail, wc, grep, sort, uniq, find' },
        { text: '  echo, chmod, date, whoami, history, clear' },
        { text: '' },
        { text: 'Redirección: echo "texto" > archivo.txt   (sobreescribir)' },
        { text: '             echo "texto" >> archivo.txt  (agregar)' },
        { text: 'Pipe:        cat archivo.txt | grep "palabra"' },
        { text: '' },
        { text: 'Tip: escribe "cat hola.sh" para ver tu primer script 🚀', cls: 'text-amber-400' },
      ])

    default:
      return err(`command not found. Escribe 'help' para ver comandos disponibles`)
  }
}

// ── Pipe support ──────────────────────────────────────────────────────────────
function runPipeline(raw, cwd, fs, setFs, setCwd, history) {
  const pipes = raw.split('|').map((s) => s.trim())
  if (pipes.length === 1) return runCommand(raw.trim(), cwd, fs, setFs, setCwd, history)

  // Only support simple piped commands (not full re-run)
  let lines = []
  for (let i = 0; i < pipes.length; i++) {
    const [bin, ...args] = pipes[i].split(/\s+/)
    if (i === 0) {
      const res = runCommand(pipes[i], cwd, fs, setFs, setCwd, history)
      lines = res.lines ?? []
    } else {
      // Process previous lines through next command
      const text = lines.map((l) => l.text ?? '').join('\n')
      if (bin === 'head') {
        const n = parseInt(args.find((a) => a.startsWith('-'))?.slice(1) ?? '10') || 10
        lines = text.split('\n').slice(0, n).map((l) => ({ text: l }))
      } else if (bin === 'tail') {
        const n = parseInt(args.find((a) => a.startsWith('-'))?.slice(1) ?? '10') || 10
        lines = text.split('\n').slice(-n).map((l) => ({ text: l }))
      } else if (bin === 'grep') {
        const flags  = args.filter((a) => a.startsWith('-')).join('')
        const pattern = args.find((a) => !a.startsWith('-'))
        if (!pattern) { lines = [{ text: 'grep: missing pattern', cls: 'text-red-400' }]; break }
        const regex  = new RegExp(pattern, flags.includes('i') ? 'gi' : 'g')
        const invert = flags.includes('v')
        if (flags.includes('c')) {
          const cnt = text.split('\n').filter((l) => invert ? !regex.test(l) : regex.test(l)).length
          lines = [{ text: String(cnt) }]
        } else {
          lines = text.split('\n')
            .filter((l) => invert ? !regex.test(l) : regex.test(l))
            .map((l) => ({ text: l, cls: 'text-green-300' }))
        }
      } else if (bin === 'wc') {
        const flag = args[0] ?? '-l'
        const lns  = text.split('\n')
        if (flag === '-l') lines = [{ text: String(lns.length) }]
        else if (flag === '-w') lines = [{ text: String(text.split(/\s+/).filter(Boolean).length) }]
        else lines = [{ text: String(lns.length) }]
      } else if (bin === 'sort') {
        lines = [...text.split('\n')].sort().map((l) => ({ text: l }))
      } else if (bin === 'uniq') {
        lines = [...new Set(text.split('\n'))].map((l) => ({ text: l }))
      } else {
        lines = [{ text: `bash: ${bin}: command not found`, cls: 'text-red-400' }]
      }
    }
  }
  return { lines }
}

// ── Terminal component ────────────────────────────────────────────────────────
export default function BashTerminalGame() {
  const [fs,       setFs]       = useState(buildFs)
  const [cwd,      setCwd]      = useState(HOME_PATH)
  const [input,    setInput]    = useState('')
  const [output,   setOutput]   = useState([
    { type: 'system', text: '╔════════════════════════════════════════╗' },
    { type: 'system', text: '║    🐚 Terminal de Práctica — Oliver    ║' },
    { type: 'system', text: '╚════════════════════════════════════════╝' },
    { type: 'system', text: 'Escribe "help" para ver los comandos disponibles.' },
    { type: 'system', text: '' },
  ])
  const [cmdHistory, setCmdHistory] = useState([])
  const [histIdx,    setHistIdx]    = useState(-1)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [output])
  useEffect(() => { inputRef.current?.focus() }, [])

  const prompt = `estudiante@oliver-academy:${relativeHome(cwd)}$ `

  const submit = useCallback(() => {
    const rawCmd = input.trim()
    setInput('')
    setHistIdx(-1)

    const newHistory = rawCmd ? [...cmdHistory, rawCmd] : cmdHistory
    if (rawCmd) setCmdHistory(newHistory)

    const promptLine = { type: 'prompt', text: prompt + rawCmd }

    if (!rawCmd) { setOutput((o) => [...o, promptLine]); return }

    const result = runPipeline(rawCmd, cwd, fs, setFs, setCwd, newHistory)

    if (result.clear) { setOutput([promptLine]); return }

    const outLines = (result.lines ?? []).map((l) => ({ type: 'output', ...l }))
    setOutput((o) => [...o, promptLine, ...outLines])
  }, [input, cmd, cwd, fs, cmdHistory, prompt])

  const handleKey = (e) => {
    if (e.key === 'Enter') { submit(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = histIdx + 1
      if (idx < cmdHistory.length) {
        setHistIdx(idx)
        setInput(cmdHistory[cmdHistory.length - 1 - idx])
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = histIdx - 1
      if (idx < 0) { setHistIdx(-1); setInput(''); return }
      setHistIdx(idx)
      setInput(cmdHistory[cmdHistory.length - 1 - idx])
      return
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setOutput([])
    }
    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      setOutput((o) => [...o, { type: 'prompt', text: prompt + input + '^C' }])
      setInput('')
    }
  }

  return (
    <div
      className="flex h-full flex-col bg-[#0d1117] font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#161b22] px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <span className="flex-1 text-center text-xs text-white/40">bash — estudiante@oliver-academy</span>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {output.map((line, i) => {
          if (line.type === 'system')
            return <div key={i} className="text-green-500/80">{line.text}</div>
          if (line.type === 'prompt')
            return <div key={i} className="text-white/90">{line.text}</div>
          if (line.inline)
            return (
              <div key={i} className="flex flex-wrap gap-x-4 gap-y-0.5">
                {line.inline.map((item, j) => (
                  <span key={j} className={item.cls ?? 'text-white/90'}>{item.text}</span>
                ))}
              </div>
            )
          return (
            <div key={i} className={line.cls ?? 'text-white/90'}>
              {line.text}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input line */}
      <div className="flex items-center border-t border-white/10 bg-[#0d1117] px-4 py-3">
        <span className="text-green-400 whitespace-nowrap select-none">{prompt}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          className="flex-1 bg-transparent text-white/90 outline-none caret-green-400 ml-0.5"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
