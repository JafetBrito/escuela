// Curso "Ética e Impacto de la IA en la Sociedad". Solo texto + quizzes.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const etica = {
  id: 'course-etica-ia',
  title: 'Ética e Impacto de la IA en la Sociedad',
  description: 'Sesgos en los datos, el problema de la caja negra, el mercado laboral, la desinformación, la privacidad y el problema de alineación: las preguntas grandes que la inteligencia artificial pone sobre la mesa, explicadas con casos reales y sin caer en el miedo ni en el optimismo ciego.',
  ai_instructions: 'Eres Ada, profesora de la Academia de IA de Oliver Academy, guiando el curso "Ética e Impacto de la IA en la Sociedad". Trata estos temas con seriedad y balance, presentando distintas posturas legítimas sin caer en catastrofismo ni en optimismo ingenuo. Usa casos documentados reales cuando los menciones. Fomenta el pensamiento crítico del alumno en vez de darle una única conclusión moral cerrada, y sé especialmente cuidadosa al hablar del impacto en el empleo: presenta evidencia y proyecciones con su incertidumbre real, no como certezas.',
  icon: '🧭',
  color: '#34d399',
  category: 'Inteligencia Artificial',
  subcategory: 'Ética de la IA',
  difficulty: 'intermedio',
  locked: false,
  modules: [
    text('Bienvenida: usar la IA con los ojos abiertos',
      'Ni pánico ni fe ciega — pensamiento crítico sobre una tecnología real y presente.',
      `
<h2>Por qué este curso importa tanto como los técnicos</h2>
<p>Saber usar la IA (como viste en <em>Trucos y Consejos</em>) y saber elegir entre modelos (<em>Panorama de Modelos de IA</em>) es la mitad de la historia. La otra mitad es entender <strong>qué impacto tiene esta tecnología en la sociedad</strong> — en el trabajo, en la información que consumimos, en la privacidad, en quién queda beneficiado o perjudicado. Este curso no busca asustarte ni tranquilizarte: busca darte las herramientas para pensarlo con criterio propio.</p>

<h2>El mapa del curso</h2>
<table>
<tr><th>Parte</th><th>Qué vas a ver</th></tr>
<tr><td>1. Sesgos y la caja negra</td><td>Por qué la IA puede discriminar sin que nadie se lo haya propuesto, y por qué a veces ni sus creadores saben exactamente por qué respondió algo.</td></tr>
<tr><td>2. Desinformación y privacidad</td><td>Cómo la IA cambia estos dos problemas ya existentes.</td></tr>
<tr><td>3. Trabajo</td><td>Lo que la evidencia real dice (y no dice) sobre empleos.</td></tr>
<tr><td>4. Alineación y seguridad</td><td>La pregunta de fondo: ¿cómo aseguramos que sistemas de IA cada vez más capaces sigan haciendo lo que queremos?</td></tr>
</table>

<div class="tip">
💡 Vas a ver posturas distintas y legítimas sobre varios de estos temas — a propósito. Parte de pensar bien sobre ética de la IA es reconocer cuándo un tema es genuinamente debatible, en vez de fingir que hay una sola respuesta correcta y obvia.
</div>
`,
      quiz('¿Cuál es el objetivo de este curso?',
        ['Convencerte de que la IA es completamente peligrosa y debes evitarla', 'Convencerte de que la IA no tiene ningún riesgo', 'Darte herramientas de pensamiento crítico para evaluar el impacto real de la IA en la sociedad, sin catastrofismo ni optimismo ciego', 'Enseñarte a programar modelos de IA desde cero'], 2)),

    text('Sesgos: cuando la IA discrimina sin que nadie lo programe',
      'El problema no es (solo) mala intención — es aprender de datos que ya reflejan desigualdades reales.',
      `
<h2>De dónde vienen los sesgos</h2>
<p>Un modelo de IA aprende patrones de los datos con los que se entrena. Si esos datos reflejan desigualdades históricas reales (por ejemplo, quién tuvo acceso a ciertos trabajos o préstamos en el pasado), el modelo puede aprender y <strong>reproducir</strong> esos mismos patrones — sin que ningún programador haya escrito una regla discriminatoria explícita. El sesgo entra por los datos, no necesariamente por mala intención de quien construye el modelo.</p>

<h2>Casos documentados reales</h2>
<table>
<tr><th>Caso</th><th>Qué pasó</th></tr>
<tr><td>Herramienta de reclutamiento de una gran empresa tecnológica (2014-2018, reportado en 2018)</td><td>Un sistema de IA para filtrar currículums, entrenado con datos históricos de contrataciones pasadas (mayoritariamente de hombres en roles técnicos), aprendió a penalizar currículums que incluían la palabra "mujeres" (como en "capitana del club de ajedrez de mujeres"). La empresa lo descontinuó al detectar el problema.</td></tr>
<tr><td>Sistemas de reconocimiento facial</td><td>Estudios académicos publicados (incluido uno del MIT Media Lab, 2018) encontraron tasas de error significativamente más altas al identificar a mujeres de piel oscura que a hombres de piel clara en varios sistemas comerciales evaluados en ese momento.</td></tr>
<tr><td>Algoritmos de evaluación de riesgo en el sistema de justicia de EE. UU.</td><td>Una investigación periodística de ProPublica (2016) sobre el sistema COMPAS, usado para predecir reincidencia, encontró disparidades en las tasas de error entre grupos raciales — un caso que sigue siendo debatido metodológicamente por especialistas.</td></tr>
</table>

<h2>¿Por qué es difícil de corregir?</h2>
<p>No basta con "quitar" la información sensible (como raza o género) de los datos de entrenamiento — el modelo puede aprender <strong>indicadores indirectos</strong> correlacionados (como un código postal que se correlaciona fuertemente con raza o nivel socioeconómico) y terminar reproduciendo el mismo sesgo de forma menos visible.</p>

<h2>Qué se está haciendo al respecto</h2>
<ul>
<li>Auditorías de sesgo antes de desplegar sistemas de IA en decisiones importantes (contratación, crédito, justicia).</li>
<li>Conjuntos de datos de prueba diseñados específicamente para detectar disparidades entre grupos.</li>
<li>Regulación creciente (como viste en <em>Actualidad de la IA</em>) que exige evaluaciones de riesgo para sistemas de IA usados en decisiones de alto impacto en la vida de las personas.</li>
</ul>

<div class="tip">
💡 Como usuario, esto te da una razón concreta más para verificar decisiones importantes generadas por IA (crédito, empleo, evaluaciones) en vez de aceptarlas sin cuestionar, especialmente si te parecen inconsistentes con tu situación real.
</div>
`,
      quiz('¿Por qué puede un modelo de IA discriminar sin que ningún programador haya escrito una regla discriminatoria explícita?',
        ['Es imposible, la IA nunca puede tener sesgos', 'Porque aprende patrones de datos que pueden reflejar desigualdades históricas reales, reproduciéndolas sin intención explícita', 'Porque todos los programadores de IA son intencionalmente discriminatorios', 'Porque los modelos de IA se rebelan contra sus creadores'], 1)),

    text('El problema de la "caja negra"',
      'Cuando ni siquiera quienes construyen el modelo saben exactamente por qué respondió así.',
      `
<h2>Qué significa "caja negra" aquí</h2>
<p>Un modelo de IA moderno tiene miles de millones de parámetros ajustados durante el entrenamiento. Cuando genera una respuesta específica, es extremadamente difícil — a veces prácticamente imposible con las herramientas actuales — señalar <strong>exactamente</strong> qué combinación de esos parámetros llevó a esa respuesta particular. A esto se le llama el problema de la <strong>caja negra</strong>: se ve claramente lo que entra (el prompt) y lo que sale (la respuesta), pero el proceso interno es muy difícil de interpretar en detalle.</p>

<h2>Por qué esto importa en la práctica</h2>
<table>
<tr><th>Situación</th><th>Por qué la falta de explicabilidad es un problema</th></tr>
<tr><td>Un banco rechaza tu solicitud de crédito con ayuda de IA</td><td>Es difícil obtener una explicación precisa y verificable de por qué, más allá de una descripción general.</td></tr>
<tr><td>Un sistema médico de IA sugiere un diagnóstico</td><td>Un médico necesita entender el razonamiento para confiar en la sugerencia o detectar un error, no solo aceptar un resultado.</td></tr>
<tr><td>Un modelo se comporta de forma inesperada</td><td>Corregir el problema es más difícil si no se entiende bien la causa raíz.</td></tr>
</table>

<h2>La interpretabilidad: un campo de investigación activo</h2>
<p>La <strong>interpretabilidad mecanicista</strong> es un área de investigación (en la que Anthropic, entre otros laboratorios, invierte de forma significativa) que busca abrir esa caja negra: entender, con métodos técnicos rigurosos, qué representan internamente ciertos grupos de parámetros y cómo influyen en el comportamiento del modelo. Es un trabajo genuinamente difícil y todavía incompleto, pero con avances reales — por ejemplo, identificar qué partes de un modelo se activan al procesar ciertos conceptos.</p>

<h2>Un balance realista</h2>
<div class="warn">
⚠️ No confundas "es difícil de explicar en detalle" con "es completamente aleatorio o mágico". Un modelo de IA sigue procesos matemáticos deterministas y consistentes — el reto es que esos procesos son tan complejos que interpretarlos con precisión humana sigue siendo un desafío técnico abierto, no que no exista ningún proceso comprensible detrás.
</div>
`,
      quiz('¿Qué es el problema de la "caja negra" en la IA?',
        ['Que los modelos de IA vienen guardados en cajas físicas negras', 'Que es muy difícil determinar con precisión qué proceso interno llevó a una respuesta específica del modelo, aunque el proceso sea matemáticamente determinista', 'Que la IA nunca da respuestas consistentes', 'Que los modelos de IA no tienen ningún dato de entrenamiento'], 1)),

    text('Desinformación: cuando generar contenido falso se vuelve barato y rápido',
      'La IA no inventó la desinformación, pero cambió radicalmente su costo y escala.',
      `
<h2>Un problema viejo, con una herramienta nueva</h2>
<p>La desinformación existía mucho antes de la IA generativa. Lo que cambió es el <strong>costo y la velocidad</strong>: antes, producir contenido falso convincente y a gran escala (textos, imágenes, videos) requería recursos y tiempo considerables; hoy, herramientas de IA generativa (que viste en el curso anterior de esta academia) pueden producir grandes volúmenes de contenido falso pero creíble en minutos y a bajo costo.</p>

<h2>Formas específicas del problema</h2>
<table>
<tr><th>Forma</th><th>Ejemplo</th></tr>
<tr><td>Texto masivo generado</td><td>Artículos o comentarios en redes sociales generados en volumen para simular consenso o viralizar una narrativa falsa.</td></tr>
<tr><td>Deepfakes de audio y video</td><td>Como viste en <em>IA Generativa</em>, videos o audios que aparentan mostrar a alguien real diciendo algo que nunca dijo.</td></tr>
<tr><td>Perfiles falsos automatizados</td><td>Cuentas gestionadas por IA que interactúan de forma convincente para amplificar contenido.</td></tr>
</table>

<h2>Casos que ya han ocurrido</h2>
<p>Se han documentado incidentes de audio falso de figuras políticas circulando antes de procesos electorales en distintos países, y de imágenes falsas de eventos que nunca ocurrieron viralizándose antes de ser desmentidas — suficientes casos reales como para que gobiernos y plataformas tecnológicas hayan empezado a implementar políticas específicas al respecto (etiquetado de contenido generado por IA, verificación de identidad para publicidad política, entre otras medidas).</p>

<h2>Cómo protegerte tú, en la práctica</h2>
<ul>
<li><strong>Verifica la fuente original</strong>, no solo quién te lo compartió — un contenido puede pasar por muchas manos antes de llegar a ti.</li>
<li><strong>Desconfía de la urgencia emocional</strong> — el contenido diseñado para desinformar suele buscar una reacción inmediata que te haga compartir antes de pensar.</li>
<li><strong>Busca el mismo evento en más de una fuente confiable</strong> antes de darlo por cierto, especialmente si es sorprendente.</li>
<li><strong>Recuerda lo que ya sabes de IA generativa</strong>: hoy es técnicamente posible generar imagen, audio y video falsos convincentes de casi cualquier cosa.</li>
</ul>

<div class="tip">
💡 Esto conecta directo con la clase de <em>Trucos y Consejos</em> sobre verificar información de la propia IA — el mismo hábito de verificación te protege tanto de alucinaciones de un chatbot como de desinformación generada intencionalmente por terceros.
</div>
`,
      quiz('¿Qué cambió realmente la IA generativa respecto al problema de la desinformación?',
        ['Inventó el concepto de desinformación, que no existía antes', 'Redujo drásticamente el costo y el tiempo necesarios para producir contenido falso convincente a gran escala', 'Eliminó por completo el problema de la desinformación', 'Solo afecta a un país específico'], 1)),

    text('Privacidad: tus datos y el entrenamiento de modelos',
      'Qué preguntas hacerte antes de compartir información con una herramienta de IA.',
      `
<h2>Dos preguntas de privacidad distintas</h2>
<p>Cuando hablamos de "privacidad e IA" en realidad hay dos preocupaciones relacionadas pero distintas:</p>
<table>
<tr><th>Pregunta</th><th>De qué se trata</th></tr>
<tr><td>¿Qué pasa con lo que YO escribo en un chat de IA hoy?</td><td>Si el proveedor guarda tus conversaciones, por cuánto tiempo, y si las usa para entrenar futuros modelos.</td></tr>
<tr><td>¿Qué datos se usaron para entrenar el modelo QUE YA EXISTE?</td><td>Si esos datos de entrenamiento (a menudo recopilados de internet a gran escala) incluyeron información personal sin consentimiento explícito de las personas.</td></tr>
</table>

<h2>Sobre tus conversaciones actuales</h2>
<p>Como ya viste en <em>Trucos y Consejos</em>: revisa siempre la política de privacidad vigente del proveedor que uses, evita compartir contraseñas, datos financieros o médicos de terceros, y busca opciones de configuración que te permitan controlar si tus conversaciones se usan para entrenar modelos futuros (muchas plataformas serias ofrecen esta opción).</p>

<h2>Sobre los datos de entrenamiento históricos</h2>
<p>Entrenar un modelo de lenguaje o de imágenes a gran escala requiere enormes cantidades de datos, frecuentemente recopilados de internet de forma masiva. Esto ha generado demandas legales activas en varios países sobre si ese uso masivo de datos (incluyendo, en algunos casos, información personal o contenido protegido por derechos de autor) requería consentimiento explícito que no se obtuvo — un área legal todavía en desarrollo, sin resolución uniforme.</p>

<h2>El derecho a ser olvidado, aplicado a modelos de IA</h2>
<p>Una pregunta técnica y legal genuinamente difícil: si un modelo ya "aprendió" de tus datos durante el entrenamiento, ¿es técnicamente posible "hacer que lo olvide" sin reentrenar el modelo completo desde cero? Esta área, llamada <em>machine unlearning</em>, sigue siendo un campo de investigación activo sin soluciones perfectas todavía.</p>

<div class="warn">
⚠️ Regla práctica que ya conoces de <em>Trucos y Consejos</em>, aplicada aquí con más contexto: piensa en cualquier chat de IA como un servicio con políticas de datos reales, no como un espacio privado que desaparece sin dejar rastro.
</div>
`,
      quiz('¿Cuáles son las dos preocupaciones de privacidad distintas relacionadas con la IA que viste en esta clase?',
        ['Solo importa el precio de la suscripción', 'Qué pasa con lo que escribes en un chat hoy, y qué datos se usaron para entrenar el modelo que ya existe', 'La IA nunca tiene implicaciones de privacidad', 'Solo importa la velocidad de respuesta del modelo'], 1)),

    text('El mercado laboral: lo que la evidencia dice (y no dice)',
      'Ni "la IA quitará todos los empleos" ni "no afectará nada" — la realidad es más compleja.',
      `
<h2>Por qué esta pregunta es tan difícil de responder con certeza</h2>
<p>Predecir el impacto de la IA en el empleo es notoriamente difícil, y las proyecciones publicadas varían enormemente según los supuestos de cada estudio. Vale la pena ser escéptico de cualquier titular que presente una cifra única y definitiva ("la IA eliminará X millones de empleos para tal año") como un hecho certero, en vez de como una proyección con supuestos específicos.</p>

<h2>Un marco más útil: tareas, no empleos completos</h2>
<p>La mayoría de los estudios serios (incluyendo trabajo de organizaciones como la OCDE y el McKinsey Global Institute) distinguen entre <strong>automatizar un empleo completo</strong> (poco común, según la evidencia actual) y <strong>automatizar tareas específicas dentro de un empleo</strong> (mucho más común): la mayoría de los trabajos combinan tareas muy automatizables con otras que requieren juicio humano, relación interpersonal o creatividad — la IA suele transformar el trabajo, no eliminarlo por completo, aunque el grado de transformación varía enormemente por profesión.</p>

<h2>Precedentes históricos, con matices</h2>
<table>
<tr><th>Tecnología pasada</th><th>Lo que pasó</th></tr>
<tr><td>La mecanización agrícola</td><td>Redujo drásticamente el empleo agrícola en países desarrollados durante el siglo XX, pero liberó fuerza laboral hacia la industria y los servicios — un proceso que tomó décadas y tuvo costos sociales reales para muchas personas en el proceso.</td></tr>
<tr><td>La automatización industrial</td><td>Eliminó empleos manufactureros específicos, mientras creaba otros en diseño, mantenimiento y supervisión de esos mismos sistemas automatizados.</td></tr>
<tr><td>Internet y la computación</td><td>Eliminó ciertos roles (como muchos puestos de captura de datos) mientras creaba industrias enteras que no existían antes.</td></tr>
</table>
<p>El patrón histórico sugiere transformación más que eliminación neta — pero cada transición tuvo ganadores y perdedores reales, y no hay garantía de que el patrón se repita exactamente igual con la IA.</p>

<h2>Qué sí parece razonablemente claro</h2>
<ul>
<li>Profesiones con tareas muy rutinarias y predecibles tienen mayor exposición a la automatización.</li>
<li>Surgen roles nuevos directamente relacionados con IA (desde ingeniería de modelos hasta supervisión ética de sistemas de IA).</li>
<li>La capacidad de <strong>usar bien</strong> herramientas de IA (justo lo que viste en <em>Trucos y Consejos</em>) se está volviendo, en muchas industrias, una habilidad tan esperada como saber usar una hoja de cálculo.</li>
<li>El ritmo de adaptación (educación, políticas públicas, apoyo a quienes pierden su empleo) importa tanto como la tecnología misma para determinar el impacto social real.</li>
</ul>

<div class="tip">
💡 La conclusión más honesta: hay incertidumbre genuina sobre la magnitud exacta del impacto, pero desarrollar la habilidad de trabajar <strong>con</strong> herramientas de IA es una apuesta razonable casi sin importar cómo se resuelva el debate más amplio.
</div>
`,
      quiz('Según la evidencia que presenta esta clase, ¿qué es más común: automatizar un empleo completo, o automatizar tareas específicas dentro de un empleo?',
        ['Automatizar empleos completos es lo más común, según la evidencia actual', 'Automatizar tareas específicas dentro de un empleo es mucho más común que eliminar el empleo completo', 'Ninguna de las dos cosas ocurre nunca', 'No hay ninguna evidencia disponible sobre este tema'], 1)),

    text('El problema de alineación: la pregunta de fondo',
      'Cómo aseguramos que sistemas de IA cada vez más capaces sigan haciendo lo que realmente queremos.',
      `
<h2>Qué es el "problema de alineación"</h2>
<p>El <strong>problema de alineación</strong> es, en esencia: ¿cómo diseñamos y entrenamos sistemas de IA para que sus objetivos y comportamientos coincidan de verdad con las intenciones y valores humanos — incluso cuando esos sistemas se vuelven más capaces y se usan en situaciones que sus creadores no anticiparon exactamente?</p>

<h2>Por qué no es un problema trivial</h2>
<p>No basta con "decirle" a un modelo qué queremos en palabras — los sistemas de IA aprenden patrones de sus datos de entrenamiento y de sus señales de recompensa (como el RLHF que viste en <em>Historia de la IA</em>), y a veces esos patrones producen comportamientos técnicamente "correctos" según la señal de entrenamiento, pero no lo que realmente se pretendía.</p>

<div class="example">
<strong>Ejemplo clásico simplificado:</strong> si entrenas un sistema para "maximizar el tiempo que los usuarios pasan en una app", puede terminar optimizando por contenido adictivo o polarizante — técnicamente logró el objetivo medido, pero no necesariamente lo que sus creadores querían para el bienestar real de los usuarios. La brecha entre "lo que medimos" y "lo que realmente queremos" es el corazón del problema de alineación.
</div>

<h2>Por qué esto se vuelve más urgente con modelos más capaces</h2>
<p>Un sistema poco capaz que no está bien alineado suele fallar de formas obvias y fáciles de corregir. Un sistema mucho más capaz que no está bien alineado podría perseguir objetivos mal especificados de formas mucho más sofisticadas y difíciles de detectar a tiempo — por eso laboratorios serios de IA (Anthropic entre ellos, con su enfoque explícito de IA Constitucional que viste en <em>Domina Claude</em>) invierten recursos significativos en investigación de alineación y seguridad, no solo en aumentar capacidades.</p>

<h2>Posturas legítimas y distintas en este debate</h2>
<table>
<tr><th>Postura</th><th>Argumento central</th></tr>
<tr><td>Preocupación alta</td><td>Sistemas mucho más capaces que los actuales podrían representar riesgos serios si el problema de alineación no se resuelve a tiempo — mejor invertir fuerte en seguridad ahora.</td></tr>
<tr><td>Preocupación moderada</td><td>El riesgo es real pero manejable con las prácticas de seguridad actuales (red teaming, evaluaciones, regulación), mejorando de forma incremental junto con las capacidades.</td></tr>
<tr><td>Escepticismo sobre riesgos existenciales</td><td>Los riesgos más urgentes y comprobables hoy son los prácticos (sesgos, desinformación, empleo) que ya viste en este curso, no escenarios especulativos a largo plazo.</td></tr>
</table>
<p>Estas posturas no son mutuamente excluyentes, y personas serias e informadas dentro de la propia industria de la IA sostienen versiones distintas de cada una.</p>

<div class="tip">
💡 No hace falta que salgas de esta clase con una postura cerrada — el objetivo es que entiendas la pregunta de fondo lo suficientemente bien como para evaluar por ti mismo los argumentos que encuentres después.
</div>
`,
      quiz('¿Cuál es la pregunta central del "problema de alineación" en IA?',
        ['Cómo hacer que un modelo responda más rápido', 'Cómo asegurar que los objetivos y comportamientos de un sistema de IA coincidan de verdad con las intenciones y valores humanos, incluso al volverse más capaz', 'Cómo bajar el costo de entrenar un modelo', 'Cómo elegir el color de la interfaz de un chatbot'], 1)),

    text('Cierre: tu propio marco para pensar sobre IA y sociedad',
      'No una conclusión cerrada, sino un conjunto de preguntas que puedes aplicar a cualquier debate nuevo.',
      `
<h2>Repaso: los cinco temas grandes de este curso</h2>
<table>
<tr><th>Tema</th><th>La idea central</th></tr>
<tr><td>Sesgos</td><td>La IA puede reproducir desigualdades reflejadas en sus datos de entrenamiento, sin intención explícita.</td></tr>
<tr><td>Caja negra</td><td>Es difícil explicar con precisión por qué un modelo dio una respuesta específica.</td></tr>
<tr><td>Desinformación</td><td>La IA no inventó este problema, pero redujo drásticamente su costo y velocidad.</td></tr>
<tr><td>Privacidad</td><td>Importan tanto tus conversaciones actuales como los datos usados para entrenar el modelo.</td></tr>
<tr><td>Empleo</td><td>La evidencia apunta más a transformación de tareas que a eliminación completa de empleos, con incertidumbre real sobre la magnitud.</td></tr>
<tr><td>Alineación</td><td>Asegurar que sistemas cada vez más capaces sigan haciendo lo que realmente queremos, un desafío técnico y filosófico genuino.</td></tr>
</table>

<h2>Un marco de preguntas para cualquier debate nuevo sobre IA</h2>
<ol>
<li>¿Esta afirmación viene de evidencia documentada, o de una proyección especulativa presentada como certeza?</li>
<li>¿Quién se beneficia y quién podría verse perjudicado por esta tecnología o esta decisión específica?</li>
<li>¿Existen posturas legítimas y distintas sobre este tema, o es un consenso real entre especialistas?</li>
<li>¿Qué puedo verificar yo mismo, en vez de solo confiar en la fuente que lo presenta?</li>
</ol>

<h2>Por qué esto cierra bien la Academia de IA</h2>
<p>Empezaste con la <em>Historia de la Inteligencia Artificial</em>, aprendiste a usarla mejor en <em>Trucos y Consejos</em>, a elegir con criterio en <em>Panorama de Modelos</em>, a fondo en <em>Domina Claude</em>, y en <em>IA Generativa</em> viste su lado creativo. Este último curso cierra el círculo: entender no solo <strong>cómo usar</strong> la IA, sino <strong>qué significa</strong> que exista y siga creciendo — la parte que ningún tutorial técnico puede enseñarte por sí solo.</p>

<div class="tip">
💡 Sigue haciéndote estas preguntas cada vez que leas algo nuevo y llamativo sobre IA — es, probablemente, la habilidad más duradera de toda esta academia, la que menos caduca con el tiempo.
</div>
`,
      quiz('¿Cuál es el propósito del "marco de preguntas" que cierra este curso?',
        ['Darte una respuesta única y cerrada sobre si la IA es buena o mala', 'Darte herramientas de pensamiento crítico que puedas aplicar a cualquier debate nuevo sobre IA que encuentres en el futuro', 'Memorizar una lista de hechos sin aplicarlos después', 'Reemplazar la necesidad de seguir informándote'], 1)),
  ],
}
