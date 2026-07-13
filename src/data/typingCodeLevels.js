// Niveles del juego de mecanografía de código (TypingCodeGame.jsx).
// Estructura pensada para crecer: cada nivel es un lenguaje/dificultad con
// una lista de snippets cortos reales. Agregar un nivel/lenguaje nuevo es
// solo añadir una entrada aquí, sin tocar el componente del juego.
//
// IMPORTANTE: dentro de cada nivel, los 5 snippets están escritos para
// funcionar como UN SOLO programa si se concatenan en orden (mismos nombres
// de variable reutilizados a propósito, sin colisiones) — al terminar el
// nivel, TypingCodeGame.jsx literalmente ejecuta esa concatenación con
// `new Function` y muestra la salida real de consola. Si agregas un nivel
// nuevo, mantén esa regla: cada snippet debe declarar variables/funciones
// con nombres únicos en todo el nivel, para que el programa completo corra
// sin errores de "ya declarado".
export const TYPING_LEVELS = [
  {
    id: 'js-basico',
    language: 'JavaScript',
    icon: '🟨',
    title: 'Nivel 1: Fundamentos',
    description: 'Variables, funciones y condicionales — lo primero que escribe cualquier programador.',
    snippets: [
      `const nombre = 'Oliver';\nconsole.log(nombre);`,
      `function saludar(nombre) {\n  return 'Hola, ' + nombre;\n}\nconsole.log(saludar(nombre));`,
      `let contador = 0;\ncontador = contador + 1;\nconsole.log(contador);`,
      `const edad = 20;\nif (edad >= 18) {\n  console.log('Mayor de edad');\n}`,
      `const numeros = [1, 2, 3, 4, 5];\nconsole.log(numeros);`,
    ],
  },
  {
    id: 'js-funciones-strings',
    language: 'JavaScript',
    icon: '🟨',
    title: 'Nivel 2: Funciones y Strings',
    description: 'Template literals, funciones flecha, ternarios y métodos de texto.',
    snippets: [
      `const producto = 'Laptop';\nconst precio = 899;\nconsole.log(\`El \${producto} cuesta $\${precio}\`);`,
      `const doblar = (x) => x * 2;\nconsole.log(doblar(precio));`,
      `const descuento = precio > 500 ? 50 : 10;\nconsole.log(descuento);`,
      `const mensaje = '  hola mundo  ';\nconsole.log(mensaje.trim().toUpperCase());`,
      `const partes = 'a,b,c'.split(',');\nconsole.log(partes.length);`,
    ],
  },
  {
    id: 'js-arrays-bucles',
    language: 'JavaScript',
    icon: '🟨',
    title: 'Nivel 3: Arrays y Bucles',
    description: 'for, forEach, reduce, filter y while — recorrer datos es la mitad del trabajo.',
    snippets: [
      `const frutas = ['manzana', 'pera', 'uva'];\nfor (let i = 0; i < frutas.length; i++) {\n  console.log(frutas[i]);\n}`,
      `frutas.forEach((fruta) => console.log(fruta.toUpperCase()));`,
      `const precios = [10, 20, 30];\nconst total = precios.reduce((suma, p) => suma + p, 0);\nconsole.log(total);`,
      `const pares = precios.filter((p) => p % 20 === 0);\nconsole.log(pares);`,
      `let vuelta = 0;\nwhile (vuelta < 3) {\n  console.log('vuelta ' + vuelta);\n  vuelta++;\n}`,
    ],
  },
  {
    id: 'js-objetos',
    language: 'JavaScript',
    icon: '🟨',
    title: 'Nivel 4: Objetos y Destructuring',
    description: 'Objetos, spread, destructuring y métodos — la forma en que JavaScript organiza datos.',
    snippets: [
      `const persona = { nombre: 'Ana', edad: 28 };\nconsole.log(persona.nombre);`,
      `const { nombre, edad } = persona;\nconsole.log(\`\${nombre} tiene \${edad} años\`);`,
      `const persona2 = { ...persona, ciudad: 'CDMX' };\nconsole.log(persona2);`,
      `const mascota = {\n  apodo: 'Oliver',\n  hablar() {\n    return 'Miau';\n  },\n};\nconsole.log(mascota.hablar());`,
      `const claves = Object.keys(persona2);\nconsole.log(claves);`,
    ],
  },
  {
    id: 'js-moderno',
    language: 'JavaScript',
    icon: '🟨',
    title: 'Nivel 5: Clases y JS Moderno',
    description: 'Clases, map, rest/spread y try/catch — sintaxis de JavaScript actual.',
    snippets: [
      `class Animal {\n  constructor(nombre) {\n    this.nombre = nombre;\n  }\n  saludar() {\n    return \`Soy \${this.nombre}\`;\n  }\n}`,
      `const gato = new Animal('Oliver');\nconsole.log(gato.saludar());`,
      `const numeros = [1, 2, 3];\nconst dobles = numeros.map((n) => n * 2);\nconsole.log(dobles);`,
      `const [primero, ...resto] = dobles;\nconsole.log(primero, resto);`,
      `try {\n  JSON.parse('{ bad json');\n} catch (error) {\n  console.log('Error capturado');\n}`,
    ],
  },
]

export function getTypingLevel(id) {
  return TYPING_LEVELS.find((l) => l.id === id) ?? null
}
