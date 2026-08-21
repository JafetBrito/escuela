import { Composition } from 'remotion'
import { Ejemplo } from './compositions/Ejemplo.jsx'
import { IntroCrearCuenta, INTRO_CREAR_CUENTA_TOTAL_FRAMES } from './compositions/IntroCrearCuenta.jsx'
import { LeccionAnatomiaPrompt, LECCION_ANATOMIA_TOTAL_FRAMES } from './compositions/LeccionAnatomiaPrompt.jsx'
import { LeccionComoPiensaIA, LECCION_MENTE_TOTAL_FRAMES } from './compositions/LeccionComoPiensaIA.jsx'
import { HistoriaGitGitHub, HISTORIA_GIT_TOTAL_FRAMES } from './compositions/HistoriaGitGitHub.jsx'
import { FlujoDiarioGit, FLUJO_DIARIO_TOTAL_FRAMES } from './compositions/FlujoDiarioGit.jsx'

// Cada <Composition> es un video renderizable por separado (id único,
// duración, tamaño). Para un video nuevo: agrega un componente en
// ./compositions/ y regístralo aquí con su propio id.
export function RemotionRoot() {
  return (
    <>
      <Composition
        id="Ejemplo"
        component={Ejemplo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="IntroCrearCuenta"
        component={IntroCrearCuenta}
        durationInFrames={INTRO_CREAR_CUENTA_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LeccionAnatomiaPrompt"
        component={LeccionAnatomiaPrompt}
        durationInFrames={LECCION_ANATOMIA_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LeccionComoPiensaIA"
        component={LeccionComoPiensaIA}
        durationInFrames={LECCION_MENTE_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HistoriaGitGitHub"
        component={HistoriaGitGitHub}
        durationInFrames={HISTORIA_GIT_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FlujoDiarioGit"
        component={FlujoDiarioGit}
        durationInFrames={FLUJO_DIARIO_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  )
}
