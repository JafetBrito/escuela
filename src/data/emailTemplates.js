// Plantillas de arranque para /admin/correos. Viven en código (no en la
// base de datos) porque son un punto de partida fijo que no se edita — el
// admin las carga en el editor y de ahí en adelante puede modificarlas o
// guardarlas como una plantilla nueva en email_templates.
//
// HTML con estilos inline a propósito: los clientes de correo no soportan de
// forma confiable <style> ni CSS externo, así que cada elemento lleva su
// propio style="..." en vez de depender de las clases de Tailwind de esta
// app (que aquí no sirven de nada, este HTML va a un email, no al DOM de
// oliver-escuela).
const PRIMARY = '#f97316' // var(--color-primary) del tema por defecto (src/index.css)

function wrapper(bodyHtml) {
  return `<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;color:#1f2937;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
  <div style="background:${PRIMARY};padding:24px 32px;">
    <h1 style="margin:0;font-size:20px;color:#ffffff;">Escuela Oliver</h1>
  </div>
  <div style="padding:32px;line-height:1.6;font-size:15px;">
    ${bodyHtml}
  </div>
  <div style="background:#f8fafc;padding:16px 32px;font-size:12px;color:#94a3b8;text-align:center;">
    Escuela Oliver — este correo fue enviado desde el panel de administración.
  </div>
</div>`
}

export const emailTemplates = [
  {
    id: 'welcome',
    name: 'Bienvenida a la escuela',
    subject: '¡Bienvenido/a a Escuela Oliver!',
    html: wrapper(`
    <p>¡Hola!</p>
    <p>Te damos la bienvenida a <strong>Escuela Oliver</strong>. Tu cuenta ya está lista y puedes entrar cuando quieras para empezar tus cursos, revisar tus tareas y conocer a tus compañeros.</p>
    <p style="margin:24px 0;text-align:center;">
      <a href="https://escuelaoliver.com" style="background:${PRIMARY};color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Entrar a la escuela</a>
    </p>
    <p>Si tienes cualquier duda, responde este correo y con gusto te ayudamos.</p>
    <p>¡Nos alegra mucho tenerte aquí!</p>
  `),
  },
  {
    id: 'class-reminder',
    name: 'Recordatorio de clase en vivo',
    subject: 'Recordatorio: tu próxima clase en vivo',
    html: wrapper(`
    <p>¡Hola!</p>
    <p>Te escribimos para recordarte que tienes una <strong>clase en vivo</strong> muy pronto.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <tr>
        <td style="padding:8px 0;color:#64748b;font-size:13px;">Curso</td>
        <td style="padding:8px 0;font-weight:bold;">[Nombre del curso]</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#64748b;font-size:13px;">Fecha</td>
        <td style="padding:8px 0;font-weight:bold;">[Fecha y hora]</td>
      </tr>
    </table>
    <p style="margin:24px 0;text-align:center;">
      <a href="https://escuelaoliver.com" style="background:${PRIMARY};color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Ir a mis clases</a>
    </p>
    <p>¡Te esperamos!</p>
  `),
  },
  {
    id: 'general-announcement',
    name: 'Anuncio general',
    subject: 'Aviso importante de Escuela Oliver',
    html: wrapper(`
    <p>¡Hola!</p>
    <p>Queremos compartirte un anuncio importante:</p>
    <div style="background:#f8fafc;border-left:4px solid ${PRIMARY};padding:16px 20px;margin:20px 0;border-radius:4px;">
      <p style="margin:0;">[Escribe aquí el contenido del anuncio]</p>
    </div>
    <p>Gracias por ser parte de nuestra comunidad.</p>
  `),
  },
]
