-- ════════════════════════════════════════════════════════════════════════
-- SEED — Examen de graduación de course-003 (Ingeniería de Prompts) + las
-- 2 tareas que hay que calificar para poder graduarse
-- ════════════════════════════════════════════════════════════════════════
-- Este script NO es una migración de esquema (esa es migration_017.sql,
-- que hay que correr primero) — es contenido real: el banco de 21 preguntas
-- del examen (español + inglés, ver course_exams.translations) reutiliza
-- exactamente las mismas preguntas/respuestas que ya tiene cada módulo del
-- curso en src/data/coursePromptEngineering.js y su traducción al inglés,
-- así que no hay riesgo de inconsistencia con el contenido real del curso.
--
-- Las 2 tareas se asignan al alumno más reciente (mismo criterio que el
-- DEMO SEED de más abajo en este archivo) — bórralas o reasígnalas a un
-- alumno específico desde /admin/tareas si lo necesitas.

do $$
declare
  target_student uuid;
  target_admin   uuid;
begin
  select id into target_student from public.profiles where role = 'student' order by updated_at asc limit 1;
  select id into target_admin   from public.profiles where role = 'admin'   order by updated_at asc limit 1;

  if target_student is null then
    raise notice 'No hay ningún alumno (role=student) todavía — crea una cuenta normal primero y vuelve a correr este script.';
    return;
  end if;

  -- ── Examen (base español + traducción al inglés) ─────────────────────
  insert into public.course_exams (course_id, title, pass_score, questions_to_show, questions, translations, created_by)
  values (
    'course-003',
    'Examen final: Ingeniería de Prompts',
    70,
    15,
    '[
      {"id":"pe-q1","question":"¿Qué vas a aprender en este curso?","options":["A programar en Python","A diseñar prompts efectivos para modelos de IA","A entrenar modelos de IA desde cero","A usar hojas de cálculo"],"correct":1},
      {"id":"pe-q2","question":"¿Qué es la ingeniería de prompts?","options":["Programar en un lenguaje especial para IAs","Diseñar instrucciones efectivas para modelos de lenguaje","Entrenar modelos de IA desde cero","Configurar servidores de IA"],"correct":1},
      {"id":"pe-q3","question":"¿Cuál de estos NO es parte del framework RCTFS?","options":["Rol","Contexto","Temperatura","Formato"],"correct":2},
      {"id":"pe-q4","question":"¿Qué define al zero-shot prompting?","options":["Usar cero palabras en el prompt","No dar ejemplos — solo instrucciones","No usar el modelo sin entrenamiento previo","Limitar la respuesta a cero tokens"],"correct":1},
      {"id":"pe-q5","question":"¿Cuántos ejemplos se recomienda usar en few-shot para la mayoría de tareas?","options":["0-1","3-5","10-20","50+"],"correct":1},
      {"id":"pe-q6","question":"¿Qué hace la técnica Chain-of-Thought?","options":["Une múltiples prompts en secuencia","Hace que el modelo razone paso a paso antes de responder","Conecta la IA con internet para buscar información","Encadena llamadas a diferentes modelos"],"correct":1},
      {"id":"pe-q7","question":"¿Qué mejora principalmente el role prompting?","options":["La velocidad de respuesta del modelo","La precisión matemática","El tono, perspectiva y dominio de conocimiento activado","La longitud de las respuestas"],"correct":2},
      {"id":"pe-q8","question":"¿Qué instrucción añadirías para garantizar JSON válido sin markdown?","options":["Responde como desarrollador","Responde SOLO con JSON válido, sin texto antes ni después","Piensa paso a paso en JSON","Usa formato formal"],"correct":1},
      {"id":"pe-q9","question":"¿Qué información es MÁS importante incluir al pedir ayuda con un bug?","options":["El nombre del archivo","El mensaje de error completo + el código relevante + comportamiento esperado vs actual","Solo el código","Solo el mensaje de error"],"correct":1},
      {"id":"pe-q10","question":"¿Cuál es la mejor estrategia para analizar un documento muy largo (>10,000 palabras)?","options":["Enviar todo de una vez y esperar","Dividir en partes, analizar cada una, sintetizar al final","Pedirle a la IA que lo reduzca primero","Solo analizar la introducción y conclusión"],"correct":1},
      {"id":"pe-q11","question":"¿Qué mejora más la calidad creativa de la IA?","options":["Pedirle que sea creativa","Darle restricciones específicas e inusuales","Pedirle más alternativas","Usar modelos más grandes"],"correct":1},
      {"id":"pe-q12","question":"¿Qué temperatura usarías para extraer datos en formato JSON de manera consistente?","options":["1.5","0.9","0.0","0.5"],"correct":2},
      {"id":"pe-q13","question":"¿Cuál es la principal ventaja del prompt chaining?","options":["Usar menos tokens","Resolver tareas complejas dividiendo en pasos más manejables","Hacer que la IA piense más rápido","Evitar la necesidad de ejemplos"],"correct":1},
      {"id":"pe-q14","question":"¿Qué significa el acrónimo ReAct en prompt engineering?","options":["Retrieve and Contextualize","Reasoning and Acting","Real-time Action Chain","Recursive Autonomous Thinking"],"correct":1},
      {"id":"pe-q15","question":"¿Cuál es la principal diferencia entre CoT y ToT?","options":["CoT usa más tokens","ToT explora múltiples caminos de razonamiento en lugar de uno solo","CoT requiere ejemplos, ToT no","ToT solo funciona con GPT-4"],"correct":1},
      {"id":"pe-q16","question":"¿Qué es el prompt injection indirecto?","options":["Inyectar prompts en el código fuente","Insertar instrucciones maliciosas en datos externos que la IA procesará","Atacar el servidor donde corre la IA","Usar demasiados tokens para colapsar el modelo"],"correct":1},
      {"id":"pe-q17","question":"¿Qué es el meta-prompting?","options":["Usar prompts muy largos","Usar una IA para diseñar o mejorar prompts para otra IA","Crear prompts para metaverso","Técnica para usar menos tokens"],"correct":1},
      {"id":"pe-q18","question":"¿Qué es LLM-as-Judge?","options":["Usar la IA como árbitro legal","Usar un LLM para evaluar el output de otro LLM","Dejar que la IA juzgue prompts en competencias","Sistema de puntuación automático para chatbots"],"correct":1},
      {"id":"pe-q19","question":"¿Por qué se recomienda versionar los prompts de producción como código?","options":["Para cumplir requisitos legales","Para poder hacer rollback, documentar cambios y hacer A/B testing","Porque los LLMs lo requieren","Para ahorrar tokens"],"correct":1},
      {"id":"pe-q20","question":"¿Qué son los «negative prompts» en generación de imágenes?","options":["Prompts que generan imágenes oscuras","Instrucciones de qué NO debe aparecer en la imagen","Prompts en inglés negativo","Errores en el prompt"],"correct":1},
      {"id":"pe-q21","question":"¿Cuál de estas NO es una buena práctica para un portafolio de prompts?","options":["Versionar cada prompt como si fuera código","Incluir ejemplos reales de output","Documentar para qué modelo fue optimizado","Mantenerlo en secreto y nunca compartirlo"],"correct":3}
    ]'::jsonb,
    ('{"en": {"title": "Final Exam: Prompt Engineering", "questions": [
      {"id":"pe-q1","question":"What will you learn in this course?","options":["How to program in Python","How to design effective prompts for AI models","How to train AI models from scratch","How to use spreadsheets"],"correct":1},
      {"id":"pe-q2","question":"What is prompt engineering?","options":["Programming in a special AI language","Designing effective instructions for language models","Training AI models from scratch","Configuring AI servers"],"correct":1},
      {"id":"pe-q3","question":"Which of these is NOT part of the RCTFS framework?","options":["Role","Context","Temperature","Format"],"correct":2},
      {"id":"pe-q4","question":"What defines zero-shot prompting?","options":["Using zero words in the prompt","Giving no examples — only instructions","Not using the model without prior training","Limiting the response to zero tokens"],"correct":1},
      {"id":"pe-q5","question":"How many examples are recommended for few-shot in most tasks?","options":["0-1","3-5","10-20","50+"],"correct":1},
      {"id":"pe-q6","question":"What does the Chain-of-Thought technique do?","options":["Joins multiple prompts in sequence","Makes the model reason step by step before answering","Connects the AI to the internet to search for information","Chains calls to different models"],"correct":1},
      {"id":"pe-q7","question":"What does role prompting mainly improve?","options":["The model’s response speed","Mathematical accuracy","Tone, perspective and the knowledge domain activated","The length of responses"],"correct":2},
      {"id":"pe-q8","question":"What instruction would you add to guarantee valid JSON with no markdown?","options":["Respond like a developer","Respond ONLY with valid JSON, no text before or after","Think step by step in JSON","Use a formal format"],"correct":1},
      {"id":"pe-q9","question":"What information is MOST important to include when asking for help with a bug?","options":["The file name","The complete error message + the relevant code + expected vs actual behavior","Only the code","Only the error message"],"correct":1},
      {"id":"pe-q10","question":"What is the best strategy for analyzing a very long document (>10,000 words)?","options":["Send it all at once and wait","Split it into parts, analyze each one, synthesize at the end","Ask the AI to shorten it first","Only analyze the introduction and conclusion"],"correct":1},
      {"id":"pe-q11","question":"What most improves the AI’s creative quality?","options":["Asking it to be creative","Giving it specific, unusual constraints","Asking for more alternatives","Using bigger models"],"correct":1},
      {"id":"pe-q12","question":"What temperature would you use to extract data in JSON format consistently?","options":["1.5","0.9","0.0","0.5"],"correct":2},
      {"id":"pe-q13","question":"What is the main advantage of prompt chaining?","options":["Using fewer tokens","Solving complex tasks by splitting them into more manageable steps","Making the AI think faster","Avoiding the need for examples"],"correct":1},
      {"id":"pe-q14","question":"What does the acronym ReAct stand for in prompt engineering?","options":["Retrieve and Contextualize","Reasoning and Acting","Real-time Action Chain","Recursive Autonomous Thinking"],"correct":1},
      {"id":"pe-q15","question":"What is the main difference between CoT and ToT?","options":["CoT uses more tokens","ToT explores multiple reasoning paths instead of just one","CoT requires examples, ToT doesn’t","ToT only works with GPT-4"],"correct":1},
      {"id":"pe-q16","question":"What is indirect prompt injection?","options":["Injecting prompts into source code","Inserting malicious instructions into external data the AI will process","Attacking the server the AI runs on","Using too many tokens to crash the model"],"correct":1},
      {"id":"pe-q17","question":"What is meta-prompting?","options":["Using very long prompts","Using an AI to design or improve prompts for another AI","Creating prompts for the metaverse","A technique to use fewer tokens"],"correct":1},
      {"id":"pe-q18","question":"What is LLM-as-Judge?","options":["Using AI as a legal referee","Using one LLM to evaluate the output of another LLM","Letting the AI judge prompts in competitions","An automatic scoring system for chatbots"],"correct":1},
      {"id":"pe-q19","question":"Why is it recommended to version production prompts like code?","options":["To comply with legal requirements","To be able to roll back, document changes and run A/B tests","Because LLMs require it","To save tokens"],"correct":1},
      {"id":"pe-q20","question":"What are “negative prompts” in image generation?","options":["Prompts that generate dark images","Instructions for what should NOT appear in the image","Prompts written in negative English","Errors in the prompt"],"correct":1},
      {"id":"pe-q21","question":"Which of these is NOT a good practice for a prompt portfolio?","options":["Versioning each prompt like code","Including real output examples","Documenting which model it was optimized for","Keeping it secret and never sharing it"],"correct":3}
    ]}}')::jsonb,
    target_admin
  )
  on conflict (course_id) do update set
    title = excluded.title,
    pass_score = excluded.pass_score,
    questions_to_show = excluded.questions_to_show,
    questions = excluded.questions,
    translations = excluded.translations,
    updated_at = now();

  -- ── Las 2 tareas que hay que calificar para poder graduarse ──────────
  insert into public.student_tasks (student_id, title, description, subject, type, details, assigned_by)
  values (
    target_student,
    'Proyecto: Framework RCTFS aplicado',
    'Elige un caso de uso real (tuyo o de tu trabajo/estudio) y escribe un prompt completo usando el framework RCTFS (Rol, Contexto, Tarea, Formato, Sin-restricciones) visto en el módulo 2. Entrega el prompt final en un archivo .md, explicando brevemente cada una de las 5 partes.',
    'Programación',
    'proyecto',
    jsonb_build_object(
      'linkedLesson', jsonb_build_object(
        'courseId', 'course-003',
        'moduleId', 2,
        'courseTitle', 'Ingeniería de Prompts: De Cero a Experto',
        'moduleTitle', 'Anatomía de un Prompt Perfecto'
      ),
      'deliverables', jsonb_build_array('Prompt final en formato RCTFS', 'Explicación de cada parte (Rol/Contexto/Tarea/Formato/Restricciones)')
    ),
    target_admin
  );

  insert into public.student_tasks (student_id, title, description, subject, type, details, assigned_by)
  values (
    target_student,
    'Tarea: Mejora un prompt con Meta-Prompting',
    'Toma un prompt tuyo que no haya funcionado tan bien como esperabas. Usa la técnica de meta-prompting del módulo 16 (pide a una IA que analice y mejore tu prompt) y entrega en un archivo .md: el prompt original, el meta-prompt que usaste, y la versión mejorada — con una breve explicación de qué cambió y por qué.',
    'Programación',
    'tarea',
    jsonb_build_object(
      'linkedLesson', jsonb_build_object(
        'courseId', 'course-003',
        'moduleId', 16,
        'courseTitle', 'Ingeniería de Prompts: De Cero a Experto',
        'moduleTitle', 'Meta-Prompting: IA para crear Prompts'
      )
    ),
    target_admin
  );

  raise notice 'Examen de course-003 y 2 tareas de graduación creadas para el alumno %', target_student;
end $$;
