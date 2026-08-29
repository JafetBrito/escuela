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

// French overrides for chained quests — same pattern as QUEST_TEXT_EN above,
// translated from the Spanish original instead.
export const QUEST_TEXT_FR = {
  'bienvenida-campus': {
    title: 'Bienvenue sur le Campus',
    description: 'Rencontre les guides près du Grand Hall et montre ta progression.',
    steps: [
      { prompt: 'Bienvenue ! Parle au Mage Novice pour qu\'il évalue ta progression.' },
      { prompt: 'Atteins le niveau 2 et reviens me voir.' },
      { prompt: 'Tu as réussi ! Récupère ta récompense.' },
    ],
  },
  'circulo-confianza': {
    title: 'Cercle de Confiance',
    description: 'Connecte-toi avec d\'autres élèves du campus.',
    steps: [
      { prompt: 'Pour grandir sur le campus, il te faut des alliés. Parle au Renard Messager.' },
      { prompt: 'Ajoute au moins un ami depuis la page Amis.' },
      { prompt: 'Bien joué ! Récupère ta récompense.' },
    ],
  },
  'bash-basico': {
    title: 'Premiers Pas en Bash',
    description: 'BashMishi t\'enseigne tes premières commandes de terminal.',
    steps: [
      { prompt: "Miaou ! Je suis BashMishi 🐾. Je vais t'apprendre à parler à l'ordinateur avec Bash. Prêt pour ton premier terminal ?" },
      {
        // terminal step — only checkpoints' text fields are overridden below;
        // `validate` keeps running against the raw input either way.
        checkpoints: [
          {
            instruction: 'Pour commencer, utilise "echo" pour afficher un message à l\'écran.',
            placeholder: 'echo "Bonjour le monde"',
            success: '« echo » affiche du texte dans le terminal — c\'est la première chose qu\'apprend tout programmeur.',
            hint: 'Tape le mot "echo" suivi d\'un message, par exemple : echo "Bonjour le monde"',
          },
          {
            instruction: 'Maintenant écris un commentaire expliquant ce que fait ton script. En Bash, les commentaires commencent par "#" et l\'ordinateur les ignore — ils sont pour les humains.',
            placeholder: '# Ce script salue l\'utilisateur',
            success: 'Bien joué ! Les commentaires ne s\'exécutent pas, mais ils aident les autres à comprendre le code plus tard.',
            hint: 'La ligne doit commencer par le symbole #, par exemple : # Ce script salue l\'utilisateur',
          },
          {
            instruction: 'Dernière étape : combine "read" pour demander le nom de l\'utilisateur et "echo" pour le saluer avec cette variable. Exemple :\nread -p "Comment tu t\'appelles ? " nom\necho "Bonjour, $nom"',
            placeholder: 'read -p "Comment tu t\'appelles ? " nom\necho "Bonjour, $nom"',
            success: "Excellent ! Tu viens de combiner une entrée (read) et une sortie (echo) via une variable. C'est un vrai programme.",
            hint: 'Il te faut une ligne avec "read" qui stocke le nom dans une variable, et une autre avec "echo" qui utilise cette variable avec "$".',
          },
        ],
      },
      { prompt: "Tu as réussi ! 🎉 Ce n'est qu'un début — nous ouvrirons bientôt tout un monde Bash. En attendant, récupère ta récompense." },
    ],
  },
}

// Italian overrides for chained quests — same pattern as QUEST_TEXT_EN above,
// translated from the Spanish original instead.
export const QUEST_TEXT_IT = {
  'bienvenida-campus': {
    title: 'Benvenuto nel Campus',
    description: 'Incontra le guide vicino alla Grande Aula e mostra i tuoi progressi.',
    steps: [
      { prompt: 'Benvenuto! Parla con il Mago Novizio così può valutare i tuoi progressi.' },
      { prompt: 'Raggiungi il livello 2 e torna a trovarmi.' },
      { prompt: 'Ce l\'hai fatta! Prendi la tua ricompensa.' },
    ],
  },
  'circulo-confianza': {
    title: 'Cerchio di Fiducia',
    description: 'Connettiti con altri studenti del campus.',
    steps: [
      { prompt: 'Per crescere nel campus ti servono alleati. Parla con la Volpe Messaggera.' },
      { prompt: 'Aggiungi almeno un amico dalla pagina Amici.' },
      { prompt: 'Ben fatto! Prendi la tua ricompensa.' },
    ],
  },
  'bash-basico': {
    title: 'Primi Passi in Bash',
    description: 'BashMishi ti insegna i tuoi primi comandi da terminale.',
    steps: [
      { prompt: "Miao! Sono BashMishi 🐾. Ti insegnerò a parlare con il computer usando Bash. Pronto per il tuo primo terminale?" },
      {
        // terminal step — only checkpoints' text fields are overridden below;
        // `validate` keeps running against the raw input either way.
        checkpoints: [
          {
            instruction: 'Per iniziare, usa "echo" per stampare un messaggio a schermo.',
            placeholder: 'echo "Ciao Mondo"',
            success: '"echo" stampa del testo nel terminale — è la prima cosa che impara ogni programmatore.',
            hint: 'Digita la parola "echo" seguita da un messaggio, per esempio: echo "Ciao Mondo"',
          },
          {
            instruction: 'Ora scrivi un commento che spieghi cosa fa il tuo script. In Bash, i commenti iniziano con "#" e il computer li ignora — sono per gli esseri umani.',
            placeholder: '# Questo script saluta l\'utente',
            success: 'Ben fatto! I commenti non vengono eseguiti, ma aiutano gli altri a capire il codice in seguito.',
            hint: 'La riga deve iniziare con il simbolo #, per esempio: # Questo script saluta l\'utente',
          },
          {
            instruction: 'Ultimo passo: combina "read" per chiedere il nome dell\'utente e "echo" per salutarlo usando quella variabile. Esempio:\nread -p "Come ti chiami? " nome\necho "Ciao, $nome"',
            placeholder: 'read -p "Come ti chiami? " nome\necho "Ciao, $nome"',
            success: 'Eccellente! Hai appena combinato input (read) e output (echo) usando una variabile. Questo è un programma vero e proprio.',
            hint: 'Ti serve una riga con "read" che salva il nome in una variabile, e un\'altra con "echo" che usa quella variabile con "$".',
          },
        ],
      },
      { prompt: "Ce l'hai fatta! 🎉 Questo è solo l'inizio — presto apriremo tutto un mondo Bash. Per ora, prendi la tua ricompensa." },
    ],
  },
}

// Deep-merges the EN/FR/IT override on top of the original quest only when
// lang is 'en', 'fr' or 'it': title/description at the top level, then each
// step's `prompt` merged in by position, and (for the one quest with them)
// each checkpoint's text fields merged in by position too. Everything else
// (npcId, type, check, validate) always comes from the original `quest`.
export function localizeQuest(quest, lang) {
  if (!quest) return quest
  const overrides = lang === 'en' ? QUEST_TEXT_EN[quest.id] : lang === 'fr' ? QUEST_TEXT_FR[quest.id] : lang === 'it' ? QUEST_TEXT_IT[quest.id] : null
  if (!overrides) return quest
  return {
    ...quest,
    title: overrides.title ?? quest.title,
    description: overrides.description ?? quest.description,
    steps: quest.steps.map((step, i) => {
      const overrideStep = overrides.steps?.[i]
      if (!overrideStep) return step
      const merged = { ...step, prompt: overrideStep.prompt ?? step.prompt }
      if (step.checkpoints && overrideStep.checkpoints) {
        merged.checkpoints = step.checkpoints.map((cp, j) => {
          const overrideCp = overrideStep.checkpoints[j]
          if (!overrideCp) return cp
          return {
            ...cp,
            instruction: overrideCp.instruction ?? cp.instruction,
            placeholder: overrideCp.placeholder ?? cp.placeholder,
            success: overrideCp.success ?? cp.success,
            hint: overrideCp.hint ?? cp.hint,
          }
        })
      }
      return merged
    }),
  }
}
