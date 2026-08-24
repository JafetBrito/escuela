// `embeddable`: true si el sitio NO manda X-Frame-Options/CSP frame-ancestors
// restrictivo (verificado con curl -I sobre cada url — mismo checklist que
// Blog, ver project_bookshelf_and_blog_embed en memoria). Si es true,
// GuideViewerModal lo muestra en un <iframe> sin salir de la plataforma; si
// es false, el sitio bloquea el embed por su propia política de seguridad y
// el modal ofrece solo el botón de abrir en pestaña nueva.
export const GUIAS = [
  {
    id: 'web',
    icon: '🌐',
    title: 'Desarrollo Web',
    color: 'from-blue-500 to-cyan-500',
    links: [
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/es/', desc: 'La referencia web más completa: HTML, CSS, JS, APIs. Disponible en español.', icon: '📘', embeddable: false },
      { title: 'DevDocs.io', url: 'https://devdocs.io', desc: 'Documentación offline de +700 tecnologías en un solo lugar. Funciona sin internet.', icon: '📚', embeddable: true },
    ],
  },
  {
    id: 'python',
    icon: '🐍',
    title: 'Python',
    color: 'from-yellow-400 to-green-500',
    links: [
      { title: 'Python Docs Oficial', url: 'https://docs.python.org/es/3/', desc: 'Documentación oficial de Python en español: tutorial, biblioteca estándar, referencia.', icon: '📖', embeddable: true },
      { title: 'Real Python', url: 'https://realpython.com', desc: 'Tutoriales prácticos en profundidad: web scraping, APIs, machine learning, async.', icon: '🐍', embeddable: false },
    ],
  },
  {
    id: 'js',
    icon: '🟨',
    title: 'JavaScript / TypeScript',
    color: 'from-yellow-400 to-orange-500',
    links: [
      { title: 'javascript.info', url: 'https://es.javascript.info', desc: 'El mejor tutorial de JS moderno en español. Desde variables hasta async/await.', icon: '📕', embeddable: false },
      { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/es/docs/handbook/', desc: 'Manual oficial de TypeScript. Types, interfaces, generics, decoradores.', icon: '📘', embeddable: true },
    ],
  },
  {
    id: 'react',
    icon: '⚛️',
    title: 'React & Frameworks',
    color: 'from-cyan-400 to-blue-500',
    links: [
      { title: 'React Docs (react.dev)', url: 'https://es.react.dev', desc: 'Documentación oficial de React con ejemplos interactivos. En español.', icon: '⚛️', embeddable: true },
      { title: 'Next.js Docs', url: 'https://nextjs.org/docs', desc: 'Framework React full-stack. Rutas, SSR, SSG, Server Components.', icon: '▲', embeddable: false },
    ],
  },
  {
    id: 'db',
    icon: '🗄️',
    title: 'Bases de Datos',
    color: 'from-purple-500 to-indigo-600',
    links: [
      { title: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/', desc: 'Referencia completa de PostgreSQL: SQL, funciones, índices, transacciones.', icon: '🐘', embeddable: false },
      { title: 'SQLite Tutorial', url: 'https://www.sqlitetutorial.net', desc: 'Aprende SQLite desde cero. Ideal para apps locales, móvil y prototipado.', icon: '🗃️', embeddable: true },
    ],
  },
  {
    id: 'linux',
    icon: '🐧',
    title: 'Linux & Terminal',
    color: 'from-gray-600 to-gray-800',
    links: [
      { title: 'TLDR Pages', url: 'https://tldr.sh', desc: 'Man pages simplificadas. Ejemplos prácticos de cualquier comando en segundos.', icon: '📄', embeddable: true },
      { title: 'ExplainShell', url: 'https://explainshell.com', desc: 'Pega cualquier comando y te explica cada parte: flags, argumentos, pipes.', icon: '🔍', embeddable: true },
    ],
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'Inteligencia Artificial',
    color: 'from-violet-500 to-purple-600',
    links: [
      { title: 'Prompting Guide', url: 'https://www.promptingguide.ai/es', desc: 'La guía más completa de prompt engineering. Zero-shot, CoT, ReAct, ToT y más.', icon: '✨', embeddable: true },
      { title: 'Hugging Face Docs', url: 'https://huggingface.co/docs', desc: 'Transformers, Diffusers, Datasets. El hub de IA open source más grande del mundo.', icon: '🤗', embeddable: false },
    ],
  },
  {
    id: 'security',
    icon: '🔒',
    title: 'Ciberseguridad',
    color: 'from-red-500 to-rose-700',
    links: [
      { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', desc: 'Los 10 riesgos de seguridad más críticos en aplicaciones web. Referencia obligatoria.', icon: '🛡️', embeddable: false },
      { title: 'GTFOBins', url: 'https://gtfobins.github.io', desc: 'Formas de explotar binarios Unix para escalada de privilegios y bypass de restricciones.', icon: '🕵️', embeddable: true },
    ],
  },
  {
    id: 'devops',
    icon: '🐳',
    title: 'DevOps & Cloud',
    color: 'from-blue-600 to-indigo-700',
    links: [
      { title: 'Docker Docs', url: 'https://docs.docker.com', desc: 'Contenedores, imágenes, Compose, networking. El estándar de la industria.', icon: '🐳', embeddable: false },
      { title: 'GitHub Actions', url: 'https://docs.github.com/es/actions', desc: 'CI/CD integrado en GitHub. Automatiza builds, tests y despliegues en minutos.', icon: '⚙️', embeddable: false },
    ],
  },
  {
    id: 'design',
    icon: '🎨',
    title: 'Diseño & CSS',
    color: 'from-pink-500 to-rose-500',
    links: [
      { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', desc: 'Clases utilitarias para cualquier diseño. La forma más rápida de hacer UI.', icon: '💨', embeddable: true },
      { title: 'CSS Tricks', url: 'https://css-tricks.com', desc: 'Artículos prácticos sobre CSS, Grid, Flexbox, animaciones y más.', icon: '✂️', embeddable: false },
    ],
  },
  {
    id: 'math',
    icon: '📐',
    title: 'Matemáticas',
    color: 'from-emerald-500 to-teal-600',
    links: [
      { title: 'Khan Academy', url: 'https://es.khanacademy.org', desc: 'Matemáticas completas en español: aritmética, álgebra, cálculo, estadística.', icon: '🏫', embeddable: true },
      { title: 'Wolfram MathWorld', url: 'https://mathworld.wolfram.com', desc: 'La enciclopedia matemática más completa. Fórmulas, teoremas, demostraciones.', icon: '🌐', embeddable: true },
    ],
  },
  {
    id: 'algorithms',
    icon: '♟️',
    title: 'Algoritmos & Estructuras',
    color: 'from-amber-500 to-orange-600',
    links: [
      { title: 'Visualgo', url: 'https://visualgo.net/es', desc: 'Visualizaciones animadas de algoritmos y estructuras de datos. Ver para entender.', icon: '👁️', embeddable: true },
      { title: 'Big-O Cheatsheet', url: 'https://www.bigocheatsheet.com', desc: 'Complejidad de tiempo y espacio de los algoritmos más comunes. Referencia rápida.', icon: '⏱️', embeddable: true },
    ],
  },
]
