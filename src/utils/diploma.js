// Genera un diploma autocontenido (HTML + CSS inline, sin dependencias
// externas) para descargar cuando un alumno se gradúa de un curso — ver
// ExamPage.jsx. `downloadDiploma` dispara la descarga vía Blob, sin backend.

export function buildDiplomaHtml({ studentName, courseTitle, date }) {
  const formattedDate = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Diploma — ${courseTitle}</title>
<style>
  body { margin: 0; padding: 3rem 1rem; background: #f4ede1; font-family: Georgia, 'Times New Roman', serif; display: flex; justify-content: center; }
  .diploma { width: 100%; max-width: 800px; background: #fffdf7; border: 14px double #b8860b; border-radius: 8px; padding: 3rem 3.5rem; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
  .brand { font-size: 0.9rem; letter-spacing: 0.3em; text-transform: uppercase; color: #b8860b; font-weight: bold; }
  h1 { font-size: 2.2rem; margin: 1rem 0 0.25rem; color: #2c2415; }
  .subtitle { font-size: 1rem; color: #6b5d45; margin-bottom: 2rem; }
  .name { font-size: 2rem; margin: 1.5rem 0; color: #1a1408; font-weight: bold; border-bottom: 2px solid #b8860b; display: inline-block; padding-bottom: 0.5rem; }
  .course { font-size: 1.3rem; margin: 1rem 0; color: #2c2415; font-style: italic; }
  .date { margin-top: 2rem; font-size: 0.95rem; color: #6b5d45; }
  .seal { font-size: 3rem; margin-top: 1.5rem; }
  .footer { margin-top: 2rem; font-size: 0.8rem; color: #9a8b6f; }
</style>
</head>
<body>
  <div class="diploma">
    <p class="brand">🐱 Oliver Academy</p>
    <h1>Diploma de Graduación</h1>
    <p class="subtitle">Se otorga el presente diploma a</p>
    <p class="name">${studentName}</p>
    <p class="subtitle">por haber completado exitosamente el curso</p>
    <p class="course">"${courseTitle}"</p>
    <p class="date">Otorgado el ${formattedDate}</p>
    <p class="seal">🎓</p>
    <p class="footer">Oliver Academy — este documento certifica la finalización del curso dentro de la plataforma.</p>
  </div>
</body>
</html>`
}

export function downloadDiploma(html, filename) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
