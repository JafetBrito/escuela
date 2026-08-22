import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Autenticación de dos factores (2FA)" (course-ciberseguridad-basica, módulo 4).
const SLIDES = [
  { id: 'cyb4_1', audioFile: 'cyb4_1.wav', durationFrames: 218, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="🔐 2FA: el candado extra">
      <Body>Autenticación de dos factores.</Body>
    </Slide>
  )},
  { id: 'cyb4_2', audioFile: 'cyb4_2.wav', durationFrames: 209, render: () => (
    <Slide eyebrow="Por qué funciona" title="Aunque tengan tu contraseña...">
      <Box kind="tip">Sin el código de tu celular, no pueden entrar.</Box>
    </Slide>
  )},
  { id: 'cyb4_3', audioFile: 'cyb4_3.wav', durationFrames: 274, render: () => (
    <Slide eyebrow="La mejor opción" title="📱 App de autenticación, no SMS">
      <Body>Google Authenticator es más segura que recibir el código por mensaje de texto.</Body>
    </Slide>
  )},
  { id: 'cyb4_4', audioFile: 'cyb4_4.wav', durationFrames: 232, render: () => (
    <Slide eyebrow="Por dónde empezar" title="📧 Actívalo primero en tu correo">
      <Body>Es la cuenta que un atacante usaría para resetear todas las demás.</Body>
    </Slide>
  )},
]

export function CyberTema4() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA4_TOTAL_FRAMES = totalFrames(SLIDES)
