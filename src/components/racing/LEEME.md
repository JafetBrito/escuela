# Oliver Racing (demo) — `/carrera`

Juego de carreras 3D cuesta abajo (inspirado en Tux Racer) donde **la clase que eliges define las preguntas, el vehículo y la pista**.

## Reglas del demo
- El vehículo baja la colina solo; tú giras izquierda/derecha (← → / A D, o botones en el celular).
- Cada ~340 m hay una **bifurcación**: aparece la pregunta, un pórtico con dos carteles (A izquierda, B derecha) y un muro parte la pista en dos carriles. Al entrar a la zona dividida el carril queda fijado según el lado en que vas.
- Carril correcto → turbo + el vehículo sube de nivel. Carril equivocado → trampa: choque, pierdes velocidad y se muestra la respuesta correcta.
- 6 preguntas por carrera. Nivel del vehículo = aciertos (máx. 4). Velocidad máxima = `20 + 7.5 × nivel` m/s. (Prueba del motor: carrera perfecta ≈ 66 s, todo mal ≈ 127 s: acertar compensa.)

## Archivos
| Archivo | Qué hace |
|---|---|
| `racingData.js` | Clases (paleta + 5 vehículos + banco de preguntas `{q, ok, bad}`), constantes de la pista (`RACE`) y `buildForks` (sortea preguntas y el lado correcto) |
| `raceEngine.js` | Motor **sin React/three**: avance, carriles, evaluación de bifurcaciones, niveles. Probar con `node src/components/racing/raceEngine.test.mjs` |
| `track.js` | Línea central de la pista (curvas + pendiente), `frame(s, u)` y cintas de malla que siguen la colina |
| `trackBuild.js` | Arma la pista temática (terreno, asfalto, barreras, muro, pórticos, decorado por clase) y las texturas de los carteles |
| `vehicles.js` | 11 vehículos procedurales low-poly (camilla, silla de ruedas, scooter, ambulancia, turbo, patineta, moto, coche, cohete, carreta, cuadriga) |
| `RacingDemo.jsx` | Menú, escena, HUD, controles táctiles y pantalla de resultados |

## Cómo agregar una clase / preguntas
1. En `CLASSES` (`racingData.js`) agrega la clase: `sky/fog/ground/ground2/road/accent`, `emblem` (`cross`, `code` u `omega`; para uno nuevo agrega su decorado en `trackBuild.js` y su distintivo en `vehicles.js`), 5 `tiers` (usa los `kind` existentes) y ≥ 6 preguntas.
2. Para preguntas de más de 2 opciones habría que partir en 3 carriles (hoy son 2).

## Lo que NO está en el demo (ideas para definir)
- **Programar tu coche** (clase Programación): entre carreras, un mini-reto de código que cambia un parámetro real del vehículo (ej. `acceleration = 12`, un `for` que reparte turbo). Cada clase tendría su propia "mejora" (Medicina: armar el botiquín, Filosofía: argumentar).
- Preguntas desde la base de cursos reales (hoy es un banco fijo en el código) y por nivel de dificultad.
- Progreso guardado en la cuenta (vehículos desbloqueados, récords), XP/oro como recompensa y ranking de amigos.
- Pistas con más temática por clase (hospital, servidores, ágora), obstáculos, derrapes y multijugador.
- Trampas visibles (el carril malo cae a un foso, se ve el reciclaje de la pista).
- Textos en inglés/francés (hoy solo español).
