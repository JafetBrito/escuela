import LegalLayout, { LegalSection } from './LegalLayout'

export default function TermsPage() {
  return (
    <LegalLayout title="Términos de Uso" updated="20 de agosto de 2026">
      <p>
        Al crear una cuenta o usar Oliver Academy aceptas estos términos. Si tu cuenta es para
        un menor de edad, quien la crea (padre, madre o tutor) acepta estos términos en su
        nombre.
      </p>

      <LegalSection title="1. Qué es Oliver Academy">
        <p>
          Una escuela en línea con cursos, mascotas guía con inteligencia artificial, un mundo
          3D opcional, minijuegos, misiones y clases en vivo. Actualmente estamos en fase alpha:
          algunas funciones pueden cambiar, tener errores, o estar incompletas mientras seguimos
          construyendo.
        </p>
      </LegalSection>

      <LegalSection title="2. Cuentas">
        <ul className="list-disc space-y-1 pl-5">
          <li>Debes dar información real y mantener tu contraseña en privado.</li>
          <li>Las cuentas de menores de edad las crea un padre/tutor y requieren aprobación de un administrador antes de poder usarse.</li>
          <li>Eres responsable de la actividad que ocurra en tu cuenta.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Acceso y suscripción">
        <p>
          Durante la fase alpha, el acceso a la plataforma es gratuito mientras terminamos de
          definir el modelo de suscripción. Cuando esté disponible, el plan de suscripción
          (mensual o anual) dará acceso a todos los cursos; lo anunciaremos con anticipación
          antes de activar cualquier cobro, y nunca cobraremos sin que lo hayas aceptado
          explícitamente.
        </p>
      </LegalSection>

      <LegalSection title="4. La mascota y los personajes con IA">
        <p>
          Las respuestas de tu mascota y de los personajes del campus las genera un modelo de
          inteligencia artificial de un tercero. Pueden equivocarse, dar información
          desactualizada o inexacta — no las trates como una fuente única de verdad, y consulta
          a tu profesor o a una fuente confiable ante cualquier duda importante.
        </p>
      </LegalSection>

      <LegalSection title="5. Buen uso de la comunidad">
        <p>Al usar funciones que involucran a otras personas (chat, ajedrez en línea, clases en vivo, amigos), te comprometes a:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Tratar a otros estudiantes y profesores con respeto.</li>
          <li>No compartir contenido ofensivo, ilegal o inapropiado para el resto de la comunidad.</li>
          <li>No hacer trampa ni explotar errores del sistema para obtener ventajas (XP, monedas, calificaciones) de forma indebida.</li>
        </ul>
        <p>Podemos suspender o cerrar cuentas que incumplan estas reglas.</p>
      </LegalSection>

      <LegalSection title="6. Contenido de los cursos">
        <p>
          El contenido de los cursos (videos, textos, ejercicios) es propiedad de Oliver Academy
          o de quien lo licenció para la plataforma. Puedes usarlo para tu aprendizaje personal;
          no está permitido redistribuirlo ni revenderlo sin permiso.
        </p>
      </LegalSection>

      <LegalSection title="7. Cambios y cierre de servicio">
        <p>
          Podemos actualizar estos términos, y lo avisaremos dentro de la plataforma antes de
          que el cambio entre en vigor. Si en algún momento discontinuamos el servicio, avisaremos
          con anticipación razonable.
        </p>
      </LegalSection>

      <LegalSection title="8. Límite de responsabilidad">
        <p>
          Oliver Academy se ofrece "tal cual", especialmente durante esta fase alpha. Hacemos
          nuestro mejor esfuerzo por mantener la plataforma funcionando correctamente, pero no
          garantizamos que esté libre de errores en todo momento.
        </p>
      </LegalSection>

      <LegalSection title="9. Contacto">
        <p>Dudas sobre estos términos: <strong>[pendiente: correo de contacto]</strong>.</p>
      </LegalSection>

      <p className="pt-4 text-xs text-text-muted/70">
        Este documento es un punto de partida y no sustituye asesoría legal profesional —
        revísalo con un abogado antes de operar públicamente, sobre todo una vez que se active
        el cobro de suscripciones.
      </p>
    </LegalLayout>
  )
}
