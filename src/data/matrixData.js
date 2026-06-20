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
        name: 'First Tastes',
        oliversIntro: {
          headline: '¡Nivel 1 · First Tastes! 🍎',
          message: 'Empezamos con lo más fundamental: alimentos que todos reconocemos de inmediato. Powell Janulus siempre comienza con palabras concretas y visuales, porque el cerebro las retiene 3 veces más rápido que las abstractas.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Objeto\n\n"I want to" + "find" + "an apple"\n= I want to find an apple',
          funFact: '💡 El inglés tiene más de 170,000 palabras, pero solo 3,000 cubren el 95% del habla cotidiana. ¡Empezamos por las más visuales!',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo que se busca o que estaba perdido.',
            definitionEn: 'To locate or discover something you were looking for.',
            etymology: 'Del anglosajón "findan", del proto-germánico, relacionado con el alemán "finden".',
            etymologyEn: 'From Old English "findan", Proto-Germanic. Related to German "finden".',
            examples: [
              { s: 'I want to find an apple.', t: 'Quiero encontrar una manzana.' },
              { s: 'Can you find some bread?', t: '¿Puedes encontrar pan?' },
            ],
          },
          {
            id: 'v2', text: 'see', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos; observar algo visualmente.',
            definitionEn: 'To perceive with the eyes; to notice something.',
            etymology: 'Del anglosajón "sēon", una de las palabras más antiguas del idioma.',
            etymologyEn: 'From Old English "sēon", Proto-Germanic "sehwanan" — one of the oldest words in any language.',
            examples: [
              { s: 'I can see an apple.', t: 'Puedo ver una manzana.' },
              { s: 'I want to see a banana.', t: 'Quiero ver un plátano.' },
            ],
          },
          {
            id: 'v3', text: 'carry', emoji: '💪', anim: 'lift',
            definition: 'Transportar algo de un lugar a otro sosteniéndolo.',
            definitionEn: 'To hold and transport something from one place to another.',
            etymology: 'Del francés normando "carier" (llevar en carro), de "car" (vehículo).',
            etymologyEn: 'From Norman French "carier", from "car" (vehicle). Arrived with the Norman Conquest of 1066.',
            examples: [
              { s: 'I need to carry some bread.', t: 'Necesito llevar pan.' },
              { s: 'Can you carry an egg?', t: '¿Puedes llevar un huevo?' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'an apple', emoji: '🍎', keyword: 'apple',
            definition: 'Fruta redonda de piel roja, verde o amarilla y pulpa blanca.',
            definitionEn: 'A round fruit with colored skin and white flesh, grown on trees.',
            etymology: 'Del anglosajón "æppel" (siglo VIII), misma raíz que el alemán "Apfel".',
            etymologyEn: 'From Old English "æppel" (8th century). In Old English, "apple" could mean almost any fruit.',
            oliversTip: '"Apple" (inglés), "Apfel" (alemán) — familia germánica. El español "manzana" viene del latín "mattiana". 🍎',
            examples: [
              { s: 'I want to find an apple.', t: 'Quiero encontrar una manzana.' },
              { s: 'I can see an apple.', t: 'Puedo ver una manzana.' },
            ],
          },
          {
            id: 'w2', text: 'a banana', emoji: '🍌', keyword: 'banana',
            definition: 'Fruta tropical de piel amarilla y pulpa dulce y cremosa.',
            definitionEn: 'A tropical fruit with yellow skin and sweet, creamy flesh.',
            etymology: 'Del wolof "banana" (lengua de Senegal), llegó al inglés vía el portugués.',
            etymologyEn: 'From Wolof "banana" (a West African language), via Portuguese in the 1500s.',
            oliversTip: '"Banana" es casi idéntica en inglés, italiano, alemán y catalán — ¡una de las palabras más universales del mundo! 🌍',
            examples: [
              { s: 'I want to carry a banana.', t: 'Quiero llevar un plátano.' },
              { s: 'I need to find a banana.', t: 'Necesito encontrar un plátano.' },
            ],
          },
          {
            id: 'w3', text: 'some bread', emoji: '🍞', keyword: 'bread',
            definition: 'Alimento básico hecho de harina, agua y levadura, horneado.',
            definitionEn: 'A basic food made from flour, water, and yeast, baked in an oven.',
            etymology: 'Del anglosajón "brēad", relacionado con el alemán "Brot".',
            etymologyEn: 'From Old English "brēad", related to German "Brot". For millennia, bread and beer were made the same way.',
            examples: [
              { s: 'I need some bread.', t: 'Necesito pan.' },
              { s: 'I can carry some bread.', t: 'Puedo llevar pan.' },
            ],
          },
          {
            id: 'w4', text: 'some milk', emoji: '🥛', keyword: 'milk',
            definition: 'Líquido blanco y nutritivo producido por los mamíferos.',
            definitionEn: 'A white nutritious liquid produced by mammals.',
            etymology: 'Del anglosajón "meolc", relacionado con el alemán "Milch".',
            etymologyEn: 'From Old English "meolc", related to German "Milch". From PIE "melg-" (to milk, to squeeze).',
            oliversTip: '"Milk" (inglés), "Milch" (alemán) — familia germánica. El español "leche" viene del latín "lac" — de ahí "galaxia" (la Vía Láctea). 🌌',
            examples: [
              { s: 'I need some milk.', t: 'Necesito leche.' },
              { s: 'I want to find some milk.', t: 'Quiero encontrar leche.' },
            ],
          },
          {
            id: 'w5', text: 'an egg', emoji: '🥚', keyword: 'egg',
            definition: 'Cuerpo ovalado producido por aves, con cáscara, yema y clara.',
            definitionEn: 'An oval body produced by birds, with a yolk and white inside a shell.',
            etymology: 'Del nórdico antiguo "egg" (siglo XIII), que reemplazó al anglosajón "æg".',
            etymologyEn: 'From Old Norse "egg" (13th century), brought by Vikings to northern England.',
            oliversTip: 'En el siglo XV un mercader inglés pidió "eyren" (huevos en inglés antiguo) en Bélgica — ¡no le entendieron porque ya se decía "eggs"! 🥚',
            examples: [
              { s: 'I want to find an egg.', t: 'Quiero encontrar un huevo.' },
              { s: 'I can carry an egg.', t: 'Puedo llevar un huevo.' },
            ],
          },
          {
            id: 'w6', text: 'a mango', emoji: '🥭', keyword: 'mango',
            definition: 'Fruta tropical de pulpa amarilla, jugosa y muy dulce.',
            definitionEn: 'A tropical fruit with sweet, juicy orange flesh.',
            etymology: 'Del tamil "māṅkāy", a través del portugués "manga".',
            etymologyEn: 'From Tamil "māṅkāy", through Portuguese "manga" — traders brought it from India to the world in the 1500s.',
            examples: [
              { s: 'I want to find a mango.', t: 'Quiero encontrar un mango.' },
              { s: 'I can see a mango.', t: 'Puedo ver un mango.' },
            ],
          },
        ],
      },
      {
        level: 2,
        name: 'My Body',
        oliversIntro: {
          headline: 'Nivel 2 · My Body 🙌',
          message: 'Tu cuerpo siempre está contigo, y este vocabulario también. Las palabras que puedes señalar mientras las dices se aprenden hasta 4 veces más rápido.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Parte del cuerpo\n\n"I need to" + "wash" + "my face"\n= I need to wash my face',
          funFact: '💡 "Hand" en inglés y "Hand" en alemán son exactamente iguales — palabras hermanas de la misma raíz germánica.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'touch', emoji: '☝️', anim: 'pulse',
            definition: 'Entrar en contacto físico con algo con los dedos o la mano.',
            definitionEn: 'To put your hand or finger on something.',
            etymology: 'Del francés antiguo "touchier", quizás del fráncico.',
            etymologyEn: 'From Old French "touchier", possibly Frankish. Root of Italian "toccare" and Spanish "tocar".',
            examples: [
              { s: 'I want to touch my hand.', t: 'Quiero tocar mi mano.' },
              { s: 'I can touch my nose.', t: 'Puedo tocar mi nariz.' },
            ],
          },
          {
            id: 'v2', text: 'wash', emoji: '🧼', anim: 'spin',
            definition: 'Limpiar algo con agua y jabón.',
            definitionEn: 'To clean something with water and soap.',
            etymology: 'Del anglosajón "wæscan", relacionado con "water" — misma raíz "*wed-" (húmedo).',
            etymologyEn: 'From Old English "wæscan", related to "water" — both from the same root meaning "wet".',
            examples: [
              { s: 'I need to wash my face.', t: 'Necesito lavarme la cara.' },
              { s: 'I want to wash my hair.', t: 'Quiero lavarme el cabello.' },
            ],
          },
          {
            id: 'v3', text: 'use', emoji: '🔧', anim: 'spin',
            definition: 'Emplear algo o una parte del cuerpo para un fin.',
            definitionEn: 'To employ something or a part of the body for a purpose.',
            etymology: 'Del latín "usus", de "uti" (usar, disfrutar).',
            etymologyEn: 'From Latin "usus", from "uti" (to use). Root of "utensil" and "utility".',
            examples: [
              { s: 'I can use my hands.', t: 'Puedo usar mis manos.' },
              { s: 'I use my eyes every day.', t: 'Uso mis ojos todos los días.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'my hand', emoji: '✋', keyword: 'hand',
            definition: 'Parte del cuerpo al final del brazo, con palma y cinco dedos.',
            definitionEn: 'The part of the body at the end of the arm, with a palm and five fingers.',
            etymology: 'Del anglosajón "hand" — igual al alemán "Hand", sin cambios en 2,000 años.',
            etymologyEn: 'From Old English "hand" — identical to German "Hand", unchanged for 2,000 years.',
            examples: [
              { s: 'I want to wash my hand.', t: 'Quiero lavarme la mano.' },
              { s: 'I can use my hand.', t: 'Puedo usar mi mano.' },
            ],
          },
          {
            id: 'w2', text: 'my face', emoji: '😊', keyword: 'face',
            definition: 'Parte delantera de la cabeza, con ojos, nariz y boca.',
            definitionEn: 'The front of the head, including the eyes, nose, and mouth.',
            etymology: 'Del latín "facies" (apariencia, forma), vía el francés antiguo "face".',
            etymologyEn: 'From Latin "facies" (appearance), via Old French "face". Root of "surface" and "facade".',
            examples: [
              { s: 'I want to wash my face.', t: 'Quiero lavarme la cara.' },
              { s: 'I can touch my face.', t: 'Puedo tocar mi cara.' },
            ],
          },
          {
            id: 'w3', text: 'my eyes', emoji: '👀', keyword: 'eyes',
            definition: 'Órganos de la visión situados en la cara.',
            definitionEn: 'The organs of sight in the face.',
            etymology: 'Del anglosajón "ēage". Del indo-europeo "okw-" (ver).',
            etymologyEn: 'From Old English "ēage", PIE "okw-" (to see) — same root as "ocular" and "optical".',
            examples: [
              { s: 'I can use my eyes.', t: 'Puedo usar mis ojos.' },
              { s: 'I want to wash my eyes.', t: 'Quiero lavarme los ojos.' },
            ],
          },
          {
            id: 'w4', text: 'my ears', emoji: '👂', keyword: 'ears',
            definition: 'Órganos auditivos situados a los lados de la cabeza.',
            definitionEn: 'The organs of hearing on the sides of the head.',
            etymology: 'Del anglosajón "ēare". Del indo-europeo "ous-" (oído).',
            etymologyEn: 'From Old English "ēare", PIE "ous-" — same root as "audio" and "auditory".',
            examples: [
              { s: 'I can touch my ears.', t: 'Puedo tocar mis orejas.' },
              { s: 'I want to wash my ears.', t: 'Quiero lavarme las orejas.' },
            ],
          },
          {
            id: 'w5', text: 'my nose', emoji: '👃', keyword: 'nose',
            definition: 'Órgano del olfato en el centro de la cara.',
            definitionEn: 'The organ of smell in the center of the face.',
            etymology: 'Del anglosajón "nosu", relacionado con el alemán "Nase".',
            etymologyEn: 'From Old English "nosu", related to German "Nase". "Nostril" comes from "nose-thirl" (nose-hole).',
            examples: [
              { s: 'I want to touch my nose.', t: 'Quiero tocar mi nariz.' },
              { s: 'I can use my nose.', t: 'Puedo usar mi nariz.' },
            ],
          },
          {
            id: 'w6', text: 'my hair', emoji: '💇', keyword: 'hair',
            definition: 'Conjunto de filamentos que crecen en la cabeza y el cuerpo.',
            definitionEn: 'The fine threads that grow on the head and body.',
            etymology: 'Del anglosajón "hær", palabra puramente germánica.',
            etymologyEn: 'From Old English "hær" — purely Germanic; Latin used "capillus" instead (giving "capillary").',
            examples: [
              { s: 'I need to wash my hair.', t: 'Necesito lavarme el cabello.' },
              { s: 'I can touch my hair.', t: 'Puedo tocar mi cabello.' },
            ],
          },
        ],
      },
      {
        level: 3,
        name: 'Animals',
        oliversIntro: {
          headline: 'Nivel 3 · Animals 🐾',
          message: 'Los animales son vocabulario universal — cada cultura humana tiene palabras para ellos. Algunos nombres en inglés tienen orígenes sorprendentes, como descubrirás aquí.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Animal\n\n"I like to" + "feed" + "a cat"\n= I like to feed a cat',
          funFact: '💡 El origen de la palabra "dog" es un misterio total para los lingüistas — ¡uno de los grandes enigmas del inglés!',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I like to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'see', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos.',
            definitionEn: 'To perceive with the eyes.',
            etymology: 'Del anglosajón "sēon", una de las palabras más antiguas del idioma.',
            etymologyEn: 'From Old English "sēon" — among the oldest words in any language.',
            examples: [
              { s: 'I want to see a cat.', t: 'Quiero ver un gato.' },
              { s: 'I can see a horse.', t: 'Puedo ver un caballo.' },
            ],
          },
          {
            id: 'v2', text: 'feed', emoji: '🥄', anim: 'bounce',
            definition: 'Dar comida a una persona o animal.',
            definitionEn: 'To give food to a person or animal.',
            etymology: 'Del anglosajón "fēdan", relacionado con "food" (comida).',
            etymologyEn: 'From Old English "fēdan", related to "food" and "fodder".',
            examples: [
              { s: 'I like to feed a dog.', t: 'Me gusta alimentar a un perro.' },
              { s: 'I want to feed a rabbit.', t: 'Quiero alimentar a un conejo.' },
            ],
          },
          {
            id: 'v3', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo o a alguien.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan", related to German "finden".',
            examples: [
              { s: 'I want to find a bird.', t: 'Quiero encontrar un pájaro.' },
              { s: 'Can you find a fish?', t: '¿Puedes encontrar un pez?' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a cat', emoji: '🐱', keyword: 'cat',
            definition: 'Mamífero pequeño y doméstico, muy popular como mascota.',
            definitionEn: 'A small domesticated mammal, a popular pet.',
            etymology: 'Del latín tardío "cattus", que reemplazó al clásico "felis".',
            etymologyEn: 'From Late Latin "cattus", which replaced classical "felis". The word spread across Europe via Roman trade routes.',
            examples: [
              { s: 'I want to see a cat.', t: 'Quiero ver un gato.' },
              { s: 'I can feed a cat.', t: 'Puedo alimentar a un gato.' },
            ],
          },
          {
            id: 'w2', text: 'a dog', emoji: '🐶', keyword: 'dog',
            definition: 'Mamífero doméstico, fiel compañero del ser humano.',
            definitionEn: 'A domesticated mammal, a loyal companion to humans.',
            etymology: 'Del anglosajón "docga" (siglo X) — ¡su origen es desconocido!',
            etymologyEn: 'From Old English "docga" (10th century) — its origin is genuinely unknown, one of English\'s great mysteries.',
            oliversTip: 'La palabra "hund" (relacionada con "hound") era la original en inglés antiguo. "Dog" apareció después y nadie sabe de dónde vino. 🐶',
            examples: [
              { s: 'I like to feed a dog.', t: 'Me gusta alimentar a un perro.' },
              { s: 'I want to see a dog.', t: 'Quiero ver un perro.' },
            ],
          },
          {
            id: 'w3', text: 'a bird', emoji: '🐦', keyword: 'bird',
            definition: 'Animal con plumas, alas y pico, capaz de volar.',
            definitionEn: 'An animal with feathers, wings, and a beak, usually able to fly.',
            etymology: 'Del anglosajón "bridd" (cría de ave). La palabra general era "fowl".',
            etymologyEn: 'From Old English "bridd" (nestling, young bird). The general word was "fowl" — "bird" gradually took over.',
            examples: [
              { s: 'I want to find a bird.', t: 'Quiero encontrar un pájaro.' },
              { s: 'I can see a bird.', t: 'Puedo ver un pájaro.' },
            ],
          },
          {
            id: 'w4', text: 'a horse', emoji: '🐴', keyword: 'horse',
            definition: 'Mamífero grande usado para montar o transportar cargas.',
            definitionEn: 'A large mammal used for riding or pulling loads.',
            etymology: 'Del anglosajón "hors", relacionado con el alemán "Ross".',
            etymologyEn: 'From Old English "hors", related to German "Ross" (a poetic word for horse). Latin used "equus" (giving "equestrian").',
            examples: [
              { s: 'I can see a horse.', t: 'Puedo ver un caballo.' },
              { s: 'I want to find a horse.', t: 'Quiero encontrar un caballo.' },
            ],
          },
          {
            id: 'w5', text: 'a rabbit', emoji: '🐰', keyword: 'rabbit',
            definition: 'Mamífero pequeño de orejas largas, muy rápido al correr.',
            definitionEn: 'A small mammal with long ears, known for being fast.',
            etymology: 'Apareció en inglés en el siglo XV, quizá del francés "rabotte".',
            etymologyEn: 'Appeared in English in the 1400s, possibly from French "rabotte". Before that, rabbits were called "coneys".',
            oliversTip: 'Los romanos llamaban al conejo "cuniculus" — los normandos trajeron conejos a Inglaterra para criarlos como alimento. 🐰',
            examples: [
              { s: 'I like to feed a rabbit.', t: 'Me gusta alimentar a un conejo.' },
              { s: 'I want to see a rabbit.', t: 'Quiero ver un conejo.' },
            ],
          },
          {
            id: 'w6', text: 'a fish', emoji: '🐟', keyword: 'fish',
            definition: 'Animal acuático con escamas y branquias que vive en el agua.',
            definitionEn: 'An aquatic animal with scales and gills that lives in water.',
            etymology: 'Del anglosajón "fisc", relacionado con el latín "piscis" (de donde viene "Pisces").',
            etymologyEn: 'From Old English "fisc", related to Latin "piscis" — giving us "Pisces" and "pescatarian".',
            examples: [
              { s: 'I want to find a fish.', t: 'Quiero encontrar un pez.' },
              { s: 'I can see a fish.', t: 'Puedo ver un pez.' },
            ],
          },
        ],
      },
      {
        level: 4,
        name: 'Meal Time',
        oliversIntro: {
          headline: 'Nivel 4 · Meal Time 🍝',
          message: 'Comemos tres veces al día — este vocabulario lo usarás constantemente. Muchas palabras de comida en inglés viajaron desde lugares sorprendentes: India, México, Italia.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Comida\n\n"I want to" + "eat" + "some pasta"\n= I want to eat some pasta',
          funFact: '💡 La palabra "tomato" viene del náhuatl "tomatl" — el idioma azteca de México.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I like to' },
        ],
        verbs: [
          {
            id: 'v1', text: 'eat', emoji: '🍽️', anim: 'bounce',
            definition: 'Masticar y tragar alimentos.',
            definitionEn: 'To chew and swallow food.',
            etymology: 'Del anglosajón "etan", relacionado con el alemán "essen" y el latín "edere".',
            etymologyEn: 'From Old English "etan", related to German "essen" and Latin "edere" (giving "edible").',
            examples: [
              { s: 'I want to eat some pasta.', t: 'Quiero comer pasta.' },
              { s: 'I like to eat some rice.', t: 'Me gusta comer arroz.' },
            ],
          },
          {
            id: 'v2', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find a tomato.', t: 'Quiero encontrar un tomate.' },
              { s: 'Can you find some cheese?', t: '¿Puedes encontrar queso?' },
            ],
          },
          {
            id: 'v3', text: 'buy', emoji: '🛒', anim: 'spin',
            definition: 'Adquirir algo a cambio de dinero.',
            definitionEn: 'To get something in exchange for money.',
            etymology: 'Del anglosajón "bycgan", su origen fuera del germánico es desconocido.',
            etymologyEn: 'From Old English "bycgan", related to Gothic "bugjan". No clear relatives outside Germanic.',
            examples: [
              { s: 'I need to buy an orange.', t: 'Necesito comprar una naranja.' },
              { s: 'I want to buy some cheese.', t: 'Quiero comprar queso.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'some rice', emoji: '🍚', keyword: 'rice',
            definition: 'Cereal pequeño y blanco, alimento básico en gran parte del mundo.',
            definitionEn: 'A small white grain, a staple food across much of the world.',
            etymology: 'Del griego "oryza", que viene de una antigua palabra del sánscrito.',
            etymologyEn: 'From Greek "oryza", from an ancient Sanskrit-related word. Rice traveled to Europe via the Silk Road.',
            examples: [
              { s: 'I want to eat some rice.', t: 'Quiero comer arroz.' },
              { s: 'I need to find some rice.', t: 'Necesito encontrar arroz.' },
            ],
          },
          {
            id: 'w2', text: 'some soup', emoji: '🍜', keyword: 'soup',
            definition: 'Plato líquido caliente, generalmente con verduras o carne.',
            definitionEn: 'A hot liquid dish, usually with vegetables or meat.',
            etymology: 'Del francés antiguo "soupe" (pan remojado en caldo), del fráncico "suppa".',
            etymologyEn: 'From Old French "soupe" (bread soaked in broth), from Frankish "suppa". Related to "supper".',
            examples: [
              { s: 'I like to eat some soup.', t: 'Me gusta comer sopa.' },
              { s: 'I want to find some soup.', t: 'Quiero encontrar sopa.' },
            ],
          },
          {
            id: 'w3', text: 'some pasta', emoji: '🍝', keyword: 'pasta',
            definition: 'Alimento de harina y agua con forma variada, típico de Italia.',
            definitionEn: 'A food made of flour and water in various shapes, typical of Italy.',
            etymology: 'Del italiano "pasta" (masa), del latín tardío "pasta", del griego "pastē".',
            etymologyEn: 'From Italian "pasta" (dough), from Late Latin, from Greek "pastē" (barley porridge). Same root as "paste" and "pastry".',
            examples: [
              { s: 'I want to eat some pasta.', t: 'Quiero comer pasta.' },
              { s: 'I like to eat some pasta.', t: 'Me gusta comer pasta.' },
            ],
          },
          {
            id: 'w4', text: 'a tomato', emoji: '🍅', keyword: 'tomato',
            definition: 'Fruto rojo y jugoso, usado como verdura en la cocina.',
            definitionEn: 'A red, juicy fruit used as a vegetable in cooking.',
            etymology: 'Del náhuatl "tomatl" (idioma azteca), vía el español "tomate".',
            etymologyEn: 'From Nahuatl "tomatl" (Aztec language), via Spanish "tomate". Brought to Europe from Mexico in the 1500s.',
            oliversTip: 'Durante 200 años, los europeos creyeron que el tomate era venenoso — solo lo usaban como planta decorativa. 🍅',
            examples: [
              { s: 'I want to find a tomato.', t: 'Quiero encontrar un tomate.' },
              { s: 'I like to eat a tomato.', t: 'Me gusta comer un tomate.' },
            ],
          },
          {
            id: 'w5', text: 'some cheese', emoji: '🧀', keyword: 'cheese',
            definition: 'Alimento sólido hecho de leche cuajada.',
            definitionEn: 'A solid food made from curdled milk.',
            etymology: 'Del anglosajón "cēse", del latín "caseus" (de donde viene "caseína").',
            etymologyEn: 'From Old English "cēse", from Latin "caseus" — giving "casein", the protein in cheese.',
            examples: [
              { s: 'I want to buy some cheese.', t: 'Quiero comprar queso.' },
              { s: 'I like to eat some cheese.', t: 'Me gusta comer queso.' },
            ],
          },
          {
            id: 'w6', text: 'an orange', emoji: '🍊', keyword: 'orange',
            definition: 'Fruta cítrica de color naranja, dulce y jugosa.',
            definitionEn: 'A citrus fruit, sweet and juicy, with orange-colored skin.',
            etymology: 'Del árabe "nāranj", del persa "nārang", del sánscrito — un viaje de India a Europa.',
            etymologyEn: 'From Arabic "nāranj", from Persian, from Sanskrit — the fruit\'s name traveled from India through Persia and Arabia to Europe.',
            examples: [
              { s: 'I need to buy an orange.', t: 'Necesito comprar una naranja.' },
              { s: 'I want to find an orange.', t: 'Quiero encontrar una naranja.' },
            ],
          },
        ],
      },
      {
        level: 5,
        name: 'Drinks',
        oliversIntro: {
          headline: 'Nivel 5 · Drinks 🧃',
          message: 'Las bebidas son parte del día a día en cualquier idioma. "Water" es una de las palabras más antiguas que existen — compartida desde Islandia hasta India.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Bebida\n\n"I need to" + "drink" + "some water"\n= I need to drink some water',
          funFact: '💡 "Tea" y "chai" son la misma palabra china — viajó por dos rutas comerciales distintas y llegó dos veces a Europa.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I like to' },
        ],
        verbs: [
          {
            id: 'v1', text: 'drink', emoji: '☕', anim: 'lift',
            definition: 'Tragar un líquido.',
            definitionEn: 'To swallow a liquid.',
            etymology: 'Del anglosajón "drincan", relacionado con el alemán "trinken".',
            etymologyEn: 'From Old English "drincan", related to German "trinken".',
            examples: [
              { s: 'I need to drink some water.', t: 'Necesito beber agua.' },
              { s: 'I like to drink some tea.', t: 'Me gusta beber té.' },
            ],
          },
          {
            id: 'v2', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find some coffee.', t: 'Quiero encontrar café.' },
              { s: 'Can you find some juice?', t: '¿Puedes encontrar jugo?' },
            ],
          },
          {
            id: 'v3', text: 'buy', emoji: '🛒', anim: 'spin',
            definition: 'Adquirir algo a cambio de dinero.',
            definitionEn: 'To get something in exchange for money.',
            etymology: 'Del anglosajón "bycgan".',
            etymologyEn: 'From Old English "bycgan".',
            examples: [
              { s: 'I want to buy some soda.', t: 'Quiero comprar refresco.' },
              { s: 'I need to buy some cocoa.', t: 'Necesito comprar cacao.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'some tea', emoji: '🍵', keyword: 'tea',
            definition: 'Bebida caliente hecha con hojas secas de la planta del té.',
            definitionEn: 'A hot drink made from the dried leaves of the tea plant.',
            etymology: 'Del chino "tê" (dialecto de Amoy), llevado por comerciantes holandeses.',
            etymologyEn: 'From Chinese "tê" (Amoy dialect), brought by Dutch traders. The Mandarin form "chá" gave Russian "chay" and Hindi "chai".',
            examples: [
              { s: 'I like to drink some tea.', t: 'Me gusta beber té.' },
              { s: 'I want to find some tea.', t: 'Quiero encontrar té.' },
            ],
          },
          {
            id: 'w2', text: 'some coffee', emoji: '☕', keyword: 'coffee',
            definition: 'Bebida oscura y estimulante hecha de granos tostados.',
            definitionEn: 'A dark, energizing drink made from roasted beans.',
            etymology: 'Del árabe "qahwa", a través del turco "kahve". Originario de Etiopía.',
            etymologyEn: 'From Arabic "qahwa", through Turkish "kahve". The drink originated in Ethiopia.',
            examples: [
              { s: 'I want to find some coffee.', t: 'Quiero encontrar café.' },
              { s: 'I need to drink some coffee.', t: 'Necesito beber café.' },
            ],
          },
          {
            id: 'w3', text: 'some juice', emoji: '🧃', keyword: 'juice',
            definition: 'Líquido extraído de frutas o verduras.',
            definitionEn: 'A liquid extracted from fruits or vegetables.',
            etymology: 'Del francés antiguo "jus" (caldo), del latín "jus" (salsa, caldo).',
            etymologyEn: 'From Old French "jus" (broth), from Latin "jus" (sauce, broth).',
            examples: [
              { s: 'I want to drink some juice.', t: 'Quiero beber jugo.' },
              { s: 'I need to find some juice.', t: 'Necesito encontrar jugo.' },
            ],
          },
          {
            id: 'w4', text: 'some water', emoji: '💧', keyword: 'water',
            definition: 'Líquido transparente, esencial para la vida (H₂O).',
            definitionEn: 'A clear liquid essential for life (H₂O).',
            etymology: 'Del anglosajón "wæter", del indo-europeo "wódr̥".',
            etymologyEn: 'From Old English "wæter", PIE "wódr̥" — a word shared from Iceland to India.',
            examples: [
              { s: 'I need to drink some water.', t: 'Necesito beber agua.' },
              { s: 'I want to find some water.', t: 'Quiero encontrar agua.' },
            ],
          },
          {
            id: 'w5', text: 'some soda', emoji: '🥤', keyword: 'soda',
            definition: 'Bebida gaseosa, dulce y refrescante.',
            definitionEn: 'A sweet, carbonated, refreshing drink.',
            etymology: 'Del latín medieval "soda", relacionado con "sodium" (sodio).',
            etymologyEn: 'From Medieval Latin "soda", related to "sodium" — the chemical used to make it bubble.',
            examples: [
              { s: 'I want to buy some soda.', t: 'Quiero comprar refresco.' },
              { s: 'I like to drink some soda.', t: 'Me gusta beber refresco.' },
            ],
          },
          {
            id: 'w6', text: 'some cocoa', emoji: '🍫', keyword: 'cocoa',
            definition: 'Bebida o ingrediente hecho de semillas de cacao tostadas.',
            definitionEn: 'A drink or ingredient made from roasted cacao beans.',
            etymology: 'Del español "cacao", del náhuatl "cacahuatl".',
            etymologyEn: 'From Spanish "cacao", from Nahuatl "cacahuatl". The Aztecs drank it bitter and spiced.',
            examples: [
              { s: 'I need to buy some cocoa.', t: 'Necesito comprar cacao.' },
              { s: 'I like to drink some cocoa.', t: 'Me gusta beber cacao.' },
            ],
          },
        ],
      },
      {
        level: 6,
        name: 'At Home',
        oliversIntro: {
          headline: 'Nivel 6 · At Home 🏠',
          message: 'Tu casa está llena de vocabulario esencial. Muchas palabras de muebles tienen historias sorprendentes: "window" significa literalmente "ojo del viento" en nórdico antiguo.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Objeto del hogar\n\n"I can" + "use" + "a table"\n= I can use a table',
          funFact: '💡 "Window" viene del nórdico antiguo "vindauga": "vind" (viento) + "auga" (ojo). ¡Antes del vidrio, las ventanas eran solo agujeros!',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'see', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos.',
            definitionEn: 'To perceive with the eyes.',
            etymology: 'Del anglosajón "sēon".',
            etymologyEn: 'From Old English "sēon".',
            examples: [
              { s: 'I can see a door.', t: 'Puedo ver una puerta.' },
              { s: 'I want to see a lamp.', t: 'Quiero ver una lámpara.' },
            ],
          },
          {
            id: 'v2', text: 'use', emoji: '🔧', anim: 'spin',
            definition: 'Emplear algo para un fin determinado.',
            definitionEn: 'To employ something for a purpose.',
            etymology: 'Del latín "usus", de "uti" (usar).',
            etymologyEn: 'From Latin "usus", from "uti" (to use).',
            examples: [
              { s: 'I can use a table.', t: 'Puedo usar una mesa.' },
              { s: 'I want to use a chair.', t: 'Quiero usar una silla.' },
            ],
          },
          {
            id: 'v3', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I need to find a bed.', t: 'Necesito encontrar una cama.' },
              { s: 'Can you find a window?', t: '¿Puedes encontrar una ventana?' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a door', emoji: '🚪', keyword: 'door',
            definition: 'Estructura que se abre y cierra para dar acceso a un espacio.',
            definitionEn: 'A structure that opens and closes to allow access to a space.',
            etymology: 'Del anglosajón "duru", relacionado con el alemán "Tür".',
            etymologyEn: 'From Old English "duru", related to German "Tür". Latin used "janua" — giving "January", named after Janus, god of doorways.',
            examples: [
              { s: 'I can see a door.', t: 'Puedo ver una puerta.' },
              { s: 'I want to find a door.', t: 'Quiero encontrar una puerta.' },
            ],
          },
          {
            id: 'w2', text: 'a window', emoji: '🪟', keyword: 'window',
            definition: 'Abertura en una pared, generalmente con vidrio, para dejar pasar la luz.',
            definitionEn: 'An opening in a wall, usually glazed, to let in light.',
            etymology: 'Del nórdico antiguo "vindauga": "vind" (viento) + "auga" (ojo).',
            etymologyEn: 'From Old Norse "vindauga" — literally "wind eye". Before glass, windows were simply holes that let the wind in.',
            oliversTip: '"Window" = "ojo del viento" en nórdico antiguo. ¡Los vikingos nos dieron esta palabra junto con "sky", "egg" y "knife"! 🪟',
            examples: [
              { s: 'I want to find a window.', t: 'Quiero encontrar una ventana.' },
              { s: 'I can see a window.', t: 'Puedo ver una ventana.' },
            ],
          },
          {
            id: 'w3', text: 'a table', emoji: '🪑', keyword: 'table',
            definition: 'Mueble con una superficie plana sobre patas.',
            definitionEn: 'A piece of furniture with a flat top on legs.',
            etymology: 'Del francés antiguo "table", del latín "tabula" (tabla, tablón).',
            etymologyEn: 'From Old French "table", from Latin "tabula" (a flat board). Root of "tablet" and "tabulate".',
            examples: [
              { s: 'I can use a table.', t: 'Puedo usar una mesa.' },
              { s: 'I want to find a table.', t: 'Quiero encontrar una mesa.' },
            ],
          },
          {
            id: 'w4', text: 'a chair', emoji: '💺', keyword: 'chair',
            definition: 'Mueble individual con respaldo, usado para sentarse.',
            definitionEn: 'A piece of furniture with a back, used for sitting.',
            etymology: 'Del francés antiguo "chaiere", del latín "cathedra" (asiento de autoridad).',
            etymologyEn: 'From Old French "chaiere", from Latin "cathedra" — same root as "cathedral", the church with the bishop\'s seat.',
            examples: [
              { s: 'I want to use a chair.', t: 'Quiero usar una silla.' },
              { s: 'I can see a chair.', t: 'Puedo ver una silla.' },
            ],
          },
          {
            id: 'w5', text: 'a bed', emoji: '🛏️', keyword: 'bed',
            definition: 'Mueble para dormir o descansar.',
            definitionEn: 'A piece of furniture for sleeping or resting.',
            etymology: 'Del anglosajón "bedd", relacionado con el alemán "Bett".',
            etymologyEn: 'From Old English "bedd", related to German "Bett". The original sense may have been "a dug-out resting place".',
            examples: [
              { s: 'I need to find a bed.', t: 'Necesito encontrar una cama.' },
              { s: 'I can see a bed.', t: 'Puedo ver una cama.' },
            ],
          },
          {
            id: 'w6', text: 'a lamp', emoji: '💡', keyword: 'lamp',
            definition: 'Aparato que produce luz artificial.',
            definitionEn: 'A device that produces artificial light.',
            etymology: 'Del francés antiguo "lampe", del griego "lampas" (antorcha), de "lampein" (brillar).',
            etymologyEn: 'From Old French "lampe", from Greek "lampas" (torch), from "lampein" (to shine).',
            examples: [
              { s: 'I want to find a lamp.', t: 'Quiero encontrar una lámpara.' },
              { s: 'I can use a lamp.', t: 'Puedo usar una lámpara.' },
            ],
          },
        ],
      },
      {
        level: 7,
        name: 'My Family',
        oliversIntro: {
          headline: 'Nivel 7 · My Family 👨‍👩‍👧',
          message: 'Las palabras de familia son las más universales y emotivas en cualquier idioma. "Mother" y "father" son casi idénticas en decenas de lenguas indoeuropeas — un eco de hace 6,000 años.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Familiar\n\n"I want to" + "call" + "my mother"\n= I want to call my mother',
          funFact: '💡 "Mother" (inglés), "Mutter" (alemán), "mater" (latín), "mētēr" (griego) — todas vienen de la misma raíz indoeuropea de hace miles de años.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I can' },
          { id: 'b3', text: 'I need to' },
        ],
        verbs: [
          {
            id: 'v1', text: 'see', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos; visitar a alguien.',
            definitionEn: 'To perceive with the eyes; to visit someone.',
            etymology: 'Del anglosajón "sēon".',
            etymologyEn: 'From Old English "sēon".',
            examples: [
              { s: 'I want to see my mother.', t: 'Quiero ver a mi madre.' },
              { s: 'I can see my sister.', t: 'Puedo ver a mi hermana.' },
            ],
          },
          {
            id: 'v2', text: 'call', emoji: '📱', anim: 'flash',
            definition: 'Comunicarse con alguien por teléfono o llamando en voz alta.',
            definitionEn: 'To communicate with someone by phone or by speaking loudly.',
            etymology: 'Del nórdico antiguo "kalla" (llamar en voz alta).',
            etymologyEn: 'From Old Norse "kalla" (to shout, to call loudly) — another Viking word.',
            examples: [
              { s: 'I want to call my father.', t: 'Quiero llamar a mi padre.' },
              { s: 'I need to call my brother.', t: 'Necesito llamar a mi hermano.' },
            ],
          },
          {
            id: 'v3', text: 'hug', emoji: '🤗', anim: 'pulse',
            definition: 'Abrazar a alguien con los brazos en señal de afecto.',
            definitionEn: 'To put your arms around someone affectionately.',
            etymology: 'Probablemente del nórdico antiguo "hugga" (consolar).',
            etymologyEn: 'Probably from Old Norse "hugga" (to comfort, console).',
            examples: [
              { s: 'I want to hug my sister.', t: 'Quiero abrazar a mi hermana.' },
              { s: 'I can hug a baby.', t: 'Puedo abrazar a un bebé.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'my mother', emoji: '👩', keyword: 'mother',
            definition: 'Mujer que ha tenido o cría a un hijo.',
            definitionEn: 'A woman who has given birth to or raises a child.',
            etymology: 'Del anglosajón "mōdor", del indo-europeo "méh₂tēr" — casi idéntica en docenas de idiomas.',
            etymologyEn: 'From Old English "mōdor", PIE "méh₂tēr" — one of the most universal words across all human languages.',
            examples: [
              { s: 'I want to see my mother.', t: 'Quiero ver a mi madre.' },
              { s: 'I want to call my mother.', t: 'Quiero llamar a mi madre.' },
            ],
          },
          {
            id: 'w2', text: 'my father', emoji: '👨', keyword: 'father',
            definition: 'Hombre que ha tenido o cría a un hijo.',
            definitionEn: 'A man who has fathered or raises a child.',
            etymology: 'Del anglosajón "fæder", del indo-europeo "ph₂tḗr".',
            etymologyEn: 'From Old English "fæder", PIE "ph₂tḗr" — related to Latin "pater" (giving "paternal") and Greek "patēr".',
            examples: [
              { s: 'I want to call my father.', t: 'Quiero llamar a mi padre.' },
              { s: 'I can see my father.', t: 'Puedo ver a mi padre.' },
            ],
          },
          {
            id: 'w3', text: 'my brother', emoji: '👦', keyword: 'brother',
            definition: 'Hombre que tiene los mismos padres que otra persona.',
            definitionEn: 'A man who shares the same parents as another person.',
            etymology: 'Del anglosajón "brōþor", del indo-europeo "bʰréh₂tēr".',
            etymologyEn: 'From Old English "brōþor", PIE "bʰréh₂tēr" — related to Latin "frater" (giving "fraternal").',
            examples: [
              { s: 'I need to call my brother.', t: 'Necesito llamar a mi hermano.' },
              { s: 'I want to see my brother.', t: 'Quiero ver a mi hermano.' },
            ],
          },
          {
            id: 'w4', text: 'my sister', emoji: '👧', keyword: 'sister',
            definition: 'Mujer que tiene los mismos padres que otra persona.',
            definitionEn: 'A woman who shares the same parents as another person.',
            etymology: 'Del anglosajón "sweostor", del indo-europeo "swésōr".',
            etymologyEn: 'From Old English "sweostor", PIE "swésōr" — related to Latin "soror" (giving "sorority").',
            examples: [
              { s: 'I want to hug my sister.', t: 'Quiero abrazar a mi hermana.' },
              { s: 'I can see my sister.', t: 'Puedo ver a mi hermana.' },
            ],
          },
          {
            id: 'w5', text: 'my friend', emoji: '🤝', keyword: 'friend',
            definition: 'Persona con quien se tiene una relación de afecto y confianza.',
            definitionEn: 'A person with whom you have a bond of affection and trust.',
            etymology: 'Del anglosajón "frēond" (el que ama), de "frēogan" (amar, liberar).',
            etymologyEn: 'From Old English "frēond" (one who loves), from "frēogan" (to love, to free) — friendship as the "free" relationship, chosen not inherited.',
            examples: [
              { s: 'I want to see my friend.', t: 'Quiero ver a mi amigo.' },
              { s: 'I want to hug my friend.', t: 'Quiero abrazar a mi amigo.' },
            ],
          },
          {
            id: 'w6', text: 'a baby', emoji: '👶', keyword: 'baby',
            definition: 'Niño o niña recién nacido o muy pequeño.',
            definitionEn: 'A very young child, newly born or in its first year.',
            etymology: 'Apareció en inglés hacia el año 1300, posiblemente del habla infantil "ba-ba".',
            etymologyEn: 'Appeared around 1300, likely from baby talk — "ba-ba" sounds are among the first any human infant makes.',
            examples: [
              { s: 'I can hug a baby.', t: 'Puedo abrazar a un bebé.' },
              { s: 'I want to see a baby.', t: 'Quiero ver a un bebé.' },
            ],
          },
        ],
      },
      {
        level: 8,
        name: 'The Market',
        oliversIntro: {
          headline: 'Nivel 8 · The Market 🛒',
          message: 'El mercado es donde el vocabulario cobra vida real. Muchas palabras de comida viajaron por rutas comerciales antiguas — del vikingo "cake" al normando "carry".',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Producto\n\n"I need to" + "buy" + "some eggs"\n= I need to buy some eggs',
          funFact: '💡 "Cake" viene del nórdico antiguo "kaka" — los vikingos también nos dieron esta palabra dulce.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'buy', emoji: '🛒', anim: 'spin',
            definition: 'Adquirir algo a cambio de dinero.',
            definitionEn: 'To get something in exchange for money.',
            etymology: 'Del anglosajón "bycgan".',
            etymologyEn: 'From Old English "bycgan".',
            examples: [
              { s: 'I need to buy some eggs.', t: 'Necesito comprar huevos.' },
              { s: 'I want to buy a cake.', t: 'Quiero comprar un pastel.' },
            ],
          },
          {
            id: 'v2', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find some grapes.', t: 'Quiero encontrar uvas.' },
              { s: 'Can you find a carrot?', t: '¿Puedes encontrar una zanahoria?' },
            ],
          },
          {
            id: 'v3', text: 'carry', emoji: '💪', anim: 'lift',
            definition: 'Transportar algo de un lugar a otro.',
            definitionEn: 'To hold and transport something.',
            etymology: 'Del francés normando "carier".',
            etymologyEn: 'From Norman French "carier", from "car" (vehicle).',
            examples: [
              { s: 'I need to carry some meat.', t: 'Necesito llevar carne.' },
              { s: 'I can carry a pear.', t: 'Puedo llevar una pera.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a cake', emoji: '🎂', keyword: 'cake',
            definition: 'Postre horneado, dulce, hecho de harina, azúcar y huevos.',
            definitionEn: 'A sweet baked dessert made of flour, sugar, and eggs.',
            etymology: 'Del nórdico antiguo "kaka", relacionado con el alemán "Kuchen".',
            etymologyEn: 'From Old Norse "kaka", related to German "Kuchen" — brought to English by Viking settlers.',
            examples: [
              { s: 'I want to buy a cake.', t: 'Quiero comprar un pastel.' },
              { s: 'I need to find a cake.', t: 'Necesito encontrar un pastel.' },
            ],
          },
          {
            id: 'w2', text: 'some meat', emoji: '🥩', keyword: 'meat',
            definition: 'Carne de animal usada como alimento.',
            definitionEn: 'Animal flesh used as food.',
            etymology: 'Del anglosajón "mete", que originalmente significaba cualquier alimento sólido.',
            etymologyEn: 'From Old English "mete" — originally meant any solid food at all, not just animal flesh.',
            examples: [
              { s: 'I need to carry some meat.', t: 'Necesito llevar carne.' },
              { s: 'I want to buy some meat.', t: 'Quiero comprar carne.' },
            ],
          },
          {
            id: 'w3', text: 'some grapes', emoji: '🍇', keyword: 'grapes',
            definition: 'Frutas pequeñas y redondas que crecen en racimos en la vid.',
            definitionEn: 'Small round fruits that grow in clusters on a vine.',
            etymology: 'Del francés antiguo "grape" (racimo), de "graper" (recoger con un gancho).',
            etymologyEn: 'From Old French "grape" (a bunch), from "graper" (to pick with a hook) — related to "grapple" and "grasp".',
            examples: [
              { s: 'I want to find some grapes.', t: 'Quiero encontrar uvas.' },
              { s: 'I need to buy some grapes.', t: 'Necesito comprar uvas.' },
            ],
          },
          {
            id: 'w4', text: 'a carrot', emoji: '🥕', keyword: 'carrot',
            definition: 'Raíz comestible de color naranja, dulce y crujiente.',
            definitionEn: 'An orange, sweet, crunchy edible root.',
            etymology: 'Del francés medio "carotte", del latín "carota", del griego "karōton".',
            etymologyEn: 'From Middle French "carotte", from Latin "carota", from Greek "karōton".',
            examples: [
              { s: 'I want to find a carrot.', t: 'Quiero encontrar una zanahoria.' },
              { s: 'I need to buy a carrot.', t: 'Necesito comprar una zanahoria.' },
            ],
          },
          {
            id: 'w5', text: 'some butter', emoji: '🧈', keyword: 'butter',
            definition: 'Grasa sólida y amarilla obtenida de la leche.',
            definitionEn: 'A solid, yellow fat made from milk.',
            etymology: 'Del latín "butyrum", del griego "boutyron" — "bous" (vaca) + "tyros" (queso).',
            etymologyEn: 'From Latin "butyrum", from Greek "boutyron" — literally "cow cheese" (bous + tyros).',
            examples: [
              { s: 'I need to buy some butter.', t: 'Necesito comprar mantequilla.' },
              { s: 'I want to find some butter.', t: 'Quiero encontrar mantequilla.' },
            ],
          },
          {
            id: 'w6', text: 'a pear', emoji: '🍐', keyword: 'pear',
            definition: 'Fruta de forma alargada, dulce y jugosa.',
            definitionEn: 'A sweet, juicy fruit with an elongated shape.',
            etymology: 'Del anglosajón "peru", del latín "pira" (plural de "pirum").',
            etymologyEn: 'From Old English "peru", from Latin "pira". The pear tree was among the first cultivated by humans.',
            examples: [
              { s: 'I can carry a pear.', t: 'Puedo llevar una pera.' },
              { s: 'I want to buy a pear.', t: 'Quiero comprar una pera.' },
            ],
          },
        ],
      },
      {
        level: 9,
        name: 'At School',
        oliversIntro: {
          headline: 'Nivel 9 · At School 📚',
          message: 'El vocabulario escolar abre las puertas del aprendizaje mismo. "Read" originalmente significaba "interpretar señales" — leer siempre ha sido un acto de descifrar el mundo.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Objeto escolar\n\n"I want to" + "read" + "a book"\n= I want to read a book',
          funFact: '💡 "Letter" viene del latín "littera" — la misma raíz de "literature" y "literacy" (alfabetización).',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'read', emoji: '📖', anim: 'flash',
            definition: 'Interpretar el significado de un texto escrito.',
            definitionEn: 'To interpret the meaning of written text.',
            etymology: 'Del anglosajón "rædan", que originalmente significaba "interpretar señales".',
            etymologyEn: 'From Old English "rædan" — originally "to advise, to interpret signs".',
            examples: [
              { s: 'I want to read a book.', t: 'Quiero leer un libro.' },
              { s: 'I like to read a letter.', t: 'Me gusta leer una carta.' },
            ],
          },
          {
            id: 'v2', text: 'write', emoji: '✏️', anim: 'wander',
            definition: 'Formar letras o palabras sobre una superficie.',
            definitionEn: 'To form letters or words on a surface.',
            etymology: 'Del anglosajón "wrītan", que originalmente significaba "rasgar" o "tallar".',
            etymologyEn: 'From Old English "wrītan" — originally meant "to scratch" or "to carve".',
            examples: [
              { s: 'I want to write a word.', t: 'Quiero escribir una palabra.' },
              { s: 'I need to write a sentence.', t: 'Necesito escribir una oración.' },
            ],
          },
          {
            id: 'v3', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I need to find a pen.', t: 'Necesito encontrar un bolígrafo.' },
              { s: 'Can you find a number?', t: '¿Puedes encontrar un número?' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a notebook', emoji: '📓', keyword: 'notebook',
            definition: 'Cuaderno de hojas en blanco o rayadas para escribir.',
            definitionEn: 'A book of blank or lined pages for writing.',
            etymology: 'Compuesto de "note" (del latín "nota", marca) + "book".',
            etymologyEn: 'A compound of "note" (from Latin "nota", a mark) and "book".',
            examples: [
              { s: 'I want to find a notebook.', t: 'Quiero encontrar un cuaderno.' },
              { s: 'I need to write in a notebook.', t: 'Necesito escribir en un cuaderno.' },
            ],
          },
          {
            id: 'w2', text: 'a pen', emoji: '🖊️', keyword: 'pen',
            definition: 'Instrumento de tinta para escribir.',
            definitionEn: 'An ink instrument for writing.',
            etymology: 'Del francés antiguo "penne" (pluma), del latín "penna" (pluma de ave).',
            etymologyEn: 'From Old French "penne" (feather), from Latin "penna" — a pen was originally a quill.',
            examples: [
              { s: 'I need to find a pen.', t: 'Necesito encontrar un bolígrafo.' },
              { s: 'I want to use a pen.', t: 'Quiero usar un bolígrafo.' },
            ],
          },
          {
            id: 'w3', text: 'a word', emoji: '💬', keyword: 'word',
            definition: 'Unidad mínima de significado en un idioma.',
            definitionEn: 'A minimal unit of meaning in a language.',
            etymology: 'Del anglosajón "word", del indo-europeo "werdʰo-" (lo que se habla).',
            etymologyEn: 'From Old English "word", PIE "werdʰo-" (that which is spoken).',
            examples: [
              { s: 'I want to write a word.', t: 'Quiero escribir una palabra.' },
              { s: 'I need to read a word.', t: 'Necesito leer una palabra.' },
            ],
          },
          {
            id: 'w4', text: 'a number', emoji: '🔢', keyword: 'number',
            definition: 'Símbolo o palabra que representa una cantidad.',
            definitionEn: 'A symbol or word that represents a quantity.',
            etymology: 'Del francés antiguo "nombre", del latín "numerus".',
            etymologyEn: 'From Old French "nombre", from Latin "numerus" — root of "numerical" and "enumerate".',
            examples: [
              { s: 'I want to write a number.', t: 'Quiero escribir un número.' },
              { s: 'I need to find a number.', t: 'Necesito encontrar un número.' },
            ],
          },
          {
            id: 'w5', text: 'a sentence', emoji: '📝', keyword: 'sentence',
            definition: 'Conjunto de palabras que expresa una idea completa.',
            definitionEn: 'A group of words that expresses a complete thought.',
            etymology: 'Del latín "sententia" (opinión, juicio), de "sentire" (sentir, juzgar).',
            etymologyEn: 'From Latin "sententia" (opinion, judgment), from "sentire" (to feel, to judge) — same root as "sense" and "sentiment".',
            examples: [
              { s: 'I want to write a sentence.', t: 'Quiero escribir una oración.' },
              { s: 'I need to read a sentence.', t: 'Necesito leer una oración.' },
            ],
          },
          {
            id: 'w6', text: 'a letter', emoji: '✉️', keyword: 'letter',
            definition: 'Signo del alfabeto, o mensaje escrito enviado a alguien.',
            definitionEn: 'A symbol of the alphabet, or a written message sent to someone.',
            etymology: 'Del francés antiguo "lettre", del latín "littera".',
            etymologyEn: 'From Old French "lettre", from Latin "littera" — root of "literature" and "literacy".',
            examples: [
              { s: 'I like to read a letter.', t: 'Me gusta leer una carta.' },
              { s: 'I want to write a letter.', t: 'Quiero escribir una carta.' },
            ],
          },
        ],
      },
      {
        level: 10,
        name: 'Colors',
        oliversIntro: {
          headline: 'Nivel 10 · Colors 🎨',
          message: 'Los colores combinan con cualquier objeto — son el adjetivo perfecto para empezar a describir el mundo. ¡Llegaste a la mitad del Stage 1!',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Color + Objeto\n\n"I can" + "see" + "a red apple"\n= I can see a red apple',
          funFact: '💡 Muchos idiomas antiguos no tenían una palabra separada para "azul" — describían el cielo y el mar con la misma palabra que el verde o el negro.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I can' },
          { id: 'b3', text: 'I like to' },
        ],
        verbs: [
          {
            id: 'v1', text: 'see', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos.',
            definitionEn: 'To perceive with the eyes.',
            etymology: 'Del anglosajón "sēon".',
            etymologyEn: 'From Old English "sēon".',
            examples: [
              { s: 'I can see a red apple.', t: 'Puedo ver una manzana roja.' },
              { s: 'I want to see a blue bag.', t: 'Quiero ver una bolsa azul.' },
            ],
          },
          {
            id: 'v2', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find a green tree.', t: 'Quiero encontrar un árbol verde.' },
              { s: 'Can you find a white bird?', t: '¿Puedes encontrar un pájaro blanco?' },
            ],
          },
          {
            id: 'v3', text: 'carry', emoji: '💪', anim: 'lift',
            definition: 'Transportar algo de un lugar a otro.',
            definitionEn: 'To hold and transport something.',
            etymology: 'Del francés normando "carier".',
            etymologyEn: 'From Norman French "carier".',
            examples: [
              { s: 'I can carry a yellow flower.', t: 'Puedo llevar una flor amarilla.' },
              { s: 'I want to carry a black cat.', t: 'Quiero llevar un gato negro.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a red apple', emoji: '🍎', keyword: 'red',
            definition: 'Color como el de la sangre o el fuego.',
            definitionEn: 'The color of blood or fire.',
            etymology: 'Del anglosajón "rēad", del indo-europeo "h₁rewdʰ-".',
            etymologyEn: 'From Old English "rēad", PIE "h₁rewdʰ-" — related to Latin "ruber" (giving "ruby").',
            examples: [
              { s: 'I can see a red apple.', t: 'Puedo ver una manzana roja.' },
              { s: 'I want to find a red apple.', t: 'Quiero encontrar una manzana roja.' },
            ],
          },
          {
            id: 'w2', text: 'a blue bag', emoji: '🎒', keyword: 'blue',
            definition: 'Color como el del cielo despejado.',
            definitionEn: 'The color of a clear sky.',
            etymology: 'Del francés antiguo "bleu", del fráncico "blao".',
            etymologyEn: 'From Old French "bleu", from Frankish "blao". Many ancient languages had no separate word for blue at all.',
            oliversTip: 'Homero, en la antigua Grecia, nunca describió el mar como "azul" — usaba "color de vino". ¡El azul es uno de los colores "más nuevos" en el lenguaje humano! 🌊',
            examples: [
              { s: 'I want to see a blue bag.', t: 'Quiero ver una bolsa azul.' },
              { s: 'I can carry a blue bag.', t: 'Puedo llevar una bolsa azul.' },
            ],
          },
          {
            id: 'w3', text: 'a green tree', emoji: '🌳', keyword: 'green',
            definition: 'Color como el de las hojas y la hierba.',
            definitionEn: 'The color of leaves and grass.',
            etymology: 'Del anglosajón "grēne", de la misma raíz que "grow" (crecer).',
            etymologyEn: 'From Old English "grēne", from the same root as "grow" and "grass".',
            examples: [
              { s: 'I want to find a green tree.', t: 'Quiero encontrar un árbol verde.' },
              { s: 'I can see a green tree.', t: 'Puedo ver un árbol verde.' },
            ],
          },
          {
            id: 'w4', text: 'a white bird', emoji: '🕊️', keyword: 'white',
            definition: 'Color como el de la nieve, ausencia de otros colores.',
            definitionEn: 'The color of snow, the absence of other colors.',
            etymology: 'Del anglosajón "hwīt", del indo-europeo "kweyt-" (brillar).',
            etymologyEn: 'From Old English "hwīt", PIE "kweyt-" (to shine, be bright).',
            examples: [
              { s: 'I want to find a white bird.', t: 'Quiero encontrar un pájaro blanco.' },
              { s: 'I can see a white bird.', t: 'Puedo ver un pájaro blanco.' },
            ],
          },
          {
            id: 'w5', text: 'a black cat', emoji: '🐈‍⬛', keyword: 'black',
            definition: 'Color más oscuro, ausencia total de luz.',
            definitionEn: 'The darkest color, the total absence of light.',
            etymology: 'Del anglosajón "blæc" (oscuro), posiblemente relacionado con "bleach" (blanquear).',
            etymologyEn: 'From Old English "blæc" (dark) — surprisingly, possibly related to "bleach" through a root meaning "to burn, to shine".',
            examples: [
              { s: 'I want to carry a black cat.', t: 'Quiero llevar un gato negro.' },
              { s: 'I can see a black cat.', t: 'Puedo ver un gato negro.' },
            ],
          },
          {
            id: 'w6', text: 'a yellow flower', emoji: '🌻', keyword: 'yellow',
            definition: 'Color como el del sol o el limón.',
            definitionEn: 'The color of the sun or a lemon.',
            etymology: 'Del anglosajón "geolu", del indo-europeo "ghel-" (brillar, dorado).',
            etymologyEn: 'From Old English "geolu", PIE "ghel-" (to shine, golden-colored).',
            examples: [
              { s: 'I can carry a yellow flower.', t: 'Puedo llevar una flor amarilla.' },
              { s: 'I want to find a yellow flower.', t: 'Quiero encontrar una flor amarilla.' },
            ],
          },
        ],
      },
      {
        level: 11,
        name: 'Clothes',
        oliversIntro: {
          headline: 'Nivel 11 · Clothes 👕',
          message: 'La ropa es vocabulario diario inevitable. "Pants" tiene un origen sorprendente: viene de un personaje de teatro italiano que siempre usaba pantalones largos y holgados.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Prenda\n\n"I need to" + "buy" + "a shirt"\n= I need to buy a shirt',
          funFact: '💡 "Pants" viene de "Pantalone", un personaje de la commedia dell\'arte italiana. ¡Su nombre se convirtió en la prenda!',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'buy', emoji: '🛒', anim: 'spin',
            definition: 'Adquirir algo a cambio de dinero.',
            definitionEn: 'To get something in exchange for money.',
            etymology: 'Del anglosajón "bycgan".',
            etymologyEn: 'From Old English "bycgan".',
            examples: [
              { s: 'I need to buy a shirt.', t: 'Necesito comprar una camisa.' },
              { s: 'I want to buy a hat.', t: 'Quiero comprar un sombrero.' },
            ],
          },
          {
            id: 'v2', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find some shoes.', t: 'Quiero encontrar zapatos.' },
              { s: 'Can you find a coat?', t: '¿Puedes encontrar un abrigo?' },
            ],
          },
          {
            id: 'v3', text: 'wear', emoji: '👔', anim: 'glow',
            definition: 'Llevar puesta una prenda de vestir.',
            definitionEn: 'To have clothing on your body.',
            etymology: 'Del anglosajón "werian" (vestir), relacionado con el latín "vestis".',
            etymologyEn: 'From Old English "werian" (to clothe), related to Latin "vestis" — giving "vest" and "invest" (literally "to clothe with authority").',
            examples: [
              { s: 'I want to wear a dress.', t: 'Quiero usar un vestido.' },
              { s: 'I can wear some pants.', t: 'Puedo usar pantalones.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a shirt', emoji: '👕', keyword: 'shirt',
            definition: 'Prenda superior con mangas y botones.',
            definitionEn: 'A garment for the upper body, usually with sleeves and buttons.',
            etymology: 'Del anglosajón "scyrte" (prenda corta), relacionado con "short".',
            etymologyEn: 'From Old English "scyrte" (a short garment), related to "short".',
            examples: [
              { s: 'I need to buy a shirt.', t: 'Necesito comprar una camisa.' },
              { s: 'I want to wear a shirt.', t: 'Quiero usar una camisa.' },
            ],
          },
          {
            id: 'w2', text: 'some shoes', emoji: '👟', keyword: 'shoes',
            definition: 'Calzado que cubre y protege el pie.',
            definitionEn: 'Footwear that covers and protects the foot.',
            etymology: 'Del anglosajón "scōh", relacionado con el alemán "Schuh".',
            etymologyEn: 'From Old English "scōh", related to German "Schuh" and Dutch "schoen".',
            examples: [
              { s: 'I want to find some shoes.', t: 'Quiero encontrar zapatos.' },
              { s: 'I can wear some shoes.', t: 'Puedo usar zapatos.' },
            ],
          },
          {
            id: 'w3', text: 'a hat', emoji: '🎩', keyword: 'hat',
            definition: 'Prenda que cubre la cabeza.',
            definitionEn: 'A covering for the head.',
            etymology: 'Del anglosajón "hæt", posiblemente relacionado con "hood".',
            etymologyEn: 'From Old English "hæt", possibly related to "hood".',
            examples: [
              { s: 'I want to buy a hat.', t: 'Quiero comprar un sombrero.' },
              { s: 'I can wear a hat.', t: 'Puedo usar un sombrero.' },
            ],
          },
          {
            id: 'w4', text: 'a coat', emoji: '🧥', keyword: 'coat',
            definition: 'Prenda larga que se usa sobre la ropa para abrigarse.',
            definitionEn: 'A long outer garment worn over other clothes for warmth.',
            etymology: 'Del francés antiguo "cote", del fráncico "kotta" (tela de lana basta).',
            etymologyEn: 'From Old French "cote", from Frankish "kotta" — a coat was originally just a piece of cloth, not a tailored garment.',
            examples: [
              { s: 'I want to find a coat.', t: 'Quiero encontrar un abrigo.' },
              { s: 'I can wear a coat.', t: 'Puedo usar un abrigo.' },
            ],
          },
          {
            id: 'w5', text: 'a dress', emoji: '👗', keyword: 'dress',
            definition: 'Prenda de una sola pieza que cubre el cuerpo y las piernas.',
            definitionEn: 'A one-piece garment covering the body and legs.',
            etymology: 'Del francés antiguo "dresser" (enderezar, preparar), del latín "directiare".',
            etymologyEn: 'From Old French "dresser" (to arrange, set upright), from Latin "directiare" — to dress originally meant "to arrange yourself".',
            examples: [
              { s: 'I want to wear a dress.', t: 'Quiero usar un vestido.' },
              { s: 'I need to buy a dress.', t: 'Necesito comprar un vestido.' },
            ],
          },
          {
            id: 'w6', text: 'some pants', emoji: '👖', keyword: 'pants',
            definition: 'Prenda que cubre cada pierna por separado, desde la cintura.',
            definitionEn: 'A garment covering each leg separately, from the waist down.',
            etymology: 'Corto de "pantaloons", del italiano "Pantalone", un personaje de teatro.',
            etymologyEn: 'Short for "pantaloons", from Italian "Pantalone" — a commedia dell\'arte character who always wore long, baggy trousers.',
            oliversTip: '¡Un personaje cómico de teatro italiano le dio su nombre a la prenda que usas todos los días! 🎭',
            examples: [
              { s: 'I can wear some pants.', t: 'Puedo usar pantalones.' },
              { s: 'I want to find some pants.', t: 'Quiero encontrar pantalones.' },
            ],
          },
        ],
      },
      {
        level: 12,
        name: 'The Street',
        oliversIntro: {
          headline: 'Nivel 12 · The Street 🚗',
          message: 'Sales a la calle y el inglés está en todas partes. "Bus" es en realidad una palabra latina abreviada que significa "para todos".',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Lugar/Vehículo\n\n"I can" + "see" + "a car"\n= I can see a car',
          funFact: '💡 "Bus" viene de "omnibus", latín para "para todos" — los primeros autobuses eran carruajes tirados por caballos en el París de 1820.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I can' },
          { id: 'b3', text: 'I need to' },
        ],
        verbs: [
          {
            id: 'v1', text: 'see', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos.',
            definitionEn: 'To perceive with the eyes.',
            etymology: 'Del anglosajón "sēon".',
            etymologyEn: 'From Old English "sēon".',
            examples: [
              { s: 'I can see a car.', t: 'Puedo ver un auto.' },
              { s: 'I want to see a bus.', t: 'Quiero ver un autobús.' },
            ],
          },
          {
            id: 'v2', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find a bike.', t: 'Quiero encontrar una bicicleta.' },
              { s: 'Can you find the road?', t: '¿Puedes encontrar el camino?' },
            ],
          },
          {
            id: 'v3', text: 'visit', emoji: '🗺️', anim: 'wander',
            definition: 'Ir a un lugar para verlo o estar en él un tiempo.',
            definitionEn: 'To go to a place to see it or spend time there.',
            etymology: 'Del latín "visitare", de "visere" (mirar con atención), de "videre" (ver).',
            etymologyEn: 'From Latin "visitare", from "videre" (to see) — same root as "vision" and "visible".',
            examples: [
              { s: 'I want to visit a park.', t: 'Quiero visitar un parque.' },
              { s: 'I need to visit a store.', t: 'Necesito visitar una tienda.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a car', emoji: '🚗', keyword: 'car',
            definition: 'Vehículo con motor para transportar personas.',
            definitionEn: 'A motor vehicle for transporting people.',
            etymology: 'Del latín "carrus" (carro de dos ruedas usado por los galos).',
            etymologyEn: 'From Latin "carrus" — a two-wheeled cart used by the Gauls. Root of "carry" and "carriage".',
            examples: [
              { s: 'I can see a car.', t: 'Puedo ver un auto.' },
              { s: 'I want to find a car.', t: 'Quiero encontrar un auto.' },
            ],
          },
          {
            id: 'w2', text: 'a bus', emoji: '🚌', keyword: 'bus',
            definition: 'Vehículo grande para transportar a muchos pasajeros.',
            definitionEn: 'A large vehicle for transporting many passengers.',
            etymology: 'Abreviación de "omnibus", latín para "para todos".',
            etymologyEn: 'Short for "omnibus" (Latin: "for all") — early buses were horse-drawn carriages for everyone, introduced in Paris in the 1820s.',
            examples: [
              { s: 'I want to see a bus.', t: 'Quiero ver un autobús.' },
              { s: 'I can find a bus.', t: 'Puedo encontrar un autobús.' },
            ],
          },
          {
            id: 'w3', text: 'a bike', emoji: '🚲', keyword: 'bike',
            definition: 'Vehículo de dos ruedas que se mueve pedaleando.',
            definitionEn: 'A two-wheeled vehicle moved by pedaling.',
            etymology: 'Corto de "bicycle", del francés "bicyclette" — "bi" (dos) + griego "kyklos" (rueda).',
            etymologyEn: 'Short for "bicycle", from French "bicyclette" — "bi" (two) + Greek "kyklos" (wheel), same root as "cycle" and "encyclopedia".',
            examples: [
              { s: 'I want to find a bike.', t: 'Quiero encontrar una bicicleta.' },
              { s: 'I can see a bike.', t: 'Puedo ver una bicicleta.' },
            ],
          },
          {
            id: 'w4', text: 'a road', emoji: '🛤️', keyword: 'road',
            definition: 'Camino preparado para que circulen vehículos.',
            definitionEn: 'A way prepared for vehicles to travel on.',
            etymology: 'Del anglosajón "rād" (cabalgata, viaje a caballo), de "rīdan" (cabalgar).',
            etymologyEn: 'From Old English "rād" (a ride, a journey on horseback), from "rīdan" (to ride) — related to "raid".',
            examples: [
              { s: 'I want to find the road.', t: 'Quiero encontrar el camino.' },
              { s: 'I can see the road.', t: 'Puedo ver el camino.' },
            ],
          },
          {
            id: 'w5', text: 'a park', emoji: '🌳', keyword: 'park',
            definition: 'Espacio público con árboles y áreas verdes para pasear.',
            definitionEn: 'A public green space with trees, used for recreation.',
            etymology: 'Del francés antiguo "parc" (terreno cercado para animales de caza).',
            etymologyEn: 'From Old French "parc" (an enclosed game preserve) — originally a fenced area for royal hunting, later a public green space.',
            examples: [
              { s: 'I want to visit a park.', t: 'Quiero visitar un parque.' },
              { s: 'I can see a park.', t: 'Puedo ver un parque.' },
            ],
          },
          {
            id: 'w6', text: 'a store', emoji: '🏪', keyword: 'store',
            definition: 'Establecimiento donde se venden productos.',
            definitionEn: 'An establishment where goods are sold.',
            etymology: 'Del francés antiguo "estorer" (construir, abastecer), del latín "instaurare" (renovar).',
            etymologyEn: 'From Old French "estorer" (to build, to furnish), from Latin "instaurare" (to renew) — related to "restore".',
            examples: [
              { s: 'I need to visit a store.', t: 'Necesito visitar una tienda.' },
              { s: 'I want to find a store.', t: 'Quiero encontrar una tienda.' },
            ],
          },
        ],
      },
      {
        level: 13,
        name: 'Weather',
        oliversIntro: {
          headline: 'Nivel 13 · Weather ☀️',
          message: 'El clima es el tema de conversación más universal del planeta. La palabra "cloud" tiene una de las historias más extrañas del inglés: ¡originalmente significaba "roca"!',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Clima\n\n"I like to" + "feel" + "the sun"\n= I like to feel the sun',
          funFact: '💡 "Cloud" viene del anglosajón "clūd", que significaba "masa de roca". Las nubes parecían colinas flotantes en el cielo.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I can' },
          { id: 'b3', text: 'I like to' },
        ],
        verbs: [
          {
            id: 'v1', text: 'see', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos.',
            definitionEn: 'To perceive with the eyes.',
            etymology: 'Del anglosajón "sēon".',
            etymologyEn: 'From Old English "sēon".',
            examples: [
              { s: 'I can see the sun.', t: 'Puedo ver el sol.' },
              { s: 'I want to see a rainbow.', t: 'Quiero ver un arcoíris.' },
            ],
          },
          {
            id: 'v2', text: 'feel', emoji: '🌡️', anim: 'pulse',
            definition: 'Percibir algo a través del tacto o la sensación física.',
            definitionEn: 'To perceive something through touch or physical sensation.',
            etymology: 'Del anglosajón "fēlan", relacionado con el alemán "fühlen".',
            etymologyEn: 'From Old English "fēlan", related to German "fühlen".',
            examples: [
              { s: 'I like to feel the sun.', t: 'Me gusta sentir el sol.' },
              { s: 'I can feel the wind.', t: 'Puedo sentir el viento.' },
            ],
          },
          {
            id: 'v3', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find some snow.', t: 'Quiero encontrar nieve.' },
              { s: 'Can you find a cloud?', t: '¿Puedes encontrar una nube?' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'the sun', emoji: '☀️', keyword: 'sun',
            definition: 'Estrella que da luz y calor a la Tierra.',
            definitionEn: 'The star that gives light and heat to the Earth.',
            etymology: 'Del anglosajón "sunne", relacionado con el latín "sol" (de donde viene "solar").',
            etymologyEn: 'From Old English "sunne", related to Latin "sol" — giving "solar" and "solstice".',
            examples: [
              { s: 'I like to feel the sun.', t: 'Me gusta sentir el sol.' },
              { s: 'I can see the sun.', t: 'Puedo ver el sol.' },
            ],
          },
          {
            id: 'w2', text: 'some rain', emoji: '🌧️', keyword: 'rain',
            definition: 'Agua que cae de las nubes en forma de gotas.',
            definitionEn: 'Water that falls from clouds in the form of drops.',
            etymology: 'Del anglosajón "regn", relacionado con el alemán "Regen".',
            etymologyEn: 'From Old English "regn", related to German "Regen".',
            examples: [
              { s: 'I can feel some rain.', t: 'Puedo sentir la lluvia.' },
              { s: 'I want to see some rain.', t: 'Quiero ver la lluvia.' },
            ],
          },
          {
            id: 'w3', text: 'the wind', emoji: '💨', keyword: 'wind',
            definition: 'Corriente de aire que se mueve sobre la superficie terrestre.',
            definitionEn: 'A current of air moving across the Earth\'s surface.',
            etymology: 'Del anglosajón "wind", del indo-europeo "h₂weh₁-" (soplar).',
            etymologyEn: 'From Old English "wind", PIE "h₂weh₁-" (to blow) — same root as Latin "ventus" (giving "ventilation").',
            examples: [
              { s: 'I can feel the wind.', t: 'Puedo sentir el viento.' },
              { s: 'I want to feel the wind.', t: 'Quiero sentir el viento.' },
            ],
          },
          {
            id: 'w4', text: 'a cloud', emoji: '☁️', keyword: 'cloud',
            definition: 'Masa visible de gotas de agua suspendida en el cielo.',
            definitionEn: 'A visible mass of water droplets suspended in the sky.',
            etymology: 'Del anglosajón "clūd", que originalmente significaba "masa de roca" o "colina".',
            etymologyEn: 'From Old English "clūd" — originally meant "a mass of rock" or "hill". Clouds looked like floating rocky hills.',
            oliversTip: '¡"Cloud" significaba "roca" en inglés antiguo! Las nubes se nombraron por parecer colinas flotantes en el cielo. ☁️',
            examples: [
              { s: 'I want to find a cloud.', t: 'Quiero encontrar una nube.' },
              { s: 'I can see a cloud.', t: 'Puedo ver una nube.' },
            ],
          },
          {
            id: 'w5', text: 'some snow', emoji: '❄️', keyword: 'snow',
            definition: 'Agua congelada que cae del cielo en copos blancos.',
            definitionEn: 'Frozen water that falls from the sky in white flakes.',
            etymology: 'Del anglosajón "snāw", relacionado con el latín "nix/nivis".',
            etymologyEn: 'From Old English "snāw", related to Latin "nix/nivis" — giving "niveous".',
            examples: [
              { s: 'I want to find some snow.', t: 'Quiero encontrar nieve.' },
              { s: 'I can see some snow.', t: 'Puedo ver nieve.' },
            ],
          },
          {
            id: 'w6', text: 'a rainbow', emoji: '🌈', keyword: 'rainbow',
            definition: 'Arco de colores que aparece en el cielo tras la lluvia.',
            definitionEn: 'An arc of colors that appears in the sky after rain.',
            etymology: 'Del anglosajón "regnboga": "regn" (lluvia) + "boga" (arco).',
            etymologyEn: 'From Old English "regnboga" — literally "rain + bow" (arch), describing exactly what it looks like.',
            examples: [
              { s: 'I want to see a rainbow.', t: 'Quiero ver un arcoíris.' },
              { s: 'I can find a rainbow.', t: 'Puedo encontrar un arcoíris.' },
            ],
          },
        ],
      },
      {
        level: 14,
        name: 'The Kitchen',
        oliversIntro: {
          headline: 'Nivel 14 · The Kitchen 🍽️',
          message: 'En la Europa medieval, el tenedor se consideraba un objeto escandaloso y decadente — ¡la gente comía con las manos y un cuchillo!',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Objeto\n\n"I need to" + "clean" + "a plate"\n= I need to clean a plate',
          funFact: '💡 "Sofa" viene del árabe "ṣuffah" — una plataforma con cojines en los hogares árabes medievales.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'clean', emoji: '🧹', anim: 'spin',
            definition: 'Quitar la suciedad de algo.',
            definitionEn: 'To remove dirt from something.',
            etymology: 'Del anglosajón "clæne" (puro, brillante).',
            etymologyEn: 'From Old English "clæne" (pure, bright).',
            examples: [
              { s: 'I need to clean a plate.', t: 'Necesito limpiar un plato.' },
              { s: 'I want to clean a fork.', t: 'Quiero limpiar un tenedor.' },
            ],
          },
          {
            id: 'v2', text: 'move', emoji: '📦', anim: 'lift',
            definition: 'Cambiar algo de lugar o posición.',
            definitionEn: 'To change the place or position of something.',
            etymology: 'Del francés antiguo "mover", del latín "movere".',
            etymologyEn: 'From Old French "mover", from Latin "movere" — root of "motor" and "emotion".',
            examples: [
              { s: 'I need to move a sofa.', t: 'Necesito mover un sofá.' },
              { s: 'I want to move a clock.', t: 'Quiero mover un reloj.' },
            ],
          },
          {
            id: 'v3', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find a pot.', t: 'Quiero encontrar una olla.' },
              { s: 'Can you find a vase?', t: '¿Puedes encontrar un jarrón?' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a sofa', emoji: '🛋️', keyword: 'sofa',
            definition: 'Asiento mullido y largo para varias personas.',
            definitionEn: 'A long, cushioned seat for several people.',
            etymology: 'Del árabe "ṣuffah" (plataforma con cojines), vía el turco "sofa".',
            etymologyEn: 'From Arabic "ṣuffah" (a cushioned platform), via Ottoman Turkish "sofa".',
            examples: [
              { s: 'I need to move a sofa.', t: 'Necesito mover un sofá.' },
              { s: 'I want to find a sofa.', t: 'Quiero encontrar un sofá.' },
            ],
          },
          {
            id: 'w2', text: 'a clock', emoji: '🕐', keyword: 'clock',
            definition: 'Instrumento que mide y muestra la hora.',
            definitionEn: 'An instrument that measures and shows the time.',
            etymology: 'Del latín medieval "clocca" (campana). Los primeros relojes solo tocaban campanas, sin manecillas.',
            etymologyEn: 'From Medieval Latin "clocca" (bell) — early clocks only rang bells, with no hands at all.',
            examples: [
              { s: 'I want to move a clock.', t: 'Quiero mover un reloj.' },
              { s: 'I need to clean a clock.', t: 'Necesito limpiar un reloj.' },
            ],
          },
          {
            id: 'w3', text: 'a plate', emoji: '🍽️', keyword: 'plate',
            definition: 'Recipiente plano donde se sirve la comida.',
            definitionEn: 'A flat dish on which food is served.',
            etymology: 'Del francés antiguo "plate" (plano), del griego "platys" (ancho).',
            etymologyEn: 'From Old French "plate" (flat), from Greek "platys" (broad) — root of "plateau" and "platinum".',
            examples: [
              { s: 'I need to clean a plate.', t: 'Necesito limpiar un plato.' },
              { s: 'I want to find a plate.', t: 'Quiero encontrar un plato.' },
            ],
          },
          {
            id: 'w4', text: 'a fork', emoji: '🍴', keyword: 'fork',
            definition: 'Utensilio con dientes para pinchar y comer alimentos.',
            definitionEn: 'A utensil with prongs used to pick up and eat food.',
            etymology: 'Del anglosajón "forca", del latín "furca" (horca de dos puntas).',
            etymologyEn: 'From Old English "forca", from Latin "furca" — table forks were considered scandalous in medieval Europe.',
            oliversTip: 'En la Edad Media, usar un tenedor en la mesa se consideraba decadente y poco varonil — ¡la gente comía con las manos! 🍴',
            examples: [
              { s: 'I want to clean a fork.', t: 'Quiero limpiar un tenedor.' },
              { s: 'I need to find a fork.', t: 'Necesito encontrar un tenedor.' },
            ],
          },
          {
            id: 'w5', text: 'a pot', emoji: '🫕', keyword: 'pot',
            definition: 'Recipiente hondo para cocinar alimentos.',
            definitionEn: 'A deep container used for cooking food.',
            etymology: 'Del anglosajón "pott", relacionado con el holandés "pot".',
            etymologyEn: 'From Old English "pott", related to Dutch "pot" and German "Pott".',
            examples: [
              { s: 'I want to find a pot.', t: 'Quiero encontrar una olla.' },
              { s: 'I need to clean a pot.', t: 'Necesito limpiar una olla.' },
            ],
          },
          {
            id: 'w6', text: 'a vase', emoji: '🏺', keyword: 'vase',
            definition: 'Recipiente decorativo, a menudo usado para flores.',
            definitionEn: 'A decorative container, often used for flowers.',
            etymology: 'Del francés "vase", del latín "vas" (vasija, recipiente).',
            etymologyEn: 'From French "vase", from Latin "vas" (vessel) — root of "vascular" and "evacuate".',
            examples: [
              { s: 'I want to find a vase.', t: 'Quiero encontrar un jarrón.' },
              { s: 'I need to move a vase.', t: 'Necesito mover un jarrón.' },
            ],
          },
        ],
      },
      {
        level: 15,
        name: 'Sports',
        oliversIntro: {
          headline: 'Nivel 15 · Sports ⚽',
          message: 'El deporte es un idioma universal por sí mismo. "Sport" viene de una palabra que significa "ser llevado lejos" de las preocupaciones diarias — ¡jugar es escapar!',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Deporte\n\n"I like to" + "enjoy" + "a game"\n= I like to enjoy a game',
          funFact: '💡 "Team" viene del anglosajón "tēam", que originalmente significaba un grupo de bueyes tirando juntos del mismo arado.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I like to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find a ball.', t: 'Quiero encontrar una pelota.' },
              { s: 'Can you find a team?', t: '¿Puedes encontrar un equipo?' },
            ],
          },
          {
            id: 'v2', text: 'use', emoji: '🔧', anim: 'spin',
            definition: 'Emplear algo para un fin determinado.',
            definitionEn: 'To employ something for a purpose.',
            etymology: 'Del latín "usus".',
            etymologyEn: 'From Latin "usus".',
            examples: [
              { s: 'I can use a bat.', t: 'Puedo usar un bate.' },
              { s: 'I want to use a rope.', t: 'Quiero usar una cuerda.' },
            ],
          },
          {
            id: 'v3', text: 'enjoy', emoji: '😊', anim: 'glow',
            definition: 'Disfrutar de algo con placer.',
            definitionEn: 'To take pleasure in something.',
            etymology: 'Del francés antiguo "enjoir", del latín "gaudere" (alegrarse) — misma raíz que "joy".',
            etymologyEn: 'From Old French "enjoir", from Latin "gaudere" (to rejoice) — the same root as "joy".',
            examples: [
              { s: 'I like to enjoy a game.', t: 'Me gusta disfrutar de un juego.' },
              { s: 'I want to enjoy a sport.', t: 'Quiero disfrutar de un deporte.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a ball', emoji: '⚽', keyword: 'ball',
            definition: 'Objeto esférico usado para jugar.',
            definitionEn: 'A spherical object used in games.',
            etymology: 'Del nórdico antiguo "böllr", relacionado con el alemán "Ball".',
            etymologyEn: 'From Old Norse "böllr", related to German "Ball".',
            examples: [
              { s: 'I want to find a ball.', t: 'Quiero encontrar una pelota.' },
              { s: 'I can use a ball.', t: 'Puedo usar una pelota.' },
            ],
          },
          {
            id: 'w2', text: 'a game', emoji: '🎮', keyword: 'game',
            definition: 'Actividad recreativa con reglas, hecha por diversión.',
            definitionEn: 'A recreational activity with rules, done for fun.',
            etymology: 'Del anglosajón "gamen" (diversión, alegría, deporte).',
            etymologyEn: 'From Old English "gamen" (amusement, joy, sport) — source of "gamble".',
            examples: [
              { s: 'I like to enjoy a game.', t: 'Me gusta disfrutar de un juego.' },
              { s: 'I want to find a game.', t: 'Quiero encontrar un juego.' },
            ],
          },
          {
            id: 'w3', text: 'a bat', emoji: '🏏', keyword: 'bat',
            definition: 'Instrumento largo para golpear una pelota.',
            definitionEn: 'A long implement used to hit a ball.',
            etymology: 'Del anglosajón "batt" (garrote), del francés antiguo "batte" (golpe).',
            etymologyEn: 'From Old English "batt" (cudgel), from Old French "batte" (a beating) — related to "battle" and "combat".',
            examples: [
              { s: 'I can use a bat.', t: 'Puedo usar un bate.' },
              { s: 'I want to find a bat.', t: 'Quiero encontrar un bate.' },
            ],
          },
          {
            id: 'w4', text: 'a rope', emoji: '🪢', keyword: 'rope',
            definition: 'Cuerda gruesa hecha de fibras trenzadas.',
            definitionEn: 'A thick cord made of twisted fibers.',
            etymology: 'Del anglosajón "rāp", relacionado con el alemán "Reep" (cuerda de barco).',
            etymologyEn: 'From Old English "rāp", related to German "Reep" (ship\'s rope) — one of humanity\'s oldest inventions.',
            examples: [
              { s: 'I want to use a rope.', t: 'Quiero usar una cuerda.' },
              { s: 'I can find a rope.', t: 'Puedo encontrar una cuerda.' },
            ],
          },
          {
            id: 'w5', text: 'a team', emoji: '🤝', keyword: 'team',
            definition: 'Grupo de personas que trabajan juntas hacia un mismo objetivo.',
            definitionEn: 'A group of people working together toward a common goal.',
            etymology: 'Del anglosajón "tēam" (grupo de bueyes tirando juntos de un arado).',
            etymologyEn: 'From Old English "tēam" — originally a group of oxen pulling a plow together, later any cooperative group.',
            oliversTip: '¡"Team" empezó como una palabra para bueyes trabajando juntos! El espíritu de equipo es literalmente "tirar juntos en la misma dirección". 🐂',
            examples: [
              { s: 'I want to find a team.', t: 'Quiero encontrar un equipo.' },
              { s: 'I like to enjoy a team.', t: 'Me gusta disfrutar de un equipo.' },
            ],
          },
          {
            id: 'w6', text: 'a sport', emoji: '🏆', keyword: 'sport',
            definition: 'Actividad física con reglas, practicada por diversión o competencia.',
            definitionEn: 'A physical activity with rules, done for fun or competition.',
            etymology: 'Corto de "disport", del francés antiguo "desporter" — "dis-" + "portare" (llevar).',
            etymologyEn: 'Short for "disport", from Old French "desporter" — literally "to carry away" from daily concerns.',
            examples: [
              { s: 'I want to enjoy a sport.', t: 'Quiero disfrutar de un deporte.' },
              { s: 'I like to find a sport.', t: 'Me gusta encontrar un deporte.' },
            ],
          },
        ],
      },
      {
        level: 16,
        name: 'Music & Art',
        oliversIntro: {
          headline: 'Nivel 16 · Music & Art 🎸',
          message: 'La guitarra viajó desde Grecia antigua a través de Arabia y España hasta llegar a todo el mundo. El arte y la música conectan culturas a través del tiempo.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Instrumento/Arte\n\n"I want to" + "find" + "a guitar"\n= I want to find a guitar',
          funFact: '💡 "Piano" es la forma corta de "pianoforte" — italiano para "suave-fuerte", porque podía tocar ambos volúmenes, a diferencia del clavicordio.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I like to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find a guitar.', t: 'Quiero encontrar una guitarra.' },
              { s: 'Can you find a drum?', t: '¿Puedes encontrar un tambor?' },
            ],
          },
          {
            id: 'v2', text: 'buy', emoji: '🛒', anim: 'spin',
            definition: 'Adquirir algo a cambio de dinero.',
            definitionEn: 'To get something in exchange for money.',
            etymology: 'Del anglosajón "bycgan".',
            etymologyEn: 'From Old English "bycgan".',
            examples: [
              { s: 'I want to buy a piano.', t: 'Quiero comprar un piano.' },
              { s: 'I need to buy a painting.', t: 'Necesito comprar una pintura.' },
            ],
          },
          {
            id: 'v3', text: 'enjoy', emoji: '😊', anim: 'glow',
            definition: 'Disfrutar de algo con placer.',
            definitionEn: 'To take pleasure in something.',
            etymology: 'Del francés antiguo "enjoir", del latín "gaudere" (alegrarse).',
            etymologyEn: 'From Old French "enjoir", from Latin "gaudere" — same root as "joy".',
            examples: [
              { s: 'I like to enjoy a song.', t: 'Me gusta disfrutar de una canción.' },
              { s: 'I want to enjoy a concert.', t: 'Quiero disfrutar de un concierto.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a guitar', emoji: '🎸', keyword: 'guitar',
            definition: 'Instrumento musical de cuerdas, tocado con los dedos o una púa.',
            definitionEn: 'A stringed musical instrument, played with fingers or a pick.',
            etymology: 'Del español "guitarra", del árabe "qiṭāra", del griego "kithara".',
            etymologyEn: 'From Spanish "guitarra", from Arabic "qiṭāra", from Greek "kithara" — the guitar traveled from ancient Greece through Moorish Spain.',
            examples: [
              { s: 'I want to find a guitar.', t: 'Quiero encontrar una guitarra.' },
              { s: 'I like to enjoy a guitar.', t: 'Me gusta disfrutar de una guitarra.' },
            ],
          },
          {
            id: 'w2', text: 'a piano', emoji: '🎹', keyword: 'piano',
            definition: 'Instrumento musical de teclas y cuerdas internas.',
            definitionEn: 'A musical instrument with keys and internal strings.',
            etymology: 'Corto de "pianoforte", italiano: "piano" (suave) + "forte" (fuerte).',
            etymologyEn: 'Short for "pianoforte", Italian for "soft-loud" — named for its ability to play both volumes, unlike the harpsichord.',
            oliversTip: '¡"Piano" significa "suave" en italiano! Se llamó así porque, a diferencia del clavicordio, podía tocar fuerte y suave. 🎹',
            examples: [
              { s: 'I want to buy a piano.', t: 'Quiero comprar un piano.' },
              { s: 'I can find a piano.', t: 'Puedo encontrar un piano.' },
            ],
          },
          {
            id: 'w3', text: 'a drum', emoji: '🥁', keyword: 'drum',
            definition: 'Instrumento de percusión que se golpea con las manos o palillos.',
            definitionEn: 'A percussion instrument struck with hands or sticks.',
            etymology: 'Del neerlandés medio "tromme", de una raíz germánica imitativa del sonido.',
            etymologyEn: 'From Middle Dutch "tromme", from an imitative Germanic root — the word echoes the sound.',
            examples: [
              { s: 'I want to find a drum.', t: 'Quiero encontrar un tambor.' },
              { s: 'I like to enjoy a drum.', t: 'Me gusta disfrutar de un tambor.' },
            ],
          },
          {
            id: 'w4', text: 'a song', emoji: '🎵', keyword: 'song',
            definition: 'Composición musical hecha para ser cantada.',
            definitionEn: 'A musical composition made to be sung.',
            etymology: 'Del anglosajón "sang", del indo-europeo "sengwh-" (cantar).',
            etymologyEn: 'From Old English "sang", PIE "sengwh-" (to sing) — related to German "Sang".',
            examples: [
              { s: 'I like to enjoy a song.', t: 'Me gusta disfrutar de una canción.' },
              { s: 'I want to find a song.', t: 'Quiero encontrar una canción.' },
            ],
          },
          {
            id: 'w5', text: 'a painting', emoji: '🖼️', keyword: 'painting',
            definition: 'Obra de arte hecha con pintura sobre una superficie.',
            definitionEn: 'A work of art made with paint on a surface.',
            etymology: 'Del francés antiguo "peintier", del latín "pingere" (pintar, bordar).',
            etymologyEn: 'From Old French "peintier", from Latin "pingere" — root of "picture" and "depict".',
            examples: [
              { s: 'I need to buy a painting.', t: 'Necesito comprar una pintura.' },
              { s: 'I want to find a painting.', t: 'Quiero encontrar una pintura.' },
            ],
          },
          {
            id: 'w6', text: 'a concert', emoji: '🎤', keyword: 'concert',
            definition: 'Presentación musical en vivo ante una audiencia.',
            definitionEn: 'A live musical performance before an audience.',
            etymology: 'Del italiano "concerto" (armonía), del latín "concertare" (competir en armonía).',
            etymologyEn: 'From Italian "concerto" (harmony), from Latin "concertare" — everyone working harmoniously together.',
            examples: [
              { s: 'I want to enjoy a concert.', t: 'Quiero disfrutar de un concierto.' },
              { s: 'I like to find a concert.', t: 'Me gusta encontrar un concierto.' },
            ],
          },
        ],
      },
      {
        level: 17,
        name: 'Nature',
        oliversIntro: {
          headline: 'Nivel 17 · Nature 🌲',
          message: 'La naturaleza es donde el lenguaje humano comenzó. "Tree" comparte raíz con "druid" — el sacerdote del roble en las culturas celtas antiguas.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Elemento natural\n\n"I like to" + "explore" + "a forest"\n= I like to explore a forest',
          funFact: '💡 "River" viene del latín "ripa" (orilla) — la misma raíz de "arrive" (llegar a la orilla) y "rival" (quien comparte el mismo río).',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I can' },
          { id: 'b3', text: 'I like to' },
        ],
        verbs: [
          {
            id: 'v1', text: 'see', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos.',
            definitionEn: 'To perceive with the eyes.',
            etymology: 'Del anglosajón "sēon".',
            etymologyEn: 'From Old English "sēon".',
            examples: [
              { s: 'I can see a tree.', t: 'Puedo ver un árbol.' },
              { s: 'I want to see a flower.', t: 'Quiero ver una flor.' },
            ],
          },
          {
            id: 'v2', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find a river.', t: 'Quiero encontrar un río.' },
              { s: 'Can you find a lake?', t: '¿Puedes encontrar un lago?' },
            ],
          },
          {
            id: 'v3', text: 'explore', emoji: '🌿', anim: 'wander',
            definition: 'Recorrer un lugar desconocido para conocerlo.',
            definitionEn: 'To travel through an unknown place to learn about it.',
            etymology: 'Del latín "explorare" — los cazadores romanos hacían ruido para "hacer salir" la caza.',
            etymologyEn: 'From Latin "explorare" — Roman hunters made noise to drive game out of hiding.',
            examples: [
              { s: 'I like to explore a forest.', t: 'Me gusta explorar un bosque.' },
              { s: 'I want to explore a mountain.', t: 'Quiero explorar una montaña.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a tree', emoji: '🌳', keyword: 'tree',
            definition: 'Planta grande de tronco leñoso, ramas y hojas.',
            definitionEn: 'A large plant with a woody trunk, branches, and leaves.',
            etymology: 'Del anglosajón "trēow", del indo-europeo "doru-" (árbol, madera).',
            etymologyEn: 'From Old English "trēow", PIE "doru-" — same root as Greek "drus" (oak), giving "druid" (oak-priest).',
            oliversTip: '"Druid" significa literalmente "sabio del roble" — los celtas antiguos veneraban los árboles como portales sagrados. 🌳',
            examples: [
              { s: 'I can see a tree.', t: 'Puedo ver un árbol.' },
              { s: 'I want to find a tree.', t: 'Quiero encontrar un árbol.' },
            ],
          },
          {
            id: 'w2', text: 'a flower', emoji: '🌸', keyword: 'flower',
            definition: 'Parte de la planta con pétalos de colores, donde nace la semilla.',
            definitionEn: 'The colorful, petaled part of a plant where seeds form.',
            etymology: 'Del francés antiguo "flur", del latín "flos/floris".',
            etymologyEn: 'From Old French "flur", from Latin "flos" — root of "flourish" and "Florida" (land of flowers).',
            examples: [
              { s: 'I want to see a flower.', t: 'Quiero ver una flor.' },
              { s: 'I can find a flower.', t: 'Puedo encontrar una flor.' },
            ],
          },
          {
            id: 'w3', text: 'a river', emoji: '🏞️', keyword: 'river',
            definition: 'Corriente de agua dulce que fluye hacia el mar u otro río.',
            definitionEn: 'A flowing body of fresh water that runs into the sea or another river.',
            etymology: 'Del francés antiguo "riviere", del latín "ripa" (orilla).',
            etymologyEn: 'From Old French "riviere", from Latin "ripa" (riverbank) — root of "arrive" and "rival".',
            examples: [
              { s: 'I want to find a river.', t: 'Quiero encontrar un río.' },
              { s: 'I can see a river.', t: 'Puedo ver un río.' },
            ],
          },
          {
            id: 'w4', text: 'a mountain', emoji: '⛰️', keyword: 'mountain',
            definition: 'Elevación natural del terreno muy alta.',
            definitionEn: 'A very high natural elevation of land.',
            etymology: 'Del francés antiguo "montaigne", del latín "mons/montis".',
            etymologyEn: 'From Old French "montaigne", from Latin "mons" — root of "mount" and "paramount".',
            examples: [
              { s: 'I like to explore a mountain.', t: 'Me gusta explorar una montaña.' },
              { s: 'I want to see a mountain.', t: 'Quiero ver una montaña.' },
            ],
          },
          {
            id: 'w5', text: 'a lake', emoji: '🏔️', keyword: 'lake',
            definition: 'Gran extensión de agua rodeada de tierra.',
            definitionEn: 'A large body of water surrounded by land.',
            etymology: 'Del francés antiguo "lac", del latín "lacus" (lago, hoyo).',
            etymologyEn: 'From Old French "lac", from Latin "lacus" — related to "lagoon" and "lacuna" (a little lake/gap).',
            examples: [
              { s: 'I want to find a lake.', t: 'Quiero encontrar un lago.' },
              { s: 'I can see a lake.', t: 'Puedo ver un lago.' },
            ],
          },
          {
            id: 'w6', text: 'a forest', emoji: '🌲', keyword: 'forest',
            definition: 'Extensión grande de terreno con muchos árboles.',
            definitionEn: 'A large area of land covered with trees.',
            etymology: 'Del latín medieval "forestem silvam" (bosque exterior), de "foris" (afuera).',
            etymologyEn: 'From Medieval Latin "forestem silvam" — originally the land outside city walls reserved for royal hunting.',
            examples: [
              { s: 'I like to explore a forest.', t: 'Me gusta explorar un bosque.' },
              { s: 'I want to find a forest.', t: 'Quiero encontrar un bosque.' },
            ],
          },
        ],
      },
      {
        level: 18,
        name: 'Technology',
        oliversIntro: {
          headline: 'Nivel 18 · Technology 📱',
          message: 'La tecnología moderna usa palabras antiguas con nuevos significados. ¡"Computer" solía ser el título de un trabajo humano, no una máquina!',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Dispositivo\n\n"I need to" + "use" + "a phone"\n= I need to use a phone',
          funFact: '💡 Antes de las computadoras electrónicas, un "computer" era una persona contratada para hacer cálculos matemáticos a mano.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'use', emoji: '🔧', anim: 'spin',
            definition: 'Emplear algo para un fin determinado.',
            definitionEn: 'To employ something for a purpose.',
            etymology: 'Del latín "usus".',
            etymologyEn: 'From Latin "usus".',
            examples: [
              { s: 'I need to use a phone.', t: 'Necesito usar un teléfono.' },
              { s: 'I can use a computer.', t: 'Puedo usar una computadora.' },
            ],
          },
          {
            id: 'v2', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find a camera.', t: 'Quiero encontrar una cámara.' },
              { s: 'Can you find a radio?', t: '¿Puedes encontrar una radio?' },
            ],
          },
          {
            id: 'v3', text: 'buy', emoji: '🛒', anim: 'bounce',
            definition: 'Adquirir algo a cambio de dinero.',
            definitionEn: 'To get something in exchange for money.',
            etymology: 'Del anglosajón "bycgan".',
            etymologyEn: 'From Old English "bycgan".',
            examples: [
              { s: 'I want to buy a watch.', t: 'Quiero comprar un reloj.' },
              { s: 'I need to buy a screen.', t: 'Necesito comprar una pantalla.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a phone', emoji: '📱', keyword: 'phone',
            definition: 'Dispositivo usado para comunicarse a distancia por voz o mensajes.',
            definitionEn: 'A device used to communicate at a distance, by voice or messages.',
            etymology: 'Del griego "phōnē" (voz, sonido). Raíz de "telephone", "microphone" y "symphony".',
            etymologyEn: 'From Greek "phōnē" (voice, sound) — root of "telephone", "microphone", "symphony".',
            examples: [
              { s: 'I need to use a phone.', t: 'Necesito usar un teléfono.' },
              { s: 'I want to find a phone.', t: 'Quiero encontrar un teléfono.' },
            ],
          },
          {
            id: 'w2', text: 'a computer', emoji: '💻', keyword: 'computer',
            definition: 'Máquina electrónica que procesa información.',
            definitionEn: 'An electronic machine that processes information.',
            etymology: 'Del latín "computare" (contar juntos). Antiguamente, "computer" era el título de una persona que calculaba.',
            etymologyEn: 'From Latin "computare" (to count together) — originally "computer" was a human job title, not a machine.',
            oliversTip: '¡Antes del siglo XX, un "computer" era una persona que hacía cálculos matemáticos como trabajo! 💻',
            examples: [
              { s: 'I can use a computer.', t: 'Puedo usar una computadora.' },
              { s: 'I want to find a computer.', t: 'Quiero encontrar una computadora.' },
            ],
          },
          {
            id: 'w3', text: 'a camera', emoji: '📷', keyword: 'camera',
            definition: 'Dispositivo que captura imágenes o fotografías.',
            definitionEn: 'A device that captures images or photographs.',
            etymology: 'Del latín "camera" (cámara, habitación), del griego "kamara" (cuarto abovedado).',
            etymologyEn: 'From Latin "camera" (chamber), from Greek "kamara" — "camera" originally meant simply "room".',
            examples: [
              { s: 'I want to find a camera.', t: 'Quiero encontrar una cámara.' },
              { s: 'I need to use a camera.', t: 'Necesito usar una cámara.' },
            ],
          },
          {
            id: 'w4', text: 'a watch', emoji: '⌚', keyword: 'watch',
            definition: 'Reloj pequeño que se lleva en la muñeca.',
            definitionEn: 'A small clock worn on the wrist.',
            etymology: 'Del anglosajón "wæccan" (estar despierto, vigilar).',
            etymologyEn: 'From Old English "wæccan" (to stay awake, to keep watch) — you had to be awake to hear the chimes.',
            examples: [
              { s: 'I want to buy a watch.', t: 'Quiero comprar un reloj.' },
              { s: 'I need to find a watch.', t: 'Necesito encontrar un reloj.' },
            ],
          },
          {
            id: 'w5', text: 'a radio', emoji: '📻', keyword: 'radio',
            definition: 'Dispositivo que recibe y transmite señales de audio.',
            definitionEn: 'A device that receives and transmits audio signals.',
            etymology: 'Del latín "radius" (rayo, radio de una rueda).',
            etymologyEn: 'From Latin "radius" (ray, spoke of a wheel) — radio technology transmits on rays of energy.',
            examples: [
              { s: 'I want to find a radio.', t: 'Quiero encontrar una radio.' },
              { s: 'I can use a radio.', t: 'Puedo usar una radio.' },
            ],
          },
          {
            id: 'w6', text: 'a screen', emoji: '🖥️', keyword: 'screen',
            definition: 'Superficie donde se muestran imágenes o información.',
            definitionEn: 'A surface on which images or information are displayed.',
            etymology: 'Del francés antiguo "escren" (pantalla contra el fuego), del neerlandés medio "scherm".',
            etymologyEn: 'From Old French "escren" (a firescreen), from Middle Dutch "scherm" — originally protected you from a fire\'s heat.',
            examples: [
              { s: 'I need to buy a screen.', t: 'Necesito comprar una pantalla.' },
              { s: 'I want to use a screen.', t: 'Quiero usar una pantalla.' },
            ],
          },
        ],
      },
      {
        level: 19,
        name: 'Health',
        oliversIntro: {
          headline: 'Nivel 19 · Health 🏥',
          message: 'Las palabras de salud guardan historias de cuidado humano. "Hospital" significaba originalmente "casa de huéspedes" — un lugar de hospitalidad para viajeros.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Salud\n\n"I need to" + "see" + "a doctor"\n= I need to see a doctor',
          funFact: '💡 "Doctor" viene del latín "docere" (enseñar) — los médicos eran originalmente "maestros" de medicina.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I can' },
        ],
        verbs: [
          {
            id: 'v1', text: 'use', emoji: '🔧', anim: 'spin',
            definition: 'Emplear algo para un fin determinado.',
            definitionEn: 'To employ something for a purpose.',
            etymology: 'Del latín "usus".',
            etymologyEn: 'From Latin "usus".',
            examples: [
              { s: 'I need to use some soap.', t: 'Necesito usar jabón.' },
              { s: 'I want to use a towel.', t: 'Quiero usar una toalla.' },
            ],
          },
          {
            id: 'v2', text: 'find', emoji: '🔍', anim: 'search',
            definition: 'Localizar o descubrir algo.',
            definitionEn: 'To locate or discover something.',
            etymology: 'Del anglosajón "findan".',
            etymologyEn: 'From Old English "findan".',
            examples: [
              { s: 'I want to find a brush.', t: 'Quiero encontrar un cepillo.' },
              { s: 'Can you find some medicine?', t: '¿Puedes encontrar medicina?' },
            ],
          },
          {
            id: 'v3', text: 'see', emoji: '👁️', anim: 'blink',
            definition: 'Percibir algo con los ojos; consultar a alguien.',
            definitionEn: 'To perceive with the eyes; to consult someone.',
            etymology: 'Del anglosajón "sēon".',
            etymologyEn: 'From Old English "sēon".',
            examples: [
              { s: 'I need to see a doctor.', t: 'Necesito ver a un doctor.' },
              { s: 'I want to see a hospital.', t: 'Quiero ver un hospital.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'some soap', emoji: '🧼', keyword: 'soap',
            definition: 'Sustancia usada con agua para limpiar el cuerpo o las cosas.',
            definitionEn: 'A substance used with water to clean the body or objects.',
            etymology: 'Del anglosajón "sāpe", relacionado con el alemán "Seife".',
            etymologyEn: 'From Old English "sāpe", related to German "Seife" — one of humanity\'s first manufactured products.',
            examples: [
              { s: 'I need to use some soap.', t: 'Necesito usar jabón.' },
              { s: 'I want to find some soap.', t: 'Quiero encontrar jabón.' },
            ],
          },
          {
            id: 'w2', text: 'a brush', emoji: '🪥', keyword: 'brush',
            definition: 'Objeto con cerdas usado para limpiar o peinar.',
            definitionEn: 'An object with bristles used for cleaning or grooming.',
            etymology: 'Del francés antiguo "brosse" (maleza, matorral). Los primeros cepillos eran manojos de ramitas.',
            etymologyEn: 'From Old French "brosse" (brushwood) — the earliest brushes were simply bundles of twigs.',
            examples: [
              { s: 'I want to find a brush.', t: 'Quiero encontrar un cepillo.' },
              { s: 'I need to use a brush.', t: 'Necesito usar un cepillo.' },
            ],
          },
          {
            id: 'w3', text: 'a towel', emoji: '🏊', keyword: 'towel',
            definition: 'Tela absorbente usada para secarse.',
            definitionEn: 'An absorbent cloth used for drying off.',
            etymology: 'Del francés antiguo "touaille", del fráncico "thwahljō" (tela de lavar).',
            etymologyEn: 'From Old French "touaille", from Frankish "thwahljō" — connected to a Proto-Germanic root meaning "to wash".',
            examples: [
              { s: 'I want to use a towel.', t: 'Quiero usar una toalla.' },
              { s: 'I need to find a towel.', t: 'Necesito encontrar una toalla.' },
            ],
          },
          {
            id: 'w4', text: 'a doctor', emoji: '👨‍⚕️', keyword: 'doctor',
            definition: 'Persona capacitada para diagnosticar y tratar enfermedades.',
            definitionEn: 'A person trained to diagnose and treat illness.',
            etymology: 'Del latín "doctor" (maestro), de "docere" (enseñar).',
            etymologyEn: 'From Latin "doctor" (teacher), from "docere" (to teach) — doctors were originally "teachers" of medicine.',
            examples: [
              { s: 'I need to see a doctor.', t: 'Necesito ver a un doctor.' },
              { s: 'I want to find a doctor.', t: 'Quiero encontrar un doctor.' },
            ],
          },
          {
            id: 'w5', text: 'some medicine', emoji: '💊', keyword: 'medicine',
            definition: 'Sustancia usada para curar o prevenir enfermedades.',
            definitionEn: 'A substance used to cure or prevent illness.',
            etymology: 'Del latín "medicina" (el arte de curar), de "mederi" (cuidar, sanar).',
            etymologyEn: 'From Latin "medicina", from "mederi" (to heal, to care for) — related to "meditate".',
            examples: [
              { s: 'I want to find some medicine.', t: 'Quiero encontrar medicina.' },
              { s: 'I need to use some medicine.', t: 'Necesito usar medicina.' },
            ],
          },
          {
            id: 'w6', text: 'a hospital', emoji: '🏥', keyword: 'hospital',
            definition: 'Lugar donde se atiende y trata a personas enfermas.',
            definitionEn: 'A place where sick people are cared for and treated.',
            etymology: 'Del latín "hospitale" (casa de huéspedes), de "hospes" (anfitrión, huésped).',
            etymologyEn: 'From Latin "hospitale" (guest house), from "hospes" — originally a place of hospitality for travelers, related to "hotel" and "hostel".',
            oliversTip: '¡"Hospital", "hotel" y "hostel" son la misma palabra! Todos vienen de "hospes" — un lugar para recibir huéspedes. 🏥',
            examples: [
              { s: 'I want to see a hospital.', t: 'Quiero ver un hospital.' },
              { s: 'I need to find a hospital.', t: 'Necesito encontrar un hospital.' },
            ],
          },
        ],
      },
      {
        level: 20,
        name: 'My Day',
        oliversIntro: {
          headline: 'Nivel 20 · My Day 🌅 ¡Stage 1 completo!',
          message: '¡Felicidades! Has llegado al último nivel del Stage 1. Aquí aprenderás a describir tu rutina diaria — el vocabulario que usarás cada día de tu vida. Una "journey" en inglés antiguo significaba exactamente un día de viaje.',
          technique: '🔵 Base  +  🟢 Verbo  +  🟣 Momento del día\n\n"I want to" + "enjoy" + "a meal"\n= I want to enjoy a meal',
          funFact: '💡 "Breakfast" significa literalmente "romper el ayuno" (break + fast) — la primera comida que rompe la noche sin comer.',
        },
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I like to' },
          { id: 'b3', text: 'I need to' },
        ],
        verbs: [
          {
            id: 'v1', text: 'start', emoji: '🌅', anim: 'rise',
            definition: 'Comenzar algo.',
            definitionEn: 'To begin something.',
            etymology: 'Del anglosajón "styrtan" (saltar de repente), relacionado con "startle".',
            etymologyEn: 'From Old English "styrtan" (to leap up) — related to "startle".',
            examples: [
              { s: 'I want to start a lesson.', t: 'Quiero empezar una lección.' },
              { s: 'I need to start a journey.', t: 'Necesito empezar un viaje.' },
            ],
          },
          {
            id: 'v2', text: 'enjoy', emoji: '😊', anim: 'glow',
            definition: 'Disfrutar de algo con placer.',
            definitionEn: 'To take pleasure in something.',
            etymology: 'Del francés antiguo "enjoir", del latín "gaudere" (alegrarse) — misma raíz que "joy".',
            etymologyEn: 'From Old French "enjoir", from Latin "gaudere" — same root as "joy".',
            examples: [
              { s: 'I want to enjoy a meal.', t: 'Quiero disfrutar de una comida.' },
              { s: 'I like to enjoy a story.', t: 'Me gusta disfrutar de una historia.' },
            ],
          },
          {
            id: 'v3', text: 'finish', emoji: '✅', anim: 'flash',
            definition: 'Terminar o completar algo.',
            definitionEn: 'To end or complete something.',
            etymology: 'Del francés antiguo "finir", del latín "finire" (terminar), de "finis" (fin).',
            etymologyEn: 'From Old French "finir", from Latin "finire", from "finis" (end) — root of "final" and "finance".',
            examples: [
              { s: 'I need to finish a breakfast.', t: 'Necesito terminar un desayuno.' },
              { s: 'I want to finish a day.', t: 'Quiero terminar un día.' },
            ],
          },
        ],
        vocab: [
          {
            id: 'w1', text: 'a journey', emoji: '🚶', keyword: 'journey',
            definition: 'Viaje de un lugar a otro, generalmente largo.',
            definitionEn: 'A trip from one place to another, usually a long one.',
            etymology: 'Del francés antiguo "jornee" (viaje de un día), del latín "diurnum" (del día).',
            etymologyEn: 'From Old French "jornee" (a day\'s travel), from Latin "diurnum" — a journey was originally exactly one day\'s worth of travel.',
            examples: [
              { s: 'I need to start a journey.', t: 'Necesito empezar un viaje.' },
              { s: 'I want to enjoy a journey.', t: 'Quiero disfrutar de un viaje.' },
            ],
          },
          {
            id: 'w2', text: 'a breakfast', emoji: '🍳', keyword: 'breakfast',
            definition: 'Primera comida del día.',
            definitionEn: 'The first meal of the day.',
            etymology: 'Compuesto de "break" + "fast" (ayuno) — literalmente "romper el ayuno".',
            etymologyEn: 'A compound of "break" + "fast" (a period without food) — literally "to break your overnight fast".',
            oliversTip: '¡"Breakfast" significa literalmente "romper el ayuno"! Cada mañana rompes el ayuno de la noche. 🍳',
            examples: [
              { s: 'I need to finish a breakfast.', t: 'Necesito terminar un desayuno.' },
              { s: 'I like to enjoy a breakfast.', t: 'Me gusta disfrutar de un desayuno.' },
            ],
          },
          {
            id: 'w3', text: 'a lesson', emoji: '📚', keyword: 'lesson',
            definition: 'Período de enseñanza sobre un tema.',
            definitionEn: 'A period of teaching about a subject.',
            etymology: 'Del francés antiguo "leçon", del latín "lectionem" (lectura), de "legere" (leer, elegir).',
            etymologyEn: 'From Old French "leçon", from Latin "lectionem" — same root as "lecture" and "legible".',
            examples: [
              { s: 'I want to start a lesson.', t: 'Quiero empezar una lección.' },
              { s: 'I like to enjoy a lesson.', t: 'Me gusta disfrutar de una lección.' },
            ],
          },
          {
            id: 'w4', text: 'a story', emoji: '📖', keyword: 'story',
            definition: 'Narración de hechos reales o imaginarios.',
            definitionEn: 'A narrative of real or imagined events.',
            etymology: 'Del francés antiguo "estoire", del latín "historia". "Story" e "history" son la misma palabra.',
            etymologyEn: 'From Old French "estoire", from Latin "historia" — "story" and "history" are exactly the same word.',
            examples: [
              { s: 'I like to enjoy a story.', t: 'Me gusta disfrutar de una historia.' },
              { s: 'I want to finish a story.', t: 'Quiero terminar una historia.' },
            ],
          },
          {
            id: 'w5', text: 'a meal', emoji: '🍽️', keyword: 'meal',
            definition: 'Comida que se toma en un momento fijo del día.',
            definitionEn: 'Food eaten at a set time of day.',
            etymology: 'Del anglosajón "mæl" (momento fijo, comida), relacionado con el alemán "Mal".',
            etymologyEn: 'From Old English "mæl" (an appointed time, a meal) — originally meant a fixed moment of eating.',
            examples: [
              { s: 'I want to enjoy a meal.', t: 'Quiero disfrutar de una comida.' },
              { s: 'I need to finish a meal.', t: 'Necesito terminar una comida.' },
            ],
          },
          {
            id: 'w6', text: 'a day', emoji: '📅', keyword: 'day',
            definition: 'Período de 24 horas; también el tiempo entre el amanecer y el anochecer.',
            definitionEn: 'A 24-hour period; also the time between sunrise and sunset.',
            etymology: 'Del anglosajón "dæg", relacionado con el alemán "Tag".',
            etymologyEn: 'From Old English "dæg", related to German "Tag" — one of the most fundamental words in any language.',
            examples: [
              { s: 'I want to start a day.', t: 'Quiero empezar un día.' },
              { s: 'I like to enjoy a day.', t: 'Me gusta disfrutar de un día.' },
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
