// ─────────────────────────────────────────────────────────────────────────────
// Bash Simulator — virtual filesystem + command interpreter
// No server needed. Everything runs in the browser.
// ─────────────────────────────────────────────────────────────────────────────

// ── Color helpers (ANSI-style tags → CSS classNames via TerminalEmulator) ───
export const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
  blue:   (s) => `\x1b[34m${s}\x1b[0m`,
  magenta:(s) => `\x1b[35m${s}\x1b[0m`,
}

// ── Path utilities ────────────────────────────────────────────────────────────
export function resolvePath(cwd, path) {
  if (!path || path === '') return cwd
  const parts = path.startsWith('/') ? path.split('/') : [...cwd.split('/'), ...path.split('/')]
  const resolved = []
  for (const p of parts) {
    if (p === '' || p === '.') continue
    if (p === '..') resolved.pop()
    else resolved.push(p)
  }
  return '/' + resolved.join('/')
}

export function dirname(path) {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/') || '/'
}

export function basename(path) {
  return path.split('/').pop() || '/'
}

// ── Filesystem access ─────────────────────────────────────────────────────────
function getNode(fs, path) {
  if (path === '/') return fs['/']
  const parts = path.split('/').filter(Boolean)
  let node = fs['/']
  for (const p of parts) {
    if (!node || node.type !== 'dir') return null
    node = node.children?.[p]
  }
  return node ?? null
}

function setNode(fs, path, node) {
  if (path === '/') return
  const parts = path.split('/').filter(Boolean)
  let cur = fs['/']
  for (const p of parts.slice(0, -1)) {
    cur = cur.children[p]
  }
  const key = parts[parts.length - 1]
  if (node === null) delete cur.children[key]
  else cur.children[key] = node
}

// ── Permission check ──────────────────────────────────────────────────────────
function canRead(node, user) {
  if (user === 'root') return true
  if (!node) return false
  const perms = node.permissions ?? '644'
  const owner = node.owner ?? 'student'
  if (owner === user) return parseInt(perms[0]) & 4
  return parseInt(perms[2]) & 4
}

function canWrite(node, user) {
  if (user === 'root') return true
  if (!node) return false
  const perms = node.permissions ?? '644'
  const owner = node.owner ?? 'student'
  if (owner === user) return parseInt(perms[0]) & 2
  return parseInt(perms[2]) & 2
}

function canExec(node, user) {
  if (user === 'root') return true
  if (!node) return false
  const perms = node.permissions ?? '755'
  const owner = node.owner ?? 'student'
  if (owner === user) return parseInt(perms[0]) & 1
  return parseInt(perms[2]) & 1
}

// ── ls format ────────────────────────────────────────────────────────────────
function formatPerms(node) {
  const type = node.type === 'dir' ? 'd' : '-'
  const p = node.permissions ?? (node.type === 'dir' ? '755' : '644')
  const bits = (n) => {
    const r = n & 4 ? 'r' : '-'
    const w = n & 2 ? 'w' : '-'
    const x = n & 1 ? 'x' : '-'
    return r + w + x
  }
  return type + bits(parseInt(p[0])) + bits(parseInt(p[1])) + bits(parseInt(p[2]))
}

function colorName(node, name) {
  if (node.type === 'dir')                   return c.blue(c.bold(name + '/'))
  if (node.permissions?.endsWith?.('5') ||
      node.permissions?.includes?.('7'))     return c.green(c.bold(name))
  if (name.startsWith('.'))                  return c.dim(name)
  return name
}

// ── Command implementations ───────────────────────────────────────────────────
const COMMANDS = {

  pwd({ state }) {
    return [c.cyan(state.cwd)]
  },

  ls({ args, state, fs }) {
    const showAll  = args.includes('-a') || args.includes('-la') || args.includes('-al')
    const longFmt  = args.includes('-l') || args.includes('-la') || args.includes('-al')
    const pathArg  = args.find((a) => !a.startsWith('-'))
    const target   = pathArg ? resolvePath(state.cwd, pathArg) : state.cwd
    const node     = getNode(fs, target)

    if (!node) return [c.red(`ls: cannot access '${target}': No such file or directory`)]
    if (!canRead(node, state.user)) return [c.red(`ls: cannot open directory '${target}': Permission denied`)]
    if (node.type === 'file') {
      return longFmt
        ? [`${formatPerms(node)} 1 ${node.owner??'student'} student    ${(node.content?.length??0).toString().padStart(4)} ${colorName(node, basename(target))}`]
        : [colorName(node, basename(target))]
    }

    const entries = Object.entries(node.children ?? {})
      .filter(([name]) => showAll || !name.startsWith('.'))
      .sort(([a], [b]) => a.localeCompare(b))

    if (!longFmt) {
      return [entries.map(([name, n]) => colorName(n, name)).join('  ') || '']
    }

    const total = entries.length
    const lines = [`total ${total}`]
    if (showAll) {
      lines.push(`${c.blue('drwxr-xr-x')} 2 ${state.user} student   ${c.yellow('.')}`)
      lines.push(`${c.blue('drwxr-xr-x')} 2 ${state.user} student   ${c.yellow('..')}`)
    }
    for (const [name, n] of entries) {
      const perm  = c.cyan(formatPerms(n))
      const owner = c.yellow(n.owner ?? 'student')
      const size  = (n.content?.length ?? 0).toString().padStart(6)
      lines.push(`${perm} 1 ${owner} student ${size} ${colorName(n, name)}`)
    }
    return lines
  },

  cd({ args, state, fs }) {
    const target = args[0] ? resolvePath(state.cwd, args[0]) : '/home/' + state.user
    const node   = getNode(fs, target)
    if (!node) return [c.red(`cd: ${args[0]}: No such file or directory`)]
    if (node.type !== 'dir') return [c.red(`cd: ${args[0]}: Not a directory`)]
    if (!canExec(node, state.user)) return [c.red(`cd: ${args[0]}: Permission denied`)]
    state.cwd = target
    return []
  },

  cat({ args, state, fs }) {
    const out = []
    for (const arg of args) {
      const path = resolvePath(state.cwd, arg)
      const node = getNode(fs, path)
      if (!node) { out.push(c.red(`cat: ${arg}: No such file or directory`)); continue }
      if (node.type === 'dir') { out.push(c.red(`cat: ${arg}: Is a directory`)); continue }
      if (!canRead(node, state.user)) { out.push(c.red(`cat: ${arg}: Permission denied`)); continue }
      out.push(...(node.content ?? '').split('\n'))
    }
    return out
  },

  echo({ args, state }) {
    const raw = args.join(' ')
    const expanded = raw.replace(/\$(\w+)/g, (_, k) => state.env[k] ?? '')
    return [expanded]
  },

  mkdir({ args, state, fs }) {
    const makeParents = args.includes('-p')
    const paths = args.filter((a) => !a.startsWith('-'))
    const out = []
    for (const arg of paths) {
      const path = resolvePath(state.cwd, arg)
      const parent = dirname(path)
      const pNode = getNode(fs, parent)
      if (!pNode) { out.push(c.red(`mkdir: cannot create directory '${arg}': No such file or directory`)); continue }
      if (!canWrite(pNode, state.user)) { out.push(c.red(`mkdir: cannot create directory '${arg}': Permission denied`)); continue }
      if (getNode(fs, path)) { if (!makeParents) out.push(c.red(`mkdir: cannot create directory '${arg}': File exists`)); continue }
      setNode(fs, path, { type: 'dir', children: {}, owner: state.user, permissions: '755' })
    }
    return out
  },

  touch({ args, state, fs }) {
    const out = []
    for (const arg of args) {
      const path = resolvePath(state.cwd, arg)
      const existing = getNode(fs, path)
      if (existing) continue
      const parent = dirname(path)
      const pNode = getNode(fs, parent)
      if (!pNode) { out.push(c.red(`touch: cannot touch '${arg}': No such file or directory`)); continue }
      if (!canWrite(pNode, state.user)) { out.push(c.red(`touch: cannot touch '${arg}': Permission denied`)); continue }
      setNode(fs, path, { type: 'file', content: '', owner: state.user, permissions: '644' })
    }
    return out
  },

  rm({ args, state, fs }) {
    const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-fr')
    const force     = args.includes('-f') || args.includes('-rf') || args.includes('-fr')
    const paths = args.filter((a) => !a.startsWith('-'))
    const out = []
    for (const arg of paths) {
      const path = resolvePath(state.cwd, arg)
      if (path === '/') { out.push(c.red("rm: it is dangerous to operate recursively on '/'") ); continue }
      const node = getNode(fs, path)
      if (!node) { if (!force) out.push(c.red(`rm: cannot remove '${arg}': No such file or directory`)); continue }
      if (node.type === 'dir' && !recursive) { out.push(c.red(`rm: cannot remove '${arg}': Is a directory`)); continue }
      const pNode = getNode(fs, dirname(path))
      if (!canWrite(pNode, state.user)) { out.push(c.red(`rm: cannot remove '${arg}': Permission denied`)); continue }
      setNode(fs, path, null)
    }
    return out
  },

  cp({ args, state, fs }) {
    const paths = args.filter((a) => !a.startsWith('-'))
    if (paths.length < 2) return [c.red("cp: missing destination file operand")]
    const src  = resolvePath(state.cwd, paths[0])
    const dst  = resolvePath(state.cwd, paths[1])
    const sNode = getNode(fs, src)
    if (!sNode) return [c.red(`cp: cannot stat '${paths[0]}': No such file or directory`)]
    if (!canRead(sNode, state.user)) return [c.red(`cp: cannot open '${paths[0]}': Permission denied`)]
    const dParent = getNode(fs, dirname(dst))
    if (!dParent) return [c.red(`cp: cannot create regular file '${paths[1]}': No such file or directory`)]
    setNode(fs, dst, JSON.parse(JSON.stringify(sNode)))
    return []
  },

  mv({ args, state, fs }) {
    const paths = args.filter((a) => !a.startsWith('-'))
    if (paths.length < 2) return [c.red("mv: missing destination file operand")]
    const src = resolvePath(state.cwd, paths[0])
    const dst = resolvePath(state.cwd, paths[1])
    const sNode = getNode(fs, src)
    if (!sNode) return [c.red(`mv: cannot stat '${paths[0]}': No such file or directory`)]
    const pNode = getNode(fs, dirname(src))
    if (!canWrite(pNode, state.user)) return [c.red(`mv: cannot move '${paths[0]}': Permission denied`)]
    const dParent = getNode(fs, dirname(dst))
    if (!dParent) return [c.red(`mv: cannot move '${paths[0]}' to '${paths[1]}': No such file or directory`)]
    setNode(fs, dst, JSON.parse(JSON.stringify(sNode)))
    setNode(fs, src, null)
    return []
  },

  chmod({ args, state, fs }) {
    const modeArg = args.find((a) => !a.startsWith('-') && /^[0-7]{3}$/.test(a))
    const paths   = args.filter((a) => !a.startsWith('-') && !/^[0-7]{3}$/.test(a))
    if (!modeArg) return [c.red("chmod: invalid mode")]
    const out = []
    for (const arg of paths) {
      const path = resolvePath(state.cwd, arg)
      const node = getNode(fs, path)
      if (!node) { out.push(c.red(`chmod: cannot access '${arg}': No such file or directory`)); continue }
      if (node.owner !== state.user && state.user !== 'root') { out.push(c.red(`chmod: changing permissions of '${arg}': Operation not permitted`)); continue }
      node.permissions = modeArg
    }
    return out
  },

  grep({ args, state, fs }) {
    const recursive = args.includes('-r') || args.includes('-R')
    const iFlag     = args.includes('-i')
    const nFlag     = args.includes('-n')
    const flags = args.filter((a) => a.startsWith('-'))
    const rest  = args.filter((a) => !a.startsWith('-'))
    if (rest.length < 1) return [c.red("grep: no pattern specified")]
    const pattern = rest[0]
    const targets = rest.slice(1)
    const regex = new RegExp(pattern, iFlag ? 'gi' : 'g')
    const out = []

    const grepFile = (path, name) => {
      const node = getNode(fs, path)
      if (!node || node.type !== 'file') return
      if (!canRead(node, state.user)) { out.push(c.red(`grep: ${name}: Permission denied`)); return }
      const lines = (node.content ?? '').split('\n')
      lines.forEach((line, i) => {
        if (regex.test(line)) {
          const prefix = targets.length > 1 ? c.magenta(name) + ':' : ''
          const lineNum = nFlag ? c.yellow(String(i+1)) + ':' : ''
          const highlighted = line.replace(regex, (m) => c.red(c.bold(m)))
          out.push(`${prefix}${lineNum}${highlighted}`)
        }
        regex.lastIndex = 0
      })
    }

    if (targets.length === 0 && !recursive) return [c.yellow("grep: reading from stdin not supported")]

    for (const t of targets) {
      const path = resolvePath(state.cwd, t)
      const node = getNode(fs, path)
      if (!node) { out.push(c.red(`grep: ${t}: No such file or directory`)); continue }
      if (node.type === 'dir' && !recursive) { out.push(c.red(`grep: ${t}: Is a directory`)); continue }
      if (node.type === 'dir' && recursive) {
        const walk = (p, n) => {
          for (const [k, child] of Object.entries(n.children ?? {})) {
            const cp = p === '/' ? `/${k}` : `${p}/${k}`
            if (child.type === 'dir') walk(cp, child)
            else grepFile(cp, cp)
          }
        }
        walk(path, node)
      } else {
        grepFile(path, t)
      }
    }
    return out
  },

  find({ args, state, fs }) {
    const startPath = args.find((a) => !a.startsWith('-')) ?? '.'
    const nameIdx   = args.indexOf('-name')
    const typeIdx   = args.indexOf('-type')
    const namePattern = nameIdx !== -1 ? args[nameIdx + 1] : null
    const typeFilter  = typeIdx  !== -1 ? args[typeIdx + 1] : null

    const start = resolvePath(state.cwd, startPath)
    const startNode = getNode(fs, start)
    if (!startNode) return [c.red(`find: '${startPath}': No such file or directory`)]

    const out = []
    const walk = (path, node) => {
      const name = basename(path) || '/'
      const matchName = !namePattern || new RegExp('^' + namePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$').test(name)
      const matchType = !typeFilter || (typeFilter === 'f' ? node.type === 'file' : node.type === 'dir')
      if (matchName && matchType) out.push(path === start ? startPath : path.replace(start, startPath).replace(/^\/\//, '/'))
      if (node.type === 'dir') {
        for (const [k, child] of Object.entries(node.children ?? {})) {
          const cp = path === '/' ? `/${k}` : `${path}/${k}`
          walk(cp, child)
        }
      }
    }
    walk(start, startNode)
    return out
  },

  whoami({ state }) { return [c.green(state.user)] },

  id({ state }) {
    const uid = state.user === 'root' ? 0 : 1000
    return [`${c.yellow(`uid=${uid}(${state.user})`)} ${c.cyan(`gid=${uid}(${state.user})`)} groups=${uid}(${state.user})`]
  },

  env({ state }) {
    return Object.entries(state.env).map(([k, v]) => `${c.cyan(k)}=${v}`)
  },

  export({ args, state }) {
    for (const arg of args) {
      const [k, v] = arg.split('=')
      if (k && v !== undefined) state.env[k] = v
    }
    return []
  },

  history({ state }) {
    return state.history.map((cmd, i) => `  ${c.yellow(String(i+1).padStart(3))}  ${cmd}`)
  },

  clear() { return ['__CLEAR__'] },

  which({ args }) {
    const builtins = Object.keys(COMMANDS)
    return args.map((cmd) => builtins.includes(cmd) ? `/usr/bin/${cmd}` : c.red(`which: ${cmd}: command not found`))
  },

  file({ args, state, fs }) {
    return args.map((arg) => {
      const path = resolvePath(state.cwd, arg)
      const node = getNode(fs, path)
      if (!node) return c.red(`file: ${arg}: No such file or directory`)
      if (node.type === 'dir') return `${arg}: ${c.cyan('directory')}`
      const content = node.content ?? ''
      if (content.startsWith('#!/bin/bash') || content.startsWith('#!/bin/sh')) return `${arg}: ${c.green('Bourne-Again shell script')}`
      if (/^.ELF/.test(content)) return `${arg}: ${c.yellow('ELF 64-bit LSB executable')}`
      return `${arg}: ${c.cyan('ASCII text')}`
    })
  },

  base64({ args, state, fs }) {
    const decode = args.includes('-d') || args.includes('--decode')
    const fileArg = args.find((a) => !a.startsWith('-'))
    let text = ''
    if (fileArg) {
      const path = resolvePath(state.cwd, fileArg)
      const node = getNode(fs, path)
      if (!node) return [c.red(`base64: ${fileArg}: No such file or directory`)]
      if (!canRead(node, state.user)) return [c.red(`base64: ${fileArg}: Permission denied`)]
      text = node.content ?? ''
    } else {
      return [c.yellow('base64: reading from stdin not supported — specify a file')]
    }
    try {
      if (decode) return [atob(text.trim())]
      return [btoa(text)]
    } catch {
      return [c.red('base64: invalid input')]
    }
  },

  strings({ args, state, fs }) {
    const fileArg = args.find((a) => !a.startsWith('-'))
    if (!fileArg) return [c.red('strings: missing file argument')]
    const path = resolvePath(state.cwd, fileArg)
    const node = getNode(fs, path)
    if (!node) return [c.red(`strings: ${fileArg}: No such file or directory`)]
    if (!canRead(node, state.user)) return [c.red(`strings: ${fileArg}: Permission denied`)]
    const matches = (node.content ?? '').match(/[\x20-\x7E]{4,}/g) ?? []
    return matches.length ? matches : [c.dim('(no printable strings found)')]
  },

  sudo({ args, state, fs, run }) {
    if (state.user === 'root') return run(args, state, fs)
    if (state.sudoPassword && state.env['SUDO_PASS'] === state.sudoPassword) {
      const prevUser = state.user
      state.user = 'root'
      const result = run(args, state, fs)
      state.user = prevUser
      return result
    }
    // Interactive password prompt would break the flow — return a hint
    if (state.sudoPassword) {
      return [
        c.yellow('[sudo] password for ' + state.user + ': '),
        c.dim('Tip: export SUDO_PASS=<password> para usar sudo sin prompt'),
      ]
    }
    return [c.red('sudo: permission denied')]
  },

  su({ args, state }) {
    const targetUser = args.find((a) => !a.startsWith('-')) ?? 'root'
    if (targetUser === state.user) return []
    const pw = state.passwords?.[targetUser]
    if (!pw) return [c.red(`su: user ${targetUser} does not exist`)]
    const inputPw = state.env['SU_PASS_' + targetUser.toUpperCase()]
    if (inputPw === pw) {
      state.user = targetUser
      return [c.green(`Switched to user: ${targetUser}`)]
    }
    return [
      c.yellow(`Password: `),
      c.dim(`Tip: export SU_PASS_${targetUser.toUpperCase()}=<password>`),
    ]
  },

  man({ args }) {
    const pages = {
      ls:      'ls - list directory contents\n  Usage: ls [-la] [path]\n  -l: long format  -a: show hidden files',
      cd:      'cd - change directory\n  Usage: cd [path]',
      cat:     'cat - concatenate and print files\n  Usage: cat [file...]',
      grep:    'grep - search text patterns\n  Usage: grep [-rin] PATTERN [file...]\n  -r: recursive  -i: ignore case  -n: line numbers',
      find:    'find - search for files\n  Usage: find [path] [-name pattern] [-type f|d]',
      chmod:   'chmod - change file permissions\n  Usage: chmod MODE file\n  MODE: octal (e.g. 755, 644, 600)',
      base64:  'base64 - encode/decode base64\n  Usage: base64 [-d] file\n  -d: decode',
      sudo:    'sudo - run command as root\n  Set SUDO_PASS=<password> to authenticate',
      su:      'su - switch user\n  Set SU_PASS_<USER>=<password> to switch without prompt',
    }
    if (!args[0]) return [c.yellow('Available manual pages: ' + Object.keys(pages).join(', '))]
    return pages[args[0]]
      ? pages[args[0]].split('\n').map((l, i) => i === 0 ? c.bold(c.cyan(l)) : c.dim(l))
      : [c.red(`man: no manual entry for ${args[0]}`)]
  },

  ps({ state }) {
    return [
      c.bold(c.cyan('  PID TTY          TIME CMD')),
      `  ${c.yellow('1')}   pts/0    00:00:00 bash`,
      `  ${c.yellow('2')}   pts/0    00:00:00 ps`,
    ]
  },

  uname({ args }) {
    const full = args.includes('-a')
    return [full ? 'Linux oliver-academy 5.15.0 #1 SMP x86_64 GNU/Linux' : 'Linux']
  },

  hostname() { return ['oliver-academy'] },

  date() { return [new Date().toString()] },

  help() {
    return [
      c.bold(c.cyan('Comandos disponibles:')),
      c.green('  Navegación:') + '  ls, cd, pwd, find',
      c.green('  Archivos:  ') + '  cat, touch, mkdir, rm, cp, mv, chmod',
      c.green('  Búsqueda:  ') + '  grep, strings, file',
      c.green('  Sistema:   ') + '  whoami, id, ps, uname, hostname, date, env, export',
      c.green('  Crypto:    ') + '  base64',
      c.green('  Permisos:  ') + '  sudo, su',
      c.green('  Otros:     ') + '  echo, history, clear, which, man, help',
      '',
      c.dim('Pipes: cmd1 | cmd2    Redirección: cmd > file    Variables: $VAR'),
    ]
  },
}

// ── Tokenizer ─────────────────────────────────────────────────────────────────
function tokenize(raw) {
  const tokens = []
  let cur = ''
  let inQ = false, inDQ = false
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch === "'" && !inDQ) { inQ = !inQ; continue }
    if (ch === '"' && !inQ) { inDQ = !inDQ; continue }
    if ((ch === ' ' || ch === '\t') && !inQ && !inDQ) {
      if (cur) tokens.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  if (cur) tokens.push(cur)
  return tokens
}

// ── Pipeline runner ───────────────────────────────────────────────────────────
function runPipeline(segments, state, fs) {
  let output = []
  for (const seg of segments) {
    const [cmd, ...args] = seg
    const expandedArgs = args.map((a) => a.replace(/\$(\w+)/g, (_, k) => state.env[k] ?? ''))
    const handler = COMMANDS[cmd]
    if (!handler) {
      output = [c.red(`${cmd}: command not found`)]
      break
    }
    const subRun = (subArgs, s, f) => {
      const [sc, ...sa] = subArgs
      return COMMANDS[sc] ? COMMANDS[sc]({ args: sa, state: s, fs: f, run: subRun }) : [c.red(`${sc}: command not found`)]
    }
    output = handler({ args: expandedArgs, state, fs, run: subRun })
  }
  return output
}

// ── Public API ────────────────────────────────────────────────────────────────
export function createShell(initialFs, options = {}) {
  // Deep-clone so each shell has its own mutable fs
  const fs = JSON.parse(JSON.stringify(initialFs))

  const state = {
    cwd:          options.cwd      ?? '/home/student',
    user:         options.user     ?? 'student',
    hostname:     options.hostname ?? 'oliver-academy',
    env:          { HOME: '/home/student', PATH: '/usr/bin:/bin', TERM: 'xterm-256color', ...(options.env ?? {}) },
    history:      [],
    sudoPassword: options.sudoPassword ?? null,
    passwords:    options.passwords    ?? {},
  }

  function run(raw) {
    const trimmed = raw.trim()
    if (!trimmed) return { output: [], clear: false }

    state.history.push(trimmed)

    // Redirection: cmd > file  or  cmd >> file
    let outputFile = null, appendMode = false
    let commandStr = trimmed
    const redirMatch = trimmed.match(/^(.*?)\s*(>>|>)\s*(\S+)$/)
    if (redirMatch) {
      commandStr = redirMatch[1].trim()
      appendMode = redirMatch[2] === '>>'
      outputFile = redirMatch[3]
    }

    // Split by pipes
    const pipeSegments = commandStr.split('|').map((s) => tokenize(s.trim()))

    let output = []
    let doClear = false

    try {
      output = runPipeline(pipeSegments, state, fs)
      if (output.includes('__CLEAR__')) { output = []; doClear = true }
    } catch (e) {
      output = [c.red(`bash: internal error: ${e.message}`)]
    }

    // Handle redirection
    if (outputFile && !doClear) {
      const path = resolvePath(state.cwd, outputFile)
      const parent = getNode(fs, dirname(path))
      if (!parent) {
        output = [c.red(`bash: ${outputFile}: No such file or directory`)]
      } else {
        const existing = getNode(fs, path)
        const newContent = output.join('\n')
        if (existing) {
          existing.content = appendMode ? (existing.content ?? '') + '\n' + newContent : newContent
        } else {
          setNode(fs, path, { type: 'file', content: newContent, owner: state.user, permissions: '644' })
        }
        output = []
      }
    }

    return { output, clear: doClear, state: { ...state }, fs }
  }

  function prompt() {
    const short = state.cwd.replace('/home/' + state.user, '~')
    const color  = state.user === 'root' ? c.red : c.green
    return `${color(state.user + '@' + state.hostname)}:${c.cyan(short)}${state.user === 'root' ? c.red('#') : c.green('$')} `
  }

  function getFs()    { return fs }
  function getState() { return state }

  return { run, prompt, getFs, getState }
}
