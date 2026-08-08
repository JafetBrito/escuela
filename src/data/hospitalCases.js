// Casos rápidos para el rol Doctor de "Oliver Cyber Range: Hospital" —
// elección múltiple simple (síntomas → tratamiento correcto), pensado para
// resolverse en segundos: cada acierto estabiliza al hospital en tiempo
// real mientras un Hacker intenta bajarle la seguridad. No es contenido
// médico real para diagnóstico — es un juego educativo, mismo espíritu que
// courseMedicina.js.
export const HOSPITAL_PATIENT_CASES = [
  {
    id: 'fiebre-alta',
    patient: 'Paciente de 8 años, fiebre de 39°C, dolor de garganta y ganglios inflamados.',
    options: ['Aplicar hielo directo en la piel', 'Antibiótico si confirma infección bacteriana + control de fiebre', 'Ignorar, se le pasa solo', 'Cirugía inmediata'],
    correct: 1,
    explanation: 'Fiebre + garganta + ganglios sugiere infección — se confirma el tipo y se trata la fiebre mientras tanto, nunca hielo directo (quema la piel).',
  },
  {
    id: 'dolor-pecho',
    patient: 'Hombre de 55 años, dolor opresivo en el pecho que se extiende al brazo izquierdo, sudoración fría.',
    options: ['Darle un antiácido y mandarlo a casa', 'Activar protocolo de emergencia cardíaca de inmediato', 'Esperar a ver si se le pasa en una hora', 'Solo darle agua'],
    correct: 1,
    explanation: 'Dolor opresivo al brazo + sudoración fría son señales clásicas de un posible infarto — es una emergencia que no se espera.',
  },
  {
    id: 'reaccion-alergica',
    patient: 'Paciente con hinchazón facial repentina, dificultad para respirar tras comer mariscos.',
    options: ['Darle antihistamínico leve y observar sin prisa', 'Aplicar epinefrina — posible shock anafiláctico', 'Darle café para despertarlo', 'No es urgente'],
    correct: 1,
    explanation: 'Hinchazón + dificultad respiratoria tras un alérgeno conocido es anafilaxia — requiere epinefrina de inmediato, no antihistamínico solo.',
  },
  {
    id: 'deshidratacion',
    patient: 'Niño con diarrea de 2 días, boca seca, poca orina y decaído.',
    options: ['Suero de rehidratación oral', 'Solo dejarlo dormir', 'Darle más lácteos', 'No darle líquidos hasta que pare la diarrea'],
    correct: 0,
    explanation: 'Los signos (boca seca, poca orina, decaimiento) son de deshidratación — la rehidratación oral es el tratamiento estándar inmediato.',
  },
  {
    id: 'fractura',
    patient: 'Paciente cayó de una bicicleta, brazo deformado y muy dolorido al moverlo.',
    options: ['Forzar el brazo a su posición normal', 'Inmovilizar y enviar a radiografía', 'Solo dar un analgésico y mandarlo a casa', 'Aplicar calor intenso en la zona'],
    correct: 1,
    explanation: 'Ante una posible fractura, se inmoviliza sin forzar nada y se confirma con imagen — mover el hueso sin saber el tipo de fractura puede empeorarla.',
  },
  {
    id: 'hipoglucemia',
    patient: 'Paciente diabético, confundido, tembloroso y sudando frío antes del almuerzo.',
    options: ['Darle insulina extra', 'Darle algo con azúcar de absorción rápida', 'Dejarlo dormir la confusión', 'No darle nada hasta el almuerzo'],
    correct: 1,
    explanation: 'Confusión + temblor + sudor frío antes de comer en un diabético sugiere azúcar BAJA (hipoglucemia) — insulina la bajaría aún más, es al revés.',
  },
  {
    id: 'quemadura',
    patient: 'Paciente se quemó la mano con agua hirviendo, piel roja y con ampollas.',
    options: ['Reventar las ampollas de inmediato', 'Enfriar con agua corriente tibia/fría y cubrir sin apretar', 'Aplicar mantequilla o aceite', 'Aplicar hielo directo'],
    correct: 1,
    explanation: 'Agua corriente fresca (no helada) baja la temperatura de la piel de forma segura — mantequilla, aceite y hielo directo son mitos que dañan más.',
  },
  {
    id: 'convulsion',
    patient: 'Paciente con epilepsia conocida tiene una convulsión en la sala de espera.',
    options: ['Sujetarlo con fuerza para que no se mueva', 'Meterle algo en la boca para que no se muerda', 'Despejar el área, proteger su cabeza y cronometrar', 'Darle agua inmediatamente'],
    correct: 2,
    explanation: 'Durante una convulsión no se sujeta ni se mete nada en la boca (riesgo de lesión) — se despeja el área, se protege la cabeza y se cronometra la duración.',
  },
]
