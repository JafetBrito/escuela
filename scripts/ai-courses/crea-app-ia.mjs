// Curso "Crea tu Primera App con IA: Curso Práctico". Solo texto + quizzes.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const creaAppIa = {
  id: 'course-crea-app-ia',
  title: 'Crea tu Primera App con IA: Curso Práctico',
  description: 'De una idea en una servilleta a una app real, publicada en internet, construida describiéndola en lenguaje natural ("vibe coding"): define tu app, elige un stack simple, escribe tus primeros prompts de construcción, depura con ayuda de IA, guarda datos, pruébala, y publícala gratis. El curso más práctico de la Academia de IA.',
  ai_instructions: 'Eres Oliver, profesor guía de la Escuela de Inteligencia Artificial de Oliver Academy, guiando el curso "Crea tu Primera App con IA". Sé muy práctico y alentador — el objetivo es que el alumno termine con algo real funcionando, no solo teoría. Cuando expliques pasos técnicos, asume que el alumno tiene cero experiencia previa de programación y ve cada paso como su primera vez. Sé honesto sobre las limitaciones del "vibe coding" para proyectos serios con datos reales de usuarios, sin desanimar el aprendizaje.',
  icon: '🚀',
  color: '#22c55e',
  category: 'Inteligencia Artificial',
  subcategory: 'Creación de Apps con IA',
  difficulty: 'principiante',
  locked: false,
  modules: [
    text('Bienvenida: hoy es más fácil que nunca construir algo real',
      'Por qué este curso existe ahora, y qué vas a tener al terminarlo.',
      `
<h2>Lo que vas a lograr</h2>
<p>Al terminar este curso vas a tener una <strong>app web real, funcionando, publicada en internet</strong> — no un ejercicio de práctica que se queda en tu computadora, sino algo con una dirección que puedes compartir con quien quieras. La vas a construir describiéndola en lenguaje natural a un asistente de IA, con tu criterio guiando cada decisión.</p>

<h2>El "vibe coding", explicado sin exagerar</h2>
<p>Como viste en <em>Actualidad de la IA</em>, el <strong>vibe coding</strong> es describir en lenguaje natural lo que quieres construir, dejando que la IA escriba (y a menudo pruebe) la mayor parte del código, mientras tú guías el resultado con tu criterio. Este curso te enseña a hacerlo bien: no es "pedir una vez y que salga perfecto" — es un proceso de ida y vuelta, con pasos concretos.</p>

<h2>El mapa del curso: de la idea a internet</h2>
<table>
<tr><th>Parte</th><th>Qué vas a hacer</th></tr>
<tr><td>1. Define tu app</td><td>Una idea clara, en una sola página, antes de escribir nada.</td></tr>
<tr><td>2. Elige tu stack</td><td>Sin abrumarte con opciones — una elección simple y suficiente.</td></tr>
<tr><td>3. Tu primer prompt de construcción</td><td>El arranque real, paso a paso.</td></tr>
<tr><td>4. Depura con IA</td><td>Qué hacer cuando algo (inevitablemente) no funciona.</td></tr>
<tr><td>5. Dale vida con datos</td><td>Que tu app recuerde información, no solo se vea bonita.</td></tr>
<tr><td>6. Pruébala de verdad</td><td>Antes de mostrársela a nadie más.</td></tr>
<tr><td>7. Publícala gratis</td><td>Una dirección real en internet.</td></tr>
</table>

<div class="tip">
💡 No necesitas experiencia previa de programación para este curso — sí te va a ayudar mucho haber tomado <em>Trucos y Consejos para Sacarle el Máximo Provecho a la IA</em>, porque vas a usar esos mismos hábitos (contexto, iteración, verificación) constantemente.
</div>
`,
      quiz('¿Qué vas a tener al terminar este curso, según la bienvenida?',
        ['Solo conocimiento teórico, sin nada construido', 'Una app web real, funcionando, publicada en internet con una dirección que puedes compartir', 'Un certificado sin ningún proyecto asociado', 'Una lista de lecturas para el futuro'], 1)),

    text('Define tu app antes de escribir una sola línea',
      'La página de una hoja que evita que te pierdas a la mitad del proyecto.',
      `
<h2>El error más común: empezar a construir sin saber qué</h2>
<p>La tentación es abrir el chat de IA y escribir "hazme una app de lista de tareas" de inmediato. El problema: sin definir bien qué necesitas, vas a terminar pidiendo cambios contradictorios a mitad del camino, y el resultado será confuso. Cinco minutos de planeación ahorran horas de confusión después.</p>

<h2>La plantilla de una página</h2>
<table>
<tr><th>Pregunta</th><th>Ejemplo de respuesta</th></tr>
<tr><td><strong>¿Qué problema resuelve?</strong></td><td>"Olvido las tareas que tengo pendientes para mis cursos."</td></tr>
<tr><td><strong>¿Quién la va a usar?</strong></td><td>"Solo yo, desde mi teléfono y mi computadora."</td></tr>
<tr><td><strong>¿Cuál es la funcionalidad MÍNIMA para que sea útil?</strong></td><td>"Agregar una tarea, marcarla como hecha, y que no se borre al cerrar la página."</td></tr>
<tr><td><strong>¿Qué NO necesita tener (todavía)?</strong></td><td>"No necesito cuentas de usuario, ni compartirla con otros, ni categorías."</td></tr>
<tr><td><strong>¿Cómo se ve el éxito?</strong></td><td>"La abro mañana y mis tareas siguen ahí."</td></tr>
</table>

<h2>Por qué la columna de "qué NO necesita tener" es la más importante</h2>
<p>El error de principiante más común no es pedir muy poco — es pedir demasiado de una sola vez. Una app con 3 funciones que SÍ funcionan es mucho mejor que una con 15 funciones a medio terminar. Recorta sin miedo — siempre puedes agregar más después de tener lo básico funcionando.</p>

<div class="example">
<strong>Ejemplo completo de definición:</strong> "Una app de lista de tareas simple. Solo yo la uso. Puedo agregar una tarea escribiendo su texto, marcarla como completada con un clic, y eliminarla. Mis tareas se guardan aunque cierre la pestaña. No necesito cuentas, ni categorías, ni fechas límite por ahora. Sé que funciona si cierro la pestaña, la vuelvo a abrir, y mis tareas siguen ahí."
</div>

<h2>Tu tarea antes de la siguiente clase</h2>
<p>Escribe tu propia definición de una página, usando la plantilla de arriba, para una app que tú quieras construir. Puede ser tan simple como quieras — el objetivo de este curso es terminar algo funcionando, no algo ambicioso.</p>
`,
      quiz('¿Cuál es el error de principiante más común al empezar a construir una app con IA?',
        ['Definir muy pocas funciones', 'Pedir demasiadas funciones de una sola vez, en vez de empezar con lo mínimo indispensable que funcione', 'Escribir la definición de la app antes de empezar', 'Usar demasiado tiempo planeando'], 1)),

    text('Elige tu stack sin abrumarte',
      'Las decisiones técnicas mínimas para empezar, explicadas sin jerga innecesaria.',
      `
<h2>Qué es un "stack" y por qué no necesitas saber de todos</h2>
<p>El <strong>stack</strong> es el conjunto de tecnologías con las que se construye una app. Hay cientos de combinaciones posibles — la buena noticia es que, para tu primera app, una combinación simple y muy probada es más que suficiente, y no necesitas entender cada alternativa que existe.</p>

<h2>La recomendación para este curso</h2>
<table>
<tr><th>Pieza</th><th>Elección recomendada para empezar</th><th>Por qué</th></tr>
<tr><td>Estructura y contenido</td><td>HTML</td><td>El lenguaje más simple y universal para definir qué hay en una página.</td></tr>
<tr><td>Apariencia</td><td>CSS</td><td>Controla colores, tamaños y diseño — la IA puede generarlo por ti sin que necesites memorizar sintaxis.</td></tr>
<tr><td>Comportamiento</td><td>JavaScript</td><td>Lo que hace que los botones "hagan algo" — agregar tareas, guardarlas, etc.</td></tr>
<tr><td>Dónde guardar datos (al principio)</td><td><code>localStorage</code> del navegador</td><td>Guarda datos directamente en el navegador del usuario, sin necesitar una base de datos ni un servidor — perfecto para una primera app.</td></tr>
</table>

<h2>¿Por qué no un "framework" más avanzado?</h2>
<p>Existen herramientas más potentes (React, Vue, y muchas otras) que probablemente ya viste mencionadas si exploraste otros cursos de programación. Son excelentes para proyectos grandes, pero agregan complejidad que no necesitas para tu primera app — HTML, CSS y JavaScript "planos" son suficientes, y entenderás mejor lo que la IA genera si empiezas simple.</p>

<h2>Un solo archivo es suficiente para empezar</h2>
<p>Para tu primera app, todo puede vivir en un solo archivo <code>.html</code> que combina las tres piezas — lo puedes abrir directamente en tu navegador para probarlo, sin instalar nada. Cuando tu app crezca, podrás separar el código en varios archivos, pero no hace falta complicarte desde el día uno.</p>

<div class="tip">
💡 Si en algún momento quieres ir más allá de este curso, el curso <em>Git y GitHub</em> de esta escuela te prepara para organizar proyectos más grandes con control de versiones — perfecto como siguiente paso después de este.
</div>
`,
      quiz('¿Por qué se recomienda empezar con HTML, CSS y JavaScript "planos" en vez de un framework más avanzado?',
        ['Porque los frameworks no existen', 'Porque son suficientes para una primera app y evitan complejidad innecesaria que dificultaría entender lo que la IA genera', 'Porque la IA no puede generar código de frameworks', 'Porque HTML, CSS y JavaScript ya no se usan en la industria'], 1)),

    text('Tu primer prompt de construcción, paso a paso',
      'El arranque real: cómo pedirle a la IA tu primera versión funcional.',
      `
<h2>El prompt inicial: pon todo el contexto que ya tienes</h2>
<p>Recuerda tu definición de una página de la clase 2 — ahora la conviertes en tu primer prompt real. Sé específico sobre el stack (de la clase anterior) y pide un solo archivo para empezar:</p>

<div class="example">
<strong>Prompt inicial de ejemplo:</strong><br>
<code>Quiero construir una app de lista de tareas simple, en un solo archivo HTML con CSS y JavaScript incluidos (sin archivos separados, sin frameworks). Funciones: agregar una tarea escribiendo texto y presionando Enter, marcar una tarea como completada con un clic (se tacha visualmente), eliminar una tarea con un botón, y que las tareas se guarden en localStorage para que no se pierdan al cerrar la pestaña. Hazlo con un diseño simple y limpio, colores suaves. Dame el código completo del archivo.</code>
</div>

<h2>Guarda y prueba de inmediato</h2>
<ol>
<li>Copia el código que te dio la IA en un archivo nuevo, por ejemplo <code>mi-app.html</code>.</li>
<li>Ábrelo directamente en tu navegador (doble clic en el archivo, o arrástralo a una pestaña).</li>
<li>Pruébalo de verdad: agrega una tarea, márcala, ciérralo, vuelve a abrirlo.</li>
</ol>

<h2>La primera versión casi nunca es perfecta — y está bien</h2>
<p>Como viste en <em>Trucos y Consejos</em>, la primera respuesta rara vez es la final. Es normal que algo no se vea exactamente como imaginabas, o que falte un detalle. El siguiente paso es <strong>iterar</strong>, no empezar de cero.</p>

<h2>Cómo pedir ajustes específicos</h2>
<table>
<tr><th>Lo que ves</th><th>Cómo pedirlo</th></tr>
<tr><td>El botón de eliminar está en el lugar equivocado</td><td>"Mueve el botón de eliminar a la derecha de cada tarea, no debajo."</td></tr>
<tr><td>Falta un detalle visual</td><td>"Agrega un contador que muestre cuántas tareas quedan pendientes."</td></tr>
<tr><td>Algo no funciona como esperabas</td><td>Ve a la siguiente clase — depuración es su propio proceso.</td></tr>
</table>

<div class="tip">
💡 Mantén la misma conversación con la IA para todos los ajustes de tu app — así conserva el contexto completo de lo que ya construyó, en vez de que tengas que reexplicar todo desde cero cada vez.
</div>
`,
      quiz('¿Qué deberías hacer si la primera versión de tu app no es exactamente como la imaginabas?',
        ['Abandonar el proyecto inmediatamente', 'Seguir en la misma conversación e iterar con ajustes específicos, en vez de empezar de cero', 'Aceptar la versión imperfecta sin pedir cambios', 'Cambiar completamente de idea de app'], 1)),

    text('Cuando algo no funciona: depurar con ayuda de IA',
      'El paso que todo el mundo teme, convertido en un proceso simple y repetible.',
      `
<h2>Un error no es un fracaso — es información</h2>
<p>Que algo no funcione a la primera es completamente normal, incluso para programadores con años de experiencia. La diferencia entre alguien frustrado y alguien productivo no es "nunca tener errores" — es saber qué hacer cuando aparecen.</p>

<h2>El método de tres pasos</h2>
<ol>
<li><strong>Describe exactamente qué esperabas vs. qué pasó realmente.</strong> No solo "no funciona" — sé específico.</li>
<li><strong>Si hay un mensaje de error, cópialo completo.</strong> La mayoría de los navegadores muestran errores en las "herramientas de desarrollador" (clic derecho → "Inspeccionar" → pestaña "Consola").</li>
<li><strong>Pega ambas cosas (descripción + error) en tu conversación con la IA.</strong></li>
</ol>

<div class="example">
<strong>Antes (vago, difícil de ayudar):</strong> "Mi botón no funciona."<br>
<strong>Después (específico, fácil de ayudar):</strong> "Cuando hago clic en el botón 'Agregar tarea', no pasa nada — no se agrega ninguna tarea a la lista, y la consola muestra este error: 'Uncaught TypeError: Cannot read properties of null'. Aquí está mi código completo: [pega el código]"
</div>

<h2>Cómo encontrar el mensaje de error (consola del navegador)</h2>
<table>
<tr><th>Navegador</th><th>Cómo abrir la consola</th></tr>
<tr><td>Chrome / Edge</td><td>Clic derecho en la página → "Inspeccionar" → pestaña "Console"</td></tr>
<tr><td>Firefox</td><td>Clic derecho → "Inspeccionar" → pestaña "Consola"</td></tr>
<tr><td>Safari</td><td>Activa el menú "Desarrollar" en Preferencias primero, luego "Mostrar consola de JavaScript"</td></tr>
</table>

<h2>Pide que explique antes de corregir</h2>
<p>Como viste en <em>El Gran Repositorio de Prompts</em>, pedirle a la IA que explique la causa antes de corregir te ayuda a entender qué pasó — y la próxima vez, quizás puedas resolverlo tú mismo sin ayuda.</p>

<h2>Si el error persiste después de un intento</h2>
<p>Dile explícitamente a la IA: "eso no resolvió el problema, sigue pasando lo mismo" — y vuelve a describir el comportamiento actual. No asumas que el segundo intento automáticamente lo arregló sin volver a probar tú mismo.</p>

<div class="warn">
⚠️ Prueba SIEMPRE tú mismo después de cada corrección. No asumas que "la IA dijo que ya está arreglado" significa que de verdad funciona — verifica antes de seguir avanzando.
</div>
`,
      quiz('¿Cuál es la diferencia entre "mi botón no funciona" y un buen reporte de error?',
        ['No hay ninguna diferencia', 'Un buen reporte describe exactamente qué esperabas vs. qué pasó, e incluye el mensaje de error completo de la consola del navegador', 'Un buen reporte siempre debe ser más corto', 'Solo importa el tamaño del código, no la descripción'], 1)),

    text('Dale vida a tu app: guarda y organiza datos',
      'De localStorage a opciones más robustas, según lo que tu app realmente necesite.',
      `
<h2>Repaso: qué ya tienes con localStorage</h2>
<p>Si seguiste la clase 3, tu app ya guarda datos en <code>localStorage</code> — un almacén simple dentro del propio navegador de cada persona. Es perfecto para empezar, pero tiene límites que vale la pena conocer.</p>

<h2>Las limitaciones de localStorage</h2>
<table>
<tr><th>Limitación</th><th>Qué significa en la práctica</th></tr>
<tr><td>Es local a un solo navegador</td><td>Si abres tu app desde otro dispositivo, no ves los mismos datos.</td></tr>
<tr><td>Se puede perder</td><td>Si alguien borra los datos del navegador, o usa modo incógnito, los datos desaparecen.</td></tr>
<tr><td>No se comparte entre usuarios</td><td>Si quieres que varias personas usen la misma app con datos compartidos, localStorage no alcanza.</td></tr>
</table>

<h2>¿Cuándo necesitas algo más robusto?</h2>
<p>Si tu app es solo para ti, en un dispositivo, localStorage puede ser suficiente para siempre. Si necesitas que tus datos te sigan entre dispositivos, o que varias personas compartan información, necesitas una <strong>base de datos real</strong> con un servidor detrás — un paso más avanzado, pero con opciones gratuitas para empezar.</p>

<h2>Opciones gratuitas para dar el siguiente paso</h2>
<table>
<tr><th>Servicio</th><th>Qué ofrece</th></tr>
<tr><td>Supabase</td><td>Base de datos con un nivel gratuito generoso, pensado para que la conectes fácilmente desde una app web.</td></tr>
<tr><td>Firebase (Google)</td><td>Alternativa similar, con base de datos y autenticación de usuarios incluida.</td></tr>
</table>
<p>Pídele a tu asistente de IA, con tu definición de app de la clase 2 a la mano: "Quiero conectar mi app a [Supabase/Firebase] para que mis datos se guarden en la nube en vez de solo en localStorage. Guíame paso a paso, empezando por crear la cuenta gratuita."</p>

<div class="warn">
⚠️ En cuanto conectes una base de datos real, aparecen consideraciones de seguridad (¿quién puede leer o modificar qué datos?) que no existían con localStorage. Para una app personal simple, las reglas por defecto de estos servicios suelen bastar — para una app que otros usuarios usarán, pídele a la IA explícitamente que te ayude a configurar permisos de acceso correctos antes de compartirla.
</div>

<div class="tip">
💡 Para este curso, localStorage es suficiente — este módulo existe para que sepas que existe un siguiente nivel, cuando (y si) lo necesites.
</div>
`,
      quiz('¿Cuál es una limitación real de guardar datos solo con localStorage?',
        ['No tiene ninguna limitación', 'Es local a un solo navegador — no se comparte entre dispositivos ni entre distintos usuarios', 'Solo funciona en Google Chrome', 'Requiere pagar una suscripción mensual'], 1)),

    text('Pruébala de verdad antes de mostrarla a nadie',
      'La diferencia entre "parece que funciona" y "de verdad funciona".',
      `
<h2>Por qué "se ve bien" no es lo mismo que "funciona bien"</h2>
<p>Es fácil probar solo el camino feliz: agregas una tarea, se ve bien, das por hecho que todo funciona. Los problemas reales casi siempre aparecen en los <strong>casos límite</strong> — situaciones que no probaste a propósito.</p>

<h2>Una lista de casos límite para probar cualquier app simple</h2>
<table>
<tr><th>Caso límite</th><th>Qué revisar</th></tr>
<tr><td>Campo vacío</td><td>¿Qué pasa si presionas "Agregar" sin escribir nada?</td></tr>
<tr><td>Texto muy largo</td><td>¿Se ve bien una tarea con una oración muy larga?</td></tr>
<tr><td>Caracteres especiales</td><td>¿Funciona si escribes emojis, comillas, o símbolos raros?</td></tr>
<tr><td>Muchos elementos</td><td>¿Sigue funcionando bien con 50 tareas en la lista?</td></tr>
<tr><td>Recargar la página</td><td>¿Los datos siguen ahí después de refrescar?</td></tr>
<tr><td>Otro navegador o dispositivo</td><td>¿Se ve razonable en tu teléfono, no solo en tu computadora?</td></tr>
</table>

<h2>Pídele a la IA que piense en casos límite por ti</h2>
<p>Como viste en <em>El Gran Repositorio de Prompts</em>: <code>"¿Qué casos límite no estoy considerando en esta app? Dame una lista para probar."</code> — un prompt simple que puede revelar problemas que no se te hubieran ocurrido.</p>

<h2>Prueba en un dispositivo distinto al que la construiste</h2>
<p>Si construiste tu app en una computadora, ábrela también en tu teléfono antes de darla por terminada — muchos problemas de diseño solo se notan en pantallas más pequeñas.</p>

<h2>Pide una segunda opinión humana</h2>
<div class="tip">
💡 Antes de publicarla, pídele a alguien más que la use sin darle instrucciones — obsérvalo (o pregúntale después) dónde se confundió. Los problemas que tú ya no ves (porque conoces tu propia app de memoria) suelen ser obvios para alguien que la usa por primera vez.
</div>
`,
      quiz('¿Por qué es importante probar "casos límite" (campo vacío, texto muy largo, muchos elementos) en vez de solo el uso normal?',
        ['No es importante, solo hay que probar el uso normal', 'Porque los problemas reales casi siempre aparecen en situaciones que no probaste a propósito, no en el camino feliz esperado', 'Porque los casos límite son más fáciles de probar', 'Porque las apps nunca tienen errores en el uso normal'], 1)),

    text('Publícala gratis: tu app con una dirección real en internet',
      'De un archivo en tu computadora a algo que cualquiera puede visitar.',
      `
<h2>Opciones gratuitas para publicar</h2>
<table>
<tr><th>Servicio</th><th>Ideal para</th></tr>
<tr><td><strong>GitHub Pages</strong></td><td>Apps simples de HTML/CSS/JavaScript, gratis, directamente desde un repositorio de GitHub — si tomaste <em>Git y GitHub</em>, ya tienes lo necesario para esto.</td></tr>
<tr><td><strong>Vercel</strong></td><td>Apps más complejas también, con un flujo muy simple de publicar conectando tu repositorio.</td></tr>
<tr><td><strong>Netlify</strong></td><td>Alternativa similar a Vercel, también con un nivel gratuito generoso.</td></tr>
</table>

<h2>El camino más simple: GitHub Pages</h2>
<ol>
<li>Sube tu archivo <code>mi-app.html</code> (renómbralo a <code>index.html</code>) a un repositorio nuevo en GitHub.</li>
<li>En la configuración del repositorio, busca la sección "Pages".</li>
<li>Activa GitHub Pages, eligiendo la rama principal como fuente.</li>
<li>En unos minutos, tu app tendrá una dirección pública, algo como <code>tu-usuario.github.io/tu-repositorio</code>.</li>
</ol>

<div class="tip">
💡 Si no recuerdas cómo subir archivos a un repositorio de GitHub, el curso <em>Git y GitHub: de Cero a Experto</em> de esta escuela tiene una consola interactiva dedicada exactamente a eso.
</div>

<h2>Comparte tu app y pide retroalimentación</h2>
<p>Una vez publicada, compártela con alguien y observa cómo la usa sin darle instrucciones — es la prueba final, más allá de lo que ya probaste tú mismo en la clase anterior.</p>

<h2>Un recordatorio importante sobre datos</h2>
<div class="warn">
⚠️ Si tu app usa localStorage (clase 6), recuerda que los datos son <strong>locales al navegador de cada persona</strong> que la visite — cada quien tendrá su propia lista de tareas separada, no una compartida. Eso está perfecto para una app personal; si quisieras datos compartidos entre usuarios, necesitarías la base de datos real que viste como siguiente paso.
</div>

<h2>Ya lo lograste</h2>
<p>Si llegaste hasta aquí con una app funcionando y publicada: felicidades, de verdad — construiste algo real de principio a fin, usando exactamente el proceso que usan los desarrolladores profesionales cuando trabajan con IA: definir, construir, depurar, probar, publicar.</p>
`,
      quiz('¿Qué necesitas tener en cuenta si tu app usa localStorage y la compartes públicamente con otras personas?',
        ['Nada especial, todos verán los mismos datos', 'Los datos son locales al navegador de cada persona — cada quien tendrá su propia información separada, no compartida', 'localStorage no funciona en apps publicadas', 'Es obligatorio usar una base de datos real antes de publicar cualquier app'], 1)),

    text('Qué sigue: mantenimiento, límites del vibe coding, y tu próximo proyecto',
      'Cierre honesto sobre cuándo este enfoque basta, y cuándo necesitas más.',
      `
<h2>Mantener tu app viva</h2>
<p>Publicar no es el final — si encuentras un error después, o quieres agregar una función nueva, el proceso es el mismo que ya conoces: descríbelo a la IA, prueba el cambio, y vuelve a publicar. Guarda el enlace a tu conversación original (o a tu Proyecto, si usas Claude — ver <em>Domina Claude</em>) para no perder el contexto acumulado.</p>

<h2>Los límites honestos del vibe coding</h2>
<table>
<tr><th>Funciona muy bien para...</th><th>Necesita más cuidado (o un desarrollador con experiencia) para...</th></tr>
<tr><td>Proyectos personales y prototipos</td><td>Software que maneja datos sensibles de otras personas (salud, finanzas, identidad)</td></tr>
<tr><td>Herramientas internas simples</td><td>Apps con muchos usuarios simultáneos y necesidades de rendimiento serias</td></tr>
<tr><td>Aprender y experimentar</td><td>Sistemas donde un error de seguridad tendría consecuencias reales importantes</td></tr>
<tr><td>Validar una idea rápido, antes de invertir más</td><td>Software que necesita mantenerse y escalar por años, con un equipo</td></tr>
</table>

<div class="warn">
⚠️ Como viste en <em>Actualidad de la IA</em>: el vibe coding es excelente para prototipos y aprendizaje. Para cualquier proyecto real con datos de usuarios reales o dinero de por medio, la revisión de alguien con experiencia técnica sigue siendo indispensable — no opcional.
</div>

<h2>Tu próximo proyecto</h2>
<p>Ahora que ya recorriste el proceso completo una vez, elige tu segunda app — algo un poco más ambicioso que la primera. Aplica exactamente el mismo método: define, elige stack, construye, depura, prueba, publica.</p>

<h2>Sigue aprendiendo en esta escuela</h2>
<table>
<tr><th>Si quieres...</th><th>Ve a...</th></tr>
<tr><td>Entender mejor el control de versiones para proyectos más grandes</td><td>Git y GitHub: de Cero a Experto</td></tr>
<tr><td>Profundizar en programación "de verdad"</td><td>Los cursos de la Escuela de Programación de esta plataforma</td></tr>
<tr><td>Automatizar tareas combinando Python e IA</td><td>Automatización con Python e IA (esta misma academia)</td></tr>
<tr><td>Entender cómo piensan los modelos que usaste</td><td>Aprendizaje Automático: Cómo Piensa una Máquina</td></tr>
</table>

<div class="tip">
💡 El curso terminó, pero el hábito que construiste — definir antes de construir, iterar en vez de empezar de cero, probar casos límite, verificar antes de confiar — te va a servir en cualquier proyecto futuro, con o sin IA de por medio.
</div>
`,
      quiz('Según el cierre del curso, ¿para qué tipo de proyecto sigue siendo indispensable la revisión de alguien con experiencia técnica?',
        ['Para cualquier prototipo personal simple', 'Para proyectos reales con datos sensibles de usuarios, dinero de por medio, o consecuencias serias si algo sale mal', 'El vibe coding nunca necesita revisión adicional', 'Solo para apps que nunca se van a publicar'], 1)),
  ],
}
