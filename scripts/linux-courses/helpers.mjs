// Ayudas compartidas por los generadores de cursos de la Academia de Linux.
// Mismo formato de módulos que scripts/build_git_course.mjs.

// Un checkpoint de consola: `pattern` es un string de regex (el contenido vive
// en Supabase como jsonb, no puede haber funciones). `output` es la salida
// simulada del comando (GitTerminalSim.jsx la muestra debajo del comando).
export const cp = (instruction, placeholder, pattern, hint, success, output) => ({
  instruction, placeholder, pattern, hint, success, ...(output ? { output } : {}),
})

export const quiz = (question, options, correctIndex) => ({ question, options, correctIndex })

// Módulo de texto. `sim` = { title, intro, checkpoints } se separa después en su
// propia clase de "Consola Interactiva" (splitConsoleModules).
export const text = (title, description, content, q, sim) => ({
  type: 'text', title, description, content, exercises: [], resources: [],
  ...(q ? { quiz: q } : {}),
  ...(sim ? { terminalSim: sim } : {}),
})

function consoleIntroHtml(sim) {
  return `
<h2>🖥️ Esta clase es 100% práctica</h2>
<p>Vas a usar una <strong>consola interactiva simulada</strong> — no toca tu computadora ni tu teléfono, pero funciona igual para aprender: escribe exactamente el comando que se te pide en cada paso y presiona <strong>Ejecutar</strong> (o Enter). Si está bien, avanzas al siguiente paso.</p>
<div class="tip">
💡 Si te equivocas, te da una pista — no hay límite de intentos. La idea es que el comando se te quede en los dedos, no solo en la cabeza. Cuando termines, prueba lo mismo en una terminal real (o en el <strong>Laboratorio de terminales</strong> de la Academia de Linux).
</div>
${sim.intro ? `<p>${sim.intro}</p>` : ''}
`
}

// Separa cada módulo con terminalSim en concepto + consola propia y renumera.
export function splitConsoleModules(mods) {
  const out = []
  for (const m of mods) {
    if (m.terminalSim) {
      const { terminalSim, ...concept } = m
      out.push(concept)
      out.push({
        type: 'text',
        title: `🖥️ Consola Interactiva: ${terminalSim.title.replace(/^Simulador:\s*/, '')}`,
        description: 'Practica en una consola interactiva simulada — sin arriesgar nada real.',
        content: consoleIntroHtml(terminalSim),
        exercises: [], resources: [],
        terminalSim,
      })
    } else out.push(m)
  }
  return out.map((m, i) => ({ ...m, id: i, order: i }))
}

const q = (s) => `'${s.replace(/'/g, "''")}'`
const j = (o) => `'${JSON.stringify(o).replace(/'/g, "''")}'`

// SQL de upsert de un curso en public.courses (mismo esquema que migration_038).
export function courseSql(c) {
  return `insert into public.courses
  (id, title, description, ai_instructions, icon, color, category, subcategory, difficulty, locked, modules, translations)
values (
  ${q(c.id)}, ${q(c.title)}, ${q(c.description)}, ${q(c.ai_instructions)},
  ${q(c.icon)}, ${q(c.color)}, ${q(c.category)}, ${q(c.subcategory)}, ${q(c.difficulty)}, ${c.locked},
  ${j(c.modules)},
  '{}'::jsonb
)
on conflict (id) do update set
  title = excluded.title, description = excluded.description, ai_instructions = excluded.ai_instructions,
  icon = excluded.icon, color = excluded.color, category = excluded.category,
  subcategory = excluded.subcategory, difficulty = excluded.difficulty, locked = excluded.locked,
  modules = excluded.modules, translations = excluded.translations, updated_at = now();
`
}
