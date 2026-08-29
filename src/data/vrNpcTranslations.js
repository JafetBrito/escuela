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

// Spreads the EN override (dialogue/lines) on top of the original NPC only
// when lang === 'en', falling back to the Spanish fields when the EN entry
// is missing one of them (so a partial override never blanks a field).
export function localizeNpcDialogue(npc, lang) {
  if (lang !== 'en' || !npc) return npc
  const en = VR_NPC_DIALOGUE_EN[npc.id]
  if (!en) return npc
  return {
    ...npc,
    dialogue: en.dialogue ?? npc.dialogue,
    lines: en.lines ?? npc.lines,
  }
}
