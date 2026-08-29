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

// Spreads the EN/FR/IT override (dialogue/lines) on top of the original NPC
// only when lang is 'en', 'fr' or 'it', falling back to the Spanish fields
// when the override entry is missing one of them (so a partial override
// never blanks a field).
export function localizeNpcDialogue(npc, lang) {
  if (!npc) return npc
  const overrides = lang === 'en' ? VR_NPC_DIALOGUE_EN[npc.id] : lang === 'fr' ? VR_NPC_DIALOGUE_FR[npc.id] : lang === 'it' ? VR_NPC_DIALOGUE_IT[npc.id] : null
  if (!overrides) return npc
  return {
    ...npc,
    dialogue: overrides.dialogue ?? npc.dialogue,
    lines: overrides.lines ?? npc.lines,
  }
}
