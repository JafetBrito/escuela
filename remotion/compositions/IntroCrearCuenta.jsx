import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

// Duración real de cada línea de narración (medida de los .wav generados
// con TTS), + un pequeño colchón para que no se corte justo al terminar.
// Si vuelves a generar el audio con otro texto/voz, actualiza estos números
// (duración del wav en segundos * 30fps + ~15 frames de colchón).
const SCENE_FRAMES = {
  scene1: 222, // 6.87s
  scene2: 241, // 7.53s
  scene3: 335, // 10.65s
  scene4: 170, // 5.14s
  scene5: 392, // 12.58s
  scene6: 350, // 11.18s
  scene7: 155, // 4.48s
}

// Colores y textos reales de Oliver Academy (src/index.css, src/i18n/locales/es.js,
// src/components/shared/Logo.jsx) — no es un mockup genérico, es la marca real.
const BG = '#0f172a'
const PRIMARY = '#f97316'
const TEXT = '#f1f5f9'
const TEXT_MUTED = '#94a3b8'
const CARD_BG = '#1e293b'
const BORDER = '#334155'

function FadeIn({ children, delay = 0, durationInFrames = 20 }) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame - delay, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const translateY = interpolate(frame - delay, [0, durationInFrames], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return <div style={{ opacity, transform: `translateY(${translateY}px)` }}>{children}</div>
}

function Logo({ size = 64 }) {
  return (
    <span style={{ fontSize: size, fontWeight: 800, letterSpacing: -1 }}>
      <span style={{ color: TEXT }}>OLIVER</span>
      <span style={{ color: PRIMARY }}> ACADEMY</span>
    </span>
  )
}

// Rectángulo de resaltado que "respira" (pulso) alrededor de un elemento —
// simula el cursor guiando la atención, sin necesitar grabación de pantalla.
function Highlight({ x, y, width, height, radius = 12 }) {
  const frame = useCurrentFrame()
  const pulse = 1 + 0.03 * Math.sin(frame / 8)
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        borderRadius: radius,
        border: `3px solid ${PRIMARY}`,
        boxShadow: `0 0 24px ${PRIMARY}`,
        transform: `scale(${pulse})`,
        pointerEvents: 'none',
      }}
    />
  )
}

function Scene({ children }) {
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: 'Arial, sans-serif' }}>{children}</AbsoluteFill>
  )
}

// ── Escena 1: Logo de apertura (0:00–0:07 · frames 0–210) ──────────────
function SceneIntro() {
  return (
    <Scene>
      <Audio src={staticFile('audio/scene1.wav')} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <FadeIn durationInFrames={25}>
          <div style={{ textAlign: 'center' }}>
            <Logo size={90} />
            <div style={{ marginTop: 24, fontSize: 30, color: TEXT_MUTED }}>
              Aprende a tu propio ritmo
            </div>
          </div>
        </FadeIn>
      </AbsoluteFill>
    </Scene>
  )
}

// ── Escena 2: Landing / "Registrarme gratis" (0:07–0:16 · frames 210–480) ──
function SceneLanding() {
  return (
    <Scene>
      <Audio src={staticFile('audio/scene2.wav')} />
      <AbsoluteFill style={{ padding: 80, justifyContent: 'center' }}>
        <FadeIn>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              borderRadius: 999,
              backgroundColor: `${PRIMARY}22`,
              color: PRIMARY,
              fontSize: 22,
              marginBottom: 24,
            }}
          >
            ✨ Somos una escuela · Muchos cursos · Una sola llave
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, color: TEXT, maxWidth: 1100, lineHeight: 1.15 }}>
            Aprende a tu ritmo con <span style={{ color: PRIMARY }}>Oliver Academy</span>
          </div>
        </FadeIn>
        <FadeIn delay={25}>
          <div style={{ marginTop: 48, position: 'relative', display: 'inline-block' }}>
            <div
              style={{
                backgroundColor: PRIMARY,
                color: BG,
                fontWeight: 700,
                fontSize: 28,
                padding: '20px 40px',
                borderRadius: 12,
                display: 'inline-block',
              }}
            >
              Registrarme gratis
            </div>
            <Highlight x={-8} y={-8} width={296} height={80} />
          </div>
        </FadeIn>
      </AbsoluteFill>
    </Scene>
  )
}

// ── Escena 3: Formulario de cuenta (0:16–0:28 · frames 480–840) ────────
function FormField({ label, highlighted }) {
  return (
    <div style={{ position: 'relative', marginBottom: 20 }}>
      <div style={{ fontSize: 20, color: TEXT_MUTED, marginBottom: 8 }}>{label}</div>
      <div
        style={{
          width: 480,
          height: 52,
          borderRadius: 10,
          backgroundColor: BG,
          border: `2px solid ${highlighted ? PRIMARY : BORDER}`,
        }}
      />
      {highlighted && <Highlight x={-6} y={26} width={492} height={64} radius={12} />}
    </div>
  )
}

function SceneCreateAccount() {
  const frame = useCurrentFrame()
  // 3 campos + botón Google, resaltado uno a la vez a lo largo de la escena
  const step = Math.min(3, Math.floor(frame / 75))
  return (
    <Scene>
      <Audio src={staticFile('audio/scene3.wav')} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <FadeIn>
          <div
            style={{
              backgroundColor: CARD_BG,
              borderRadius: 20,
              padding: 48,
              width: 580,
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 700, color: TEXT, marginBottom: 28 }}>
              Crea tu cuenta gratis
            </div>
            <FormField label="Nombre" highlighted={step === 0} />
            <FormField label="Correo" highlighted={step === 1} />
            <FormField label="Contraseña" highlighted={step === 2} />
            <div style={{ position: 'relative', marginTop: 28 }}>
              <div
                style={{
                  border: `2px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: '16px 0',
                  textAlign: 'center',
                  color: TEXT,
                  fontSize: 22,
                }}
              >
                🟢 Continuar con Google
              </div>
              {step === 3 && <Highlight x={-6} y={-6} width={492} height={68} />}
            </div>
          </div>
        </FadeIn>
      </AbsoluteFill>
    </Scene>
  )
}

// ── Escena 4: Confirmación (0:28–0:36 · frames 840–1080) ───────────────
function SceneConfirm() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ frame, fps, config: { damping: 10 } })
  return (
    <Scene>
      <Audio src={staticFile('audio/scene4.wav')} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', transform: `scale(${scale})` }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: PRIMARY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              margin: '0 auto 32px',
            }}
          >
            ✓
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, color: TEXT }}>¡Tu cuenta ya está creada!</div>
        </div>
      </AbsoluteFill>
    </Scene>
  )
}

// ── Escena 5: Iniciar sesión (0:36–0:46 · frames 1080–1380) ────────────
function SceneLogin() {
  const frame = useCurrentFrame()
  const step = Math.min(2, Math.floor(frame / 75))
  return (
    <Scene>
      <Audio src={staticFile('audio/scene5.wav')} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <FadeIn>
          <div style={{ backgroundColor: CARD_BG, borderRadius: 20, padding: 48, width: 580 }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
              Inicia sesión
            </div>
            <div style={{ fontSize: 18, color: TEXT_MUTED, marginBottom: 28 }}>
              Tu mascota y tu progreso te están esperando.
            </div>
            <FormField label="Correo" highlighted={step === 0} />
            <FormField label="Contraseña" highlighted={step === 1} />
            <div
              style={{
                marginTop: 12,
                backgroundColor: PRIMARY,
                color: BG,
                fontWeight: 700,
                fontSize: 22,
                padding: '16px 0',
                borderRadius: 10,
                textAlign: 'center',
                position: 'relative',
              }}
            >
              Iniciar sesión
              {step === 2 && <Highlight x={-6} y={-6} width={492} height={64} />}
            </div>
          </div>
        </FadeIn>
      </AbsoluteFill>
    </Scene>
  )
}

// ── Escena 6: Dashboard (0:46–0:58 · frames 1380–1740) ─────────────────
function CourseCard({ icon, title }) {
  return (
    <div
      style={{
        backgroundColor: CARD_BG,
        borderRadius: 14,
        padding: 20,
        width: 220,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div style={{ fontSize: 36 }}>{icon}</div>
      <div style={{ fontSize: 18, color: TEXT, marginTop: 8, fontWeight: 600 }}>{title}</div>
    </div>
  )
}

function SceneDashboard() {
  return (
    <Scene>
      <Audio src={staticFile('audio/scene6.wav')} />
      <AbsoluteFill style={{ padding: 64 }}>
        <FadeIn>
          <div style={{ fontSize: 40, fontWeight: 800, color: TEXT }}>Hola 👋</div>
          <div style={{ fontSize: 22, color: TEXT_MUTED, marginTop: 4 }}>
            ¿Listo para aprender algo nuevo hoy?
          </div>
        </FadeIn>
        <FadeIn delay={20}>
          <div style={{ display: 'flex', gap: 20, marginTop: 48 }}>
            <CourseCard icon="🧠" title="Inteligencia Artificial" />
            <CourseCard icon="💻" title="Programación" />
            <CourseCard icon="🩺" title="Medicina" />
            <CourseCard icon="🗣️" title="Idiomas" />
          </div>
        </FadeIn>
        <FadeIn delay={40}>
          <div
            style={{
              marginTop: 56,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              backgroundColor: CARD_BG,
              borderRadius: 16,
              padding: 24,
              width: 620,
            }}
          >
            <div style={{ fontSize: 56 }}>🐾</div>
            <div>
              <div style={{ fontSize: 22, color: TEXT, fontWeight: 700 }}>Tu mascota IA</div>
              <div style={{ fontSize: 17, color: TEXT_MUTED }}>
                Te acompaña clase por clase y responde tus dudas.
              </div>
            </div>
          </div>
        </FadeIn>
      </AbsoluteFill>
    </Scene>
  )
}

// ── Escena 7: Cierre (0:58–1:00 · frames 1740–1800) ─────────────────────
function SceneClosing() {
  return (
    <Scene>
      <Audio src={staticFile('audio/scene7.wav')} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <FadeIn durationInFrames={15}>
          <Logo size={70} />
        </FadeIn>
      </AbsoluteFill>
    </Scene>
  )
}

export function IntroCrearCuenta() {
  // Offsets acumulados a partir de SCENE_FRAMES (duración real de cada
  // línea de audio) — cada escena empieza justo donde termina la anterior.
  let cursor = 0
  const from1 = cursor; cursor += SCENE_FRAMES.scene1
  const from2 = cursor; cursor += SCENE_FRAMES.scene2
  const from3 = cursor; cursor += SCENE_FRAMES.scene3
  const from4 = cursor; cursor += SCENE_FRAMES.scene4
  const from5 = cursor; cursor += SCENE_FRAMES.scene5
  const from6 = cursor; cursor += SCENE_FRAMES.scene6
  const from7 = cursor; cursor += SCENE_FRAMES.scene7

  return (
    <>
      <Sequence from={from1} durationInFrames={SCENE_FRAMES.scene1}>
        <SceneIntro />
      </Sequence>
      <Sequence from={from2} durationInFrames={SCENE_FRAMES.scene2}>
        <SceneLanding />
      </Sequence>
      <Sequence from={from3} durationInFrames={SCENE_FRAMES.scene3}>
        <SceneCreateAccount />
      </Sequence>
      <Sequence from={from4} durationInFrames={SCENE_FRAMES.scene4}>
        <SceneConfirm />
      </Sequence>
      <Sequence from={from5} durationInFrames={SCENE_FRAMES.scene5}>
        <SceneLogin />
      </Sequence>
      <Sequence from={from6} durationInFrames={SCENE_FRAMES.scene6}>
        <SceneDashboard />
      </Sequence>
      <Sequence from={from7} durationInFrames={SCENE_FRAMES.scene7}>
        <SceneClosing />
      </Sequence>
    </>
  )
}

export const INTRO_CREAR_CUENTA_TOTAL_FRAMES = Object.values(SCENE_FRAMES).reduce((a, b) => a + b, 0)
