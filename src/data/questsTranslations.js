// English overrides for chained quests — same pattern as
// categoryTranslations.js: a flat dictionary keyed by the quest's stable
// `id`, spread on top of the original entry only when lang === 'en'.
// questsRegistry.js's `npcId`/`type`/`check`/`validate` fields (logic, not
// text) stay untouched, and `validate` keeps checking whatever the user
// actually typed (language-independent bash syntax) either way.
export const QUEST_TEXT_EN = {
  'bienvenida-campus': {
    title: 'Welcome to the Campus',
    description: 'Meet the guides near the Grand Hall and show your progress.',
    steps: [
      { prompt: 'Welcome! Talk to the Novice Mage so they can assess your progress.' },
      { prompt: 'Reach level 2 and come see me again.' },
      { prompt: 'You made it! Take your reward.' },
    ],
  },
  'circulo-confianza': {
    title: 'Circle of Trust',
    description: 'Connect with other students on campus.',
    steps: [
      { prompt: 'To grow on campus you need allies. Talk to the Messenger Fox.' },
      { prompt: 'Add at least one friend from the Friends page.' },
      { prompt: 'Well done! Take your reward.' },
    ],
  },
  'bash-basico': {
    title: 'First Steps in Bash',
    description: 'BashMishi teaches you your first terminal commands.',
    steps: [
      { prompt: "Meow! I'm BashMishi 🐾. I'm going to teach you how to talk to the computer using Bash. Ready for your first terminal?" },
      {
        // terminal step — only checkpoints' text fields are overridden below;
        // `validate` keeps running against the raw input either way.
        checkpoints: [
          {
            instruction: 'To start, use "echo" to print a message on screen.',
            placeholder: 'echo "Hello World"',
            success: '"echo" prints text to the terminal — it\'s the first thing every programmer learns.',
            hint: 'Type the word "echo" followed by a message, for example: echo "Hello World"',
          },
          {
            instruction: 'Now write a comment explaining what your script does. In Bash, comments start with "#" and the computer ignores them — they\'re for humans.',
            placeholder: '# This script greets the user',
            success: "Well done! Comments don't run, but they help others understand the code later.",
            hint: 'The line must start with the # symbol, for example: # This script greets the user',
          },
          {
            instruction: 'Last step: combine "read" to ask for the user\'s name and "echo" to greet them using that variable. Example:\nread -p "What\'s your name? " name\necho "Hello, $name"',
            placeholder: 'read -p "What\'s your name? " name\necho "Hello, $name"',
            success: "Excellent! You just combined input (read) and output (echo) using a variable. That's a real program.",
            hint: 'You need a line with "read" that stores the name in a variable, and another with "echo" that uses that variable with "$".',
          },
        ],
      },
      { prompt: "You made it! 🎉 This is just the beginning — we'll soon open up a whole Bash world. For now, take your reward." },
    ],
  },
}

// Deep-merges the EN override on top of the original quest only when
// lang === 'en': title/description at the top level, then each step's
// `prompt` merged in by position, and (for the one quest with them) each
// checkpoint's text fields merged in by position too. Everything else
// (npcId, type, check, validate) always comes from the original `quest`.
export function localizeQuest(quest, lang) {
  if (lang !== 'en' || !quest) return quest
  const en = QUEST_TEXT_EN[quest.id]
  if (!en) return quest
  return {
    ...quest,
    title: en.title ?? quest.title,
    description: en.description ?? quest.description,
    steps: quest.steps.map((step, i) => {
      const enStep = en.steps?.[i]
      if (!enStep) return step
      const merged = { ...step, prompt: enStep.prompt ?? step.prompt }
      if (step.checkpoints && enStep.checkpoints) {
        merged.checkpoints = step.checkpoints.map((cp, j) => {
          const enCp = enStep.checkpoints[j]
          if (!enCp) return cp
          return {
            ...cp,
            instruction: enCp.instruction ?? cp.instruction,
            placeholder: enCp.placeholder ?? cp.placeholder,
            success: enCp.success ?? cp.success,
            hint: enCp.hint ?? cp.hint,
          }
        })
      }
      return merged
    }),
  }
}
