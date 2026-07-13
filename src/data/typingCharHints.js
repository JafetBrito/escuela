// Ayuda de símbolos para el juego de mecanografía de código. Para cada
// carácter especial, un nombre + para qué se usa + su código Alt (Windows:
// Alt + número en el teclado numérico, con NumLock activado — funciona en
// CUALQUIER distribución de teclado porque usa el valor ASCII directo, así
// que es la referencia más confiable independientemente de dónde esté la
// tecla físicamente en el teclado del estudiante).
export const CHAR_HINTS = {
  '=': { name: 'signo igual', tip: 'Asigna un valor a una variable.', alt: 'Alt+61' },
  ':': { name: 'dos puntos', tip: 'Separa una clave de su valor (objetos) o abre un bloque.', alt: 'Alt+58' },
  ';': { name: 'punto y coma', tip: 'Cierra una instrucción.', alt: 'Alt+59' },
  ',': { name: 'coma', tip: 'Separa elementos en listas, argumentos o parámetros.', alt: 'Alt+44' },
  '.': { name: 'punto', tip: 'Accede a una propiedad o método (ej. objeto.propiedad).', alt: 'Alt+46' },
  "'": { name: 'comilla simple', tip: "Encierra texto (strings). En algunos teclados es tecla muerta: si no aparece sola, prueba con el código Alt.", alt: 'Alt+39' },
  '"': { name: 'comilla doble', tip: 'También encierra texto (strings).', alt: 'Alt+34' },
  '`': { name: 'acento grave (backtick)', tip: 'Encierra template literals, permite meter variables con ${...}.', alt: 'Alt+96' },
  '(': { name: 'paréntesis que abre', tip: 'Abre argumentos de una función o una condición.', alt: 'Alt+40' },
  ')': { name: 'paréntesis que cierra', tip: 'Cierra argumentos de una función o una condición.', alt: 'Alt+41' },
  '{': { name: 'llave que abre', tip: 'Abre un bloque de código o un objeto.', alt: 'Alt+123' },
  '}': { name: 'llave que cierra', tip: 'Cierra un bloque de código o un objeto.', alt: 'Alt+125' },
  '[': { name: 'corchete que abre', tip: 'Abre un arreglo o un índice.', alt: 'Alt+91' },
  ']': { name: 'corchete que cierra', tip: 'Cierra un arreglo o un índice.', alt: 'Alt+93' },
  '_': { name: 'guion bajo', tip: 'Se usa en nombres de variables (snake_case).', alt: 'Alt+95' },
  '+': { name: 'signo más', tip: 'Suma números o concatena texto.', alt: 'Alt+43' },
  '-': { name: 'guion / signo menos', tip: 'Resta números o se usa en nombres compuestos.', alt: 'Alt+45' },
  '*': { name: 'asterisco', tip: 'Multiplica números.', alt: 'Alt+42' },
  '/': { name: 'diagonal', tip: 'Divide números o inicia un comentario "//".', alt: 'Alt+47' },
  '\\': { name: 'diagonal invertida', tip: 'Escapa caracteres especiales dentro de un texto.', alt: 'Alt+92' },
  '<': { name: 'menor que', tip: 'Compara si un valor es menor que otro.', alt: 'Alt+60' },
  '>': { name: 'mayor que', tip: 'Compara si un valor es mayor que otro.', alt: 'Alt+62' },
  '!': { name: 'signo de exclamación', tip: 'Niega un valor (ej. !true) o indica "distinto de" (!=).', alt: 'Alt+33' },
  '?': { name: 'signo de interrogación', tip: 'Se usa en operadores ternarios y valores opcionales.', alt: 'Alt+63' },
  '&': { name: 'ampersand', tip: 'Operador lógico "y" (&&).', alt: 'Alt+38' },
  '|': { name: 'barra vertical (pipe)', tip: 'Operador lógico "o" (||).', alt: 'Alt+124' },
  '%': { name: 'signo de porcentaje', tip: 'Devuelve el resto de una división (módulo).', alt: 'Alt+37' },
  '@': { name: 'arroba', tip: 'Se usa en decoradores y menciones, según el lenguaje.', alt: 'Alt+64' },
  '#': { name: 'numeral / gato', tip: 'Comentarios en algunos lenguajes, o campos privados en clases JS.', alt: 'Alt+35' },
  '$': { name: 'signo de dólar', tip: 'Se usa dentro de template literals: ${variable}.', alt: 'Alt+36' },
  '^': { name: 'circunflejo', tip: 'Operador de potencia en algunos lenguajes.', alt: 'Alt+94' },
  '~': { name: 'virgulilla (tilde)', tip: 'Operador NOT a nivel de bits.', alt: 'Alt+126' },
}

// Devuelve los símbolos especiales (con hint conocido) que aparecen en un
// snippet, en el orden en que aparecen por primera vez.
export function getHintsForSnippet(snippet) {
  const seen = new Set()
  const result = []
  for (const ch of snippet) {
    if (CHAR_HINTS[ch] && !seen.has(ch)) {
      seen.add(ch)
      result.push({ char: ch, ...CHAR_HINTS[ch] })
    }
  }
  return result
}
