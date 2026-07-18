// Variante "Posición aleatoria" — se sortea la fila trasera (alfiles en
// colores opuestos, luego dama, luego 2 caballos, y los 3 huecos que quedan
// se llenan T-R-T en orden de izquierda a derecha, igual que Chess960 real).
//
// ponytail: NO se implementa el enroque de la variante. chess.js no es
// consciente de Chess960 — su validación de enroque asume que las torres
// empiezan en a1/h1/a8/h8, así que si una torre queda en otra columna el
// motor podría comportarse mal al intentar enrocar. Poner los derechos de
// enroque en '-' evita ese riesgo por completo: el motor simplemente nunca
// ofrece enroque en esta variante. Se rotula honestamente en la UI como
// "Posición aleatoria (sin enroque)", no como "Chess960" completo.
export function randomStartBackRank() {
  const squares = new Array(8).fill(null)
  const emptyIdx = () => squares.reduce((acc, v, i) => (v === null ? [...acc, i] : acc), [])
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

  const evens = [0, 2, 4, 6]
  const odds = [1, 3, 5, 7]
  squares[pick(evens)] = 'b'
  squares[pick(odds.filter((i) => squares[i] === null))] = 'b'

  squares[pick(emptyIdx())] = 'q'
  squares[pick(emptyIdx())] = 'n'
  squares[pick(emptyIdx())] = 'n'

  const [r1, k, r2] = emptyIdx() // ya quedan solo 3, en orden ascendente
  squares[r1] = 'r'
  squares[k] = 'k'
  squares[r2] = 'r'

  return squares.join('')
}

export function randomStartFen() {
  const back = randomStartBackRank()
  return `${back}/pppppppp/8/8/8/8/PPPPPPPP/${back.toUpperCase()} w - - 0 1`
}
