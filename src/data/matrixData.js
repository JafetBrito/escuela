// ─── Janulus Matrix Game — Dictionary ─────────────────────────────────────
// Sentence = Base + Verb + Vocab (always this order).
// Verb fields:  emoji, anim, definition (ES), definitionEn, etymology (ES), etymologyEn, examples [{s,t}]
// Vocab fields: emoji, keyword, definition (ES), definitionEn, etymology (ES), etymologyEn?, oliversTip, examples
// etymologyEn only on EN items; definitionEn on all items.

export const JANULUS_DATA = {
  en: {
    name: 'English',
    flag: '🇬🇧',
    speechLang: 'en-US',
    levels: [
      {
        level: 1,
        name: 'First Blocks',
        oliversIntro: {
          headline: '¡Nivel 1 · First Blocks!',
          message: 'Voy a enseñarte las frases más fundamentales del inglés. Powell Janulus — el políglota canadiense que habla 42 idiomas — siempre empezó exactamente aquí: con 3 bloques simples que se combinan infinitamente.\n\nEn este nivel aprenderás verbos básicos de acción y vocabulario concreto que usarás toda la vida.',
          technique: '🔵 Estructura  +  🟢 Verbo  +  🟣 Objeto\n\n"I want to" + "find" + "a key"\n= I want to find a key',
          funFact: '💡 Con solo 1,000 palabras básicas puedes entender el 85% del inglés cotidiano. Hoy empezamos con las más importantes.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I like to' },
          { id: 'b4', text: 'I have to' },
          { id: 'b5', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Encontrar o localizar algo que se busca o que estaba perdido.',
            definitionEn: 'To locate or discover something that was lost or hidden.',
            etymology: 'Del anglosajón "findan". Del proto-germánico, relacionado con el alemán "finden". Originalmente significaba "ir a buscar" — el movimiento hacia el descubrimiento.',
            etymologyEn: 'From Old English "findan", related to German "finden". Proto-Germanic root. Originally meant "to go looking for" — the movement toward discovery.',
            examples: [
              { s: 'I want to find a key.', t: 'Quiero encontrar una llave.' },
              { s: 'Can you find the map?', t: '¿Puedes encontrar el mapa?' },
            ],
          },
          {
            id: 'v2', text: 'use', emoji: '🔧', anim: 'spin',
            definition: 'Emplear algo para un propósito determinado; hacer uso de algo.',
            definitionEn: 'To employ something for a particular purpose.',
            etymology: 'Del latín "usus", de "uti" (usar, disfrutar). La raíz de "utensil", "utility", "abuse" y "usual". Usar algo es darle su propósito.',
            etymologyEn: 'From Latin "usus", from "uti" (to use, to enjoy). Root of "utensil", "utility", "abuse", and "usual". Using something gives it its purpose.',
            examples: [
              { s: 'I can use the compass.', t: 'Puedo usar la brújula.' },
              { s: 'You can use the torch.', t: 'Puedes usar la linterna.' },
            ],
          },
          {
            id: 'v3', text: 'carry', emoji: '💪', anim: 'lift',
            definition: 'Transportar o llevar algo de un lugar a otro, sosteniéndolo.',
            definitionEn: 'To hold and transport something from one place to another.',
            etymology: 'Del francés normando "carier" (llevar en carro), de "car" (vehículo). Los normandos conquistaron Inglaterra en 1066 y trajeron cientos de palabras latinas al inglés.',
            etymologyEn: 'From Norman French "carier" (to transport by cart), from "car" (vehicle). Brought to English by the Norman Conquest of 1066.',
            examples: [
              { s: 'I need to carry a torch.', t: 'Necesito llevar una linterna.' },
              { s: 'She carries the bucket.', t: 'Ella lleva el cubo.' },
            ],
          },
          {
            id: 'v4', text: 'open', emoji: '🚪', anim: 'swing',
            definition: 'Mover una puerta, tapa o barrera para dar acceso a algo.',
            definitionEn: 'To move a door, lid, or barrier to allow access to something.',
            etymology: 'Del anglosajón "openian". Relacionado con el alemán "öffnen". Del latín "aperire" — de donde viene "apertura" y "aperitivo" (la bebida que "abre" el apetito).',
            etymologyEn: 'From Old English "openian", related to German "öffnen". Latin root "aperire" — also the source of "aperture" and "aperitif" (the drink that "opens" the appetite).',
            examples: [
              { s: 'I want to open the door.', t: 'Quiero abrir la puerta.' },
              { s: 'Can you open the book?', t: '¿Puedes abrir el libro?' },
            ],
          },
          {
            id: 'v5', text: 'see', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos; observar o contemplar.',
            definitionEn: 'To perceive with the eyes; to observe or notice something.',
            etymology: 'Del anglosajón "sēon". Del proto-germánico "sehwanan". Del indo-europeo "sekw-" (seguir con los ojos). Una de las palabras más antiguas y fundamentales de cualquier idioma.',
            etymologyEn: 'From Old English "sēon", Proto-Germanic "sehwanan". Indo-European root "sekw-" (to follow with the eyes). Among the oldest words in any language.',
            examples: [
              { s: 'I can see a candle.', t: 'Puedo ver una vela.' },
              { s: 'Do you see the mirror?', t: '¿Ves el espejo?' },
            ],
          },
          {
            id: 'v6', text: 'hold', emoji: '✋', anim: 'pulse',
            definition: 'Agarrar o sostener algo con las manos o los brazos; mantener en posición.',
            definitionEn: 'To grasp or keep something in your hands or arms; to maintain in position.',
            etymology: 'Del anglosajón "haldan". Del proto-germánico "haldanan". Del indo-europeo "kel-" (dominar, controlar). Relacionado con "behold" (contemplar) y "withhold" (retener).',
            etymologyEn: 'From Old English "haldan". Indo-European "kel-" (to dominate, control). Related to "behold" (to look at with reverence) and "withhold" (to keep back).',
            examples: [
              { s: 'Hold the torch!', t: '¡Sostén la linterna!' },
              { s: 'I need to hold the ladder.', t: 'Necesito sostener la escalera.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a key', emoji: '🗝️', keyword: 'key',
            definition: 'Instrumento metálico pequeño con forma dentada que abre o cierra una cerradura.',
            definitionEn: 'A small metal instrument with teeth that fits into a lock to open or close it.',
            etymology: 'Del anglosajón "cæg" (siglo VII). Una de las primeras palabras del inglés — anterior a la conquista normanda.',
            etymologyEn: 'From Old English "cæg" (7th century) — one of the oldest English words, predating the Norman Conquest.',
            oliversTip: '"Key" en inglés, "clé" en francés, "clave" en español, "clau" en catalán — ¡todas del latín "clavis"! Los idiomas son familia. 🌍\n\nPowell Janulus dice: "Cada palabra que aprendes es una llave que abre una nueva realidad."',
            examples: [
              { s: 'I want to find a key.', t: 'Quiero encontrar una llave.' },
              { s: 'I have a key.', t: 'Tengo una llave.' },
            ],
          },
          {
            id: 'w2', text: 'an apple', emoji: '🍎', keyword: 'apple',
            definition: 'Fruta redonda de piel roja, verde o amarilla y pulpa blanca, con un sabor dulce o ligeramente ácido.',
            definitionEn: 'A round fruit with red, green, or yellow skin and white flesh, grown on trees.',
            etymology: 'Del anglosajón "æppel" (siglo VIII). La misma raíz germánica que el alemán "Apfel" y el holandés "appel". Una de las palabras más antiguas del idioma.',
            etymologyEn: 'From Old English "æppel" (8th century). Same Germanic root as German "Apfel" and Dutch "appel". One of the very oldest words in the English language.',
            oliversTip: 'En latín, la manzana era "malum" — que también significaba "malo". El nombre científico del manzano es Malus domestica. ¡Los griegos creían que las manzanas traían maldad! 🍏',
            examples: [
              { s: 'I like to eat an apple.', t: 'Me gusta comer una manzana.' },
              { s: 'I can see an apple.', t: 'Puedo ver una manzana.' },
            ],
          },
          {
            id: 'w3', text: 'some water', emoji: '💧', keyword: 'water',
            definition: 'Líquido transparente, inodoro e insípido, esencial para la vida. Compuesto de hidrógeno y oxígeno (H₂O).',
            definitionEn: 'A clear, colorless, odorless liquid essential for life. Chemical formula: H₂O.',
            etymology: 'Del anglosajón "wæter" — casi idéntico al alemán "Wasser" y al holandés "water". Del proto-indo-europeo "wódr̥".',
            etymologyEn: 'From Old English "wæter", nearly identical to German "Wasser" and Dutch "water". From Proto-Indo-European "wódr̥" — a word shared from Iceland to India.',
            oliversTip: '"Water" (inglés), "Wasser" (alemán), "vatten" (sueco), "voda" (ruso) — todos hermanos del mismo origen indo-europeo. 🧬\n\n¡El inglés y el ruso comparten la misma palabra para "agua"!',
            examples: [
              { s: 'I need some water.', t: 'Necesito agua.' },
              { s: 'Can I have some water?', t: '¿Me puedes dar agua?' },
            ],
          },
          {
            id: 'w4', text: 'a candle', emoji: '🕯️', keyword: 'candle',
            definition: 'Cilindro de cera o sebo con una mecha en el centro que produce luz y calor al encenderse.',
            definitionEn: 'A stick of wax with a wick in the center that produces light and heat when lit.',
            etymology: 'Del latín "candela", de "candere" (brillar, resplandecer). La misma raíz que "incandescent" e "incendio".',
            etymologyEn: 'From Latin "candela", from "candere" (to glow, shine). Root of "incandescent" — and "candidate": Roman candidates wore bright white togas to appear pure and luminous.',
            oliversTip: '¡La misma raíz que "candidate"! En la Roma antigua, los candidatos políticos llevaban togas "candidas" (blancas, brillantes). Un "candidato" era literalmente un "portador de luz". 🕯️',
            examples: [
              { s: 'I can see a candle.', t: 'Puedo ver una vela.' },
              { s: 'Hold the candle!', t: '¡Sostén la vela!' },
            ],
          },
          {
            id: 'w5', text: 'a mirror', emoji: '🪞', keyword: 'mirror',
            definition: 'Superficie pulida, generalmente de vidrio con baño de plata, que refleja la imagen de los objetos.',
            definitionEn: 'A smooth reflective surface — usually silver-coated glass — that shows your image.',
            etymology: 'Del latín "mirare" (mirar con admiración) a través del francés antiguo "mireor".',
            etymologyEn: 'From Latin "mirare" (to look at with wonder), through Old French "mireor". Root of "admire", "miracle", and "mirage".',
            oliversTip: 'Misma raíz: "admire" (admirar), "miracle" (milagro), "mirage" (espejismo). El español "mirar" también viene de aquí. 👁️',
            examples: [
              { s: 'I use a mirror.', t: 'Uso un espejo.' },
              { s: 'I can see a mirror.', t: 'Puedo ver un espejo.' },
            ],
          },
          {
            id: 'w6', text: 'a bell', emoji: '🔔', keyword: 'bell',
            definition: 'Objeto hueco de metal, generalmente bronce, con forma de copa invertida, que produce un sonido resonante al ser golpeado.',
            definitionEn: 'A hollow metal object, usually bronze, shaped like an inverted cup, that rings when struck.',
            etymology: 'Del anglosajón "belle" (siglo XI). Posiblemente una onomatopeya del sonido "bel-bel".',
            etymologyEn: 'From Old English "belle" (11th century). Possibly onomatopoeic — mimicking the "bel-bel" sound. "Belfry" (bell tower) comes from Medieval German "Bergfried".',
            oliversTip: 'Las campanas fueron el primer sistema de comunicación a distancia de la humanidad: anunciaban el tiempo, el peligro, las fiestas y la guerra. 🔔',
            examples: [
              { s: 'I can hear a bell.', t: 'Puedo escuchar una campana.' },
              { s: 'I want to find a bell.', t: 'Quiero encontrar una campana.' },
            ],
          },
          {
            id: 'w7', text: 'a compass', emoji: '🧭', keyword: 'compass',
            definition: 'Instrumento de navegación con una aguja magnética giratoria que siempre apunta al norte, usado para orientarse.',
            definitionEn: 'A navigation device with a magnetized needle that always points north, used for orientation.',
            etymology: 'Del latín "compassus" (literalmente: "medir pasos juntos"). Com- = juntos, passus = paso. Del francés antiguo "compas".',
            etymologyEn: 'From Latin "compassus" (measuring steps together — com + passus). Also means "musical compass" — both senses "measure with precision".',
            oliversTip: 'La brújula llegó a Europa desde China en el siglo XII por la Ruta de la Seda. Sin ella no habría navegación oceánica. 🧭',
            examples: [
              { s: 'I need a compass.', t: 'Necesito una brújula.' },
              { s: 'Use the compass!', t: '¡Usa la brújula!' },
            ],
          },
          {
            id: 'w8', text: 'a ladder', emoji: '🪜', keyword: 'ladder',
            definition: 'Estructura formada por dos largueros paralelos unidos por travesaños transversales, usada para subir o bajar a distintas alturas.',
            definitionEn: 'A structure of two vertical poles with horizontal rungs between them, used for climbing.',
            etymology: 'Del anglosajón "hlæder". Relacionada con "lean" (apoyarse). Literalmente: "lo que se apoya para elevarte".',
            etymologyEn: 'From Old English "hlæder", related to "lean" (to rest against something). Literally: "that which you lean against to rise up".',
            oliversTip: 'La escalera es una de las herramientas más antiguas de la humanidad — evidencia de escaleras de madera de hace 10,000 años. 🪜',
            examples: [
              { s: 'I can carry a ladder.', t: 'Puedo llevar una escalera.' },
              { s: 'She needs a ladder.', t: 'Ella necesita una escalera.' },
            ],
          },
          {
            id: 'w9', text: 'a bucket', emoji: '🪣', keyword: 'bucket',
            definition: 'Recipiente de forma cilíndrica o troncocónica con un asa, usado para transportar o almacenar líquidos.',
            definitionEn: 'A cylindrical container with a handle, used for carrying or holding liquids or other materials.',
            etymology: 'Del inglés medieval "buket" (siglo XIII). Posiblemente del francés antiguo "buquet" (cubo de balancín en un pozo).',
            etymologyEn: 'From Middle English "buket" (13th century). Possibly from Old French "buquet" (a bucket used to draw water from wells). Origin of "bucket list" via "kick the bucket".',
            oliversTip: 'Un "bucket list" viene de "kick the bucket" — que probablemente viene del francés "buquet" (travesaño del que se colgaba a alguien). 🪣\n\n¡El inglés coloquial guarda historia oscura!',
            examples: [
              { s: 'I have a bucket.', t: 'Tengo un cubo.' },
              { s: 'She carries a bucket.', t: 'Ella lleva un cubo.' },
            ],
          },
          {
            id: 'w10', text: 'a book', emoji: '📖', keyword: 'book',
            definition: 'Conjunto de hojas de papel escritas o impresas, unidas por un lado y protegidas por cubiertas.',
            definitionEn: 'A set of written or printed pages bound together between covers.',
            etymology: 'Del anglosajón "bōc" — que originalmente significaba "corteza de haya" (el árbol Fagus). Los primeros escritos anglosajones se tallaban en corteza.',
            etymologyEn: 'From Old English "bōc" — originally meaning "beech bark" (the Fagus tree). The earliest Anglo-Saxon writing was scratched into bark. Same root as German "Buch" and Swedish "bok".',
            oliversTip: '"Book" (inglés), "Buch" (alemán), "bok" (sueco) — todos de la corteza de haya. 🌳\n\nEn latín, "liber" significaba tanto "libro" como "libre" (libertad). ¡Los libros son libertad!',
            examples: [
              { s: 'I like to open a book.', t: 'Me gusta abrir un libro.' },
              { s: 'I want to hold a book.', t: 'Quiero sostener un libro.' },
            ],
          },
          {
            id: 'w11', text: 'a map', emoji: '🗺️', keyword: 'map',
            definition: 'Representación gráfica y a escala de una superficie geográfica, que muestra accidentes naturales, ciudades y otros elementos.',
            definitionEn: 'A drawing or diagram showing an area of land or sea with its features and geography.',
            etymology: 'Del latín medieval "mappa mundi" (literalmente "tela del mundo"). Los primeros mapas se pintaban en tela o piel de animal.',
            etymologyEn: 'From Medieval Latin "mappa mundi" — "cloth of the world". The earliest maps were painted on cloth or animal skin. The first known world map dates to Babylon, 600 BC.',
            oliversTip: 'El primer mapa del mundo conocido es babilónico, del año 600 a.C. Aprender un idioma es construir un mapa de una nueva realidad. 🗺️',
            examples: [
              { s: 'I can use a map.', t: 'Puedo usar un mapa.' },
              { s: 'I want to find a map.', t: 'Quiero encontrar un mapa.' },
            ],
          },
          {
            id: 'w12', text: 'a torch', emoji: '🔦', keyword: 'torch',
            definition: 'Fuente de luz portátil que puede llevarse en la mano. En inglés británico también significa linterna eléctrica.',
            definitionEn: 'A portable handheld light source. In British English, also an electric flashlight.',
            etymology: 'Del latín "torquere" (torcer, retorcer). Las primeras antorchas eran telas retorcidas impregnadas de aceite o resina.',
            etymologyEn: 'From Latin "torquere" (to twist, writhe). First torches were twisted rags soaked in oil or resin. "Torque", "torture", and "contortion" share this root.',
            oliversTip: '"Torque" (mecánica), "contortion" (contorsión), "extort" (extorsionar — literalmente "torcer el brazo de alguien"), "torture" — todos de la misma raíz latina "torquere". 🔥',
            examples: [
              { s: 'I need a torch.', t: 'Necesito una linterna.' },
              { s: 'Hold the torch!', t: '¡Sostén la linterna!' },
            ],
          },
        ],
      },
      {
        level: 2,
        name: 'In Context',
        oliversIntro: {
          headline: 'Nivel 2 · In Context',
          message: 'Aquí el inglés se vuelve elegante. Las estructuras base son más sofisticadas y los verbos expresan conceptos abstractos del mundo mental: comprender, recordar, mejorar, apreciar...\n\nPowell Janulus dice que el Nivel 2 es cuando tu cerebro empieza a "pensar" en el idioma en lugar de solo traducir.',
          technique: '🔵 Base  +  🟢 Verbo abstracto  +  🟣 Concepto\n\n"I\'m learning how to" + "appreciate" + "the culture"\n= I\'m learning how to appreciate the culture',
          funFact: '💡 Los hablantes nativos de inglés usan estructuras como "I\'d like to" y "It is important to" constantemente. Dominarlas te hace sonar profesional al instante.',
        },
        bases: [
          { id: 'b1', text: "I'd like to" },
          { id: 'b2', text: "I'm trying to" },
          { id: 'b3', text: 'It is important to' },
          { id: 'b4', text: "I'm learning how to" },
          { id: 'b5', text: 'We need to' },
          { id: 'b6', text: "I'm going to" },
        ],
        verbs: [
          {
            id: 'v1', text: 'understand', emoji: '🤔', anim: 'think',
            definition: 'Captar el significado, la naturaleza o la razón de algo; comprender con la mente.',
            definitionEn: 'To grasp the meaning or nature of something; to comprehend.',
            etymology: 'Del anglosajón "understandan": "under" (bajo, entre) + "stand" (estar de pie). Literalmente "estar en medio de" las ideas.',
            etymologyEn: 'From Old English "understandan": under (among, between) + stand. Literally "to stand in the middle of" ideas — to be surrounded by them and grasp them.',
            examples: [
              { s: "I want to understand the language.", t: "Quiero entender el idioma." },
              { s: "I'm trying to understand the grammar.", t: "Estoy intentando entender la gramática." },
            ],
          },
          {
            id: 'v2', text: 'remember', emoji: '🧠', anim: 'flash',
            definition: 'Retener algo en la memoria o traer al presente un recuerdo del pasado.',
            definitionEn: 'To keep in mind or bring back to mind something from the past.',
            etymology: 'Del latín "rememorari": "re-" (de nuevo) + "memor" (que recuerda). "Memoria" viene de Mnemosyne, la diosa griega de la memoria.',
            etymologyEn: 'From Latin "rememorari": re- (again) + memor (mindful). Memory itself comes from Mnemosyne, Greek goddess of memory and mother of the nine Muses.',
            examples: [
              { s: "I need to remember the vocabulary.", t: "Necesito recordar el vocabulario." },
              { s: "Do you remember the traditions?", t: "¿Recuerdas las tradiciones?" },
            ],
          },
          {
            id: 'v3', text: 'improve', emoji: '📈', anim: 'rise',
            definition: 'Hacer que algo sea mejor de lo que era; progresar o avanzar en calidad o habilidad.',
            definitionEn: 'To make something better than it was before; to progress or advance.',
            etymology: 'Del inglés medieval "emprower", del francés antiguo "en prou" (en beneficio de). Originalmente "mejorar la tierra agrícola".',
            etymologyEn: 'From Middle English "emprower", from Old French "en prou" (to one\'s profit). Originally meant "to cultivate land" — to make the earth more productive.',
            examples: [
              { s: "I'm trying to improve my pronunciation.", t: "Estoy intentando mejorar mi pronunciación." },
              { s: "I want to improve my grammar.", t: "Quiero mejorar mi gramática." },
            ],
          },
          {
            id: 'v4', text: 'practice', emoji: '🎯', anim: 'bounce',
            definition: 'Realizar una actividad de forma repetida con el fin de desarrollar una habilidad o mejorar en ella.',
            definitionEn: 'To do something repeatedly in order to develop a skill or improve performance.',
            etymology: 'Del griego "praktikē", de "prassein" (hacer, actuar). La raíz de "pragmatic" (pragmático) y "practical" (práctico).',
            etymologyEn: 'From Greek "praktikē", from "prassein" (to do, to act). Root of "pragmatic" and "practical". To practice is to act with deliberate purpose.',
            examples: [
              { s: "I like to practice every day.", t: "Me gusta practicar todos los días." },
              { s: "I need to practice the language.", t: "Necesito practicar el idioma." },
            ],
          },
          {
            id: 'v5', text: 'discover', emoji: '🗺️', anim: 'wander',
            definition: 'Encontrar o conocer algo que era desconocido; llegar a saber algo por primera vez.',
            definitionEn: 'To find or learn something for the first time; to reveal what was hidden.',
            etymology: 'Del latín medieval "discooperire": "dis-" (quitar) + "cooperire" (cubrir). Literalmente "quitar la tapa" para revelar lo que está debajo.',
            etymologyEn: 'From Medieval Latin "discooperire": dis- (un-) + cooperire (to cover). Literally "to uncover" — to remove the lid and reveal what lies beneath.',
            examples: [
              { s: "I want to discover the culture.", t: "Quiero descubrir la cultura." },
              { s: "I'm going to discover new skills.", t: "Voy a descubrir nuevas habilidades." },
            ],
          },
          {
            id: 'v6', text: 'appreciate', emoji: '💛', anim: 'glow',
            definition: 'Reconocer y valorar el mérito, la calidad o la importancia de algo o alguien.',
            definitionEn: 'To recognize and enjoy the quality, value, or significance of something.',
            etymology: 'Del latín "appretiare": "ad-" (hacia) + "pretium" (precio, valor). La misma raíz que "price" (precio) y "precious" (precioso).',
            etymologyEn: 'From Latin "appretiare": ad- (toward) + pretium (price, value). Same root as "price" and "precious". To appreciate is to recognize the true worth.',
            examples: [
              { s: "I appreciate the culture.", t: "Aprecio la cultura." },
              { s: "I'm learning how to appreciate the history.", t: "Estoy aprendiendo a apreciar la historia." },
            ],
          },
          {
            id: 'v7', text: 'explore', emoji: '🌿', anim: 'wander',
            definition: 'Recorrer o examinar un lugar desconocido para conocerlo; investigar algo en profundidad.',
            definitionEn: 'To travel through or examine an unknown place to learn about it; to investigate.',
            etymology: 'Del latín "explorare". Los cazadores romanos "exploraban" el terreno haciendo ruido para "hacer salir" la caza. Explorar es buscar activamente lo desconocido.',
            etymologyEn: 'From Latin "explorare". Roman hunters would make noise to "drive out" (ex-) game from hiding. To explore is to actively search out the unknown.',
            examples: [
              { s: "I want to explore the history.", t: "Quiero explorar la historia." },
              { s: "I'd like to explore the culture.", t: "Me gustaría explorar la cultura." },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'the language', emoji: '🌐', keyword: 'language',
            definition: 'Sistema de comunicación formado por signos orales, escritos o gestuales propio de una comunidad humana.',
            definitionEn: 'A system of communication using sounds, words, and grammar, shared by a community.',
            etymology: 'Del latín "lingua" (lengua, idioma). La misma raíz existe en casi todos los idiomas europeos.',
            etymologyEn: 'From Latin "lingua" (tongue, language). Proto-Indo-European root shared across most European languages.',
            oliversTip: '"Language", "lengua", "langue", "lingua", "Sprache" — el concepto de idioma existe en cada cultura humana conocida. El idioma ES lo que nos hace humanos. 🌍',
            examples: [
              { s: "I want to understand the language.", t: "Quiero entender el idioma." },
              { s: "I like the language.", t: "Me gusta el idioma." },
            ],
          },
          {
            id: 'w2', text: 'the culture', emoji: '🎭', keyword: 'culture',
            definition: 'Conjunto de conocimientos, costumbres, artes, creencias y formas de vida compartidos por un grupo humano.',
            definitionEn: 'The customs, arts, beliefs, and social institutions of a particular group or nation.',
            etymology: 'Del latín "cultura", de "colere" (cultivar, trabajar la tierra). La misma raíz que "agriculture" y "colony".',
            etymologyEn: 'From Latin "cultura", from "colere" (to till, to cultivate). Same root as "agriculture" and "colony". Knowledge must be cultivated like soil.',
            oliversTip: '"Culture" era originalmente el acto de cultivar la tierra. Cultivar un idioma es exactamente lo mismo: hay que trabajarlo diariamente. 🌱',
            examples: [
              { s: "I want to discover the culture.", t: "Quiero descubrir la cultura." },
              { s: "I appreciate the culture.", t: "Aprecio la cultura." },
            ],
          },
          {
            id: 'w3', text: 'the vocabulary', emoji: '📚', keyword: 'vocabulary',
            definition: 'Conjunto de palabras de un idioma, o el conjunto de palabras que conoce y usa una persona.',
            definitionEn: 'The set of words used in a language, or the words known by a particular person.',
            etymology: 'Del latín "vocabulum" (nombre, término), de "vocare" (llamar, nombrar). Tu vocabulario son los "nombres" con los que llamas al mundo.',
            etymologyEn: 'From Latin "vocabulum" (name, term), from "vocare" (to call, to name). Your vocabulary is the set of names you use to call the world into being.',
            oliversTip: '"Vocal", "vocation" (el llamado de tu vida), "invoke" (invocar) — todos de "vocare". Tu vocabulario es tu forma de llamar a la realidad. 📢',
            examples: [
              { s: "I need to improve my vocabulary.", t: "Necesito mejorar mi vocabulario." },
              { s: "I want to remember the vocabulary.", t: "Quiero recordar el vocabulario." },
            ],
          },
          {
            id: 'w4', text: 'the pronunciation', emoji: '🗣️', keyword: 'pronunciation',
            definition: 'Manera de articular los sonidos de un idioma al hablar; la forma correcta de decir una palabra.',
            definitionEn: 'The way in which a word or language is spoken; the correct articulation of sounds.',
            etymology: 'Del latín "pronunciare" (proclamar, anunciar públicamente). Pro- = adelante/en público, nuntiare = anunciar.',
            etymologyEn: 'From Latin "pronunciare" (to proclaim publicly). Pro- = forward/public, nuntiare = to announce. A "nuncio" is a papal messenger — your voice is your public announcement.',
            oliversTip: '"Pronunciation", "announce", "denounce", "renounce" — todos de "nuntiare". Tu pronunciación es tu firma sonora en un idioma. 🎤',
            examples: [
              { s: "I'm trying to improve my pronunciation.", t: "Estoy intentando mejorar mi pronunciación." },
              { s: "I need to practice the pronunciation.", t: "Necesito practicar la pronunciación." },
            ],
          },
          {
            id: 'w5', text: 'the grammar', emoji: '✏️', keyword: 'grammar',
            definition: 'Conjunto de reglas y principios que rigen el uso correcto de una lengua.',
            definitionEn: 'The set of rules governing the structure and correct use of a language.',
            etymology: 'Del griego "grammatikē" (el arte de las letras), de "gramma" (letra). La misma raíz que "program", "telegram" y "diagram".',
            etymologyEn: 'From Greek "grammatikē" (the art of letters), from "gramma" (letter). In the Middle Ages, "grammar" was synonymous with magic — only priests could read, and they seemed sorcerers. Hence "glamour".',
            oliversTip: 'En la Edad Media, "grammar" era sinónimo de magia negra — solo los clérigos sabían leer y parecían hechiceros. De ahí viene "glamour". ✨',
            examples: [
              { s: "I want to understand the grammar.", t: "Quiero entender la gramática." },
              { s: "It is important to practice the grammar.", t: "Es importante practicar la gramática." },
            ],
          },
          {
            id: 'w6', text: 'the traditions', emoji: '🏺', keyword: 'traditions',
            definition: 'Costumbres, creencias y prácticas culturales transmitidas de generación en generación.',
            definitionEn: 'Customs, beliefs, and practices handed down through generations within a group.',
            etymology: 'Del latín "traditio" (entrega, transmisión), de "tradere" (dar a través). "Trans-" = a través, "dare" = dar.',
            etymologyEn: 'From Latin "traditio" (handing over, transmission), from "tradere" (to hand across). Root of "trade", "treason", and "betray" — all about transferring something.',
            oliversTip: '"Tradition", "treason" (traición), "trade" (comercio), "betray" (traicionar) — todos de "tradere". Las tradiciones son el regalo de cada generación. 🤝',
            examples: [
              { s: "I want to discover the traditions.", t: "Quiero descubrir las tradiciones." },
              { s: "I appreciate the traditions.", t: "Aprecio las tradiciones." },
            ],
          },
          {
            id: 'w7', text: 'the history', emoji: '📜', keyword: 'history',
            definition: 'Disciplina que estudia y narra los hechos del pasado de la humanidad.',
            definitionEn: 'The study and record of past events, especially of human affairs.',
            etymology: 'Del griego "historia" (investigación, conocimiento obtenido investigando), de "histor" (sabio, testigo, juez).',
            etymologyEn: 'From Greek "historia" (inquiry, knowledge from inquiry), from "histor" (wise man, witness, judge). "History" and "story" are the same word — history is the story we tell about the past.',
            oliversTip: '"History" y "story" son la misma palabra en su origen. "Prehistoric" = antes de que hubiera escritura para contar la historia. 📖',
            examples: [
              { s: "I'd like to explore the history.", t: "Me gustaría explorar la historia." },
              { s: "I want to discover the history.", t: "Quiero descubrir la historia." },
            ],
          },
          {
            id: 'w8', text: 'new skills', emoji: '💡', keyword: 'skills',
            definition: 'Capacidades o destrezas recién adquiridas mediante el aprendizaje o la práctica.',
            definitionEn: 'Abilities or techniques newly acquired through learning, practice, or experience.',
            etymology: 'Del nórdico antiguo "skil" (distinción, discernimiento). Los vikingos trajeron esta palabra al inglés.',
            etymologyEn: 'From Old Norse "skil" (distinction, discernment — knowing right from wrong). Vikings brought this to English along with "knife", "sky", "egg", and "window".',
            oliversTip: 'Los vikingos nos dieron "skill", "knife", "anger", "window", "husband", "egg", "sky" y cientos más. ⚔️\n\nEl inglés es anglosajón + normando + nórdico. ¡Tres idiomas en uno!',
            examples: [
              { s: "I'm learning new skills.", t: "Estoy aprendiendo nuevas habilidades." },
              { s: "I want to discover new skills.", t: "Quiero descubrir nuevas habilidades." },
            ],
          },
        ],
      },
    ],
  },

  fr: {
    name: 'Français',
    flag: '🇫🇷',
    speechLang: 'fr-FR',
    levels: [
      {
        level: 1,
        name: 'Blocs de base',
        oliversIntro: {
          headline: 'Niveau 1 · Blocs de base',
          message: 'Bienvenue en français! El francés es el idioma de la diplomacia, el arte, la cocina y el amor. Fue el idioma internacional durante 300 años. Powell Janulus lo aprendió en menos de 3 meses usando exactamente estas estructuras.',
          technique: '🔵 Structure  +  🟢 Verbe  +  🟣 Objet\n\n"Je veux" + "trouver" + "une clé"\n= Je veux trouver une clé\n(I want to find a key)',
          funFact: '💡 El 30% del vocabulario inglés viene del francés (por la conquista normanda de 1066). Si ya sabes inglés, ya conoces miles de palabras en francés.',
        },
        bases: [
          { id: 'b1', text: 'Je veux' },
          { id: 'b2', text: 'Je dois' },
          { id: 'b3', text: "J'aime" },
          { id: 'b4', text: 'Je peux' },
          { id: 'b5', text: 'Je vais' },
        ],
        verbs: [
          {
            id: 'v1', text: 'trouver', emoji: '🔍', anim: 'search',
            definition: 'Encontrar o localizar algo o a alguien; dar con lo que se buscaba.',
            definitionEn: 'To find or locate someone or something.',
            etymology: 'Del latín tardío "tropare" (componer música, "trovar"). Los trovadores medievales "encontraban" melodías. ¡Encontrar era una metáfora musical!',
            examples: [
              { s: 'Je veux trouver une clé.', t: 'Quiero encontrar una llave.' },
              { s: 'Tu peux trouver la boussole?', t: '¿Puedes encontrar la brújula?' },
            ],
          },
          {
            id: 'v2', text: 'utiliser', emoji: '🔧', anim: 'spin',
            definition: 'Usar o emplear algo para un fin determinado; servirse de algo.',
            definitionEn: 'To use or employ something for a specific purpose.',
            etymology: 'Del latín "utilis" (útil), de "uti" (usar). Misma raíz que el inglés "use" y "utility".',
            examples: [
              { s: 'Je dois utiliser une boussole.', t: 'Debo usar una brújula.' },
              { s: 'Je peux utiliser ce livre.', t: 'Puedo usar este libro.' },
            ],
          },
          {
            id: 'v3', text: 'porter', emoji: '💪', anim: 'lift',
            definition: 'Llevar o transportar algo de un lugar a otro; también, vestir o cargar algo consigo.',
            definitionEn: 'To carry or bear something; also to wear clothing.',
            etymology: 'Del latín "portare" (llevar). "Transport", "export", "import", "report", "support" — todos de esta raíz.',
            examples: [
              { s: 'Je dois porter le seau.', t: 'Debo llevar el cubo.' },
              { s: 'Elle porte une bougie.', t: 'Ella lleva una vela.' },
            ],
          },
          {
            id: 'v4', text: 'ouvrir', emoji: '🚪', anim: 'swing',
            definition: 'Hacer que algo cerrado deje de estarlo; dar acceso a un espacio o recipiente.',
            definitionEn: 'To open something that was closed or shut.',
            etymology: 'Del latín "aperire" (abrir). "Apertura", "aperitivo" (la bebida que "abre" el apetito) — todos de "aperire".',
            examples: [
              { s: 'Je veux ouvrir le livre.', t: 'Quiero abrir el libro.' },
              { s: 'Je peux ouvrir la porte.', t: 'Puedo abrir la puerta.' },
            ],
          },
          {
            id: 'v5', text: 'voir', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo mediante la vista; observar, contemplar o darse cuenta de algo.',
            definitionEn: 'To see or observe something with the eyes.',
            etymology: 'Del latín "videre" (ver). La misma raíz que "video", "visible", "vision", "vista", "evident" y el español "ver".',
            examples: [
              { s: 'Je peux voir une bougie.', t: 'Puedo ver una vela.' },
              { s: 'Tu vois le miroir?', t: '¿Ves el espejo?' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'une clé', emoji: '🗝️', keyword: 'clé',
            definition: 'Pieza metálica con forma específica que encaja en una cerradura para abrirla o cerrarla.',
            definitionEn: 'A small metal key used to lock or unlock a door or container.',
            etymology: 'Del latín "clavis" — exactamente la misma raíz que el español "clave", el inglés "clue" y el catalán "clau".',
            oliversTip: '¡"Clue" en inglés viene del griego "clew" (ovillo de hilo) — el hilo que usó Teseo para salir del laberinto del Minotauro! 🧶',
            examples: [
              { s: 'Je veux trouver une clé.', t: 'Quiero encontrar una llave.' },
              { s: "J'ai une clé.", t: 'Tengo una llave.' },
            ],
          },
          {
            id: 'w2', text: 'une pomme', emoji: '🍎', keyword: 'pomme',
            definition: 'Fruta comestible de forma redondeada, con piel de color rojo, verde o amarillo y pulpa blanca.',
            definitionEn: 'An apple — a round fruit with colored skin and white flesh, grown on trees.',
            etymology: 'Del gaulois "aballo" — el antecesor del inglés "apple" y del alemán "Apfel". El latín usaba "malum" para las manzanas.',
            oliversTip: '"Pomme de terre" (papa/patata) significa literalmente "manzana de tierra". ¡Los franceses llamaron al tubérculo "la manzana que crece bajo el suelo"! 🥔',
            examples: [
              { s: 'Je veux une pomme.', t: 'Quiero una manzana.' },
              { s: 'Je peux voir une pomme.', t: 'Puedo ver una manzana.' },
            ],
          },
          {
            id: 'w3', text: "de l'eau", emoji: '💧', keyword: 'eau',
            definition: 'Líquido incoloro, inodoro e insípido, esencial para la vida. Fórmula química: H₂O.',
            definitionEn: 'Water — a colorless, odorless liquid essential for all life (H₂O).',
            etymology: 'Del latín "aqua" — el mismo origen que "aquarium", "acuático" y el español "agua".',
            oliversTip: '"Eau" (francés) y "agua" (español) suenan completamente diferentes pero son la misma palabra latina "aqua". El francés transformó: aqua → eau en 1,500 años. 🌊',
            examples: [
              { s: "J'ai besoin d'eau.", t: 'Necesito agua.' },
              { s: "Je dois porter de l'eau.", t: 'Debo llevar agua.' },
            ],
          },
          {
            id: 'w4', text: 'une bougie', emoji: '🕯️', keyword: 'bougie',
            definition: 'Barra o cilindro de cera o parafina con una mecha que, al encenderse, proporciona luz.',
            definitionEn: 'A candle — a wax cylinder with a wick that gives light when lit.',
            etymology: 'De la ciudad de Béjaïa, en Argelia (llamada Bugia por los romanos). Desde allí se exportaba cera de alta calidad al mundo medieval.',
            oliversTip: 'Una ciudad norteafricana medieval dio nombre a las velas en francés. "Bougie" en argot francés también significa "bujía de automóvil" y "lujoso/snob". 🌍',
            examples: [
              { s: 'Je peux voir une bougie.', t: 'Puedo ver una vela.' },
              { s: 'Je dois utiliser une bougie.', t: 'Debo usar una vela.' },
            ],
          },
          {
            id: 'w5', text: 'un miroir', emoji: '🪞', keyword: 'miroir',
            definition: 'Superficie lisa y pulida, generalmente de vidrio con revestimiento metálico, que refleja la imagen de los objetos.',
            definitionEn: 'A mirror — a smooth reflective surface that shows the image of objects.',
            etymology: 'Del latín "mirare" (mirar con admiración) — exactamente la misma raíz del español "mirar" y el inglés "mirror".',
            oliversTip: '"Miroir" (francés), "mirar" (español), "mirror" (inglés) — tres idiomas, una sola raíz latina "mirare". 🪞',
            examples: [
              { s: 'Je veux voir un miroir.', t: 'Quiero ver un espejo.' },
              { s: 'Elle utilise un miroir.', t: 'Ella usa un espejo.' },
            ],
          },
          {
            id: 'w6', text: 'une cloche', emoji: '🔔', keyword: 'cloche',
            definition: 'Instrumento de percusión de metal, con forma de copa invertida, que produce un sonido claro y resonante al ser golpeado.',
            definitionEn: 'A bell — a hollow metal instrument that produces a ringing sound when struck.',
            etymology: 'Del latín medieval "clocca" — el mismo origen que el inglés "clock" y el alemán "Glocke". Un reloj era originalmente una campana que marcaba las horas.',
            oliversTip: '¡El inglés "clock" y el francés "cloche" son hermanos! Un reloj era originalmente una campana que marcaba el tiempo. ⏰',
            examples: [
              { s: 'Je peux voir une cloche.', t: 'Puedo ver una campana.' },
              { s: "J'entends une cloche.", t: 'Escucho una campana.' },
            ],
          },
          {
            id: 'w7', text: 'une boussole', emoji: '🧭', keyword: 'boussole',
            definition: 'Instrumento de orientación que contiene una aguja magnetizada que gira libremente para señalar el norte magnético.',
            definitionEn: 'A compass — a navigation instrument with a magnetic needle pointing north.',
            etymology: 'Del italiano "bussola" (cajita de madera de boj). Italia introdujo la brújula magnética en Europa en el siglo XIII.',
            oliversTip: 'La brújula viajó de China → árabes → italianos → franceses. El nombre viajó con el objeto: "bussola" (italiano) → "boussole" (francés). 🧭',
            examples: [
              { s: 'Je dois utiliser une boussole.', t: 'Debo usar una brújula.' },
              { s: 'Je veux trouver la boussole.', t: 'Quiero encontrar la brújula.' },
            ],
          },
          {
            id: 'w8', text: 'un livre', emoji: '📖', keyword: 'livre',
            definition: 'Obra escrita o impresa compuesta por un conjunto de páginas encuadernadas con cubiertas.',
            definitionEn: 'A book — a set of written or printed pages bound together between covers.',
            etymology: 'Del latín "liber" (corteza interior de árbol, donde se escribía; también libro; también libre/libertad).',
            oliversTip: '"Libérer" (liberar), "libre" (libre), "livre" (libro), "librairie" (librería) — todos de "liber". Los romanos asociaron los libros con la libertad. 📚',
            examples: [
              { s: 'Je veux ouvrir un livre.', t: 'Quiero abrir un libro.' },
              { s: "J'aime porter un livre.", t: 'Me gusta llevar un libro.' },
            ],
          },
        ],
      },
    ],
  },

  ca: {
    name: 'Català',
    flag: '🏴',
    speechLang: 'ca-ES',
    levels: [
      {
        level: 1,
        name: 'Blocs bàsics',
        oliversIntro: {
          headline: 'Nivell 1 · Blocs bàsics',
          message: 'El catalán es una lengua románica hablada por 10 millones de personas en Cataluña, Valencia, las Islas Baleares, Andorra y parte de Francia. Es la lengua de Ramon Llull, del modernismo y de Antoni Gaudí.\n\nPowell Janulus describe el catalán como "el puente perfecto entre el español y el francés".',
          technique: '🔵 Estructura  +  🟢 Verb  +  🟣 Objecte\n\n"Vull" + "trobar" + "una clau"\n= Vull trobar una clau\n(I want to find a key)',
          funFact: '💡 El catalán medieval fue una de las primeras lenguas romances con literatura escrita (siglo XII). El "Llibre dels fets" de Jaume I es una de las primeras autobiografías de la historia europea.',
        },
        bases: [
          { id: 'b1', text: 'Vull' },
          { id: 'b2', text: 'Necessito' },
          { id: 'b3', text: "M'agrada" },
          { id: 'b4', text: 'Puc' },
          { id: 'b5', text: 'Vaig a' },
        ],
        verbs: [
          {
            id: 'v1', text: 'trobar', emoji: '🔍', anim: 'search',
            definition: 'Encontrar o localizar algo o a alguien; dar con lo que se buscaba o lo que estaba perdido.',
            definitionEn: 'To find or locate someone or something.',
            etymology: 'Del latín tardío "tropare" — idéntica al francés "trouver". Los "trobadors" catalanes medievales eran famosos en toda Europa.',
            examples: [
              { s: 'Vull trobar una clau.', t: 'Quiero encontrar una llave.' },
              { s: 'Puc trobar el mapa?', t: '¿Puedo encontrar el mapa?' },
            ],
          },
          {
            id: 'v2', text: 'fer servir', emoji: '🔧', anim: 'spin',
            definition: 'Utilizar o emplear algo para un propósito concreto; poner algo al servicio de una tarea.',
            definitionEn: 'To use or make use of something for a purpose.',
            etymology: 'Del latín "facere" (hacer) + "servire" (servir). El catalán fusionó dos verbos en uno.',
            examples: [
              { s: "He de fer servir la brúixola.", t: 'Tengo que usar la brújula.' },
              { s: 'Puc fer servir un mirall.', t: 'Puedo usar un espejo.' },
            ],
          },
          {
            id: 'v3', text: 'portar', emoji: '💪', anim: 'lift',
            definition: 'Llevar o transportar algo consigo de un lugar a otro; también llevar puesto algo.',
            definitionEn: 'To carry or bring something; also to wear.',
            etymology: 'Del latín "portare" — idéntica al español "portar". "Transport", "export", "porto" (Puerto Rico viene de "portus", puerto).',
            examples: [
              { s: "He de portar una espelma.", t: 'Tengo que llevar una vela.' },
              { s: 'Vull portar el llibre.', t: 'Quiero llevar el libro.' },
            ],
          },
          {
            id: 'v4', text: 'obrir', emoji: '🚪', anim: 'swing',
            definition: 'Separar o apartar lo que estaba cerrado o tapado para dar acceso o paso.',
            definitionEn: 'To open something that was closed or shut.',
            etymology: 'Del latín "aperire". El catalán transformó: aperire → obrire → obrir. ¡Los idiomas transforman los sonidos con el tiempo!',
            examples: [
              { s: 'Vull obrir el llibre.', t: 'Quiero abrir el libro.' },
              { s: 'Puc obrir la porta.', t: 'Puedo abrir la puerta.' },
            ],
          },
          {
            id: 'v5', text: 'veure', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos; observar, mirar o darse cuenta de algo visualmente.',
            definitionEn: 'To see or perceive something with the eyes.',
            etymology: 'Del latín "videre". En catalán: videre → veure. Mismo proceso que el francés "voir" (v-id-ere → voir).',
            examples: [
              { s: "Puc veure una espelma.", t: 'Puedo ver una vela.' },
              { s: 'Veus el mirall?', t: '¿Ves el espejo?' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'una clau', emoji: '🗝️', keyword: 'clau',
            definition: "Peça metàl·lica de forma especial que s'introdueix en un pany per obrir-lo o tancar-lo. (Pieza metálica que abre una cerradura.)",
            definitionEn: 'A key — a small metal device used to lock or unlock something.',
            etymology: 'Del latín "clavis" — el catalán conserva la forma más fiel al latín: "cl-au" vs español "cl-av-e" vs francés "cl-é".',
            oliversTip: '"Clavis" (latín) → "clau" (catalán), "clave" (español), "clé" (francés), "key" (inglés). 🔑\n\nEl catalán a veces es más "puramente latino" que el español.',
            examples: [
              { s: 'Vull trobar una clau.', t: 'Quiero encontrar una llave.' },
              { s: 'Tinc una clau.', t: 'Tengo una llave.' },
            ],
          },
          {
            id: 'w2', text: 'una poma', emoji: '🍎', keyword: 'poma',
            definition: "Fruit rodó d'arbre, de gust dolç o àcid, amb pell verda, vermella o groga. (Fruta redonda de árbol, de sabor dulce o ácido.)",
            definitionEn: 'An apple — a round fruit from a tree, sweet or tart.',
            etymology: 'Del latín "poma" (frutos). El catalán "poma" es más cercano al latín que el español "manzana" (del latín "mattiana pomum").',
            oliversTip: '"Poma" (catalán), "pomme" (francés) — el catalán y el francés comparten esta raíz directa del latín "poma". El español eligió otra variedad latina. 🍎',
            examples: [
              { s: 'Vull una poma.', t: 'Quiero una manzana.' },
              { s: 'Puc veure una poma.', t: 'Puedo ver una manzana.' },
            ],
          },
          {
            id: 'w3', text: 'aigua', emoji: '💧', keyword: 'aigua',
            definition: "Líquid incolor, inodor i insípid, indispensable per a la vida de tots els éssers vius. (Líquido esencial para la vida, H₂O.)",
            definitionEn: 'Water — a colorless liquid essential for all living things (H₂O).',
            etymology: 'Del latín "aqua" — el catalán conservó casi perfectamente: "aqua" → "aiga" → "aigua".',
            oliversTip: '"Aigua" (catalán), "agua" (español), "eau" (francés) — todos de "aqua". El francés lo transformó más (aqua → eau). El catalán y el español son primos más cercanos. 💧',
            examples: [
              { s: 'Necessito aigua.', t: 'Necesito agua.' },
              { s: "He de portar aigua.", t: 'Tengo que llevar agua.' },
            ],
          },
          {
            id: 'w4', text: 'una espelma', emoji: '🕯️', keyword: 'espelma',
            definition: "Cilindre de cera amb un ble que, en cremar-se, dóna llum. (Cilindro de cera con mecha que da luz al encenderse.)",
            definitionEn: 'A candle — a wax cylinder with a wick that gives light when burning.',
            etymology: 'Del latín tardío "sphaerula" o del árabe. Palabra única del catalán, sin equivalente exacto en español o francés.',
            oliversTip: '"Espelma" es de las palabras más características del catalán — no tiene hermana exacta en otros idiomas románicos. 🕯️\n\nEl catalán tiene muchas palabras únicas: "gos" (perro), "pedra" (piedra).',
            examples: [
              { s: 'Puc veure una espelma.', t: 'Puedo ver una vela.' },
              { s: "He de portar una espelma.", t: 'Tengo que llevar una vela.' },
            ],
          },
          {
            id: 'w5', text: 'un mirall', emoji: '🪞', keyword: 'mirall',
            definition: 'Superfície polida que reflexa la imatge dels objectes. (Superficie que refleja la imagen de los objetos.)',
            definitionEn: 'A mirror — a polished surface that reflects the image of objects.',
            etymology: 'Del latín "mirallum", de "mirare" (mirar). El sufijo "-all" viene del latín "-aculum" (instrumento para algo).',
            oliversTip: '"Mirall" (catalán), "miroir" (francés), "mirror" (inglés) — todos de "mirare". 🪞\n\nTambién: "ventall" (abanico = instrumento del viento).',
            examples: [
              { s: 'Vull fer servir un mirall.', t: 'Quiero usar un espejo.' },
              { s: 'Puc veure un mirall.', t: 'Puedo ver un espejo.' },
            ],
          },
          {
            id: 'w6', text: 'una campana', emoji: '🔔', keyword: 'campana',
            definition: 'Instrument de percussió de metall, en forma de copa invertida, que sona quan es colpeja. (Instrumento de metal que suena al ser golpeado.)',
            definitionEn: 'A bell — a hollow metal instrument that produces a ringing sound when struck.',
            etymology: 'Del latín tardío "campana" (de Campania, región italiana famosa por sus bronces). Igual que en español.',
            oliversTip: 'El catalán dice "campana" como el español, pero el francés dice "cloche". 🔔\n\nLa lingüística no siempre sigue la geografía.',
            examples: [
              { s: 'Sento una campana.', t: 'Escucho una campana.' },
              { s: 'Puc veure una campana.', t: 'Puedo ver una campana.' },
            ],
          },
          {
            id: 'w7', text: 'una brúixola', emoji: '🧭', keyword: 'brúixola',
            definition: "Instrument d'orientació amb una agulla magnetitzada que assenyala sempre el nord. (Instrumento de orientación que señala el norte magnético.)",
            definitionEn: 'A compass — a navigation instrument with a magnetized needle pointing north.',
            etymology: 'Del italiano "bussola" (cajita de boj), igual que el francés "boussole". Del latín "buxis" (madera de boj).',
            oliversTip: '"Brúixola" muestra la influencia italiana en el catalán medieval. La Corona de Aragón controló el Mediterráneo occidental durante siglos. 🧭',
            examples: [
              { s: 'Necessito una brúixola.', t: 'Necesito una brújula.' },
              { s: "He de fer servir la brúixola.", t: 'Tengo que usar la brújula.' },
            ],
          },
          {
            id: 'w8', text: 'un llibre', emoji: '📖', keyword: 'llibre',
            definition: "Conjunt de fulls escrits o impresos, enquadernats i amb cobertes. (Conjunto de páginas escritas o impresas encuadernadas.)",
            definitionEn: 'A book — a set of printed or written pages bound together.',
            etymology: 'Del latín "liber" — con la doble "ll" característica del catalán, un sonido palatal propio de la lengua.',
            oliversTip: '"Llibre" (catalán), "libro" (español), "livre" (francés) — todos de "liber". 📚\n\nLa "ll" inicial es una de las marcas más características del catalán: "lluna", "llop", "llei".',
            examples: [
              { s: 'Vull obrir un llibre.', t: 'Quiero abrir un libro.' },
              { s: "M'agrada portar un llibre.", t: 'Me gusta llevar un libro.' },
            ],
          },
        ],
      },
    ],
  },
}

export function getJanulusLanguages() {
  return Object.entries(JANULUS_DATA).map(([code, l]) => ({ code, name: l.name, flag: l.flag }))
}
export function getJanulusLevels(langCode) {
  return (JANULUS_DATA[langCode]?.levels ?? []).map((l) => ({ level: l.level, name: l.name }))
}
export function getJanulusLevel(langCode, levelNum) {
  return JANULUS_DATA[langCode]?.levels.find((l) => l.level === levelNum) ?? null
}
export function getSpeechLangJanulus(langCode) {
  return JANULUS_DATA[langCode]?.speechLang ?? 'en-US'
}
