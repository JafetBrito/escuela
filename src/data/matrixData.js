// ─── Janulus Matrix Game — Dictionary ─────────────────────────────────────
// Sentence = Base + Verb + Vocab (always this order).
// Verb fields: emoji, anim (CSS keyframe), definition (Spanish), etymology
// Vocab fields: emoji, keyword (user types this), definition, etymology, oliversTip
// Level fields: oliversIntro (shown once before first round)

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
          message:
            'Voy a enseñarte las frases más fundamentales del inglés. Powell Janulus — el políglota canadiense que habla 42 idiomas — siempre empezó exactamente aquí: con 3 bloques simples que se combinan infinitamente.\n\nEn este nivel aprenderás verbos básicos de acción y vocabulario concreto que usarás toda la vida.',
          technique:
            '🔵 Estructura  +  🟢 Verbo  +  🟣 Objeto\n\n"I want to" + "find" + "a key"\n= I want to find a key',
          funFact:
            '💡 Con solo 1,000 palabras básicas puedes entender el 85% del inglés cotidiano. Hoy empezamos con las más importantes.',
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
            etymology: 'Del anglosajón "findan". Del proto-germánico, relacionado con el alemán "finden". Originalmente significaba "ir a buscar" — el movimiento hacia el descubrimiento.',
          },
          {
            id: 'v2', text: 'use', emoji: '🔧', anim: 'spin',
            definition: 'Emplear algo para un propósito determinado; hacer uso de algo.',
            etymology: 'Del latín "usus", de "uti" (usar, disfrutar). La raíz de "utensil", "utility", "abuse" y "usual". Usar algo es darle su propósito.',
          },
          {
            id: 'v3', text: 'carry', emoji: '💪', anim: 'lift',
            definition: 'Transportar o llevar algo de un lugar a otro, sosteniéndolo.',
            etymology: 'Del francés normando "carier" (llevar en carro), de "car" (vehículo). Los normandos conquistaron Inglaterra en 1066 y trajeron cientos de palabras latinas al inglés.',
          },
          {
            id: 'v4', text: 'open', emoji: '🚪', anim: 'swing',
            definition: 'Mover una puerta, tapa o barrera para dar acceso a algo.',
            etymology: 'Del anglosajón "openian". Relacionado con el alemán "öffnen". Del latín "aperire" — de donde viene "apertura" y "aperitivo" (la bebida que "abre" el apetito).',
          },
          {
            id: 'v5', text: 'see', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos; observar o contemplar.',
            etymology: 'Del anglosajón "sēon". Del proto-germánico "sehwanan". Del indo-europeo "sekw-" (seguir con los ojos). Una de las palabras más antiguas y fundamentales de cualquier idioma.',
          },
          {
            id: 'v6', text: 'hold', emoji: '✋', anim: 'pulse',
            definition: 'Agarrar o sostener algo con las manos o los brazos; mantener en posición.',
            etymology: 'Del anglosajón "haldan". Del proto-germánico "haldanan". Del indo-europeo "kel-" (dominar, controlar). Relacionado con "behold" (contemplar) y "withhold" (retener).',
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a key', emoji: '🗝️', keyword: 'key',
            definition: 'Instrumento metálico pequeño con forma dentada que abre o cierra una cerradura.',
            etymology: 'Del anglosajón "cæg" (siglo VII). Una de las primeras palabras del inglés — anterior a la conquista normanda.',
            oliversTip: '"Key" en inglés, "clé" en francés, "clave" en español, "clau" en catalán — ¡todas del latín "clavis"! Los idiomas son familia. 🌍\n\nPowell Janulus dice: "Cada palabra que aprendes es una llave que abre una nueva realidad."',
          },
          {
            id: 'w2', text: 'an apple', emoji: '🍎', keyword: 'apple',
            definition: 'Fruta redonda de piel roja, verde o amarilla y pulpa blanca, con un sabor dulce o ligeramente ácido.',
            etymology: 'Del anglosajón "æppel" (siglo VIII). La misma raíz germánica que el alemán "Apfel" y el holandés "appel". Una de las palabras más antiguas del idioma.',
            oliversTip: 'En latín, la manzana era "malum" — que también significaba "malo". El nombre científico del manzano es Malus domestica. ¡Los griegos creían que las manzanas traían maldad! 🍏\n\nEl inglés "apple" es excepcional: casi ningún otro idioma románico conservó esta raíz germánica.',
          },
          {
            id: 'w3', text: 'some water', emoji: '💧', keyword: 'water',
            definition: 'Líquido transparente, inodoro e insípido, esencial para la vida. Compuesto de hidrógeno y oxígeno (H₂O).',
            etymology: 'Del anglosajón "wæter" — casi idéntico al alemán "Wasser" y al holandés "water". Del proto-indo-europeo "wódr̥".',
            oliversTip: '"Water" (inglés), "Wasser" (alemán), "vatten" (sueco), "voda" (ruso) — todos hermanos del mismo origen indo-europeo. 🧬\n\n¡El inglés y el ruso comparten la misma palabra para "agua"!',
          },
          {
            id: 'w4', text: 'a candle', emoji: '🕯️', keyword: 'candle',
            definition: 'Cilindro de cera o sebo con una mecha en el centro que produce luz y calor al encenderse.',
            etymology: 'Del latín "candela", de "candere" (brillar, resplandecer). La misma raíz que "incandescent" e "incendio".',
            oliversTip: '¡La misma raíz que "candidate"! En la Roma antigua, los candidatos políticos llevaban togas "candidas" (blancas, brillantes) para aparecer puros e inocentes. Un "candidato" era literalmente un "portador de luz". 🕯️',
          },
          {
            id: 'w5', text: 'a mirror', emoji: '🪞', keyword: 'mirror',
            definition: 'Superficie pulida, generalmente de vidrio con baño de plata, que refleja la imagen de los objetos.',
            etymology: 'Del latín "mirare" (mirar con admiración) a través del francés antiguo "mireor".',
            oliversTip: 'Misma raíz: "admire" (admirar), "miracle" (milagro), "mirage" (espejismo). El español "mirar" también viene de aquí. 👁️\n\n¡Ver algo es admirarlo! Los romanos consideraban que mirar era un acto de respeto.',
          },
          {
            id: 'w6', text: 'a bell', emoji: '🔔', keyword: 'bell',
            definition: 'Objeto hueco de metal, generalmente bronce, con forma de copa invertida, que produce un sonido resonante al ser golpeado.',
            etymology: 'Del anglosajón "belle" (siglo XI). Posiblemente una onomatopeya del sonido "bel-bel".',
            oliversTip: 'Las campanas fueron el primer sistema de comunicación a distancia de la humanidad: anunciaban el tiempo, el peligro, las fiestas y la guerra. 🔔\n\n¡"Belfry" (campanario) viene del alemán medieval "Bergfried" (torre de refugio)!',
          },
          {
            id: 'w7', text: 'a compass', emoji: '🧭', keyword: 'compass',
            definition: 'Instrumento de navegación con una aguja magnética giratoria que siempre apunta al norte, usado para orientarse.',
            etymology: 'Del latín "compassus" (literalmente: "medir pasos juntos"). Com- = juntos, passus = paso. Del francés antiguo "compas".',
            oliversTip: 'La brújula llegó a Europa desde China en el siglo XII por la Ruta de la Seda. Sin ella no habría navegación oceánica, sin navegación no habría globalización. 🧭\n\n"Compass" también significa "compás musical" — ambos "miden con precisión".',
          },
          {
            id: 'w8', text: 'a ladder', emoji: '🪜', keyword: 'ladder',
            definition: 'Estructura formada por dos largueros paralelos unidos por travesaños transversales, usada para subir o bajar a distintas alturas.',
            etymology: 'Del anglosajón "hlæder". Relacionada con "lean" (apoyarse). Literalmente: "lo que se apoya para elevarte".',
            oliversTip: 'La escalera es una de las herramientas más antiguas de la humanidad — evidencia de escaleras de madera de hace 10,000 años. 🪜\n\nCada idioma que aprendes es un peldaño. Powell Janulus escala 42 idiomas.',
          },
          {
            id: 'w9', text: 'a bucket', emoji: '🪣', keyword: 'bucket',
            definition: 'Recipiente de forma cilíndrica o troncocónica con un asa, usado para transportar o almacenar líquidos y otros materiales.',
            etymology: 'Del inglés medieval "buket" (siglo XIII). Posiblemente del francés antiguo "buquet" (cubo de balancín en un pozo).',
            oliversTip: 'Un "bucket list" (lista de deseos antes de morir) viene de la expresión "kick the bucket" — que probablemente viene del francés "buquet" (travesaño del que se colgaba a alguien). 🪣\n\n¡El inglés coloquial guarda historia oscura!',
          },
          {
            id: 'w10', text: 'a book', emoji: '📖', keyword: 'book',
            definition: 'Conjunto de hojas de papel escritas o impresas, unidas por un lado y protegidas por cubiertas.',
            etymology: 'Del anglosajón "bōc" — que originalmente significaba "corteza de haya" (el árbol Fagus). Los primeros escritos anglosajones se tallaban en corteza.',
            oliversTip: '"Book" (inglés), "Buch" (alemán), "bok" (sueco/noruego) — todos de la corteza de haya. 🌳\n\nEn latín, "liber" significaba tanto "libro" como "corteza interior" — y también "libre" (libertad). ¡Los libros son libertad en todos los idiomas!',
          },
          {
            id: 'w11', text: 'a map', emoji: '🗺️', keyword: 'map',
            definition: 'Representación gráfica y a escala de una superficie geográfica, que muestra accidentes naturales, ciudades y otros elementos.',
            etymology: 'Del latín medieval "mappa mundi" (literalmente "tela del mundo"). Los primeros mapas se pintaban en tela o piel de animal.',
            oliversTip: 'El primer mapa del mundo conocido es babilónico, del año 600 a.C. Los mapas son el esfuerzo humano más antiguo de representar la realidad completa. 🗺️\n\nAprender un idioma es construir un mapa de una nueva realidad. Janulus tiene 42 mapas del mundo.',
          },
          {
            id: 'w12', text: 'a torch', emoji: '🔦', keyword: 'torch',
            definition: 'Fuente de luz portátil que puede llevarse en la mano. En inglés británico también significa linterna eléctrica.',
            etymology: 'Del latín "torquere" (torcer, retorcer). Las primeras antorchas eran telas retorcidas impregnadas de aceite o resina.',
            oliversTip: '"Torque" (mecánica), "contortion" (contorsión), "extort" (extorsionar — literalmente "torcer el brazo de alguien"), "torture" — todos de la misma raíz latina "torquere". 🔥\n\nEl lenguaje guarda la historia de la humanidad en cada palabra.',
          },
        ],
      },
      {
        level: 2,
        name: 'In Context',
        oliversIntro: {
          headline: 'Nivel 2 · In Context',
          message:
            'Aquí el inglés se vuelve elegante. Las estructuras base son más sofisticadas y los verbos expresan conceptos abstractos del mundo mental: comprender, recordar, mejorar, apreciar...\n\nPowell Janulus dice que el Nivel 2 es cuando tu cerebro empieza a "pensar" en el idioma en lugar de solo traducir.',
          technique:
            '🔵 Base  +  🟢 Verbo abstracto  +  🟣 Concepto\n\n"I\'m learning how to" + "appreciate" + "the culture"\n= I\'m learning how to appreciate the culture',
          funFact:
            '💡 Los hablantes nativos de inglés usan estructuras como "I\'d like to" y "It is important to" constantemente. Dominarlas te hace sonar profesional al instante.',
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
            etymology: 'Del anglosajón "understandan": "under" (bajo, entre) + "stand" (estar de pie). Literalmente "estar en medio de" las ideas — estar entre ellas para comprenderlas.',
          },
          {
            id: 'v2', text: 'remember', emoji: '🧠', anim: 'flash',
            definition: 'Retener algo en la memoria o traer al presente un recuerdo del pasado.',
            etymology: 'Del latín "rememorari": "re-" (de nuevo) + "memor" (que recuerda). "Memoria" viene de Mnemosyne, la diosa griega de la memoria, madre de las Musas.',
          },
          {
            id: 'v3', text: 'improve', emoji: '📈', anim: 'rise',
            definition: 'Hacer que algo sea mejor de lo que era; progresar o avanzar en calidad, habilidad o condición.',
            etymology: 'Del inglés medieval "emprower", del francés antiguo "en prou" (en beneficio de). Originalmente "mejorar la tierra agrícola" para hacerla más productiva.',
          },
          {
            id: 'v4', text: 'practice', emoji: '🎯', anim: 'bounce',
            definition: 'Realizar una actividad de forma repetida con el fin de desarrollar una habilidad o mejorar en ella.',
            etymology: 'Del griego "praktikē", de "prassein" (hacer, actuar). La raíz de "pragmatic" (pragmático) y "practical" (práctico). Practicar es hacer con propósito.',
          },
          {
            id: 'v5', text: 'discover', emoji: '🗺️', anim: 'wander',
            definition: 'Encontrar o conocer algo que era desconocido; llegar a saber algo por primera vez.',
            etymology: 'Del latín medieval "discooperire": "dis-" (quitar) + "cooperire" (cubrir). Literalmente "quitar la tapa" para revelar lo que está debajo.',
          },
          {
            id: 'v6', text: 'appreciate', emoji: '💛', anim: 'glow',
            definition: 'Reconocer y valorar el mérito, la calidad o la importancia de algo o alguien.',
            etymology: 'Del latín "appretiare": "ad-" (hacia) + "pretium" (precio, valor). Apreciar es reconocer el valor real de algo. La misma raíz que "price" (precio) y "precious" (precioso).',
          },
          {
            id: 'v7', text: 'explore', emoji: '🌿', anim: 'wander',
            definition: 'Recorrer o examinar un lugar desconocido para conocerlo; investigar algo en profundidad.',
            etymology: 'Del latín "explorare". Los cazadores romanos "exploraban" el terreno haciendo ruido para "hacer salir" (ex-) la caza. Explorar es buscar activamente lo desconocido.',
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'the language', emoji: '🌐', keyword: 'language',
            definition: 'Sistema de comunicación formado por signos orales, escritos o gestuales propio de una comunidad humana.',
            etymology: 'Del latín "lingua" (lengua, idioma). Del proto-indo-europeo "dn̥ǵʰwéh₂s". La misma raíz existe en casi todos los idiomas europeos.',
            oliversTip: '"Language", "lengua", "langue", "lingua", "Sprache" — el concepto de idioma existe en cada cultura humana conocida. 🌍\n\nEl idioma ES lo que nos hace humanos: somos la única especie que tiene gramática.',
          },
          {
            id: 'w2', text: 'the culture', emoji: '🎭', keyword: 'culture',
            definition: 'Conjunto de conocimientos, costumbres, artes, creencias y formas de vida compartidos por un grupo humano.',
            etymology: 'Del latín "cultura", de "colere" (cultivar, trabajar la tierra). La misma raíz que "agriculture" (agri-cultura) y "colony" (colonia).',
            oliversTip: '"Culture" era originalmente el acto de cultivar la tierra. Cultivar un idioma es exactamente lo mismo: hay que trabajarlo diariamente para que dé frutos. 🌱\n\n"Cult", "cultivate", "culture", "column" — todos de la misma raíz latina.',
          },
          {
            id: 'w3', text: 'the vocabulary', emoji: '📚', keyword: 'vocabulary',
            definition: 'Conjunto de palabras de un idioma, o el conjunto de palabras que conoce y usa una persona.',
            etymology: 'Del latín "vocabulum" (nombre, término), de "vocare" (llamar, nombrar). Tu vocabulario son los "nombres" con los que llamas al mundo.',
            oliversTip: '"Vocal", "vocation" (vocación — literalmente "el llamado de tu vida"), "invoke" (invocar), "avocado" — ¡"avocado" viene del náhuatl pero se pronuncia como "vocare"! 📢\n\nTu vocabulario es tu forma de llamar a la realidad.',
          },
          {
            id: 'w4', text: 'the pronunciation', emoji: '🗣️', keyword: 'pronunciation',
            definition: 'Manera de articular los sonidos de un idioma al hablar; la forma correcta de decir una palabra.',
            etymology: 'Del latín "pronunciare" (proclamar, anunciar públicamente). Pro- = adelante/en público, nuntiare = anunciar. Un "nuncio" es un mensajero papal.',
            oliversTip: '"Pronunciation", "announce", "denounce", "renounce", "enunciate" — todos de "nuntiare". 🎤\n\nPronunciar es hacer público lo que piensas. Tu pronunciación es tu firma sonora en un idioma.',
          },
          {
            id: 'w5', text: 'the grammar', emoji: '✏️', keyword: 'grammar',
            definition: 'Conjunto de reglas y principios que rigen el uso correcto de una lengua, incluyendo sintaxis, morfología y ortografía.',
            etymology: 'Del griego "grammatikē" (el arte de las letras), de "gramma" (letra, lo escrito). La misma raíz que "program", "telegram" y "diagram".',
            oliversTip: 'En la Edad Media, "grammar" era sinónimo de magia negra — solo los clérigos sabían leer y parecían hechiceros. De ahí viene "glamour" (encanto mágico). ✨\n\n¡La gramática sigue siendo un superpoder!',
          },
          {
            id: 'w6', text: 'the traditions', emoji: '🏺', keyword: 'traditions',
            definition: 'Costumbres, creencias y prácticas culturales transmitidas de generación en generación dentro de un grupo social.',
            etymology: 'Del latín "traditio" (entrega, transmisión), de "tradere" (dar a través). "Trans-" = a través, "dare" = dar.',
            oliversTip: '"Tradition", "treason" (traición — no entregar lo que debes), "trade" (comercio — intercambio), "betray" (traicionar) — todos de "tradere". 🤝\n\nLas tradiciones son el regalo que cada generación da a la siguiente.',
          },
          {
            id: 'w7', text: 'the history', emoji: '📜', keyword: 'history',
            definition: 'Disciplina que estudia y narra los hechos del pasado de la humanidad; también, relato de los sucesos de un período o lugar.',
            etymology: 'Del griego "historia" (investigación, conocimiento obtenido investigando), de "histor" (sabio, testigo, juez).',
            oliversTip: '"History" y "story" son la misma palabra en su origen: la historia es una historia que se cuenta. 📖\n\n"Prehistoric" (prehistórico) = antes de que hubiera escritura para contar la historia. Todo idioma lleva su propia historia.',
          },
          {
            id: 'w8', text: 'new skills', emoji: '💡', keyword: 'skills',
            definition: 'Capacidades o destrezas recién adquiridas mediante el aprendizaje o la práctica.',
            etymology: 'Del nórdico antiguo "skil" (distinción, discernimiento, habilidad de separar lo correcto de lo incorrecto). Los vikingos trajeron esta palabra al inglés.',
            oliversTip: 'Los vikingos nos dieron "skill", "knife", "anger", "window", "husband", "egg", "sky" y cientos más. ⚔️\n\nEl inglés moderno es una fusión de anglosajón + normando + nórdico. Aprender inglés es aprender tres idiomas europeos en uno.',
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
          message:
            'Bienvenue en français! El francés es el idioma de la diplomacia, el arte, la cocina y el amor. Fue el idioma internacional durante 300 años (hasta el siglo XX). Powell Janulus lo aprendió en menos de 3 meses usando exactamente estas estructuras.\n\nBuena noticia: el orden de las palabras en francés es muy similar al inglés.',
          technique:
            '🔵 Structure  +  🟢 Verbe  +  🟣 Objet\n\n"Je veux" + "trouver" + "une clé"\n= Je veux trouver une clé\n(I want to find a key)',
          funFact:
            '💡 El 30% del vocabulario inglés viene del francés (por la conquista normanda de 1066). Si ya sabes inglés, ya conoces miles de palabras en francés.',
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
            etymology: 'Del latín tardío "tropare" (componer música, "trovar"). Los trovadores medievales "encontraban" melodías. ¡Encontrar era una metáfora musical!',
          },
          {
            id: 'v2', text: 'utiliser', emoji: '🔧', anim: 'spin',
            definition: 'Usar o emplear algo para un fin determinado; servirse de algo.',
            etymology: 'Del latín "utilis" (útil), de "uti" (usar). Misma raíz que el inglés "use" y "utility". La utilidad siempre ha sido valiosa.',
          },
          {
            id: 'v3', text: 'porter', emoji: '💪', anim: 'lift',
            definition: 'Llevar o transportar algo de un lugar a otro; también, vestir o cargar algo consigo.',
            etymology: 'Del latín "portare" (llevar). Del indo-europeo "per-" (llevar a través). "Transport", "export", "import", "report", "support" — todos de esta raíz.',
          },
          {
            id: 'v4', text: 'ouvrir', emoji: '🚪', anim: 'swing',
            definition: 'Hacer que algo cerrado deje de estarlo; dar acceso a un espacio o recipiente.',
            etymology: 'Del latín "aperire" (abrir). "Apertura", "aperitivo" (la bebida que "abre" el apetito), "aperto" en italiano — todos de "aperire".',
          },
          {
            id: 'v5', text: 'voir', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo mediante la vista; observar, contemplar o darse cuenta de algo.',
            etymology: 'Del latín "videre" (ver). La misma raíz que "video", "visible", "vision", "vista", "evident" y el español "ver". Ver es la acción más latina.',
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'une clé', emoji: '🗝️', keyword: 'clé',
            definition: 'Pieza metálica con forma específica que encaja en una cerradura para abrirla o cerrarla.',
            etymology: 'Del latín "clavis" — exactamente la misma raíz que el español "clave", el inglés "clue" y el catalán "clau".',
            oliversTip: '¡"Clue" en inglés viene del griego "clew" (ovillo de hilo) — el hilo que usó Teseo para salir del laberinto del Minotauro! Una "clau/clé/clave/clue" siempre es un hilo que seguir. 🧶',
          },
          {
            id: 'w2', text: 'une pomme', emoji: '🍎', keyword: 'pomme',
            definition: 'Fruta comestible de forma redondeada, con piel de color rojo, verde o amarillo y pulpa blanca y jugosa.',
            etymology: 'Del gaulois "aballo" — el antecesor del inglés "apple" y del alemán "Apfel". El latín usaba "malum" para las manzanas.',
            oliversTip: '"Pomme de terre" (papa/patata) significa literalmente "manzana de tierra". ¡Los franceses llamaron al tubérculo "la manzana que crece bajo el suelo"! 🥔\n\n"Pomme" es también "pomo" en inglés antiguo (la empuñadura redonda de una espada).',
          },
          {
            id: 'w3', text: "de l'eau", emoji: '💧', keyword: 'eau',
            definition: 'Líquido incoloro, inodoro e insípido, esencial para la vida de todos los seres vivos. Fórmula química: H₂O.',
            etymology: 'Del latín "aqua" (agua) — el mismo origen que "aquarium", "acuático", "acuarela" y el español "agua".',
            oliversTip: '"Eau" (agua en francés) y "agua" (español) suenan completamente diferentes pero son la misma palabra latina "aqua". 🌊\n\nEl francés transformó "aqua" → "aigue" → "eaue" → "eau" en 1,500 años. ¡El francés borra las consonantes históricamente!',
          },
          {
            id: 'w4', text: 'une bougie', emoji: '🕯️', keyword: 'bougie',
            definition: 'Barra o cilindro de cera o parafina con una mecha que, al encenderse, proporciona luz.',
            etymology: 'De la ciudad de Béjaïa, en Argelia (llamada Bugia por los romanos). Desde allí se exportaba cera de alta calidad al mundo medieval.',
            oliversTip: 'Una ciudad norteafricana medieval dio nombre a las velas en francés. 🌍\n\n"Bougie" en francés moderno coloquial también significa "bujía de automóvil" y (en slang) "lujoso/snob". El significado evoluciona con el tiempo.',
          },
          {
            id: 'w5', text: 'un miroir', emoji: '🪞', keyword: 'miroir',
            definition: 'Superficie lisa y pulida, generalmente de vidrio con revestimiento metálico, que refleja la imagen de los objetos.',
            etymology: 'Del latín "mirare" (mirar con admiración) — exactamente la misma raíz del español "mirar" y el inglés "mirror".',
            oliversTip: '"Miroir" (francés), "mirar" (español), "mirror" (inglés) — tres idiomas, una sola raíz latina "mirare". 🪞\n\nCuando miras un espejo en cualquier idioma occidental, usas la misma palabra que los romanos usaban hace 2,000 años.',
          },
          {
            id: 'w6', text: 'une cloche', emoji: '🔔', keyword: 'cloche',
            definition: 'Instrumento de percusión de metal, con forma de copa invertida, que produce un sonido claro y resonante al ser golpeado.',
            etymology: 'Del latín medieval "clocca" — el mismo origen que el inglés "clock" y el alemán "Glocke". Un reloj era originalmente una campana que marcaba las horas.',
            oliversTip: '¡El inglés "clock" y el francés "cloche" son hermanos! ⏰\n\n"Cloche" también es un sombrero con forma de campana (los años 1920s). Y un invernadero en forma de campana de vidrio. La campana da forma a muchas cosas.',
          },
          {
            id: 'w7', text: 'une boussole', emoji: '🧭', keyword: 'boussole',
            definition: 'Instrumento de orientación que contiene una aguja magnetizada que gira libremente para señalar siempre el norte magnético.',
            etymology: 'Del italiano "bussola" (cajita de madera de boj). Italia introdujo la brújula magnética en Europa en el siglo XIII y exportó el nombre con el objeto.',
            oliversTip: 'La brújula llegó de China a través de los comerciantes árabes → italianos → franceses. El Mediterráneo fue la autopista del conocimiento medieval. 🧭\n\nEl nombre viajó con el objeto: "bussola" (italiano) → "boussole" (francés).',
          },
          {
            id: 'w8', text: 'un livre', emoji: '📖', keyword: 'livre',
            definition: 'Obra escrita o impresa compuesta por un conjunto de páginas encuadernadas con cubiertas.',
            etymology: 'Del latín "liber" (corteza interior de árbol, donde se escribía; también libro; también libre/libertad).',
            oliversTip: '"Libérer" (liberar), "libre" (libre), "livre" (libro), "librairie" (librería) — todos de "liber". 📚\n\nLos romanos asociaron el conocimiento (libros) con la libertad (libre). ¡Leer libros te hace libre! La misma raíz en francés une los tres conceptos.',
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
          message:
            'El catalán es una lengua románica hablada por 10 millones de personas en Cataluña, Valencia, las Islas Baleares, Andorra y parte del sur de Francia. Es la lengua de Ramon Llull (primer filósofo europeo en no escribir en latín), del modernismo catalán y de Antoni Gaudí.\n\nPowell Janulus describe el catalán como "el puente perfecto entre el español y el francés".',
          technique:
            '🔵 Estructura  +  🟢 Verb  +  🟣 Objecte\n\n"Vull" + "trobar" + "una clau"\n= Vull trobar una clau\n(I want to find a key)',
          funFact:
            '💡 El catalán medieval fue una de las primeras lenguas romances con literatura escrita (siglo XII) — anterior al castellano moderno. El "Llibre dels fets" (Libro de los hechos) de Jaume I es una de las primeras autobiografías de la historia europea.',
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
            etymology: 'Del latín tardío "tropare" — idéntica al francés "trouver". Los "trobadors" catalanes medievales eran famosos en toda Europa y la corte de Occitania.',
          },
          {
            id: 'v2', text: 'fer servir', emoji: '🔧', anim: 'spin',
            definition: 'Utilizar o emplear algo para un propósito concreto; poner algo al servicio de una tarea.',
            etymology: 'Del latín "facere" (hacer) + "servire" (servir). El catalán fusionó dos verbos en uno: "hacer + servir" = "poner algo al servicio de uno".',
          },
          {
            id: 'v3', text: 'portar', emoji: '💪', anim: 'lift',
            definition: 'Llevar o transportar algo consigo de un lugar a otro; también llevar puesto algo.',
            etymology: 'Del latín "portare" — idéntica al español "portar". "Transport", "export", "porto" (Puerto Rico viene de "portus", puerto). El Mediterráneo siempre se "portó" mucho.',
          },
          {
            id: 'v4', text: 'obrir', emoji: '🚪', anim: 'swing',
            definition: 'Separar o apartar lo que estaba cerrado o tapado para dar acceso o paso.',
            etymology: 'Del latín "aperire". El catalán transformó: aperire → obrire → obrir. La "ap-" se convirtió en "ob-" con el tiempo. ¡Los idiomas transforman los sonidos!',
          },
          {
            id: 'v5', text: 'veure', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos; observar, mirar o darse cuenta de algo visualmente.',
            etymology: 'Del latín "videre". En catalán: videre → veure. La "d" desapareció y "i" se convirtió en "eu". Mismo proceso que en el francés "voir" (v-id-ere → voir).',
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'una clau', emoji: '🗝️', keyword: 'clau',
            definition: 'Peça metàl·lica de forma especial que s\'introdueix en un pany per obrir-lo o tancar-lo. (Pieza metálica que abre una cerradura.)',
            etymology: 'Del latín "clavis" — el catalán conserva la forma más fiel al latín original: "cl-au" vs español "cl-av-e" vs francés "cl-é". El catalán perdió menos letras.',
            oliversTip: '"Clavis" (latín) → "clau" (catalán), "clave" (español), "clé" (francés), "key" (inglés del anglosajón). 🔑\n\nEl catalán es a veces más "puramente latino" que el español — conserva la "l" y la terminación más cerca del original.',
          },
          {
            id: 'w2', text: 'una poma', emoji: '🍎', keyword: 'poma',
            definition: 'Fruit rodó d\'arbre, de gust dolç o àcid, amb pell verda, vermella o groga. (Fruta redonda de árbol, de sabor dulce o ácido.)',
            etymology: 'Del latín "poma" (frutos). El catalán "poma" es más cercano al latín que el español "manzana" (del latín "mattiana pomum", la variedad de manzana "mattiana").',
            oliversTip: '"Poma" (catalán), "pomme" (francés), "pomme de terre" (papa/patata en francés) — el catalán y el francés comparten esta raíz directa del latín "poma". 🍎\n\nEl español eligió otra variedad latina ("mattiana") y el inglés conservó la raíz germánica ("apple").',
          },
          {
            id: 'w3', text: 'aigua', emoji: '💧', keyword: 'aigua',
            definition: 'Líquid incolor, inodor i insípid, indispensable per a la vida de tots els éssers vius. (Líquido esencial para la vida, H₂O.)',
            etymology: 'Del latín "aqua" — el catalán conservó casi perfectamente la forma latina: "aqua" → "aiga" → "aigua". Solo perdió la "q" + transformó la terminación.',
            oliversTip: '"Aigua" (catalán), "agua" (español), "eau" (francés) — todos de "aqua". 💧\n\nEl francés lo transformó más radicalmente (aqua → eau). El catalán y el español lo conservaron mejor. El catalán y el español son lingüísticamente primos más cercanos que el catalán y el francés.',
          },
          {
            id: 'w4', text: 'una espelma', emoji: '🕯️', keyword: 'espelma',
            definition: 'Cilindre de cera amb un ble que, en cremar-se, dóna llum. (Cilindro de cera con mecha que da luz al encenderse.)',
            etymology: 'Del latín tardío "sphaerula" (pequeña esfera) o del árabe. Palabra característica del catalán, sin equivalente directo exacto en español o francés.',
            oliversTip: '"Espelma" es una de las palabras más características del catalán — no tiene hermana exacta en español ni francés. 🕯️\n\nEl catalán tiene palabras únicas que no existen en otros idiomas románicos: también "lluna" (luna, de "luna" pero con ll-), "gos" (perro), "pedra" (piedra).',
          },
          {
            id: 'w5', text: 'un mirall', emoji: '🪞', keyword: 'mirall',
            definition: 'Superfície polida que reflexa la imatge dels objectes. (Superficie que refleja la imagen de los objetos.)',
            etymology: 'Del latín "mirallum", de "mirare" (mirar). El sufijo catalán "-all" viene del latín "-aculum" (instrumento para algo). Un espejo es "el instrumento para mirar".',
            oliversTip: '"Mirall" (catalán), "miroir" (francés), "mirror" (inglés) — todos de "mirare". 🪞\n\nEl sufijo "-all/-ail" en catalán/francés viene del latín "-aculum": "mirall" = "mirallum" = "instrumento de mirar". También: "ventall" (abanico = instrumento del viento).',
          },
          {
            id: 'w6', text: 'una campana', emoji: '🔔', keyword: 'campana',
            definition: 'Instrument de percussió de metall, en forma de copa invertida, que sona quan es colpeja. (Instrumento de metal que suena al ser golpeado.)',
            etymology: 'Del latín tardío "campana" (de Campania, región italiana famosa por la calidad de sus bronces para campanas). Igual que en español.',
            oliversTip: 'El catalán dice "campana" como el español, pero el francés dice "cloche". 🔔\n\nEsto muestra que el catalán a veces es más cercano al español que al francés, aunque geográficamente esté entre los dos. La lingüística no siempre sigue la geografía.',
          },
          {
            id: 'w7', text: 'una brúixola', emoji: '🧭', keyword: 'brúixola',
            definition: 'Instrument d\'orientació amb una agulla magnetitzada que assenyala sempre el nord. (Instrumento de orientación que señala el norte magnético.)',
            etymology: 'Del italiano "bussola" (cajita de boj), igual que el francés "boussole". Todos del latín "buxis" (madera de boj).',
            oliversTip: '"Brúixola" muestra la influencia italiana en el catalán medieval. La Corona de Aragón (que incluía Cataluña) fue una potencia mediterránea naval enorme. 🧭\n\nCataluña controló comercialmente el Mediterráneo occidental durante siglos — por eso tantas palabras náuticas italianas entraron al catalán.',
          },
          {
            id: 'w8', text: 'un llibre', emoji: '📖', keyword: 'llibre',
            definition: 'Conjunt de fulls escrits o impresos, enquadernats i amb cobertes. (Conjunto de páginas escritas o impresas encuadernadas.)',
            etymology: 'Del latín "liber" (libro, corteza, libertad) — con la doble "ll" característica del catalán, un sonido palatal propio de la lengua.',
            oliversTip: '"Llibre" (catalán), "libro" (español), "livre" (francés) — todos de "liber". 📚\n\nEl catalán transformó la "l" inicial en "ll" (sonido palatal propio). También: "lluna" (luna), "llop" (lobo), "llei" (ley). Esta "ll" inicial es una de las marcas más características del catalán.',
          },
        ],
      },
    ],
  },
}

export function getJanulusLanguages() {
  return Object.entries(JANULUS_DATA).map(([code, l]) => ({
    code, name: l.name, flag: l.flag,
  }))
}

export function getJanulusLevels(langCode) {
  return (JANULUS_DATA[langCode]?.levels ?? []).map((l) => ({
    level: l.level, name: l.name,
  }))
}

export function getJanulusLevel(langCode, levelNum) {
  return JANULUS_DATA[langCode]?.levels.find((l) => l.level === levelNum) ?? null
}

export function getSpeechLangJanulus(langCode) {
  return JANULUS_DATA[langCode]?.speechLang ?? 'en-US'
}
