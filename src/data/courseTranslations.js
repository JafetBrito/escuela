import coursePromptEngineeringEn from './translations/coursePromptEngineering.en.js'
import courseBashEn from './translations/courseBash.en.js'

// Maps courseId -> { [lang]: partial override }. Overrides only need to carry
// the fields that are actually translated — anything omitted (a whole module,
// or just its `content`) falls back to the base (Spanish) course, same
// fallback philosophy as the UI's i18n system (see src/i18n/index.js). This
// lets a course be translated incrementally, module by module, field by field.
const COURSE_TRANSLATIONS = {
  'course-003': { en: coursePromptEngineeringEn },
  'course-bash': { en: courseBashEn },
}

// Merges an array field (exercises/resources) by position: each override item
// is shallow-merged onto its base counterpart, so a translated `label` or
// `prompt` doesn't wipe out the (untranslated) `url`, `id` or `solution`.
function mergeArrayByIndex(base, override) {
  if (!Array.isArray(base)) return base
  if (!Array.isArray(override)) return base
  return base.map((item, i) => (override[i] ? { ...item, ...override[i] } : item))
}

function mergeModule(base, override) {
  if (!override) return base
  return {
    ...base,
    ...override,
    exercises: mergeArrayByIndex(base.exercises, override.exercises),
    resources: mergeArrayByIndex(base.resources, override.resources),
    quiz: base.quiz ? { ...base.quiz, ...(override.quiz ?? {}) } : base.quiz,
    terminalSim: base.terminalSim
      ? {
          ...base.terminalSim,
          ...(override.terminalSim ?? {}),
          checkpoints: mergeArrayByIndex(base.terminalSim.checkpoints, override.terminalSim?.checkpoints),
        }
      : base.terminalSim,
    // Sin esta rama, una traducción que solo trae mnemonicText traducido
    // borraría hanzi/pinyin/mnemonicSvg de los caracteres no tocados —
    // mergeArrayByIndex evita eso, igual que ya hace con terminalSim.checkpoints.
    hanziPractice: base.hanziPractice
      ? {
          ...base.hanziPractice,
          ...(override.hanziPractice ?? {}),
          characters: mergeArrayByIndex(base.hanziPractice.characters, override.hanziPractice?.characters),
        }
      : base.hanziPractice,
  }
}

// Returns `course` translated into `lang`, falling back to the Spanish base
// for any field (or whole module) the translation doesn't cover yet.
//
// Two sources of overrides, checked in order:
//  1. `course.translations[lang]` — lives on the course row itself (Supabase
//     `courses.translations` jsonb), same self-contained pattern as
//     `course_exams.translations` (useExamsStore.localizeExam). This is the
//     one that actually works for every course added after the move to
//     Supabase (migration_024+) — courseId isn't even a field on those rows.
//  2. COURSE_TRANSLATIONS (this file) — legacy, only for the handful of
//     courses that still carry a `courseId` field from before the move
//     (course-003, course-bash). Kept so those don't regress.
export function localizeCourse(course, lang) {
  const override = course.translations?.[lang] ?? COURSE_TRANSLATIONS[course.courseId]?.[lang]
  if (!override) return course

  const overridesById = new Map((override.modules ?? []).map((m) => [m.id, m]))
  return {
    ...course,
    ...override,
    modules: course.modules.map((m) => mergeModule(m, overridesById.get(m.id))),
  }
}
