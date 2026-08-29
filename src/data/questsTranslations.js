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

// Catalan overrides for chained quests — same pattern as QUEST_TEXT_EN above,
// translated from the Spanish original instead.
export const QUEST_TEXT_CA = {
  'bienvenida-campus': {
    title: 'Benvingut al Campus',
    description: 'Troba els guies prop de la Gran Aula i mostra el teu progrés.',
    steps: [
      { prompt: 'Benvingut! Parla amb el Mag Novell perquè avaluï el teu progrés.' },
      { prompt: 'Arriba al nivell 2 i torna a veure\'m.' },
      { prompt: 'Ho has aconseguit! Recull la teva recompensa.' },
    ],
  },
  'circulo-confianza': {
    title: 'Cercle de Confiança',
    description: 'Connecta amb altres estudiants del campus.',
    steps: [
      { prompt: 'Per créixer al campus necessites aliats. Parla amb la Guineu Missatgera.' },
      { prompt: 'Afegeix almenys un amic des de la pàgina d\'Amics.' },
      { prompt: 'Molt bé! Recull la teva recompensa.' },
    ],
  },
  'bash-basico': {
    title: 'Primers Passos en Bash',
    description: 'BashMishi t\'ensenya les teves primeres comandes de terminal.',
    steps: [
      { prompt: 'Meu! Sóc BashMishi 🐾. Et vaig a ensenyar a parlar amb l\'ordinador fent servir Bash. Preparat per al teu primer terminal?' },
      {
        // terminal step — only checkpoints' text fields are overridden below;
        // `validate` keeps running against the raw input either way.
        checkpoints: [
          {
            instruction: 'Per començar, fes servir "echo" per mostrar un missatge en pantalla.',
            placeholder: 'echo "Hola Món"',
            success: '"echo" mostra text al terminal — és la primera cosa que aprèn tot programador.',
            hint: 'Escriu la paraula "echo" seguida d\'un missatge, per exemple: echo "Hola Món"',
          },
          {
            instruction: 'Ara escriu un comentari que expliqui què fa el teu script. En Bash, els comentaris comencen amb "#" i l\'ordinador els ignora — són per a les persones.',
            placeholder: '# Aquest script saluda l\'usuari',
            success: 'Molt bé! Els comentaris no s\'executen, però ajuden altres a entendre el codi més endavant.',
            hint: 'La línia ha de començar amb el símbol #, per exemple: # Aquest script saluda l\'usuari',
          },
          {
            instruction: 'Últim pas: combina "read" per demanar el nom de l\'usuari i "echo" per saludar-lo fent servir aquesta variable. Exemple:\nread -p "Com et dius? " nom\necho "Hola, $nom"',
            placeholder: 'read -p "Com et dius? " nom\necho "Hola, $nom"',
            success: 'Excel·lent! Acabes de combinar entrada (read) i sortida (echo) fent servir una variable. Això és un programa de veritat.',
            hint: 'Necessites una línia amb "read" que desi el nom en una variable, i una altra amb "echo" que faci servir aquesta variable amb "$".',
          },
        ],
      },
      { prompt: 'Ho has aconseguit! 🎉 Això és només el començament — aviat obrirem tot un món Bash. Per ara, recull la teva recompensa.' },
    ],
  },
}

// Japanese overrides for chained quests — same pattern as QUEST_TEXT_EN
// above, translated from the Spanish original instead.
export const QUEST_TEXT_JA = {
  'bienvenida-campus': {
    title: 'キャンパスへようこそ',
    description: 'グランドホール近くのガイドたちに会い、進捗を見せよう。',
    steps: [
      { prompt: 'ようこそ！新米魔導士に話しかけて、君の進捗を評価してもらおう。' },
      { prompt: 'レベル2に到達したら、また会いに来てね。' },
      { prompt: 'よくやった！報酬を受け取ろう。' },
    ],
  },
  'circulo-confianza': {
    title: '信頼の輪',
    description: 'キャンパスの他の生徒とつながろう。',
    steps: [
      { prompt: 'キャンパスで成長するには仲間が必要だ。伝令のキツネに話しかけよう。' },
      { prompt: 'フレンドページから少なくとも一人フレンドを追加しよう。' },
      { prompt: 'よくできました！報酬を受け取ろう。' },
    ],
  },
  'bash-basico': {
    title: 'Bashのはじめの一歩',
    description: 'バッシュミシがターミナルの最初のコマンドを教えてくれる。',
    steps: [
      { prompt: 'ニャー！僕はバッシュミシ 🐾。Bashを使ってコンピューターと話す方法を教えてあげよう。最初のターミナルの準備はいい？' },
        {
          // terminal step — only checkpoints' text fields are overridden below;
          // `validate` keeps running against the raw input either way.
          checkpoints: [
            {
              instruction: 'まずは"echo"を使って画面にメッセージを表示してみよう。',
              placeholder: 'echo "こんにちは世界"',
              success: '"echo"はターミナルにテキストを表示する — すべてのプログラマーが最初に学ぶことだ。',
              hint: '"echo"という単語の後にメッセージを続けて入力しよう。例：echo "こんにちは世界"',
            },
            {
              instruction: '次はスクリプトが何をするかを説明するコメントを書いてみよう。Bashではコメントは"#"で始まり、コンピューターは無視する — 人間のためのものだ。',
              placeholder: '# このスクリプトはユーザーに挨拶します',
              success: 'よくできた！コメントは実行されないが、後で他の人がコードを理解するのに役立つよ。',
              hint: '行は#記号で始める必要がある。例：# このスクリプトはユーザーに挨拶します',
            },
            {
              instruction: '最後のステップ："read"でユーザーの名前を尋ね、"echo"でその変数を使って挨拶しよう。例：\nread -p "お名前は？ " name\necho "こんにちは、$name"',
              placeholder: 'read -p "お名前は？ " name\necho "こんにちは、$name"',
              success: '素晴らしい！変数を使って入力（read）と出力（echo）を組み合わせたね。これは本物のプログラムだ。',
              hint: '名前を変数に格納する"read"の行と、"$"でその変数を使う"echo"の行が必要だよ。',
            },
          ],
        },
      { prompt: 'やったね！🎉 これはまだ始まりに過ぎない — もうすぐBashの世界を丸ごと公開するよ。今のところは報酬を受け取ってね。' },
    ],
  },
}

// Chinese (Simplified) overrides for chained quests — same pattern as
// QUEST_TEXT_EN above, translated from the Spanish original instead.
export const QUEST_TEXT_ZH = {
  'bienvenida-campus': {
    title: '欢迎来到校园',
    description: '在大礼堂附近见见向导，展示你的进度。',
    steps: [
      { prompt: '欢迎！去和新手法师聊聊，让他评估一下你的进度。' },
      { prompt: '达到2级后再来找我。' },
      { prompt: '你做到了！领取你的奖励吧。' },
    ],
  },
  'circulo-confianza': {
    title: '信任圈',
    description: '和校园里的其他学生建立联系。',
    steps: [
      { prompt: '要在校园里成长，你需要盟友。去和送信狐狸聊聊。' },
      { prompt: '在好友页面至少添加一位好友。' },
      { prompt: '做得好！领取你的奖励吧。' },
    ],
  },
  'bash-basico': {
    title: 'Bash 的第一步',
    description: 'BashMishi 教你第一批终端命令。',
    steps: [
      { prompt: '喵！我是 BashMishi 🐾。我要教你用 Bash 和电脑对话。准备好上你的第一堂终端课了吗？' },
        {
          // terminal step — only checkpoints' text fields are overridden below;
          // `validate` keeps running against the raw input either way.
          checkpoints: [
            {
              instruction: '首先，用 "echo" 在屏幕上打印一条消息。',
              placeholder: 'echo "你好，世界"',
              success: '"echo" 会把文本打印到终端——这是每个程序员学的第一件事。',
              hint: '输入单词 "echo"，后面跟一条消息，例如：echo "你好，世界"',
            },
            {
              instruction: '现在写一条注释，说明你的脚本是做什么的。在 Bash 里，注释以 "#" 开头，电脑会忽略它们——它们是写给人看的。',
              placeholder: '# 这个脚本会向用户问好',
              success: '做得好！注释不会被执行，但能帮助别人以后理解这段代码。',
              hint: '这一行必须以 # 符号开头，例如：# 这个脚本会向用户问好',
            },
            {
              instruction: '最后一步：结合使用 "read" 来询问用户的名字，再用 "echo" 通过这个变量向他问好。例如：\nread -p "你叫什么名字？" name\necho "你好，$name"',
              placeholder: 'read -p "你叫什么名字？" name\necho "你好，$name"',
              success: '太棒了！你刚刚用一个变量结合了输入（read）和输出（echo）。这就是一个真正的程序。',
              hint: '你需要一行用 "read" 把名字存进变量，另一行用 "echo" 通过 "$" 使用这个变量。',
            },
          ],
        },
      { prompt: '你做到了！🎉 这仅仅是开始——我们很快会开放一整个 Bash 的世界。现在，先去领取你的奖励吧。' },
    ],
  },
}

// Deep-merges the EN/FR/IT/CA/JA/ZH override on top of the original quest
// only when lang is 'en', 'fr', 'it', 'ca', 'ja' or 'zh': title/description
// at the top level, then each step's `prompt` merged in by position, and
// (for the one quest with them) each checkpoint's text fields merged in by
// position too. Everything else (npcId, type, check, validate) always comes
// from the original `quest`.
export function localizeQuest(quest, lang) {
  if (!quest) return quest
  const overrides = lang === 'en' ? QUEST_TEXT_EN[quest.id] : lang === 'fr' ? QUEST_TEXT_FR[quest.id] : lang === 'it' ? QUEST_TEXT_IT[quest.id] : lang === 'ca' ? QUEST_TEXT_CA[quest.id] : lang === 'ja' ? QUEST_TEXT_JA[quest.id] : lang === 'zh' ? QUEST_TEXT_ZH[quest.id] : null
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
