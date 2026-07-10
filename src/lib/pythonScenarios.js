export const PYTHON_SCENARIOS = [
  {
    id: 'py-01',
    title: '¡Hola, Python!',
    day: 1,
    difficulty: 'Principiante',
    difficultyColor: 'text-emerald-400',
    category: 'Día 1 · Introducción',
    points: 50,
    briefing:
      'Tu primer programa Python. La función print() muestra texto en pantalla — es lo primero que todo programador aprende.',
    objectives: [
      'Usa la función print()',
      'La salida incluye "Hola" o "Hello"',
    ],
    starterCode: '# Tu primer programa Python\n# Usa print() para mostrar "¡Hola, Mundo!"\n\n',
    hint: 'print("¡Hola, Mundo!")',
    checkObjectives: (code, out) => [
      code.includes('print('),
      out.some((l) => /hola|hello/i.test(l)),
    ],
  },
  {
    id: 'py-02',
    title: 'Variables',
    day: 1,
    difficulty: 'Principiante',
    difficultyColor: 'text-emerald-400',
    category: 'Día 1 · Variables',
    points: 75,
    briefing:
      'Las variables son cajas que guardan datos. Pueden guardar texto (str), números (int, float) y más. Cambia los valores y ejecuta.',
    objectives: [
      'Declara la variable nombre (texto)',
      'Declara la variable edad (número real)',
      'Imprime ambas variables',
    ],
    starterCode:
      'nombre = "Escribe tu nombre aquí"\nedad = 0  # Cambia esto por tu edad\n\nprint(nombre)\nprint(edad)\n',
    hint:
      '# Cambia los valores a los tuyos:\nnombre = "Oliver"\nedad = 17\nprint(nombre)\nprint(edad)',
    checkObjectives: (code, out) => [
      /nombre\s*=/.test(code),
      /edad\s*=\s*[1-9]/.test(code),
      out.length >= 2 && out.some((l) => l.trim().length > 0 && !l.includes('Escribe tu nombre')),
    ],
  },
  {
    id: 'py-03',
    title: 'Operadores',
    day: 2,
    difficulty: 'Básico',
    difficultyColor: 'text-blue-400',
    category: 'Día 2 · Matemáticas',
    points: 100,
    briefing:
      'Python es una calculadora poderosa. Aprende los operadores especiales: % (residuo), ** (potencia) y la función len() (longitud de texto).',
    objectives: [
      'Muestra el residuo de 17 ÷ 3  →  debe ser 2',
      'Muestra 2 elevado a la 8  →  debe ser 256',
      'Muestra el largo de "Python"  →  debe ser 6',
    ],
    starterCode:
      '# Calcula y muestra (en ese orden):\n# 1. El residuo de 17 entre 3  →  usa el operador %\n# 2. Dos a la octava potencia   →  usa el operador **\n# 3. El largo de "Python"       →  usa len()\n\n',
    hint:
      '# % = residuo (módulo)\n# ** = potencia\n# len() = longitud de un string\nprint(17 % 3)      # 2\nprint(2 ** 8)      # 256\nprint(len("Python"))  # 6',
    checkObjectives: (_code, out) => [
      out.some((l) => l.trim() === '2'),
      out.some((l) => l.trim() === '256'),
      out.some((l) => l.trim() === '6'),
    ],
  },
  {
    id: 'py-04',
    title: 'Condicionales',
    day: 3,
    difficulty: 'Básico',
    difficultyColor: 'text-blue-400',
    category: 'Día 3 · Decisiones',
    points: 125,
    briefing:
      'Los programas toman decisiones con if / elif / else. Escribe el código que evalúa la nota de un alumno y muestra si aprobó.',
    objectives: [
      'Usa if, elif y else',
      'Con nota=85 la salida dice "Aprobado"',
    ],
    starterCode:
      'nota = 85\n\n# Escribe el if/elif/else:\n# Si nota >= 90  →  "Sobresaliente"\n# Si nota >= 70  →  "Aprobado"\n# Si no          →  "Reprobado"\n\n',
    hint:
      'if nota >= 90:\n    print("Sobresaliente")\nelif nota >= 70:\n    print("Aprobado")\nelse:\n    print("Reprobado")',
    checkObjectives: (code, out) => [
      code.includes('if') && code.includes('elif') && code.includes('else'),
      out.some((l) => /aprobado/i.test(l)),
    ],
  },
  {
    id: 'py-05',
    title: 'Bucle for',
    day: 4,
    difficulty: 'Intermedio',
    difficultyColor: 'text-yellow-400',
    category: 'Día 4 · Bucles',
    points: 150,
    briefing:
      'Los bucles repiten código automáticamente. Usa for + range() para imprimir la tabla de multiplicar del 7 del 1 al 10.',
    objectives: [
      'Usa un bucle for con range()',
      'Imprime 10 líneas (una por multiplicación)',
      'Primera línea contiene "7", "1" y el resultado "7"',
    ],
    starterCode:
      '# Imprime la tabla de multiplicar del 7\n# Formato esperado: "7 x 1 = 7"\n# Pista: usa f-strings →  f"7 x {i} = {7 * i}"\n\n',
    hint:
      '# range(1, 11) genera los números 1 al 10\nfor i in range(1, 11):\n    print(f"7 x {i} = {7 * i}")',
    checkObjectives: (code, out) => [
      code.includes('for') && code.includes('range'),
      out.length >= 10,
      Boolean(out[0]) && out[0].includes('7') && out[0].includes('1') && /=\s*7$/.test(out[0].trim()),
    ],
  },
]
