// Preguntas del curso 2D "Protégete del Phishing" — mismo shape que
// hospitalCases.js (id/opciones/correcta/explicación), pensado para
// resolverse en segundos al llegar a cada escritorio del mapa. No hay
// historia ni personajes, es directamente el contenido del curso.
export const PHISHING_OFFICE_QUESTIONS = [
  {
    id: 'remitente-falso',
    deskLabel: 'Escritorio 1 · El remitente',
    scenario: 'Te llega un correo de "soporte@bancoseguro-alertas.com" diciendo que tu cuenta del "Banco Seguro" fue bloqueada. ¿Qué es lo primero que revisas?',
    options: [
      'El logo del banco en el correo — se ve profesional',
      'El dominio real del remitente — "bancoseguro-alertas.com" no es el dominio oficial del banco',
      'Si el correo tiene faltas de ortografía únicamente',
      'La hora en que llegó el correo',
    ],
    correct: 1,
    explanation: 'Un logo se copia fácil. El dominio real del remitente es lo que no se puede falsificar sin que se note — "bancoseguro-alertas.com" es un dominio distinto al banco real, típico truco de phishing.',
  },
  {
    id: 'enlaces-sospechosos',
    deskLabel: 'Escritorio 2 · Los enlaces',
    scenario: 'Un correo te pide "verificar tu cuenta" con un botón. Antes de hacer clic, pasas el mouse sobre el botón (sin clickear) y ves la URL de destino. ¿Qué buscas ahí?',
    options: [
      'Que la URL empiece con "https://" nada más',
      'Que el dominio de la URL coincida exactamente con el sitio real de la empresa',
      'Que la URL sea corta',
      'No hace falta revisar nada si el botón dice "Verificar cuenta"',
    ],
    correct: 1,
    explanation: '"https://" solo indica que la conexión está encriptada, no que el sitio sea legítimo — hasta un sitio falso puede tener candado. Lo que importa es que el dominio coincida exactamente con el real.',
  },
  {
    id: 'urgencia',
    deskLabel: 'Escritorio 3 · La urgencia',
    scenario: 'El asunto del correo dice: "⚠️ ACCIÓN URGENTE: tu cuenta se cierra en 2 horas si no confirmas tus datos AHORA." ¿Qué señal de phishing es esta?',
    options: [
      'Ninguna, las empresas reales también avisan así',
      'Presión de urgencia/miedo para que actúes sin pensar — táctica clásica de ingeniería social',
      'Es solo un mal diseño de correo',
      'Significa que el correo es muy importante y confiable',
    ],
    correct: 1,
    explanation: 'Crear pánico ("2 horas o pierdes tu cuenta") es una táctica deliberada: quiere que actúes rápido, sin pararte a verificar. Las empresas reales no suelen amenazar con plazos de horas por correo.',
  },
  {
    id: 'adjuntos',
    deskLabel: 'Escritorio 4 · Los adjuntos',
    scenario: 'Recibes una "factura pendiente" de un proveedor que no reconoces, con un archivo .zip adjunto. ¿Qué haces?',
    options: [
      'Lo abres para ver de qué trata, por curiosidad',
      'No lo abres — un adjunto inesperado de un remitente desconocido es una de las formas más comunes de instalar malware',
      'Lo reenvías a un compañero para que lo revise primero',
      'Lo abres solo si tu antivirus está actualizado',
    ],
    correct: 1,
    explanation: 'Un archivo comprimido inesperado de alguien que no reconoces es una bandera roja clásica — muchos ataques de malware/ransomware empiezan exactamente así. Ni el antivirus más actualizado es garantía total.',
  },
  {
    id: 'verificar-otro-canal',
    deskLabel: 'Escritorio 5 · Verificar por otro canal',
    scenario: 'Un correo que parece venir de tu jefe te pide comprar tarjetas de regalo urgentemente y enviarle los códigos. ¿Cuál es la forma más segura de confirmar que es real?',
    options: [
      'Responder al mismo correo preguntando si es él',
      'Contactar a tu jefe por un canal DISTINTO (teléfono, mensaje directo ya conocido) para confirmar antes de actuar',
      'Comprar las tarjetas rápido para no hacerlo esperar',
      'Revisar si el correo tiene la firma con su nombre',
    ],
    correct: 1,
    explanation: 'Responder al mismo correo no sirve — si es phishing, le respondes al atacante. Verificar por un canal totalmente distinto (una llamada, un chat que ya usabas antes) es la única forma confiable de confirmar identidad.',
  },
  {
    id: 'reportar',
    deskLabel: 'Escritorio 6 · Reportar a tiempo',
    scenario: 'Sin querer hiciste clic en un enlace de phishing y pusiste tu contraseña. ¿Cuál es tu primer paso?',
    options: [
      'No decir nada para no meterte en problemas',
      'Cambiar esa contraseña de inmediato (y en cualquier otro sitio donde la hayas reutilizado) y reportarlo a tu equipo de TI/seguridad',
      'Esperar a ver si pasa algo malo antes de actuar',
      'Borrar el correo y ya',
    ],
    correct: 1,
    explanation: 'Actuar rápido limita el daño: cambiar la contraseña (y en cualquier otro sitio donde la hayas reutilizado) y avisar a seguridad para que puedan proteger la cuenta y alertar a otros. Quedarte callado le da más tiempo al atacante.',
  },
]
