// English overrides for VR NPC dialogue — same pattern as
// categoryTranslations.js / courseCatalogTranslations.js: a flat dictionary
// keyed by the NPC's stable `id`, spread on top of the original entry only
// when lang === 'en'. Keeps vrNpcRegistry.js (the Spanish source of truth,
// its `id`s referenced everywhere else — missions, quests, proximity
// tracking) completely untouched.
//
// Jokes/personality are adapted rather than translated word-for-word where a
// pun wouldn't survive the trip (Oliver's cat puns, Einstein's physics puns).
export const VR_NPC_DIALOGUE_EN = {
  // ── Mission NPCs (VR_NPCS) ─────────────────────────────────────────────
  'mago-misiones': {
    dialogue: 'Greetings, traveler! Talk to your mascot to begin your adventure.',
  },
  director: {
    dialogue: 'Complete your first class and come back to see me for your reward.',
  },
  explorador: {
    dialogue: "Activate an item from your inventory to prove you're ready.",
  },
  zafir: {
    dialogue: 'Welcome to my corner! Buy something in the Shop and come back for your prize.',
  },
  bibliotecaria: {
    dialogue: 'Open a book from the Library and tell me what you learned.',
  },
  sastre: {
    dialogue: "Change your mascot's look and show it off with pride.",
  },
  'guardiana-codigo': {
    dialogue: 'Only those who master programming may pass! Do you dare challenge me?',
  },
  'oraculo-cyber': {
    dialogue: "The network's secrets lie here. Only those who know how to face them may advance.",
  },
  'maestro-ia': {
    dialogue: "Artificial intelligence isn't magic… but to defeat me, you'll almost need some.",
  },
  'viajero-encapuchado': {
    dialogue: "I've traveled the whole campus. I can guide you if you need it.",
  },
  'mago-novato': {
    dialogue: "I'm still learning, but I can measure your progress.",
  },
  'bibliotecario-menor': {
    dialogue: 'Books teach, but friends accompany.',
  },
  'zorro-mensajero': {
    dialogue: 'I carry messages between students. Do you have friends on campus yet?',
  },
  'guardian-lagarto': {
    dialogue: 'Whoever builds their circle of trust builds their future.',
  },
  'bash-mishi': {
    dialogue: 'Meow. Want to learn how to talk to the computer?',
  },

  // ── Shopkeeper ───────────────────────────────────────────────────────────
  shopkeeper: {
    dialogue: "Welcome, traveler! I'm Korin, the Campus merchant. I have unique items for your adventure. Want to see my wares?",
    lines: [
      'Welcome to my stall! I have the best items on campus. 🛒',
      'Looking for something special? Talk to me to see the shop.',
      "I've got special deals today. Don't miss them!",
      'Campus coins are welcome here! 🪙',
      'Did you buy the camera yet? It unlocks the photo gallery. 📷',
      "With the right items, your adventure is way more fun!",
      'The campus radio has the best music in the metaverse. 🎵',
      'Did you know active items give you an edge in your missions?',
    ],
  },

  // ── Jafet ────────────────────────────────────────────────────────────────
  jafet: {
    lines: [
      'Welcome to the campus. Your adventure begins here. 🌟',
      'Every day you study is a spell etched into your memory. ✨',
      "Have you completed today's missions? Knowledge awaits you.",
      'Master one skill at a time. Mastery is a matter of practice.',
      'The Virtual Campus holds many secrets. Explore every corner!',
      'Magic and code have something in common: both require precision.',
      "Did you know you can change your mascot's look in My Team?",
      'The World Tree holds the path to the most advanced classes.',
      'Remember: the knowledge you gain here is yours forever.',
      'There are no shortcuts in magic. None in programming either. 🪄',
      'Every mistake is a lesson in disguise. Learn from it and keep going.',
      'Have you visited the Amphitheater yet? Some experiences can only be lived live.',
    ],
  },

  // ── Oliver ───────────────────────────────────────────────────────────────
  oliver: {
    lines: [
      // --- Welcome & motivational ---
      "Hi! I'm Oliver 🐾",
      'Have you explored the whole campus yet?',
      'Have a great day of learning!',
      "Remember: practice makes perfect. You've got this project!",
      'Taking breaks is vital for creativity. I take about 15 a day. 😴',
      "If your code won't compile, explain it to me. I'm an excellent rubber duck... cat. 🐈",

      // --- Digital Campus explanations ---
      'Press C to chat with other students and network.',
      'Remember to complete your daily missions to earn coins.',
      'Get close to the info boards to see your upcoming available classes. 📚',
      'The coins you earn will help you customize your avatar. Save up!',
      'If you get lost, check the interactive map on screen. 🗺️',
      'Every class you finish gives you experience points. Level up and unlock surprises!',
      "Don't forget to check your inventory — I sometimes hide little gifts in there. 🎁",
      'You can move faster by holding Shift. But watch out for my tail!',
      "Did you see the rest area? It's perfect for chatting about your projects with others.",
      'Remember to save your progress in your profile before leaving the campus. 💾',

      // --- Programming/CS jokes ---
      'Know why programmers prefer dark mode? Because light attracts bugs. 🐛',
      "I caught a mouse yesterday... but it had a USB cable and didn't taste great. 🖱️",
      "There are 10 types of cats in the world: those who understand binary and those who don't.",
      'My favorite framework is Purr-eact... Meow!',
      'I tried fixing the campus router, but I just laid on top of it because it was warm. 💤',
      'What does one bit say to another? See you on the bus! 🚌',
      'Error 404: Kibble not found. I need to recharge from the server!',
      'Good code is like a good purr: steady, clean, and uninterrupted.',
      "I have nine lives, but none of them go to production without passing QA. 🛡️",
      'This campus flies so fast, it almost feels like it was built with Astro. 🚀',

      // --- UI/UX design jokes ---
      "If you use Comic Sans in your assignments, I'll make your code fail to compile. Just kidding! (Or am I?). 😼",
      'The client always asks to "make the logo bigger." I say the food bowl should be bigger. 🍲',
      'CMYK or RGB? I prefer R-G-Meow. 🎨',
      'Make sure your elements are well aligned! My feline OCD makes me check the padding on the whole campus.',
      'That #000000 looks very elegant, but it needs a bit more contrast with my orange fur. 🟧',
      "UI/UX Design: good design is intuitive, like knowing exactly when it's dinner time without looking at a clock.",
      'I hate when they tell me to "make the design pop more." What do they want, neon lights on my fur? ✨',

      // --- Hacker cat / real cat personality ---
      'Cybersecurity matters: please never use "meow123" as your password. 🔒',
      "In cybersecurity I follow the Zero Trust model: I never trust that my food bowl is full, I always verify it myself.",
      'As a proper hacker cat, I prefer walking on all four paws to keep a better eye on the servers. No walking on two legs around here. 🐾',
      "Careful! You almost stepped on my paws. Oh wait, we're virtual. All good. 😹",
    ],
  },

  // ── Einstein ─────────────────────────────────────────────────────────────
  einstein: {
    lines: [
      // --- Originals (Construction & Relativity) ---
      'Did you know time is relative? That\'s why this section has been "almost ready" for quite a while now. ⏳',
      'E = mc²... lately the "C" also stands for "Construction." 🚧',
      "To me this campus is already finished. For you, give it a few more days: it all depends on the observer. 😄",
      'Hello! I\'m Albert. I came to explain relativity and why the "Coming Soon" button never changes its frame of reference.',
      "A tip: if something on the site doesn't work, it's not a bug... it's just spacetime curvature. 🌌",

      // --- Curious facts about Physics & CS ---
      'Did you know sunlight takes 8 minutes to reach Earth? About as long as a heavy texture takes to load... lucky we use Astro and move at the speed of light. ⚡',
      "Gravity isn't responsible for people falling in love with learning on this 3D campus. 🍎",
      "Two things are infinite: the universe and a webpage's scroll bar... and I'm not sure about the universe. 🌌",
      'If we traveled at the speed of light, the campus would already be 100% finished, but our masses would be infinite. 🏃‍♂️💨',
      'Do I look a bit polygonal today? That\'s because my atoms were exported straight as a .glb file.',
      "Imagination is more important than knowledge. That's why I imagine this part of the map already has buildings. 💭",
      "A black hole absorbs everything, even students' bug reports. 🕳️",
      "Did you know time passes slower near a massive object? That's why the last class on Friday feels eternal. ⏱️",
      "I've calculated asteroid trajectories, but centering a div in CSS still feels like a cosmic mystery to me. 📐",
      "The universe's entropy always increases, just like the number of lines of code on this platform. 📈",
      'If I move fast enough, "Coming Soon" will turn into "Available." Quantum physics! ⚛️',
      "We can't solve problems by thinking the same way we did when we created them. Maybe that's why you need to clear your browser cache. 🔄",
      "God doesn't play dice with the universe... but sometimes code behaves probabilistically. 🎲",
      "Did you know there's no up or down in space? Just like when the camera used to glitch in the early versions of this world. 🚀",
      "Quantum entanglement explains how you can be in two places at once, just like my thoughts while I wait for this to compile. 🧠",
      'Matter and energy are the same thing in different forms. Just like coffee and code. ☕',
      "If the universe is expanding, why does the server's storage space always seem to shrink? 💾",
      'Did you know atomic clocks in orbit run faster than on Earth? Maybe we should have hosted the server on a satellite. 🛰️',
      "Everything should be made as simple as possible, but no simpler. Great philosophy for this campus's interface design. 🎨",
      "A photon has no mass, so it can't weigh anything. I don't have mass in this virtual environment either — I'm pure mathematical code. 💻",
      'Did you know the sun loses 4 million tons of mass every second? I lose my patience when my ping is too high. ☀️',
      'The shortest distance between two points is a straight line... unless spacetime or dynamic routes are curved. 🌐',
      "Heisenberg's uncertainty principle states we can't precisely know both the position and the speed of a software bug. 🐛",
      'Did you know atoms are 99.9999% empty space? That explains why this part of the map still looks so empty. 🏗️',
      'Energy is neither created nor destroyed, only transformed... into heat from your graphics card rendering my textures. 🌡️',
      "Schrödinger's cat is both alive and dead at the same time. Just like that feature that's still in beta. 📦",
      "By the way, I've seen Oliver the cat around here. Glad to see him walking realistically on all four paws, no weird quantum superpositions. 🐈",
      "If you see me floating a few millimeters above the ground, it's not a coordinate bug, it's the electromagnetic repulsion of electrons. 🧲",
      "Sad state of affairs — it's easier to split an atom than to finish a code refactor. 💥",
      "Did you know Earth rotates at about 1670 km/h? And yet it feels like we're standing still admiring the digital scenery. 🌍",
      'The fourth dimension is time. The fifth is the patience needed to wait for new modules to launch. ⏳',
      "If you watch the campus from a train moving at nearly the speed of light, you'll see the color palette redshift. 🚂",
      "Any fool can know; the point is to understand. That's why you're at this school — keep exploring! 🎓",
      'Did you know the photoelectric effect explains how solar panels generate electricity? Great for keeping our servers running. ⚡',
      'Space and time are modes in which we think, not conditions in which we live. Or something like that, according to whoever set up the WebGL camera. 🧊',
    ],
  },
}

// French overrides for VR NPC dialogue — same pattern as VR_NPC_DIALOGUE_EN
// above, just translated instead of the Spanish original. Jokes/personality
// are adapted rather than translated word-for-word where a pun wouldn't
// survive the trip (Oliver's cat puns, Einstein's physics puns).
export const VR_NPC_DIALOGUE_FR = {
  // ── Mission NPCs (VR_NPCS) ─────────────────────────────────────────────
  'mago-misiones': {
    dialogue: 'Salutations, voyageur ! Parle à ta mascotte pour commencer ton aventure.',
  },
  director: {
    dialogue: 'Termine ton premier cours et reviens me voir pour ta récompense.',
  },
  explorador: {
    dialogue: 'Active un objet de ton inventaire pour prouver que tu es prêt.',
  },
  zafir: {
    dialogue: 'Bienvenue dans mon coin ! Achète quelque chose à la Boutique et reviens chercher ton prix.',
  },
  bibliotecaria: {
    dialogue: 'Ouvre un livre de la Bibliothèque et raconte-moi ce que tu as appris.',
  },
  sastre: {
    dialogue: "Change l'apparence de ta mascotte et affiche-la fièrement.",
  },
  'guardiana-codigo': {
    dialogue: 'Seuls ceux qui maîtrisent la programmation peuvent passer ! Oses-tu me défier ?',
  },
  'oraculo-cyber': {
    dialogue: 'Les secrets du réseau se trouvent ici. Seuls ceux qui savent y faire face peuvent avancer.',
  },
  'maestro-ia': {
    dialogue: "L'intelligence artificielle n'est pas de la magie… mais pour me vaincre, il t'en faudra presque.",
  },
  'viajero-encapuchado': {
    dialogue: "J'ai parcouru tout le campus. Je peux te guider si tu en as besoin.",
  },
  'mago-novato': {
    dialogue: "J'apprends encore, mais je peux mesurer ta progression.",
  },
  'bibliotecario-menor': {
    dialogue: 'Les livres enseignent, mais les amis accompagnent.',
  },
  'zorro-mensajero': {
    dialogue: 'Je transporte des messages entre élèves. As-tu déjà des amis sur le campus ?',
  },
  'guardian-lagarto': {
    dialogue: 'Qui construit son cercle de confiance construit son avenir.',
  },
  'bash-mishi': {
    dialogue: "Miaou. Tu veux apprendre à parler à l'ordinateur ?",
  },

  // ── Shopkeeper ───────────────────────────────────────────────────────────
  shopkeeper: {
    dialogue: 'Bienvenue, voyageur ! Je suis Korin, la marchande du Campus. J\'ai des objets uniques pour ton aventure. Tu veux voir ma marchandise ?',
    lines: [
      'Bienvenue à mon étal ! J\'ai les meilleurs objets du campus. 🛒',
      'Tu cherches quelque chose de spécial ? Parle-moi pour voir la boutique.',
      "J'ai des offres spéciales aujourd'hui. Ne les rate pas !",
      'Les pièces du campus sont acceptées ici ! 🪙',
      'Tu as déjà acheté l\'appareil photo ? Il débloque la galerie de photos. 📷',
      'Avec les bons objets, ton aventure est bien plus amusante !',
      'La radio du campus joue la meilleure musique du métavers. 🎵',
      'Savais-tu que les objets actifs te donnent un avantage dans tes missions ?',
    ],
  },

  // ── Jafet ────────────────────────────────────────────────────────────────
  jafet: {
    lines: [
      'Bienvenue sur le campus. Ton aventure commence ici. 🌟',
      'Chaque jour d\'étude est un sortilège gravé dans ta mémoire. ✨',
      "As-tu terminé les missions du jour ? Le savoir t'attend.",
      'Maîtrise une compétence à la fois. La maîtrise est une question de pratique.',
      'Le Campus Virtuel recèle de nombreux secrets. Explore chaque recoin !',
      'La magie et le code ont un point commun : tous deux exigent de la précision.',
      "Savais-tu que tu peux changer l'apparence de ta mascotte dans Mon Équipe ?",
      "L'Arbre-Monde détient le chemin vers les classes les plus avancées.",
      "Souviens-toi : le savoir que tu acquiers ici t'appartient pour toujours.",
      "Il n'y a pas de raccourcis en magie. Ni en programmation non plus. 🪄",
      'Chaque erreur est une leçon déguisée. Apprends-en et continue.',
      "As-tu déjà visité l'Amphithéâtre ? Certaines expériences ne se vivent qu'en direct.",
    ],
  },

  // ── Oliver ───────────────────────────────────────────────────────────────
  oliver: {
    lines: [
      // --- Welcome & motivational ---
      'Salut ! Je suis Oliver 🐾',
      'Tu as déjà exploré tout le campus ?',
      "Passe une excellente journée d'apprentissage !",
      "Souviens-toi : c'est en forgeant qu'on devient forgeron. Ce projet est pour toi !",
      'Faire des pauses est essentiel pour la créativité. J\'en fais environ 15 par jour. 😴',
      "Si ton code ne compile pas, explique-le-moi. Je suis un excellent canard... chat en plastique. 🐈",

      // --- Digital Campus explanations ---
      'Appuie sur C pour discuter avec d\'autres élèves et réseauter.',
      "N'oublie pas de terminer tes missions quotidiennes pour gagner des pièces.",
      "Approche-toi des panneaux d'information pour voir tes prochains cours disponibles. 📚",
      'Les pièces que tu gagnes t\'aideront à personnaliser ton avatar. Économise !',
      'Si tu te perds, consulte la carte interactive à l\'écran. 🗺️',
      'Chaque cours terminé te donne des points d\'expérience. Monte de niveau et débloque des surprises !',
      "N'oublie pas de vérifier ton inventaire — j'y cache parfois des petits cadeaux. 🎁",
      'Tu peux te déplacer plus vite en maintenant Maj. Mais attention à ma queue !',
      "As-tu vu l'aire de repos ? C'est parfait pour discuter de tes projets avec les autres.",
      'N\'oublie pas de sauvegarder ta progression dans ton profil avant de quitter le campus. 💾',

      // --- Programming/CS jokes ---
      'Tu sais pourquoi les programmeurs préfèrent le mode sombre ? Parce que la lumière attire les bugs. 🐛',
      "J'ai attrapé une souris hier... mais elle avait un câble USB et n'avait pas très bon goût. 🖱️",
      'Il y a 10 types de chats dans le monde : ceux qui comprennent le binaire et ceux qui ne le comprennent pas.',
      'Mon framework préféré, c\'est Ronron-eact... Miaou !',
      "J'ai essayé de réparer le routeur du campus, mais je me suis juste couché dessus parce qu'il était chaud. 💤",
      'Que dit un bit à un autre bit ? On se voit sur le bus ! 🚌',
      'Erreur 404 : croquettes introuvables. Je dois me recharger depuis le serveur !',
      'Un bon code, c\'est comme un bon ronronnement : régulier, propre et ininterrompu.',
      "J'ai neuf vies, mais aucune ne part en production sans passer par les tests QA. 🛡️",
      'Ce campus est tellement rapide qu\'on dirait presque qu\'il a été construit avec Astro. 🚀',

      // --- UI/UX design jokes ---
      'Si tu utilises la police Comic Sans dans tes devoirs, je ferai échouer la compilation de ton code. Je plaisante ! (Ou pas ?). 😼',
      'Le client demande toujours d\'« agrandir le logo ». Moi je dis qu\'il faudrait agrandir la gamelle. 🍲',
      'CMJN ou RVB ? Je préfère le R-V-Miaou. 🎨',
      'Assure-toi que tes éléments sont bien alignés ! Mes TOC de félin me poussent à vérifier le padding sur tout le campus.',
      'Ce #000000 a l\'air très élégant, mais il faudrait un peu plus de contraste avec mon pelage orange. 🟧',
      "Design UI/UX : un bon design est intuitif, comme savoir exactement quand c'est l'heure du dîner sans regarder l'horloge.",
      'Je déteste quand on me dit de « faire ressortir davantage le design ». Ils veulent quoi, des néons sur mon pelage ? ✨',

      // --- Hacker cat / real cat personality ---
      'La cybersécurité, c\'est important : n\'utilise jamais « miaou123 » comme mot de passe. 🔒',
      "En cybersécurité, je suis le modèle Zero Trust : je ne fais jamais confiance à l'idée que ma gamelle est pleine, je vérifie toujours moi-même.",
      "En tant que vrai chat hacker, je préfère marcher à quatre pattes pour mieux surveiller les serveurs. Pas de marche sur deux pattes ici. 🐾",
      "Attention ! Tu as failli marcher sur mes pattes. Ah non, on est virtuels. Tout va bien. 😹",
    ],
  },

  // ── Einstein ─────────────────────────────────────────────────────────────
  einstein: {
    lines: [
      // --- Originals (Construction & Relativity) ---
      'Savais-tu que le temps est relatif ? C\'est pour ça que cette section est « presque prête » depuis un bon moment déjà. ⏳',
      'E = mc²... ces derniers temps, le « C » veut aussi dire « Chantier ». 🚧',
      "Pour moi, ce campus est déjà terminé. Pour toi, laisse-lui encore quelques jours : tout dépend de l'observateur. 😄",
      'Bonjour ! Je suis Albert. Je suis venu expliquer la relativité et pourquoi le bouton « Bientôt disponible » ne change jamais de référentiel.',
      "Un conseil : si quelque chose ne marche pas sur le site, ce n'est pas un bug... c'est juste une courbure de l'espace-temps. 🌌",

      // --- Curious facts about Physics & CS ---
      'Savais-tu que la lumière du soleil met 8 minutes à atteindre la Terre ? À peu près le temps que met une texture lourde à charger... heureusement qu\'on utilise Astro et qu\'on va à la vitesse de la lumière. ⚡',
      "La gravité n'est pas responsable du fait qu'on tombe amoureux de l'apprentissage sur ce campus 3D. 🍎",
      "Deux choses sont infinies : l'univers et la barre de défilement d'une page web... et je ne suis pas sûr pour l'univers. 🌌",
      'Si on voyageait à la vitesse de la lumière, le campus serait déjà terminé à 100 %, mais nos masses seraient infinies. 🏃‍♂️💨',
      'J\'ai l\'air un peu polygonal aujourd\'hui ? C\'est parce que mes atomes ont été exportés directement en fichier .glb.',
      "L'imagination est plus importante que le savoir. C'est pour ça que j'imagine que cette partie de la carte a déjà des bâtiments. 💭",
      "Un trou noir absorbe tout, même les rapports de bugs des élèves. 🕳️",
      "Savais-tu que le temps passe plus lentement près d'un objet massif ? C'est pour ça que le dernier cours du vendredi semble éternel. ⏱️",
      "J'ai calculé des trajectoires d'astéroïdes, mais centrer une div en CSS reste pour moi un mystère cosmique. 📐",
      "L'entropie de l'univers augmente toujours, tout comme le nombre de lignes de code sur cette plateforme. 📈",
      'Si je bouge assez vite, « Bientôt disponible » se transformera en « Disponible ». Physique quantique ! ⚛️',
      "On ne peut pas résoudre les problèmes en pensant de la même façon qu'au moment où on les a créés. C'est peut-être pour ça qu'il faut vider le cache de ton navigateur. 🔄",
      "Dieu ne joue pas aux dés avec l'univers... mais parfois le code se comporte de façon probabiliste. 🎲",
      "Savais-tu qu'il n'y a ni haut ni bas dans l'espace ? Un peu comme quand la caméra buguait dans les premières versions de ce monde. 🚀",
      "L'intrication quantique explique comment on peut être à deux endroits à la fois, comme mes pensées pendant que j'attends que ça compile. 🧠",
      'La matière et l\'énergie sont la même chose sous des formes différentes. Tout comme le café et le code. ☕',
      "Si l'univers est en expansion, pourquoi l'espace de stockage du serveur semble-t-il toujours rétrécir ? 💾",
      'Savais-tu que les horloges atomiques en orbite avancent plus vite que sur Terre ? On aurait peut-être dû héberger le serveur sur un satellite. 🛰️',
      "Tout devrait être aussi simple que possible, mais pas plus simple. Belle philosophie pour le design de l'interface de ce campus. 🎨",
      "Un photon n'a pas de masse, donc il ne peut rien peser. Moi non plus je n'ai pas de masse dans cet environnement virtuel — je suis du code mathématique pur. 💻",
      'Savais-tu que le soleil perd 4 millions de tonnes de masse chaque seconde ? Moi, je perds patience quand mon ping est trop élevé. ☀️',
      'La distance la plus courte entre deux points est une ligne droite... sauf si l\'espace-temps ou les routes dynamiques sont courbes. 🌐',
      "Le principe d'incertitude de Heisenberg dit qu'on ne peut pas connaître précisément à la fois la position et la vitesse d'un bug logiciel. 🐛",
      'Savais-tu que les atomes sont composés à 99,9999 % de vide ? Ça explique pourquoi cette partie de la carte a encore l\'air si vide. 🏗️',
      'L\'énergie ne se crée ni ne se détruit, elle se transforme seulement... en chaleur émise par ta carte graphique en train de rendre mes textures. 🌡️',
      "Le chat de Schrödinger est à la fois vivant et mort. Tout comme cette fonctionnalité qui est encore en bêta. 📦",
      "Au fait, j'ai vu Oliver le chat dans le coin. Content de le voir marcher de façon réaliste à quatre pattes, sans étranges superpositions quantiques. 🐈",
      "Si tu me vois flotter à quelques millimètres du sol, ce n'est pas un bug de coordonnées, c'est la répulsion électromagnétique des électrons. 🧲",
      "Triste constat — il est plus facile de scinder un atome que de terminer un refactor de code. 💥",
      "Savais-tu que la Terre tourne à environ 1670 km/h ? Et pourtant on a l'impression d'être immobiles à admirer le paysage numérique. 🌍",
      'La quatrième dimension, c\'est le temps. La cinquième, c\'est la patience nécessaire pour attendre le lancement des nouveaux modules. ⏳',
      "Si tu observes le campus depuis un train se déplaçant presque à la vitesse de la lumière, tu verras la palette de couleurs se décaler vers le rouge. 🚂",
      "N'importe quel idiot peut savoir ; l'important, c'est de comprendre. C'est pour ça que tu es dans cette école — continue à explorer ! 🎓",
      'Savais-tu que l\'effet photoélectrique explique comment les panneaux solaires produisent de l\'électricité ? Idéal pour garder nos serveurs en marche. ⚡',
      'L\'espace et le temps sont des modes de pensée, pas des conditions d\'existence. Ou un truc du genre, selon celui qui a configuré la caméra WebGL. 🧊',
    ],
  },
}

// Italian overrides for VR NPC dialogue — same pattern as VR_NPC_DIALOGUE_EN
// above, just translated instead of the Spanish original. Jokes/personality
// are adapted rather than translated word-for-word where a pun wouldn't
// survive the trip (Oliver's cat puns, Einstein's physics puns).
export const VR_NPC_DIALOGUE_IT = {
  // ── Mission NPCs (VR_NPCS) ─────────────────────────────────────────────
  'mago-misiones': {
    dialogue: 'Saluti, viaggiatore! Parla con la tua mascotte per iniziare la tua avventura.',
  },
  director: {
    dialogue: 'Completa la tua prima lezione e torna a trovarmi per la tua ricompensa.',
  },
  explorador: {
    dialogue: 'Attiva un oggetto dal tuo inventario per dimostrare che sei pronto.',
  },
  zafir: {
    dialogue: 'Benvenuto nel mio angolo! Compra qualcosa al Negozio e torna per il tuo premio.',
  },
  bibliotecaria: {
    dialogue: 'Apri un libro della Biblioteca e raccontami cosa hai imparato.',
  },
  sastre: {
    dialogue: 'Cambia il look della tua mascotte e mostralo con orgoglio.',
  },
  'guardiana-codigo': {
    dialogue: 'Solo chi padroneggia la programmazione può passare! Osi sfidarmi?',
  },
  'oraculo-cyber': {
    dialogue: 'I segreti della rete si trovano qui. Solo chi sa affrontarli può avanzare.',
  },
  'maestro-ia': {
    dialogue: "L'intelligenza artificiale non è magia… ma per sconfiggermi, ti servirà quasi.",
  },
  'viajero-encapuchado': {
    dialogue: 'Ho viaggiato per tutto il campus. Posso guidarti se ne hai bisogno.',
  },
  'mago-novato': {
    dialogue: 'Sto ancora imparando, ma posso misurare i tuoi progressi.',
  },
  'bibliotecario-menor': {
    dialogue: 'I libri insegnano, ma gli amici accompagnano.',
  },
  'zorro-mensajero': {
    dialogue: 'Porto messaggi tra gli studenti. Hai già amici nel campus?',
  },
  'guardian-lagarto': {
    dialogue: 'Chi costruisce il proprio cerchio di fiducia costruisce il proprio futuro.',
  },
  'bash-mishi': {
    dialogue: 'Miao. Vuoi imparare a parlare con il computer?',
  },

  // ── Shopkeeper ───────────────────────────────────────────────────────────
  shopkeeper: {
    dialogue: 'Benvenuto, viaggiatore! Sono Korin, la mercante del Campus. Ho oggetti unici per la tua avventura. Vuoi vedere la mia merce?',
    lines: [
      'Benvenuto al mio banco! Ho i migliori oggetti del campus. 🛒',
      'Cerchi qualcosa di speciale? Parlami per vedere il negozio.',
      'Oggi ho delle offerte speciali. Non perdertele!',
      'Le monete del campus sono benvenute qui! 🪙',
      'Hai già comprato la fotocamera? Sblocca la galleria fotografica. 📷',
      'Con gli oggetti giusti, la tua avventura è molto più divertente!',
      'La radio del campus ha la musica migliore del metaverso. 🎵',
      'Sapevi che gli oggetti attivi ti danno un vantaggio nelle tue missioni?',
    ],
  },

  // ── Jafet ────────────────────────────────────────────────────────────────
  jafet: {
    lines: [
      'Benvenuto nel campus. La tua avventura inizia qui. 🌟',
      'Ogni giorno di studio è un incantesimo inciso nella tua memoria. ✨',
      'Hai completato le missioni di oggi? La conoscenza ti aspetta.',
      "Padroneggia un'abilità alla volta. La maestria è una questione di pratica.",
      'Il Campus Virtuale nasconde molti segreti. Esplora ogni angolo!',
      'Magia e codice hanno qualcosa in comune: entrambi richiedono precisione.',
      'Sapevi che puoi cambiare il look della tua mascotte ne La Mia Squadra?',
      "L'Albero del Mondo custodisce il cammino verso le classi più avanzate.",
      'Ricorda: la conoscenza che ottieni qui è tua per sempre.',
      'Non esistono scorciatoie in magia. Nemmeno in programmazione. 🪄',
      'Ogni errore è una lezione travestita. Impara da esso e continua.',
      "Hai già visitato l'Anfiteatro? Alcune esperienze si possono vivere solo dal vivo.",
    ],
  },

  // ── Oliver ───────────────────────────────────────────────────────────────
  oliver: {
    lines: [
      // --- Welcome & motivational ---
      'Ciao! Sono Oliver 🐾',
      'Hai già esplorato tutto il campus?',
      'Buona giornata di studio!',
      'Ricorda: la pratica rende perfetti. Questo progetto è alla tua portata!',
      'Fare pause è vitale per la creatività. Io ne faccio circa 15 al giorno. 😴',
      "Se il tuo codice non compila, spiegamelo. Sono un'ottima anatra di gomma... gatto. 🐈",

      // --- Digital Campus explanations ---
      'Premi C per chattare con altri studenti e fare networking.',
      'Ricorda di completare le tue missioni giornaliere per guadagnare monete.',
      'Avvicinati alle bacheche informative per vedere le tue prossime lezioni disponibili. 📚',
      'Le monete che guadagni ti aiuteranno a personalizzare il tuo avatar. Risparmia!',
      'Se ti perdi, controlla la mappa interattiva sullo schermo. 🗺️',
      'Ogni lezione che completi ti dà punti esperienza. Sali di livello e sblocca sorprese!',
      'Non dimenticare di controllare il tuo inventario — a volte ci nascondo dentro piccoli regali. 🎁',
      'Puoi muoverti più veloce tenendo premuto Shift. Ma attento alla mia coda!',
      "Hai visto l'area relax? È perfetta per parlare dei tuoi progetti con gli altri.",
      'Ricorda di salvare i tuoi progressi nel tuo profilo prima di lasciare il campus. 💾',

      // --- Programming/CS jokes ---
      'Sai perché i programmatori preferiscono la modalità scura? Perché la luce attira i bug. 🐛',
      "Ieri ho catturato un topo... ma aveva un cavo USB e non aveva un buon sapore. 🖱️",
      'Ci sono 10 tipi di gatti al mondo: quelli che capiscono il binario e quelli che non lo capiscono.',
      'Il mio framework preferito è Fusa-eact... Miao!',
      'Ho provato a riparare il router del campus, ma mi sono solo sdraiato sopra perché era caldo. 💤',
      'Cosa dice un bit a un altro bit? Ci vediamo sul bus! 🚌',
      'Errore 404: crocchette non trovate. Devo ricaricarmi dal server!',
      'Un buon codice è come un buon ronfare: costante, pulito e ininterrotto.',
      'Ho nove vite, ma nessuna va in produzione senza passare il QA. 🛡️',
      'Questo campus vola così veloce, sembra quasi costruito con Astro. 🚀',

      // --- UI/UX design jokes ---
      'Se usi il Comic Sans nei tuoi compiti, farò fallire la compilazione del tuo codice. Sto scherzando! (O no?). 😼',
      "Il cliente chiede sempre di \"ingrandire il logo\". Io dico che dovrebbe ingrandirsi la ciotola del cibo. 🍲",
      'CMYK o RGB? Io preferisco R-G-Miao. 🎨',
      'Assicurati che i tuoi elementi siano ben allineati! Il mio disturbo ossessivo felino mi fa controllare il padding di tutto il campus.',
      'Quel #000000 sembra molto elegante, ma serve un po\' più contrasto con il mio pelo arancione. 🟧',
      "UI/UX Design: un buon design è intuitivo, come sapere esattamente quando è ora di cena senza guardare l'orologio.",
      'Odio quando mi dicono di "far risaltare di più il design". Cosa vogliono, luci al neon sul mio pelo? ✨',

      // --- Hacker cat / real cat personality ---
      'La cybersicurezza è importante: per favore non usare mai "miao123" come password. 🔒',
      'Nella cybersicurezza seguo il modello Zero Trust: non do mai per scontato che la mia ciotola sia piena, verifico sempre di persona.',
      'Da vero gatto hacker, preferisco camminare su tutte e quattro le zampe per tenere meglio d\'occhio i server. Niente camminate su due zampe qui. 🐾',
      "Attento! Hai quasi calpestato le mie zampe. Ah, aspetta, siamo virtuali. Tutto ok. 😹",
    ],
  },

  // ── Einstein ─────────────────────────────────────────────────────────────
  einstein: {
    lines: [
      // --- Originals (Construction & Relativity) ---
      "Sapevi che il tempo è relativo? Ecco perché questa sezione è \"quasi pronta\" già da un bel po'. ⏳",
      'E = mc²... ultimamente la "C" sta anche per "Cantiere". 🚧',
      "Per me questo campus è già finito. Per te, dagli ancora qualche giorno: dipende tutto dall'osservatore. 😄",
      'Ciao! Sono Albert. Sono venuto a spiegare la relatività e perché il pulsante "Prossimamente" non cambia mai il suo sistema di riferimento.',
      "Un consiglio: se qualcosa sul sito non funziona, non è un bug... è solo curvatura dello spaziotempo. 🌌",

      // --- Curious facts about Physics & CS ---
      "Sapevi che la luce del sole impiega 8 minuti per raggiungere la Terra? Più o meno il tempo che impiega una texture pesante a caricarsi... per fortuna usiamo Astro e viaggiamo alla velocità della luce. ⚡",
      "La gravità non è responsabile del fatto che ci si innamora dell'apprendimento su questo campus 3D. 🍎",
      "Due cose sono infinite: l'universo e la barra di scorrimento di una pagina web... e dell'universo non sono del tutto sicuro. 🌌",
      'Se viaggiassimo alla velocità della luce, il campus sarebbe già completo al 100%, ma le nostre masse sarebbero infinite. 🏃‍♂️💨',
      "Ti sembro un po' poligonale oggi? È perché i miei atomi sono stati esportati direttamente come file .glb.",
      "L'immaginazione è più importante della conoscenza. Ecco perché immagino che questa parte della mappa abbia già degli edifici. 💭",
      "Un buco nero assorbe tutto, persino le segnalazioni di bug degli studenti. 🕳️",
      "Sapevi che il tempo scorre più lentamente vicino a un oggetto massiccio? Ecco perché l'ultima lezione del venerdì sembra eterna. ⏱️",
      "Ho calcolato traiettorie di asteroidi, ma centrare una div in CSS mi sembra ancora un mistero cosmico. 📐",
      "L'entropia dell'universo aumenta sempre, proprio come il numero di righe di codice su questa piattaforma. 📈",
      'Se mi muovo abbastanza veloce, "Prossimamente" diventerà "Disponibile". Fisica quantistica! ⚛️',
      "Non possiamo risolvere i problemi pensando allo stesso modo in cui li abbiamo creati. Forse è per questo che devi svuotare la cache del browser. 🔄",
      "Dio non gioca a dadi con l'universo... ma a volte il codice si comporta in modo probabilistico. 🎲",
      "Sapevi che nello spazio non esiste su o giù? Proprio come quando la telecamera si bloccava nelle prime versioni di questo mondo. 🚀",
      "L'entanglement quantistico spiega come tu possa essere in due posti contemporaneamente, proprio come i miei pensieri mentre aspetto che questo compili. 🧠",
      'Materia ed energia sono la stessa cosa in forme diverse. Proprio come caffè e codice. ☕',
      "Se l'universo si sta espandendo, perché lo spazio di archiviazione del server sembra sempre restringersi? 💾",
      'Sapevi che gli orologi atomici in orbita corrono più veloci che sulla Terra? Forse avremmo dovuto ospitare il server su un satellite. 🛰️',
      "Tutto dovrebbe essere reso il più semplice possibile, ma non di più. Ottima filosofia per il design dell'interfaccia di questo campus. 🎨",
      'Un fotone non ha massa, quindi non può pesare nulla. Anch\'io non ho massa in questo ambiente virtuale — sono puro codice matematico. 💻',
      'Sapevi che il sole perde 4 milioni di tonnellate di massa ogni secondo? Io perdo la pazienza quando il mio ping è troppo alto. ☀️',
      "La distanza più breve tra due punti è una linea retta... a meno che lo spaziotempo o le rotte dinamiche siano curve. 🌐",
      "Il principio di indeterminazione di Heisenberg dice che non possiamo conoscere con precisione sia la posizione che la velocità di un bug del software. 🐛",
      'Sapevi che gli atomi sono per il 99,9999% spazio vuoto? Questo spiega perché questa parte della mappa sembra ancora così vuota. 🏗️',
      "L'energia non si crea né si distrugge, si trasforma soltanto... in calore dalla tua scheda grafica che rende le mie texture. 🌡️",
      'Il gatto di Schrödinger è sia vivo che morto allo stesso tempo. Proprio come quella funzionalità ancora in beta. 📦',
      'A proposito, ho visto Oliver il gatto da queste parti. Felice di vederlo camminare in modo realistico su quattro zampe, senza strane sovrapposizioni quantistiche. 🐈',
      "Se mi vedi fluttuare a pochi millimetri dal suolo, non è un bug di coordinate, è la repulsione elettromagnetica degli elettroni. 🧲",
      'Triste ma vero — è più facile dividere un atomo che finire un refactor di codice. 💥',
      "Sapevi che la Terra ruota a circa 1670 km/h? Eppure sembra che siamo fermi ad ammirare il paesaggio digitale. 🌍",
      'La quarta dimensione è il tempo. La quinta è la pazienza necessaria per aspettare il lancio di nuovi moduli. ⏳',
      "Se osservi il campus da un treno che si muove quasi alla velocità della luce, vedrai la palette di colori spostarsi verso il rosso. 🚂",
      "Qualsiasi sciocco può sapere; il punto è capire. Ecco perché sei in questa scuola — continua a esplorare! 🎓",
      "Sapevi che l'effetto fotoelettrico spiega come i pannelli solari generano elettricità? Ottimo per tenere in funzione i nostri server. ⚡",
      "Lo spazio e il tempo sono modi in cui pensiamo, non condizioni in cui viviamo. O qualcosa del genere, secondo chi ha configurato la telecamera WebGL. 🧊",
    ],
  },
}

// Catalan overrides for VR NPC dialogue — same pattern as VR_NPC_DIALOGUE_EN
// above, just translated instead of the Spanish original. Jokes/personality
// are adapted rather than translated word-for-word where a pun wouldn't
// survive the trip (Oliver's cat puns, Einstein's physics puns).
export const VR_NPC_DIALOGUE_CA = {
  // ── Mission NPCs (VR_NPCS) ─────────────────────────────────────────────
  'mago-misiones': {
    dialogue: 'Salutacions, viatger! Parla amb la teva mascota per començar la teva aventura.',
  },
  director: {
    dialogue: 'Completa la teva primera classe i torna a veure\'m per rebre la teva recompensa.',
  },
  explorador: {
    dialogue: 'Activa un objecte del teu inventari per demostrar que estàs preparat.',
  },
  zafir: {
    dialogue: 'Benvingut al meu racó! Compra alguna cosa a la Botiga i torna a recollir el teu premi.',
  },
  bibliotecaria: {
    dialogue: 'Obre un llibre de la Biblioteca i explica\'m què has après.',
  },
  sastre: {
    dialogue: 'Canvia l\'aspecte de la teva mascota i llueix-lo amb orgull.',
  },
  'guardiana-codigo': {
    dialogue: 'Només qui domina la programació pot passar! T\'atreveixes a reptar-me?',
  },
  'oraculo-cyber': {
    dialogue: 'Els secrets de la xarxa hi són aquí. Només qui sap enfrontar-s\'hi pot avançar.',
  },
  'maestro-ia': {
    dialogue: 'La intel·ligència artificial no és màgia… però per vèncer-me, gairebé en necessitaràs.',
  },
  'viajero-encapuchado': {
    dialogue: 'He viatjat per tot el campus. Puc guiar-te si ho necessites.',
  },
  'mago-novato': {
    dialogue: 'Encara estic aprenent, però puc mesurar el teu progrés.',
  },
  'bibliotecario-menor': {
    dialogue: 'Els llibres ensenyen, però els amics acompanyen.',
  },
  'zorro-mensajero': {
    dialogue: 'Porto missatges entre estudiants. Ja tens amics al campus?',
  },
  'guardian-lagarto': {
    dialogue: 'Qui construeix el seu cercle de confiança construeix el seu futur.',
  },
  'bash-mishi': {
    dialogue: 'Meu. Vols aprendre a parlar amb l\'ordinador?',
  },

  // ── Shopkeeper ───────────────────────────────────────────────────────────
  shopkeeper: {
    dialogue: 'Benvingut, viatger! Sóc Korin, la mercadera del Campus. Tinc objectes únics per a la teva aventura. Vols veure la meva mercaderia?',
    lines: [
      'Benvingut a la meva parada! Tinc els millors objectes del campus. 🛒',
      'Busques alguna cosa especial? Parla amb mi per veure la botiga.',
      'Avui tinc ofertes especials. No te les perdis!',
      'Aquí acceptem monedes del campus! 🪙',
      'Ja has comprat la càmera? Desbloqueja la galeria de fotos. 📷',
      'Amb els objectes adequats, la teva aventura és molt més divertida!',
      'La ràdio del campus té la millor música del metavers. 🎵',
      'Sabies que els objectes actius et donen avantatge a les teves missions?',
    ],
  },

  // ── Jafet ────────────────────────────────────────────────────────────────
  jafet: {
    lines: [
      'Benvingut al campus. La teva aventura comença aquí. 🌟',
      'Cada dia que estudies és un encanteri gravat a la teva memòria. ✨',
      'Has completat les missions d\'avui? El coneixement t\'espera.',
      'Domina una habilitat cada cop. El domini és qüestió de pràctica.',
      'El Campus Virtual amaga molts secrets. Explora cada racó!',
      'La màgia i el codi tenen una cosa en comú: totes dues requereixen precisió.',
      'Sabies que pots canviar l\'aspecte de la teva mascota a El Meu Equip?',
      'L\'Arbre del Món guarda el camí cap a les classes més avançades.',
      'Recorda: el coneixement que obtens aquí és teu per sempre.',
      'No hi ha dreceres en màgia. Tampoc en programació. 🪄',
      'Cada error és una lliçó disfressada. Aprèn-ne i continua.',
      'Ja has visitat l\'Amfiteatre? Algunes experiències només es poden viure en directe.',
    ],
  },

  // ── Oliver ───────────────────────────────────────────────────────────────
  oliver: {
    lines: [
      // --- Welcome & motivational ---
      'Hola! Sóc l\'Oliver 🐾',
      'Ja has explorat tot el campus?',
      'Que tinguis un gran dia d\'aprenentatge!',
      'Recorda: la pràctica fa el mestre. Aquest projecte és cosa teva!',
      'Fer pauses és vital per a la creativitat. Jo en faig unes 15 al dia. 😴',
      'Si el teu codi no compila, explica-me\'l. Sóc un excel·lent ànec de goma... gat. 🐈',

      // --- Digital Campus explanations ---
      'Prem C per xatejar amb altres estudiants i fer xarxa.',
      'Recorda completar les teves missions diàries per guanyar monedes.',
      'Apropa\'t als tauells d\'informació per veure les teves properes classes disponibles. 📚',
      'Les monedes que guanyes t\'ajudaran a personalitzar el teu avatar. Estalvia!',
      'Si et perds, consulta el mapa interactiu a la pantalla. 🗺️',
      'Cada classe que acabes et dona punts d\'experiència. Puja de nivell i desbloqueja sorpreses!',
      'No t\'oblidis de revisar el teu inventari — de vegades hi amago petits regals. 🎁',
      'Pots moure\'t més ràpid mantenint premut Shift. Però vigila la meva cua!',
      'Has vist la zona de descans? És perfecta per parlar dels teus projectes amb els altres.',
      'Recorda desar el teu progrés al teu perfil abans de sortir del campus. 💾',

      // --- Programming/CS jokes ---
      'Saps per què els programadors prefereixen el mode fosc? Perquè la llum atreu els bugs. 🐛',
      'Ahir vaig caçar un ratolí... però tenia un cable USB i no tenia gaire bon gust. 🖱️',
      'Hi ha 10 tipus de gats al món: els que entenen el binari i els que no.',
      'El meu framework preferit és el Ronron-eact... Meu!',
      'Vaig intentar arreglar el router del campus, però només m\'hi vaig ajeure a sobre perquè era calentó. 💤',
      'Què li diu un bit a un altre bit? Ens veiem al bus! 🚌',
      'Error 404: pinso no trobat. Necessito recarregar-me des del servidor!',
      'Un bon codi és com un bon ronroneig: constant, net i ininterromput.',
      'Tinc nou vides, però cap va a producció sense passar per QA. 🛡️',
      'Aquest campus vola tan ràpid que sembla que l\'hagin construït amb Astro. 🚀',

      // --- UI/UX design jokes ---
      'Si fas servir Comic Sans a les teves tasques, faré que el teu codi no compili. És broma! (O no?). 😼',
      'El client sempre demana "fer el logo més gran." Jo dic que el bol del menjar hauria de ser més gran. 🍲',
      'CMYK o RGB? Jo prefereixo el R-G-Meu. 🎨',
      'Assegura\'t que els teus elements estan ben alineats! El meu TOC felí em fa revisar el padding de tot el campus.',
      'Aquest #000000 queda molt elegant, però necessita una mica més de contrast amb el meu pèl taronja. 🟧',
      'Disseny UI/UX: un bon disseny és intuïtiu, com saber exactament quan és l\'hora de sopar sense mirar el rellotge.',
      'Odio quan em diuen que "faci ressaltar més el disseny." Què volen, llums de neó al meu pèl? ✨',

      // --- Hacker cat / real cat personality ---
      'La ciberseguretat importa: si us plau, no facis servir mai "meu123" com a contrasenya. 🔒',
      'En ciberseguretat segueixo el model Zero Trust: mai confio que el meu bol estigui ple, sempre ho comprovo jo mateix.',
      'Com a autèntic gat hacker, prefereixo caminar a quatre potes per vigilar millor els servidors. Aquí no es camina a dues potes. 🐾',
      'Compte! Gairebé em trepitges les potes. Ah espera, som virtuals. Tot bé. 😹',
    ],
  },

  // ── Einstein ─────────────────────────────────────────────────────────────
  einstein: {
    lines: [
      // --- Originals (Construction & Relativity) ---
      'Sabies que el temps és relatiu? Per això aquesta secció fa temps que està "gairebé llesta". ⏳',
      'E = mc²... últimament la "C" també vol dir "Construcció." 🚧',
      'Per a mi, aquest campus ja està acabat. Per a tu, dona-li uns dies més: tot depèn de l\'observador. 😄',
      'Hola! Sóc l\'Albert. He vingut a explicar la relativitat i per què el botó "Properament" mai canvia el seu sistema de referència.',
      'Un consell: si alguna cosa del lloc no funciona, no és un bug... és només curvatura de l\'espai-temps. 🌌',

      // --- Curious facts about Physics & CS ---
      'Sabies que la llum del sol triga 8 minuts a arribar a la Terra? Més o menys el que triga a carregar-se una textura pesada... sort que fem servir Astro i anem a la velocitat de la llum. ⚡',
      'La gravetat no és responsable que la gent s\'enamori d\'aprendre en aquest campus 3D. 🍎',
      'Dues coses són infinites: l\'univers i la barra de desplaçament d\'una pàgina web... i de l\'univers no n\'estic tan segur. 🌌',
      'Si viatgéssim a la velocitat de la llum, el campus ja estaria acabat al 100%, però les nostres masses serien infinites. 🏃‍♂️💨',
      'Em veus una mica poligonal avui? És perquè els meus àtoms s\'han exportat directament com a fitxer .glb.',
      'La imaginació és més important que el coneixement. Per això m\'imagino que aquesta part del mapa ja té edificis. 💭',
      'Un forat negre ho absorbeix tot, fins i tot els informes de bugs dels estudiants. 🕳️',
      'Sabies que el temps passa més a poc a poc a prop d\'un objecte massiu? Per això l\'última classe del divendres sembla eterna. ⏱️',
      'He calculat trajectòries d\'asteroides, però centrar un div en CSS encara em sembla un misteri còsmic. 📐',
      'L\'entropia de l\'univers sempre augmenta, igual que el nombre de línies de codi d\'aquesta plataforma. 📈',
      'Si em moc prou ràpid, "Properament" es convertirà en "Disponible." Física quàntica! ⚛️',
      'No podem resoldre problemes pensant de la mateixa manera que quan els vam crear. Potser per això has de netejar la memòria cau del navegador. 🔄',
      'Déu no juga a daus amb l\'univers... però de vegades el codi es comporta de manera probabilística. 🎲',
      'Sabies que a l\'espai no hi ha dalt ni baix? Igual que quan la càmera fallava en les primeres versions d\'aquest món. 🚀',
      'L\'entrellaçament quàntic explica com pots estar en dos llocs alhora, igual que els meus pensaments mentre espero que això compili. 🧠',
      'La matèria i l\'energia són la mateixa cosa en formes diferents. Igual que el cafè i el codi. ☕',
      'Si l\'univers s\'expandeix, per què l\'espai d\'emmagatzematge del servidor sempre sembla que s\'encongeix? 💾',
      'Sabies que els rellotges atòmics en òrbita van més ràpid que a la Terra? Potser hauríem d\'haver allotjat el servidor en un satèl·lit. 🛰️',
      'Tot s\'hauria de fer tan simple com sigui possible, però no més. Gran filosofia per al disseny de la interfície d\'aquest campus. 🎨',
      'Un fotó no té massa, així que no pot pesar res. Jo tampoc tinc massa en aquest entorn virtual — sóc codi matemàtic pur. 💻',
      'Sabies que el sol perd 4 milions de tones de massa cada segon? Jo perdo la paciència quan el meu ping és massa alt. ☀️',
      'La distància més curta entre dos punts és una línia recta... tret que l\'espai-temps o les rutes dinàmiques siguin corbes. 🌐',
      'El principi d\'incertesa de Heisenberg diu que no podem conèixer amb precisió alhora la posició i la velocitat d\'un bug de programari. 🐛',
      'Sabies que els àtoms són un 99,9999% espai buit? Això explica per què aquesta part del mapa encara sembla tan buida. 🏗️',
      'L\'energia no es crea ni es destrueix, només es transforma... en calor de la teva targeta gràfica renderitzant les meves textures. 🌡️',
      'El gat de Schrödinger està viu i mort alhora. Igual que aquesta funcionalitat que encara està en beta. 📦',
      'Per cert, he vist l\'Oliver el gat per aquí. Content de veure\'l caminar de manera realista a quatre potes, sense estranyes superposicions quàntiques. 🐈',
      'Si em veus flotant uns mil·límetres per sobre del terra, no és un bug de coordenades, és la repulsió electromagnètica dels electrons. 🧲',
      'Trist però cert — és més fàcil dividir un àtom que acabar un refactor de codi. 💥',
      'Sabies que la Terra gira a uns 1670 km/h? I tanmateix sembla que estiguem quiets admirant el paisatge digital. 🌍',
      'La quarta dimensió és el temps. La cinquena és la paciència necessària per esperar que es llancin nous mòduls. ⏳',
      'Si observes el campus des d\'un tren que es mou gairebé a la velocitat de la llum, veuràs com la paleta de colors es desplaça cap al vermell. 🚂',
      'Qualsevol beneit pot saber; el que importa és comprendre. Per això ets en aquesta escola — segueix explorant! 🎓',
      'Sabies que l\'efecte fotoelèctric explica com les plaques solars generen electricitat? Genial per mantenir els nostres servidors funcionant. ⚡',
      'L\'espai i el temps són maneres en què pensem, no condicions en què vivim. O alguna cosa així, segons qui va configurar la càmera WebGL. 🧊',
    ],
  },
}

// Japanese overrides for VR NPC dialogue — same pattern as VR_NPC_DIALOGUE_EN
// above, just translated instead of the Spanish original. Jokes/personality
// are adapted rather than translated word-for-word where a pun wouldn't
// survive the trip (Oliver's cat puns, Einstein's physics puns).
export const VR_NPC_DIALOGUE_JA = {
  // ── Mission NPCs (VR_NPCS) ─────────────────────────────────────────────
  'mago-misiones': {
    dialogue: '旅人よ、ようこそ！マスコットに話しかけて冒険を始めよう。',
  },
  director: {
    dialogue: '最初の授業を終えたら、報酬を受け取りに戻ってきてください。',
  },
  explorador: {
    dialogue: '持ち物からアイテムを使ってみて、準備ができていることを証明しよう。',
  },
  zafir: {
    dialogue: 'ようこそ私のコーナーへ！ショップで何か買って、賞品を受け取りに戻ってきてね。',
  },
  bibliotecaria: {
    dialogue: '図書館の本を開いて、学んだことを教えてください。',
  },
  sastre: {
    dialogue: 'マスコットの見た目を変えて、誇らしげに見せびらかそう。',
  },
  'guardiana-codigo': {
    dialogue: 'プログラミングを極めた者だけが通れる！私に挑む勇気はあるかしら？',
  },
  'oraculo-cyber': {
    dialogue: 'ネットワークの秘密はここにある。立ち向かい方を知る者だけが先へ進める。',
  },
  'maestro-ia': {
    dialogue: '人工知能は魔法ではない…でも私を倒すには、ほぼ魔法級の力が必要だぞ。',
  },
  'viajero-encapuchado': {
    dialogue: 'キャンパス全体を旅してきた。必要なら案内してあげよう。',
  },
  'mago-novato': {
    dialogue: 'まだ勉強中の身だが、君の進捗なら測ってあげられるよ。',
  },
  'bibliotecario-menor': {
    dialogue: '本は教えてくれる、でも友達は一緒に歩んでくれる。',
  },
  'zorro-mensajero': {
    dialogue: '生徒たちの間でメッセージを運んでいるよ。キャンパスにはもう友達ができた？',
  },
  'guardian-lagarto': {
    dialogue: '信頼の輪を築く者は、自らの未来を築く。',
  },
  'bash-mishi': {
    dialogue: 'ニャー。コンピューターとの話し方を学びたい？',
  },

  // ── Shopkeeper ───────────────────────────────────────────────────────────
  shopkeeper: {
    dialogue: 'ようこそ、旅人よ！私はコリン、キャンパスの商人だ。冒険に役立つユニークなアイテムを取り揃えているよ。商品を見てみるかい？',
    lines: [
      '私の屋台へようこそ！キャンパス一番のアイテムを揃えているよ。🛒',
      '何か特別なものをお探し？話しかけてくれればショップを見せるよ。',
      '今日は特別セール中だ。見逃さないでね！',
      'キャンパスコインはここで使えるよ！🪙',
      'もうカメラは買った？フォトギャラリーが解放されるよ。📷',
      '良いアイテムがあれば、冒険はもっと楽しくなる！',
      'キャンパスラジオはメタバース一番の音楽を流しているよ。🎵',
      'アクティブアイテムはミッションで有利になるって知ってた？',
    ],
  },

  // ── Jafet ────────────────────────────────────────────────────────────────
  jafet: {
    lines: [
      'キャンパスへようこそ。君の冒険はここから始まる。🌟',
      '勉強する一日一日が、記憶に刻まれる呪文だ。✨',
      '今日のミッションはもう終えたかい？知識が君を待っている。',
      '一つずつスキルを極めよう。熟練とは練習の積み重ねだ。',
      '仮想キャンパスには多くの秘密が眠っている。すみずみまで探索しよう！',
      '魔法とコードには共通点がある：どちらも正確さが求められる。',
      'マイチームでマスコットの見た目を変えられるって知ってた？',
      'ワールドツリーには、より上級のクラスへの道が眠っている。',
      '覚えておいてほしい：ここで得た知識は永遠に君のものだ。',
      '魔法に近道はない。プログラミングも同じだ。🪄',
      'すべての失敗は姿を変えた教訓だ。そこから学んで前へ進もう。',
      'もう円形劇場には行った？ライブでしか味わえない体験もあるんだ。',
    ],
  },

  // ── Oliver ───────────────────────────────────────────────────────────────
  oliver: {
    lines: [
      // --- Welcome & motivational ---
      'やあ！僕はオリバー 🐾',
      'キャンパスはもう全部探検した？',
      '素晴らしい学びの一日を！',
      '覚えておいて：継続は力なり。このプロジェクトはきっとできるよ！',
      '休憩はクリエイティビティに欠かせない。僕は一日に15回くらい休むよ。😴',
      'コードがコンパイルできないなら、僕に説明してみて。僕は優秀なアヒル…いや猫のラバーダックだから。🐈',

      // --- Digital Campus explanations ---
      'Cキーを押して他の生徒とチャットして人脈を広げよう。',
      'デイリーミッションを忘れずに完了してコインを稼ごう。',
      '掲示板に近づくと、近日受講可能な授業が見えるよ。📚',
      '稼いだコインはアバターのカスタマイズに使えるよ。貯めておこう！',
      '道に迷ったら画面のインタラクティブマップを確認してね。🗺️',
      '授業を終えるたびに経験値がもらえる。レベルアップしてサプライズを解除しよう！',
      '持ち物の確認を忘れずに — たまに小さなギフトを隠しておくからね。🎁',
      'Shiftキーを押しっぱなしで速く移動できるよ。でも僕のしっぽには気をつけて！',
      '休憩エリアはもう見た？他の人とプロジェクトについて話すのにぴったりだよ。',
      'キャンパスを離れる前に、プロフィールで進捗を保存するのを忘れずに。💾',

      // --- Programming/CS jokes ---
      'プログラマーがダークモードを好む理由知ってる？光がバグを引き寄せるからさ。🐛',
      '昨日ネズミを捕まえたんだけど…USBケーブルが付いていて、あんまり美味しくなかったよ。🖱️',
      '世界には10種類の猫がいる：二進数を理解する猫と、理解しない猫だ。',
      '僕のお気に入りのフレームワークはPurr-eact…ニャー！',
      'キャンパスのルーターを直そうとしたんだけど、温かかったから上に乗っかっちゃった。💤',
      'ビットがビットに何て言う？バスでまた会おう！🚌',
      'エラー404：カリカリが見つかりません。サーバーから充電しなきゃ！',
      '良いコードは良いゴロゴロと同じ：安定していて、綺麗で、途切れない。',
      '僕には9つの命があるけど、QAを通らずに本番環境に行くものは一つもないよ。🛡️',
      'このキャンパスはとても速い、まるでAstroで作られたみたいに。🚀',

      // --- UI/UX design jokes ---
      '課題でComic Sansを使ったら、君のコードをコンパイル失敗させるよ。冗談だよ！（…かな？）😼',
      'クライアントはいつも「ロゴをもっと大きく」と言う。僕はエサ皿をもっと大きくすべきだと思うけどね。🍲',
      'CMYKかRGBか？僕はR-G-ニャーが好きだな。🎨',
      '要素の配置はちゃんと揃えてる？僕の猫的な几帳面さがキャンパス中のパディングをチェックさせるんだ。',
      'その#000000はエレガントに見えるけど、僕のオレンジの毛並みにはもう少しコントラストが必要だね。🟧',
      'UI/UXデザイン：良いデザインとは直感的なもの、時計を見なくても夕食の時間がわかるようなものさ。',
      '「デザインをもっと目立たせて」と言われるのが嫌いなんだ。僕の毛にネオンライトでもつけろって言うのかな？✨',

      // --- Hacker cat / real cat personality ---
      'サイバーセキュリティは大事だよ：パスワードに「meow123」なんて絶対使わないでね。🔒',
      'サイバーセキュリティではゼロトラストモデルを採用してるよ：エサ皿が満タンだなんて絶対信用しない、いつも自分で確かめる。',
      '本物のハッカー猫として、サーバーをよく見張るために四本足で歩くのを好むよ。ここでは二本足歩行はなしだ。🐾',
      '気をつけて！危うく僕の足を踏むところだったね。あ、待って、僕らは仮想空間にいるんだった。大丈夫。😹',
    ],
  },

  // ── Einstein ─────────────────────────────────────────────────────────────
  einstein: {
    lines: [
      // --- Originals (Construction & Relativity) ---
      '時間は相対的だって知ってた？だからこのセクションはずっと「もうすぐ完成」のままなんだ。⏳',
      'E = mc²…最近は「C」が「工事中（Construction）」の意味も持つようになったよ。🚧',
      '僕にとってこのキャンパスはもう完成している。君にとってはあと数日待ってくれ：すべては観測者次第だからね。😄',
      'こんにちは！僕はアルバートだ。相対性理論と、「近日公開」ボタンがなぜ決して基準系を変えないのかを説明しに来たよ。',
      'ヒントを一つ：サイトの何かが動かないなら、それはバグじゃない…ただの時空の歪みだよ。🌌',

      // --- Curious facts about Physics & CS ---
      '太陽の光が地球に届くまで8分かかるって知ってた？重いテクスチャの読み込みとだいたい同じくらいの時間だ…幸いAstroを使って光速で移動しているけどね。⚡',
      '重力は、この3Dキャンパスで人が学びに恋してしまうこととは関係ないよ。🍎',
      '無限なものが2つある：宇宙とウェブページのスクロールバーだ…宇宙の方は確信が持てないけどね。🌌',
      '光速で移動できたら、キャンパスはもう100%完成しているはずだ。でも僕らの質量は無限大になってしまう。🏃‍♂️💨',
      '今日の僕、ちょっとポリゴンっぽく見える？それは僕の原子が.glbファイルとしてそのままエクスポートされたからさ。',
      '想像力は知識よりも重要だ。だから僕はマップのこの部分にはもう建物があると想像しているんだ。💭',
      'ブラックホールはすべてを吸い込む、生徒たちのバグ報告さえもね。🕳️',
      '重い物体の近くでは時間がゆっくり流れるって知ってた？だから金曜日の最後の授業は永遠に感じるんだ。⏱️',
      '小惑星の軌道を計算したことはあるけど、CSSでdivを中央揃えするのは今でも宇宙の謎に感じるよ。📐',
      '宇宙のエントロピーは常に増加する、このプラットフォームのコード行数と同じようにね。📈',
      '十分速く動けば、「近日公開」は「利用可能」に変わるはずだ。量子物理学だね！⚛️',
      '問題を作ったときと同じ考え方では、その問題は解決できない。だからブラウザのキャッシュを消す必要があるのかもしれないね。🔄',
      '神はサイコロを振らない…でも時々コードは確率的に振る舞うことがあるね。🎲',
      '宇宙には上も下もないって知ってた？この世界の初期バージョンでカメラがバグっていた時みたいにね。🚀',
      '量子もつれは、君が同時に2つの場所にいられる仕組みを説明してくれる、ちょうどこれがコンパイルされるのを待つ間の僕の思考みたいにね。🧠',
      '物質とエネルギーは異なる形をした同じものだ。コーヒーとコードみたいにね。☕',
      '宇宙が膨張しているなら、なぜサーバーの保存容量はいつも縮んでいくように見えるんだろう？💾',
      '軌道上の原子時計は地球上より速く進むって知ってた？サーバーは衛星にホスティングすべきだったかもね。🛰️',
      'すべてはできる限りシンプルであるべきだが、それ以上シンプルにしすぎてもいけない。このキャンパスのインターフェースデザインにぴったりの哲学だね。🎨',
      '光子には質量がない、だから何も重さを持てない。僕もこの仮想環境では質量がない — 純粋な数学的コードだからね。💻',
      '太陽は毎秒400万トンの質量を失うって知ってた？僕はピンが高すぎると我慢の限界を失うよ。☀️',
      '2点間の最短距離は直線だ…時空や動的ルートが曲がっていなければの話だけどね。🌐',
      'ハイゼンベルクの不確定性原理によれば、ソフトウェアのバグの位置と速度を同時に正確に知ることはできない。🐛',
      '原子は99.9999%が空っぽの空間だって知ってた？それがこのマップの部分がまだこんなに空っぽに見える理由さ。🏗️',
      'エネルギーは生成も消滅もしない、ただ変換されるだけだ…僕のテクスチャをレンダリングする君のグラフィックカードの熱にね。🌡️',
      'シュレーディンガーの猫は生きていると同時に死んでいる。まだベータ版のあの機能みたいにね。📦',
      'ところで、猫のオリバーをこの辺りで見かけたよ。奇妙な量子重ね合わせもなく、リアルに四本足で歩いているのを見て嬉しいね。🐈',
      '僕が地面から数ミリ浮いているのを見たら、それは座標のバグじゃなくて電子同士の電磁反発なんだ。🧲',
      '悲しい現実だ — 原子を分裂させる方が、コードのリファクタリングを終わらせるより簡単だなんて。💥',
      '地球は時速約1670kmで回転しているって知ってた？それでも僕らはこのデジタルの景色を眺めながらじっとしているように感じるね。🌍',
      '第四の次元は時間だ。第五の次元は、新しいモジュールのリリースを待つのに必要な忍耐力さ。⏳',
      'ほぼ光速で走る電車からキャンパスを見たら、カラーパレットが赤方偏移するのが見えるはずだ。🚂',
      'どんな愚か者でも知ることはできる。大事なのは理解することだ。だから君はこの学校にいるんだ — 探求を続けよう！🎓',
      '光電効果が太陽光パネルの発電の仕組みを説明しているって知ってた？僕らのサーバーを動かし続けるのにぴったりだね。⚡',
      '空間と時間は僕らが考える様式であって、僕らが生きる条件ではない。WebGLカメラを設定した誰かによれば、そんな感じらしいよ。🧊',
    ],
  },
}

// Chinese (Simplified) overrides for VR NPC dialogue — same pattern as
// VR_NPC_DIALOGUE_EN above, just translated instead of the Spanish original.
// Jokes/personality are adapted rather than translated word-for-word where a
// pun wouldn't survive the trip (Oliver's cat puns, Einstein's physics puns).
export const VR_NPC_DIALOGUE_ZH = {
  // ── Mission NPCs (VR_NPCS) ─────────────────────────────────────────────
  'mago-misiones': {
    dialogue: '欢迎，旅行者！和你的伙伴聊聊，开始你的冒险吧。',
  },
  director: {
    dialogue: '完成你的第一节课，再来找我领取奖励。',
  },
  explorador: {
    dialogue: '激活你物品栏里的一件物品，证明你已经准备好了。',
  },
  zafir: {
    dialogue: '欢迎来到我的小天地！在商店买点东西，再回来领取你的奖品。',
  },
  bibliotecaria: {
    dialogue: '打开图书馆的一本书，告诉我你学到了什么。',
  },
  sastre: {
    dialogue: '改变一下你伙伴的外观，骄傲地展示出来吧。',
  },
  'guardiana-codigo': {
    dialogue: '只有精通编程的人才能通过！你敢挑战我吗？',
  },
  'oraculo-cyber': {
    dialogue: '网络的秘密就藏在这里。只有懂得应对的人才能前进。',
  },
  'maestro-ia': {
    dialogue: '人工智能不是魔法……但要打败我，你几乎需要一点魔法。',
  },
  'viajero-encapuchado': {
    dialogue: '我走遍了整个校园。如果你需要，我可以给你带路。',
  },
  'mago-novato': {
    dialogue: '我还在学习中，不过我可以帮你评估进度。',
  },
  'bibliotecario-menor': {
    dialogue: '书本传授知识，但朋友一路相伴。',
  },
  'zorro-mensajero': {
    dialogue: '我在学生之间传递消息。你在校园里交到朋友了吗？',
  },
  'guardian-lagarto': {
    dialogue: '建立起自己信任圈子的人，就是在建立自己的未来。',
  },
  'bash-mishi': {
    dialogue: '喵。想学学怎么和电脑说话吗？',
  },

  // ── Shopkeeper ───────────────────────────────────────────────────────────
  shopkeeper: {
    dialogue: '欢迎，旅行者！我是柯林，校园的商人。我这里有你冒险所需的独特物品。想看看我的商品吗？',
    lines: [
      '欢迎光临我的摊位！这里有校园里最好的物品。🛒',
      '在找什么特别的东西吗？跟我聊聊，看看商店吧。',
      '今天有特别优惠，别错过哦！',
      '这里欢迎使用校园金币！🪙',
      '你买相机了吗？它能解锁照片相册哦。📷',
      '有了合适的装备，你的冒险会更有趣！',
      '校园电台播放着元宇宙里最好听的音乐。🎵',
      '你知道吗，激活的物品能在任务中给你带来优势哦。',
    ],
  },

  // ── Jafet ────────────────────────────────────────────────────────────────
  jafet: {
    lines: [
      '欢迎来到校园。你的冒险从这里开始。🌟',
      '每一天的学习都是刻在记忆里的一道咒语。✨',
      '今天的任务完成了吗？知识正在等着你。',
      '一次专精一项技能。精通靠的是不断练习。',
      '虚拟校园里藏着许多秘密。去探索每一个角落吧！',
      '魔法和代码有一个共同点：两者都需要精确。',
      '你知道吗，你可以在"我的团队"里更换伙伴的外观。',
      '世界之树里藏着通往更高级职业的道路。',
      '记住：你在这里获得的知识永远属于你。',
      '魔法没有捷径，编程也是一样。🪄',
      '每一次失误都是伪装成教训的礼物。从中学习，继续前进。',
      '你去过圆形剧场了吗？有些体验只有现场才能感受到。',
    ],
  },

  // ── Oliver ───────────────────────────────────────────────────────────────
  oliver: {
    lines: [
      // --- Welcome & motivational ---
      '嗨！我是奥利弗 🐾',
      '你把整个校园都探索过了吗？',
      '祝你有美好的学习一天！',
      '记住：熟能生巧。这个项目你一定能搞定！',
      '休息对创造力至关重要。我一天大概要休息15次。😴',
      '如果你的代码编译不过，说给我听听。我是一只优秀的橡皮鸭……不对，是橡皮猫。🐈',

      // --- Digital Campus explanations ---
      '按 C 和其他同学聊天，扩展你的人脉。',
      '别忘了完成每日任务来赚取金币。',
      '靠近信息板可以看到你接下来能上的课程。📚',
      '你赚到的金币能帮你装扮你的角色。攒起来吧！',
      '如果迷路了，看看屏幕上的互动地图吧。🗺️',
      '每完成一节课都会获得经验值。升级解锁惊喜吧！',
      '别忘了看看你的背包——我有时会在里面藏一些小礼物。🎁',
      '按住 Shift 可以跑得更快。不过要小心我的尾巴！',
      '你看到休息区了吗？那里最适合和大家聊聊你的项目了。',
      '离开校园前记得在个人资料里保存你的进度。💾',

      // --- Programming/CS jokes ---
      '知道程序员为什么喜欢深色模式吗？因为光会引来 bug。🐛',
      '我昨天抓到一只老鼠……可它带着 USB 线，味道也不怎么样。🖱️',
      '世界上有10种猫：懂二进制的和不懂的。',
      '我最喜欢的框架是"呼噜-eact"……喵！',
      '我想修好校园的路由器，结果因为它是热的，我就直接趴上面了。💤',
      '一个比特对另一个比特说了什么？公交车上见！🚌',
      '错误404：找不到猫粮。我得从服务器充充电了！',
      '好代码就像好呼噜：稳定、干净、从不中断。',
      '我有九条命，但没有一条能不经过 QA 测试就上线。🛡️',
      '这个校园运行得飞快，感觉像是用 Astro 搭出来的。🚀',

      // --- UI/UX design jokes ---
      '要是你作业里用了 Comic Sans 字体，我就让你的代码编译失败。开玩笑的！（还是不是呢？）😼',
      '客户总是要求"把 logo 做大一点"。我倒觉得该把猫粮碗做大一点。🍲',
      'CMYK 还是 RGB？我更喜欢 R-G-喵。🎨',
      '你的元素对齐了吗？我的猫式强迫症会让我检查整个校园的内边距。',
      '那个 #000000 看起来很优雅，不过配上我橙色的毛需要多一点对比度。🟧',
      'UI/UX 设计：好的设计是直观的，就像不用看时钟也知道该吃晚饭了一样。',
      '我最讨厌别人说"让设计再突出一点"。他们是想让我毛上装霓虹灯吗？✨',

      // --- Hacker cat / real cat personality ---
      '网络安全很重要：千万别把"meow123"当密码用。🔒',
      '在网络安全方面我遵循零信任模型：我从不相信猫粮碗是满的，永远都要自己确认一下。',
      '作为一只真正的黑客猫，我更喜欢用四只爪子走路，这样能更好地盯着服务器。这里可不兴用两条腿走路。🐾',
      '小心！你差点踩到我的爪子。哦，等等，我们是虚拟的。没事没事。😹',
    ],
  },

  // ── Einstein ─────────────────────────────────────────────────────────────
  einstein: {
    lines: [
      // --- Originals (Construction & Relativity) ---
      '你知道时间是相对的吗？所以这个板块"快要准备好了"这句话已经说了好一阵子了。⏳',
      'E = mc²……最近这个"C"也代表"施工中"（Construction）了。🚧',
      '对我来说这个校园已经完工了。对你来说嘛，再等它几天吧：一切都取决于观察者。😄',
      '你好！我是阿尔伯特。我是来解释相对论的，顺便说说为什么"即将推出"这个按钮永远不会改变它的参考系。',
      '一个小提示：如果网站上有什么东西不能用，那不是 bug……只是时空弯曲而已。🌌',

      // --- Curious facts about Physics & CS ---
      '你知道阳光到达地球需要8分钟吗？差不多就是一张很重的贴图加载所需的时间……幸好我们用的是 Astro，跑得跟光速一样快。⚡',
      '让人爱上在这个3D校园里学习，可不是重力的功劳。🍎',
      '有两样东西是无限的：宇宙，还有网页的滚动条……至于宇宙，我倒不太确定。🌌',
      '如果我们能以光速旅行，校园早就100%完工了，只是我们的质量会变成无限大。🏃‍♂️💨',
      '今天我看起来有点多边形？那是因为我的原子被直接导出成了 .glb 文件。',
      '想象力比知识更重要。所以我想象地图的这一片区域已经盖好了建筑。💭',
      '黑洞会吞噬一切，甚至连学生们的 bug 报告也不放过。🕳️',
      '你知道离大质量物体越近，时间流逝得越慢吗？所以周五的最后一节课才感觉像永远上不完。⏱️',
      '我计算过小行星的轨道，可在 CSS 里把一个 div 居中，对我来说至今仍是宇宙级的谜题。📐',
      '宇宙的熵总是在增加，就像这个平台的代码行数一样。📈',
      '如果我移动得够快，"即将推出"就会变成"现已推出"。这就是量子物理！⚛️',
      '我们没法用当初制造问题时的思维方式来解决问题。也许这就是你需要清空浏览器缓存的原因。🔄',
      '上帝不掷骰子……不过有时候代码的行为确实带点概率性。🎲',
      '你知道太空中没有上下之分吗？就像这个世界早期版本里摄像机经常抽风一样。🚀',
      '量子纠缠解释了你怎么能同时出现在两个地方，就像我在等这段代码编译完成时脑子里同时转的那些念头。🧠',
      '物质和能量是同一样东西的不同形态。就像咖啡和代码一样。☕',
      '如果宇宙在膨胀，为什么服务器的存储空间看起来总是在缩水呢？💾',
      '你知道轨道上的原子钟走得比地球上快吗？也许我们该把服务器架设在卫星上。🛰️',
      '一切都应该尽可能简单，但不能过于简单。这句话简直就是为这个校园的界面设计量身定做的哲学。🎨',
      '光子没有质量，所以它什么也称不出来。我在这个虚拟环境里也没有质量——我就是纯粹的数学代码。💻',
      '你知道太阳每秒钟要损失400万吨质量吗？我则是每次 ping 值太高就会失去耐心。☀️',
      '两点之间最短的距离是直线……除非时空或者动态路由是弯曲的。🌐',
      '海森堡不确定性原理告诉我们，没法同时精确知道一个软件 bug 的位置和速度。🐛',
      '你知道原子有 99.9999% 都是空的吗？这就解释了为什么地图的这一块看起来还是这么空。🏗️',
      '能量既不会被创造，也不会被消灭，只会转化……变成你的显卡渲染我这些贴图时产生的热量。🌡️',
      '薛定谔的猫既是活的又是死的。就像那个还在测试阶段的功能一样。📦',
      '对了，我在这附近看到猫咪奥利弗了。很高兴看到它用四条腿走路的样子那么真实，完全没有奇怪的量子叠加态。🐈',
      '如果你看到我悬浮在地面上方几毫米处，那不是坐标出了 bug，那是电子之间的电磁排斥力。🧲',
      '可悲的现实是——分裂一个原子都比完成一次代码重构更容易。💥',
      '你知道地球以大约每小时1670公里的速度自转吗？可我们却感觉自己一动不动地欣赏着这片数字风景。🌍',
      '第四维是时间。第五维是等待新模块上线所需要的耐心。⏳',
      '如果你从一列接近光速行驶的火车上观察校园，你会看到色彩偏向红色端。🚂',
      '谁都能"知道"，重要的是"理解"。这就是你来这所学校的原因——继续探索吧！🎓',
      '你知道光电效应解释了太阳能板是怎么发电的吗？这对让我们的服务器持续运转来说太棒了。⚡',
      '空间和时间是我们思考的方式，而不是我们生存的条件。或者差不多是这个意思吧，具体要问是谁配置的那台 WebGL 摄像机了。🧊',
    ],
  },
}

// Spreads the EN/FR/IT/CA/JA/ZH override (dialogue/lines) on top of the
// original NPC only when lang is 'en', 'fr', 'it', 'ca', 'ja' or 'zh',
// falling back to the Spanish fields when the override entry is missing one
// of them (so a partial override never blanks a field).
export function localizeNpcDialogue(npc, lang) {
  if (!npc) return npc
  const overrides = lang === 'en' ? VR_NPC_DIALOGUE_EN[npc.id] : lang === 'fr' ? VR_NPC_DIALOGUE_FR[npc.id] : lang === 'it' ? VR_NPC_DIALOGUE_IT[npc.id] : lang === 'ca' ? VR_NPC_DIALOGUE_CA[npc.id] : lang === 'ja' ? VR_NPC_DIALOGUE_JA[npc.id] : lang === 'zh' ? VR_NPC_DIALOGUE_ZH[npc.id] : null
  if (!overrides) return npc
  return {
    ...npc,
    dialogue: overrides.dialogue ?? npc.dialogue,
    lines: overrides.lines ?? npc.lines,
  }
}
