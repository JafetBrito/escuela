import LegalLayout, { LegalSection, L } from './LegalLayout'

const UL = 'list-disc space-y-1 pl-5'

export default function TermsPage() {
  return (
    <LegalLayout title="Términos de Uso">
      <p>
        Al crear una cuenta o usar Oliver Academy aceptas estos términos. Si tu cuenta es para
        un menor de edad, quien la crea (madre, padre o tutor) acepta estos términos en su
        nombre. Estos términos aplican en México, España y Canadá; ninguna parte de ellos
        limita los derechos que la ley de tu país te reconoce como consumidor.
      </p>

      <LegalSection title="1. Quién presta el servicio">
        <ul className={UL}>
          <li><strong>Prestador:</strong> {L('name')} (Oliver Academy).</li>
          <li><strong>Domicilio:</strong> {L('address')}.</li>
          <li><strong>Correo de contacto:</strong> {L('email')}.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Qué es Oliver Academy">
        <p>
          Una escuela en línea con cursos, mascotas guía con inteligencia artificial, un mundo
          3D opcional, minijuegos, misiones y clases en vivo. Estamos en fase alpha: algunas
          funciones pueden cambiar, tener errores o estar incompletas mientras seguimos
          construyendo. Los cursos son de carácter educativo y divulgativo; no sustituyen
          asesoría profesional (médica, legal, financiera ni de seguridad) ni otorgan
          títulos con validez oficial.
        </p>
      </LegalSection>

      <LegalSection title="3. Cuentas">
        <ul className={UL}>
          <li>Debes dar información real y mantener tu contraseña en privado.</li>
          <li>Necesitas tener la edad legal para consentir en tu país (14 años en España; en México y Canadá, ser mayor de edad) o que tu madre, padre o tutor cree la cuenta por ti.</li>
          <li>Las cuentas de menores las crea un padre/tutor y requieren aprobación de un administrador antes de usarse.</li>
          <li>Eres responsable de la actividad que ocurra en tu cuenta. Avísanos si sospechas un uso no autorizado.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Acceso, gratuidad y suscripción">
        <p>
          Durante la fase alpha el acceso es gratuito. Cuando exista un plan de suscripción
          (mensual o anual) lo anunciaremos con anticipación, y nunca cobraremos sin tu
          aceptación expresa. Al contratar en el futuro te informaremos de precio, impuestos,
          renovación y cómo cancelar, y respetaremos el derecho de desistimiento o retracto que
          te reconozca la ley de tu país (por ejemplo, 14 días en la Unión Europea para
          contratos a distancia, salvo que hayas pedido acceso inmediato al contenido digital).
        </p>
      </LegalSection>

      <LegalSection title="5. La mascota y los personajes con IA">
        <p>
          Las respuestas de tu mascota y de los personajes del campus las genera un modelo de
          inteligencia artificial de un tercero. Pueden equivocarse o dar información
          desactualizada — no las trates como fuente única de verdad, y consulta a tu profesor
          o a una fuente confiable ante cualquier duda importante. Tú decides qué proveedor de
          IA conectas y eres responsable de las condiciones y costos de tu propia llave.
        </p>
      </LegalSection>

      <LegalSection title="6. Buen uso de la comunidad">
        <p>Al usar funciones que involucran a otras personas (chat, foro, ajedrez en línea, clases en vivo, amigos), te comprometes a:</p>
        <ul className={UL}>
          <li>Tratar a otros estudiantes y profesores con respeto.</li>
          <li>No compartir contenido ofensivo, ilegal, discriminatorio o inapropiado para menores.</li>
          <li>No acosar, suplantar identidades ni compartir datos personales de otras personas.</li>
          <li>No hacer trampa ni explotar errores del sistema para obtener ventajas indebidas (XP, monedas, calificaciones), ni intentar acceder a datos o funciones que no te correspondan.</li>
        </ul>
        <p>
          Podemos moderar el contenido (incluido un filtro automático de palabras) y suspender
          o cerrar cuentas que incumplan estas reglas.
        </p>
      </LegalSection>

      <LegalSection title="7. Contenido de los cursos y tu contenido">
        <p>
          El contenido de los cursos (videos, textos, ejercicios) es propiedad de Oliver
          Academy o de quien lo licenció para la plataforma. Puedes usarlo para tu aprendizaje
          personal; no está permitido redistribuirlo ni revenderlo sin permiso.
        </p>
        <p>
          Lo que tú publiques (mensajes, tareas, notas, fotos) sigue siendo tuyo; nos das
          permiso limitado para almacenarlo y mostrarlo dentro de la plataforma según la
          función que uses, y garantizas que tienes derecho a compartirlo.
        </p>
      </LegalSection>

      <LegalSection title="8. Ciberseguridad y uso responsable de lo aprendido">
        <p>
          Los cursos y juegos de seguridad informática (hacking ético, phishing, terminales
          simuladas) son para aprender a defender sistemas. Solo puedes practicar técnicas
          fuera de la plataforma sobre sistemas propios o con autorización expresa; usarlas
          contra terceros sin permiso puede ser delito en tu país y es motivo de baja.
          Tampoco está permitido atacar o intentar vulnerar Oliver Academy; si encuentras una
          falla, repórtala a {L('email')}.
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios y cierre del servicio">
        <p>
          Podemos actualizar estos términos y lo avisaremos dentro de la plataforma antes de
          que el cambio entre en vigor. Si discontinuamos el servicio, avisaremos con
          anticipación razonable y te permitiremos, cuando sea posible, descargar o solicitar
          tus datos.
        </p>
      </LegalSection>

      <LegalSection title="10. Límite de responsabilidad">
        <p>
          Oliver Academy se ofrece "tal cual", especialmente durante esta fase alpha. Hacemos
          nuestro mejor esfuerzo por mantener la plataforma funcionando, pero no garantizamos
          que esté libre de errores o interrupciones. En la medida que la ley lo permita, no
          respondemos por daños indirectos derivados del uso del servicio. Nada de lo anterior
          excluye responsabilidades que la ley no permita excluir ni tus derechos como
          consumidor.
        </p>
      </LegalSection>

      <LegalSection title="11. Ley aplicable y reclamaciones">
        <ul className={UL}>
          <li><strong>México:</strong> estos términos se rigen por las leyes mexicanas aplicables; como consumidor puedes acudir a la Procuraduría Federal del Consumidor (PROFECO).</li>
          <li><strong>España:</strong> rige la legislación española y de la Unión Europea; como consumidor conservas el fuero de tu domicilio y puedes recurrir a las hojas de reclamaciones de consumo de tu comunidad autónoma y a la plataforma europea de resolución de litigios en línea.</li>
          <li><strong>Canadá:</strong> rigen las leyes de tu provincia o territorio y las federales aplicables; si vives en Quebec, la Ley de Protección del Consumidor de Quebec y tus derechos de consumidor se mantienen íntegros.</li>
        </ul>
        <p>Antes de cualquier reclamación formal, te pedimos escribirnos: casi siempre lo resolvemos rápido.</p>
      </LegalSection>

      <LegalSection title="12. Contacto">
        <p>Dudas sobre estos términos o sobre tus datos: <strong>{L('email')}</strong>.</p>
      </LegalSection>
    </LegalLayout>
  )
}
