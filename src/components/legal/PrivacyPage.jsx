import LegalLayout, { LegalSection, L } from './LegalLayout'

const UL = 'list-disc space-y-1 pl-5'

export default function PrivacyPage() {
  return (
    <LegalLayout title="Aviso de Privacidad">
      <p>
        Oliver Academy es una escuela en línea. Creemos que la educación abierta y bien
        acompañada ayuda a construir un mundo más sabio, y ese mismo cuidado lo aplicamos a
        los datos de quienes estudian con nosotros — especialmente cuando son niñas, niños o
        adolescentes. Este aviso aplica a personas que usan la plataforma desde México,
        España y Canadá, los países donde operamos hoy; al final indicamos qué reglas
        adicionales te protegen según dónde vivas.
      </p>

      <LegalSection title="1. Quién es responsable de tus datos">
        <ul className={UL}>
          <li><strong>Responsable:</strong> {L('name')} (Oliver Academy).</li>
          <li><strong>Domicilio para notificaciones:</strong> {L('address')}.</li>
          <li><strong>Contacto para cualquier solicitud sobre tus datos:</strong> {L('email')}.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Qué datos recopilamos">
        <ul className={UL}>
          <li><strong>De la cuenta:</strong> nombre o apodo, correo electrónico, contraseña (guardada de forma cifrada por nuestro proveedor de autenticación, nunca en texto plano) y, si la tienes, fecha de cumpleaños para el mensaje de felicitación.</li>
          <li><strong>De aprendizaje:</strong> cursos tomados, progreso, calificaciones, tareas entregadas, misiones, experiencia (XP), monedas y logros.</li>
          <li><strong>De comunidad:</strong> lista de amigos, mensajes en foro, chat y clases en vivo, y fotos de perfil que tú subas.</li>
          <li><strong>De uso de la mascota IA:</strong> los mensajes que le escribes se envían al proveedor de inteligencia artificial que tú (o la escuela) haya conectado, para poder responderte. No usamos esas conversaciones para entrenar modelos de IA de terceros. La llave de tu proveedor se guarda cifrada en el servidor.</li>
          <li><strong>De clases en vivo:</strong> si te unes a una clase en video, el proveedor de videollamada (Jitsi) procesa audio y video durante la sesión.</li>
          <li><strong>Técnicos:</strong> preferencias guardadas en tu dispositivo (almacenamiento local) para que tu progreso no se pierda si falla la conexión, e información básica de uso para detectar errores. No usamos cookies publicitarias ni de rastreo.</li>
        </ul>
        <p>No solicitamos datos sensibles (salud, origen étnico, religión, biometría). Si escribes alguno voluntariamente en un chat, un foro o una nota, es responsabilidad tuya no compartir datos de terceros.</p>
      </LegalSection>

      <LegalSection title="3. Para qué usamos tus datos (finalidades)">
        <ul className={UL}>
          <li>Crear y mantener tu cuenta y darte acceso a los cursos.</li>
          <li>Guardar tu progreso, calificar tareas y emitir constancias de graduación.</li>
          <li>Permitir la interacción con amistades, profesores y compañeros (chat, foro, clases en vivo, juegos).</li>
          <li>Responder tus mensajes con la mascota y los personajes de IA.</li>
          <li>Mantener la seguridad de la plataforma, prevenir abusos y detectar errores.</li>
          <li>Enviarte avisos del servicio (aprobación de cuenta, recordatorios de clase, cambios a estos textos).</li>
        </ul>
        <p>Finalidad secundaria y opcional: mostrar tu perfil público de progreso si tú decides compartirlo. Puedes desactivarlo cuando quieras.</p>
      </LegalSection>

      <LegalSection title="4. Cuentas de niñas, niños y adolescentes">
        <p>
          Una cuenta para un menor la crea su madre, padre o tutor — no el menor directamente
          — y queda pendiente de aprobación por un administrador antes de usarse. Con esa
          creación, quien ejerce la patria potestad o tutela da el consentimiento por el
          menor, y puede en cualquier momento ver, corregir o eliminar los datos de la cuenta
          escribiendo a nuestro correo. Las cuentas de menores tienen funciones sociales
          reducidas. No mostramos publicidad ni vendemos datos de ninguna cuenta, y menos
          aún de cuentas infantiles.
        </p>
      </LegalSection>

      <LegalSection title="5. Con quién compartimos datos y transferencias internacionales">
        <p>No vendemos tus datos. Los compartimos solo con proveedores necesarios para operar la escuela, que actúan por nuestra cuenta:</p>
        <ul className={UL}>
          <li><strong>Supabase</strong> — base de datos, autenticación y almacenamiento.</li>
          <li><strong>Vercel</strong> — alojamiento del sitio web.</li>
          <li><strong>Google</strong> — solo si eliges iniciar sesión con tu cuenta de Google.</li>
          <li><strong>Jitsi</strong> — videollamadas de clases en vivo.</li>
          <li><strong>Proveedores de IA</strong> (por ejemplo DeepSeek, OpenAI, Anthropic, Google) — solo los mensajes que escribes a tu mascota o a un personaje, y solo al proveedor conectado en ese momento.</li>
        </ul>
        <p>
          Estos proveedores pueden tratar datos en servidores fuera de tu país (por ejemplo
          en Estados Unidos). Al usar la plataforma aceptas esas transferencias, necesarias
          para prestar el servicio. Para usuarios de España, se apoyan en cláusulas
          contractuales tipo aprobadas por la Comisión Europea u otras garantías adecuadas.
          También podemos compartir datos cuando una autoridad competente lo exija por ley.
        </p>
      </LegalSection>

      <LegalSection title="6. Cuánto tiempo guardamos tus datos">
        <p>
          Mientras tu cuenta esté activa. Si pides eliminar tu cuenta, borramos tus datos en
          un plazo razonable, salvo los que la ley nos obligue a conservar y solo por el
          tiempo que lo exija. Las copias de seguridad de nuestro proveedor pueden conservar
          los datos por un tiempo adicional limitado antes de sobrescribirse.
        </p>
      </LegalSection>

      <LegalSection title="7. Tus derechos y cómo ejercerlos">
        <p>
          Puedes pedirnos acceder a tus datos, corregirlos, eliminarlos u oponerte a su uso, y
          retirar tu consentimiento en cualquier momento, escribiendo a {L('email')} desde el
          correo de tu cuenta. Responderemos en el plazo que fije la ley de tu país (abajo).
          Para atender tu solicitud podremos pedirte confirmar tu identidad.
        </p>
      </LegalSection>

      <LegalSection title="8. Seguridad">
        <p>
          Tus datos están protegidos por políticas de acceso a nivel de base de datos (cada
          cuenta solo puede leer su propia información, salvo el personal administrativo
          autorizado), conexiones cifradas (HTTPS) y llaves de terceros cifradas en el
          servidor. Ninguna plataforma es infalible: si ocurriera una vulneración que afecte
          de forma significativa tus datos, te lo notificaremos y, cuando la ley lo exija,
          también a la autoridad de tu país.
        </p>
      </LegalSection>

      <LegalSection title="9. Reglas adicionales según tu país">
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-text">🇲🇽 México</h3>
            <p>
              Tratamos tus datos conforme a la Ley Federal de Protección de Datos Personales en
              Posesión de los Particulares (LFPDPPP). Tienes los derechos de <strong>acceso,
              rectificación, cancelación y oposición (ARCO)</strong>: envía tu solicitud a{' '}
              {L('email')} indicando tu nombre, el correo de tu cuenta, qué derecho ejerces y
              una descripción clara de tu petición; te responderemos en un máximo de 20 días
              hábiles y, si procede, la haremos efectiva en los 15 días hábiles siguientes.
              Si consideras que se vulneraron tus derechos puedes acudir a la autoridad de
              protección de datos personales en México (Secretaría Anticorrupción y Buen
              Gobierno).
            </p>
          </div>
          <div>
            <h3 className="font-bold text-text">🇪🇸 España (y Unión Europea)</h3>
            <p>
              Aplican el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica
              3/2018 (LOPDGDD). La base que usamos es la ejecución del servicio que solicitas,
              tu consentimiento (por ejemplo para el perfil público) y nuestro interés
              legítimo en la seguridad de la plataforma. Además de acceso, rectificación y
              supresión, tienes derecho a <strong>limitación del tratamiento, portabilidad y
              oposición</strong>, y a no ser objeto de decisiones únicamente automatizadas con
              efectos jurídicos. En España, el menor de <strong>14 años o más</strong> puede
              consentir por sí mismo; por debajo de esa edad se requiere autorización de
              madre, padre o tutor. Respondemos en un mes. Puedes reclamar ante la Agencia
              Española de Protección de Datos (aepd.es).
            </p>
          </div>
          <div>
            <h3 className="font-bold text-text">🇨🇦 Canadá</h3>
            <p>
              Aplican la Ley de Protección de la Información Personal y los Documentos
              Electrónicos (PIPEDA) y, si vives en Quebec, la Ley 25 sobre protección de la
              información personal en el sector privado. Recopilamos solo lo necesario, con tu
              consentimiento, y para menores exigimos el de su madre, padre o tutor. Puedes
              acceder a tu información, pedir correcciones y retirar tu consentimiento;
              respondemos en un máximo de 30 días. Nuestro responsable de privacidad es
              quien figura en la sección 1. Si no quedas conforme, puedes acudir al
              Comisionado de Privacidad de Canadá (priv.gc.ca) o, en Quebec, a la Commission
              d'accès à l'information.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="10. Cambios a este aviso">
        <p>
          Si cambiamos algo importante en cómo manejamos tus datos, lo anunciaremos dentro de
          la plataforma antes de que entre en vigor. La fecha de la última actualización
          aparece al inicio.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
