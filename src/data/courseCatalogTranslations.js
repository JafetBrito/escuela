// Traducción al inglés de la INFORMACIÓN DE VISTA PREVIA del catálogo de
// cursos (título + descripción, tal como se ven en las tarjetas de
// Academias/Escuelas) — no es lo mismo que courseTranslations.js, que
// traduce el CONTENIDO completo de las clases (módulos/lecciones) vía
// course.translations (Supabase) o COURSE_TRANSLATIONS legacy.
// courses.json no tiene campo `courseId` para enganchar ese sistema, así
// que este es un lookup local aparte, por `id`, mismo patrón que
// CARD_OVERRIDES en GamesPage.jsx.
export const COURSE_CATALOG_EN = {
  'course-001': {
    title: 'Master Google NotebookLM',
    description: 'Learn to use Google NotebookLM as your research and study assistant, module by module, with challenges and your AI mascot as your guide.',
  },
  'course-002': {
    title: 'Automate Your Studying with AI',
    description: 'Build workflows, prompts, and AI automations to study faster: automatic summaries, self-generated flashcards, and personalized assistants for every subject. You\'ll learn to connect AI tools together without needing to code. Coming soon.',
  },
  'course-003': {
    title: 'Prompt Engineering from Scratch',
    description: 'The complete prompt engineering manual. Zero-shot, Few-shot, CoT, ReAct, ToT, meta-prompting, and more. Theory + practice with Oliver as your tutor.',
  },
  'course-prompt-practico': {
    title: 'Practical Prompt Engineering: From Theory to Real Projects',
    description: 'The practical companion to "Prompt Engineering from Scratch": less theory, more real exercises — debugging prompts that fail, extracting data, working with code, and chaining tasks.',
  },
  'course-004': {
    title: 'Time Management for Students',
    description: 'Proven techniques like Pomodoro, time-blocking, and the Eisenhower matrix, adapted to the real life of a student with assignments, exams, and a life outside school. You\'ll learn to identify why you procrastinate and build a system you can actually stick to. Coming soon.',
  },
  'course-005': {
    title: 'Notion for Students',
    description: 'Organize notes, tasks, projects, and your calendar in one place with Notion, from scratch. You\'ll see ready-to-copy templates: a subject dashboard, a task tracker, and a connected notes system. Coming soon.',
  },
  'course-006': {
    title: 'UI Design Fundamentals',
    description: 'Learn the basic principles of color, typography, spacing, and composition that make an interface look professional instead of improvised. With real examples from apps and websites, you\'ll understand why certain designs work and others don\'t. Coming soon.',
  },
  'course-007': {
    title: 'Design with Figma',
    description: 'Create professional prototypes and designs using Figma from scratch: reusable components, auto-layout, and how to hand off a design ready for a developer to build. Ideal if you already have an idea and want to see it take shape. Coming soon.',
  },
  'course-008': {
    title: 'English for Programmers',
    description: 'Technical English vocabulary and phrases every developer needs to know: reading documentation, understanding error messages, writing clear commits, and surviving a technical interview in English. Coming soon.',
  },
  'course-nahuatl-a1': {
    title: 'Nahuatl from Scratch (A1)',
    description: 'Your first Nahuatl course: alphabet and pronunciation, greetings, pronouns, numbers, family, and your first complete sentences. A reading-based course.',
  },
  'course-ingles-a1': {
    title: 'English from Scratch (A1): Your First Step',
    description: 'The first course of the Language Academy: general English at A1 level (Common European Framework), explained 100% from Spanish. 39 classes — from the alphabet to comparatives, with real vocabulary, essential grammar, and the most common traps a Spanish speaker falls into when starting out.',
  },
  'course-009': {
    title: 'Programming Fundamentals',
    description: 'Learn to think like a programmer: variables, control flow, functions, and data structures — the foundation you need before learning any language.',
  },
  'course-solid': {
    title: 'SOLID Principles',
    description: 'The five design principles that make code easier to maintain, extend, and test — a mini course with real examples, not just theory.',
  },
  'course-paradigma-react': {
    title: "Oliver Academy's Paradigm: React & Declarative Programming",
    description: 'How this very platform is built: components, JSX, state, hooks, and functional programming — explained with real examples from its own code.',
  },
  'course-react': {
    title: 'React: From Zero to Real Applications',
    description: 'Components, props, state, effects, lists, and forms — a complete, self-contained React course, the library this very platform is built with.',
  },
  'course-vue': {
    title: 'Vue.js: From Zero to Real Applications',
    description: 'Reactivity, directives, components, and the Composition API — a complete Vue.js course, the other great reactive UI framework, with direct comparisons to React.',
  },
  'course-poo': {
    title: 'Introduction to Object-Oriented Programming',
    description: 'Classes, objects, encapsulation, inheritance, and polymorphism — the paradigm that organizes code as "things" with properties and behavior.',
  },
  'course-paradigmas-programacion': {
    title: 'Programming Paradigms: Imperative, OOP, Functional & More',
    description: 'A comparative tour of the major programming styles — to understand WHY different ways of writing code exist, not just memorize syntax.',
  },
  'course-bases-datos': {
    title: 'Introduction to Databases',
    description: 'What a database is, how they\'re organized into tables, basic SQL, relationships between tables, and when to choose SQL vs. NoSQL.',
  },
  'course-lenguajes-programacion': {
    title: 'Introduction to Programming Languages',
    description: 'Compiled vs. interpreted, typing, paradigms, and levels of abstraction: how to choose and understand any programming language.',
  },
  'course-historia-programacion': {
    title: 'History of Programming: From Ada Lovelace to AI',
    description: 'A complete chronological journey: from the first published algorithm in 1843 to today\'s generative artificial intelligence.',
  },
  'course-010': {
    title: 'Introduction to Python',
    description: 'Your first programming language, explained simply and practically: variables, conditionals, loops, and functions, with small exercises you can run and see working instantly. Coming soon.',
  },
  'course-bash': {
    title: 'Bash from Scratch',
    description: 'Master the Linux/Mac terminal: navigation, files, pipes, grep, permissions, and scripts. With an interactive terminal to practice in every lesson.',
  },
  'course-git-github': {
    title: 'Git & GitHub: From Zero to Expert',
    description: "The school's most complete course on version control: from why Git exists (with its real history) to rebase, team collaboration, and automation with GitHub Actions — with dedicated Interactive Console classes to practice every command.",
  },
  'course-apis-python-telegram-bot': {
    title: 'APIs with Python: Build Your Telegram Query Bot',
    description: "A hands-on course from zero to a working bot: what an API is, HTTP and JSON, requests with the requests library, protecting your keys, and how to build your own Telegram bot with python-telegram-bot. You choose which API your bot queries: NASA, real-time weather, or Pokémon data.",
  },
  'course-filo-001': {
    title: 'Introduction to Philosophy',
    description: "Explore humanity's great questions with Jafet Brito. From Plato to the digital world, each lesson combines theory with unique VR experiences.",
  },
  'course-demo': {
    title: 'Demo Course: How to Use Oliver School',
    description: '5 classes that teach you to use the platform end to end: navigation, mascot, missions, items, shop, chats, and achievements.',
  },
  'course-ajedrez': {
    title: 'Chess from Scratch',
    description: 'Learn to play chess step by step: pieces, openings, tactics, and endgames. With hands-on challenges on the campus board.',
  },
  'course-claude-mayores': {
    title: 'Claude for Everyone',
    description: 'Learn to use Claude, an AI assistant, step by step and without rushing — for anyone, no prior experience needed. No virtual worlds, just videos and a simple chat.',
  },
  'course-biologia': {
    title: 'Introduction to Biology',
    description: 'How life works: the cell, DNA, evolution, and ecosystems. A mostly reading-based course, with examples from the natural world you see every day.',
  },
  'course-psicologia': {
    title: 'Introduction to Psychology',
    description: 'Understand how the human mind works: emotions, behavior, memory, and learning. A mostly reading-based course, with real cases and everyday applications.',
  },
  'course-psicologia-desarrollo': {
    title: 'Human Developmental Psychology',
    description: 'How we change physically, cognitively, and emotionally from infancy to old age — a complete tour through the stages of life.',
  },
  'course-psicologia-salud-mental': {
    title: 'Mental Health & Common Psychological Disorders',
    description: "Anxiety, depression, and stress explained without stigma: what they really are, how to recognize them, and when/how to seek professional help.",
  },
  'course-historia': {
    title: 'World History',
    description: "A journey from the first civilizations to the modern world: wars, empires, revolutions, and the people who changed the course of history. You won't just memorize stray dates — you'll connect causes and consequences. Coming soon.",
  },
  'course-sumerios': {
    title: 'The Sumerians: The First Civilization',
    description: 'Writing, the wheel, the first code of laws, the first cities. Almost everything you take for granted, they invented 5,000 years ago. A reading course about the civilization that did it first.',
  },
  'course-matematicas': {
    title: 'Essential Mathematics',
    description: 'Arithmetic, algebra, geometry, and statistics explained from scratch, taking nothing for granted. Everything you need to understand the world in numbers, with interactive exercises, everyday examples, and no fear of formulas. Coming soon.',
  },
  'course-historia-matematicas': {
    title: 'History of Mathematics: From Origin to Infinity',
    description: "Mathematics isn't abstract — it's a set of tools invented by real humans. 30,000 years of chronological history: from the Lebombo bone to AI algorithms.",
  },
  'course-matematicas-griegas': {
    title: 'Ancient Greek Mathematics: Axioms & the Fathers of Geometry',
    description: 'From Thales\' first proof to Archimedes\' method of exhaustion: how the Greeks invented mathematical proof, what an axiom is, and why Euclid\'s "Elements" was taught unchanged for over 2,000 years. With in-depth narrated videos per topic.',
  },
  'course-medicina': {
    title: 'Introduction to Medicine',
    description: 'Medical knowledge belonged to the elite for centuries. Here, it belongs to everyone. A chronological history of medicine + first aid that everyone can and should know.',
  },
  'course-medicina-anatomia': {
    title: 'Human Anatomy & Physiology',
    description: 'How your body is built and how it works, system by system: skeleton, heart, lungs, brain, and digestion, explained from scratch.',
  },
  'course-medicina-patologia': {
    title: 'General Pathology: How & Why We Get Sick',
    description: 'What a disease is, how infections act, what inflammation is, and how a doctor reaches a diagnosis — serious, accessible medical science communication.',
  },
  'course-medicina-farmacologia': {
    title: 'Basic Pharmacology: How Medications Work',
    description: 'What a medication is, how it acts in your body, why dosage matters so much, and why antibiotic resistance is everyone\'s problem.',
  },
  'course-primeros-auxilios': {
    title: 'First Aid: A Practical Guide to Saving Lives',
    description: 'CPR, choking, wounds, burns, fractures, and common emergencies — what to do in the first minutes, before professional help arrives.',
  },
  'course-etica': {
    title: 'Introduction to Ethics',
    description: "What philosophical schools of thought exist for deciding what's right, how to think through real moral dilemmas, and why ethics isn't just opinion. A reading course.",
  },
  'course-mujeres-historia': {
    title: 'Women Who Changed the World',
    description: 'Ada Lovelace, Marie Curie, Rosalind Franklin, and other women whose contributions changed science, technology, and history — and are rarely told in full.',
  },
  'course-desarrollo-mujeres': {
    title: 'Personal Development for Women',
    description: 'Self-esteem, healthy boundaries, independence, and recognizing abuse — practical personal development tools, built around the lived experience of women.',
  },
  'course-antropologia': {
    title: 'Introduction to Anthropology',
    description: "What makes us human, how cultures vary around the world, and what they have in common despite their differences. Rituals, kinship, and how to study a culture without imposing your own. Coming soon.",
  },
  'course-neurociencia': {
    title: 'Introduction to Neuroscience',
    description: "How the human brain works: neurons, memory, emotions, sleep, and consciousness, explained with examples you can recognize in your day-to-day life. No biology background needed to get started. Coming soon.",
  },
  'course-economia': {
    title: 'Introduction to Economics',
    description: "Supply, demand, money, inflation, and how markets move, explained for real life, not for an exam. You'll understand why prices rise and how to make better decisions with your own money. Coming soon.",
  },
  'course-derecho': {
    title: 'Introduction to Law',
    description: 'How laws are built, why justice systems exist, and why knowing your rights is your responsibility — not something you can delegate to someone else.',
  },
  'course-derechos-mx': {
    title: 'My Rights as a Mexican Citizen',
    description: 'Constitutional, labor, health, and due-process rights — explained in plain language. Civic education, not legal advice.',
  },
  'course-derechos-ca': {
    title: 'My Rights as a Canadian',
    description: 'The Charter of Rights and Freedoms, public health, labor rights, and rights before the police — explained in plain language. Civic education, not legal advice.',
  },
  'course-astronomia': {
    title: 'Introduction to Astronomy',
    description: "Stars, planets, galaxies, and our place in a universe we're only beginning to understand. From how a star is born to how we know the universe is expanding. Coming soon.",
  },
  'course-fisica': {
    title: 'Introduction to Physics',
    description: 'The laws that govern the universe, from a falling apple to the speed of light. Mechanics, energy, and the ideas that changed how we understand reality forever. Coming soon.',
  },
  'course-quimica': {
    title: 'Introduction to Chemistry',
    description: "Atoms, molecules, and reactions — what literally everything that exists is made of, from the air you breathe to your own body. You'll learn to read the periodic table without fear. Coming soon.",
  },
  'course-literatura': {
    title: 'Introduction to Literature',
    description: 'Great works and authors who forever changed the way stories are told, from classical epic to modern narrative. You\'ll learn to read with new eyes, beyond whether you liked something or not. Coming soon.',
  },
  'course-arte': {
    title: 'Introduction to Art',
    description: "The history of art and its great movements, from the Renaissance to contemporary art, and how to look at a piece with new eyes. You don't need to know how to draw to learn to see — just curiosity. Coming soon.",
  },
  'course-sociologia': {
    title: 'Introduction to Sociology',
    description: 'How human groups organize themselves, why social classes exist, and why society works (or doesn\'t) the way it does. Tools to understand what\'s happening around you, not just theory. Coming soon.',
  },
  'course-logica': {
    title: 'Introduction to Logic',
    description: 'Classical logic, mathematical logic, and their fallacies: how to reason validly and spot arguments that only LOOK correct.',
  },
  'course-artes-escenicas': {
    title: 'Introduction to Performing Arts & Music',
    description: 'Theater, filmmaking, music theory, and composition — art made live or over time. Coming soon.',
  },
  'course-ing-civil': {
    title: 'Fundamentals of Civil Engineering',
    description: 'How the physical world around us is designed and built: materials, forces, foundations, and infrastructure, explained from scratch.',
  },
  'course-ing-mecanica': {
    title: 'Fundamentals of Mechanical Engineering',
    description: 'How machines are designed: forces, motion, energy, and the mechanisms that turn one thing into another.',
  },
  'course-ing-electrica': {
    title: 'Fundamentals of Electrical & Electronic Engineering',
    description: 'Voltage, current, circuits, and the components that make everything from a lightbulb to a microchip possible — explained from scratch.',
  },
  'course-ing-industrial': {
    title: 'Fundamentals of Industrial Engineering',
    description: 'How processes, quality, and people get optimized: from the production line to the global supply chain.',
  },
  'course-ing-software': {
    title: 'Fundamentals of Software Engineering',
    description: 'The difference between "coding" and building real software: lifecycle, methodologies, version control, and quality.',
  },
  'course-educacion': {
    title: 'Introduction to Education',
    description: 'Pedagogy, instructional design, and educational technology — how the way we learn is designed. Coming soon.',
  },
  'course-agricultura': {
    title: 'Introduction to Agriculture & Veterinary Science',
    description: 'Agronomy, animal science, and veterinary medicine — how we grow and care for plants and animals at scale. Coming soon.',
  },
  'course-comunicacion': {
    title: 'Introduction to Communication & Media',
    description: 'Journalism, audiovisual production, and public relations — how the stories that reach everyone get told. Coming soon.',
  },
  'course-ciberseguridad-basica': {
    title: 'Cybersecurity for Everyone: Protect Your Digital Life',
    description: 'The digital security course for everyday people and company employees, brought to you by Rúbics Digital Solutions ("Building a safer digital world"). Passwords, 2FA, phishing, malware, VPNs, backups, and more — with real free tools and the story of Emma and Raúl, two coworkers who choose very different paths.',
  },
  'course-phishing-2d': {
    title: 'Protect Yourself from Phishing (interactive course)',
    description: 'Experiment: the same course as always, but inside a 2D world — walk through an office and solve a real phishing situation at every desk (fake senders, links, urgency, attachments, and more).',
  },
  'course-ciberseguridad': {
    title: 'Cybersecurity Fundamentals',
    description: 'The essential concepts for protecting systems and data: common threats, basic cryptography, network security, and best practices every developer should know. Coming soon.',
  },
  'course-ethical-hacking': {
    title: 'Ethical Hacking from Scratch',
    description: "Think like an attacker to defend better: reconnaissance, common vulnerabilities, and how to report findings responsibly, always within an ethical and legal framework. Coming soon.",
  },
  'course-open-claw': {
    title: 'Open Claw',
    description: "Explore an open source project from start to finish: how it's structured, how people contribute, and what you can learn by reading other people's code. Coming soon.",
  },
  'course-fuentes-abiertas': {
    title: 'Open Source',
    description: 'What open source software is, why it matters, and how to start contributing to real projects: licenses, pull requests, and the culture behind open source. Coming soon.',
  },
  'course-consola-basica': {
    title: 'Command Line: First Steps',
    description: "The simplest possible introduction to the terminal: what it is, how to open it, and the basic commands to move around without fear. Built for someone who has never typed a command in their life.",
  },
  'course-aprender-a-aprender': {
    title: 'Learn How to Learn: Master Difficult Topics',
    description: "Simple, real techniques (not magic) to understand complicated things faster: breaking things into parts, the Feynman technique, spaced repetition, and active practice. For any subject, not just studying.",
  },
  'course-informatica-basica': {
    title: 'First Steps with the Computer',
    description: 'The most basic course possible: what every part of the computer is, how to use the mouse and keyboard, folders, the internet, and simple security. For someone who has barely used a computer before.',
  },
  'course-china-caracteres': {
    title: 'Chinese Characters & Writing',
    description: 'Learn your first 12 Chinese characters by seeing their real pictographic origin and practicing correct stroke order interactively — person, fire, tree, mountain, water, sun, moon, mouth, field, door, woman, and child.',
  },
  'course-china-cultura': {
    title: 'Chinese Culture: Fundamentals',
    description: "Geography and people, a tour through thousands of years of history, the most important festivals on the lunar calendar, and the customs of the Chinese table — a broad introduction to Chinese culture beyond the language.",
  },
}

export function localizeCourseCatalog(course, lang) {
  if (lang !== 'en') return course
  const tr = COURSE_CATALOG_EN[course.id]
  return tr ? { ...course, ...tr } : course
}
