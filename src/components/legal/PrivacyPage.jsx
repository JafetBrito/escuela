import LegalLayout, { LegalSection } from './LegalLayout'

export default function PrivacyPage() {
  return (
    <LegalLayout title="Aviso de Privacidad" updated="20 de agosto de 2026">
      <p>
        Oliver Academy es una escuela en línea. Creemos que la educación abierta y bien
        acompañada ayuda a construir un mundo más sabio, y ese mismo cuidado lo aplicamos a
        los datos de quienes estudian con nosotros — especialmente cuando son niñas, niños o
        adolescentes.
      </p>

      <LegalSection title="1. ¿Quién es responsable de tus datos?">
        <p>
          Oliver Academy [pendiente: agregar razón social / nombre legal y país]. Para
          cualquier duda o solicitud sobre tus datos, escribe a{' '}
          <strong>[pendiente: correo de contacto]</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué datos recopilamos">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>De la cuenta:</strong> nombre o apodo, correo electrónico, contraseña (guardada de forma cifrada por nuestro proveedor de autenticación, nunca en texto plano).</li>
          <li><strong>De aprendizaje:</strong> cursos tomados, progreso, calificaciones, tareas entregadas, misiones completadas, experiencia (XP) y monedas ganadas.</li>
          <li><strong>De uso de la mascota IA:</strong> los mensajes que le escribes se envían al proveedor de inteligencia artificial que tú (o la escuela, cuando aplique) haya conectado, para poder responderte. No usamos esas conversaciones para entrenar modelos de IA de terceros.</li>
          <li><strong>De clases en vivo:</strong> si te unes a una clase en video, el proveedor de videollamada (actualmente Jitsi) procesa audio/video durante la sesión.</li>
          <li><strong>Técnicos:</strong> preferencias guardadas en tu dispositivo (localStorage) para que tu progreso no se pierda si tu conexión falla, e información básica de uso para detectar errores.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Cuentas de niñas, niños y adolescentes">
        <p>
          Una cuenta para un menor de edad la crea un padre, madre o tutor — no el menor
          directamente — y queda pendiente de aprobación por un administrador antes de poder
          usarse. El padre/tutor puede solicitar en cualquier momento ver, corregir o eliminar
          los datos de esa cuenta escribiendo a nuestro correo de contacto. No mostramos
          publicidad ni vendemos datos de ninguna cuenta, y menos aún de cuentas infantiles.
        </p>
      </LegalSection>

      <LegalSection title="4. Con quién compartimos datos">
        <p>No vendemos tus datos. Los compartimos únicamente con los proveedores que necesitamos para operar la escuela:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Supabase</strong> — base de datos, autenticación y almacenamiento de progreso.</li>
          <li><strong>Google</strong> — si eliges iniciar sesión con tu cuenta de Google.</li>
          <li><strong>Jitsi</strong> — videollamadas durante clases en vivo.</li>
          <li><strong>Proveedores de IA</strong> (por ejemplo DeepSeek, OpenAI, Anthropic o Google) — solo los mensajes que le escribes a tu mascota o a un personaje del campus, y solo al proveedor que esté conectado en ese momento.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Cuánto tiempo guardamos tus datos">
        <p>
          Mientras tu cuenta esté activa. Si quieres eliminar tu cuenta y tus datos, escríbenos
          a nuestro correo de contacto y lo haremos en un plazo razonable, salvo que la ley nos
          obligue a conservar algún registro.
        </p>
      </LegalSection>

      <LegalSection title="6. Tus derechos">
        <p>
          Puedes pedirnos acceder a tus datos, corregirlos, eliminarlos, o retirar tu
          consentimiento en cualquier momento, escribiendo a nuestro correo de contacto.
        </p>
      </LegalSection>

      <LegalSection title="7. Seguridad">
        <p>
          Tus datos están protegidos por políticas de acceso a nivel de base de datos (cada
          cuenta solo puede leer su propia información, salvo el personal administrativo
          autorizado) y conexiones cifradas (HTTPS). Ninguna plataforma es 100% infalible, pero
          trabajamos activamente para mantener esta información segura.
        </p>
      </LegalSection>

      <LegalSection title="8. Cambios a este aviso">
        <p>
          Si cambiamos algo importante en cómo manejamos tus datos, lo anunciaremos dentro de
          la plataforma antes de que entre en vigor.
        </p>
      </LegalSection>

      <p className="pt-4 text-xs text-text-muted/70">
        Este documento es un punto de partida y no sustituye asesoría legal profesional —
        antes de operar públicamente con cuentas de menores de edad, revísalo con un abogado
        familiarizado con protección de datos de menores en tu país.
      </p>
    </LegalLayout>
  )
}
