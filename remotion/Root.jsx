import { Composition } from 'remotion'
import { Ejemplo } from './compositions/Ejemplo.jsx'
import { IntroCrearCuenta, INTRO_CREAR_CUENTA_TOTAL_FRAMES } from './compositions/IntroCrearCuenta.jsx'
import { LeccionAnatomiaPrompt, LECCION_ANATOMIA_TOTAL_FRAMES } from './compositions/LeccionAnatomiaPrompt.jsx'
import { LeccionComoPiensaIA, LECCION_MENTE_TOTAL_FRAMES } from './compositions/LeccionComoPiensaIA.jsx'
import { HistoriaGitGitHub, HISTORIA_GIT_TOTAL_FRAMES } from './compositions/HistoriaGitGitHub.jsx'
import { FlujoDiarioGit, FLUJO_DIARIO_TOTAL_FRAMES } from './compositions/FlujoDiarioGit.jsx'
import { TalesDeMileto, TALES_TOTAL_FRAMES } from './compositions/TalesDeMileto.jsx'
import { PitagorasYPitagoricos, PITAGORAS_TOTAL_FRAMES } from './compositions/PitagorasYPitagoricos.jsx'
import { ElementosDeEuclides, EUCLIDES_TOTAL_FRAMES } from './compositions/ElementosDeEuclides.jsx'
import { Arquimedes, ARQUIMEDES_TOTAL_FRAMES } from './compositions/Arquimedes.jsx'
import { ApiBienvenida, API_BIENVENIDA_TOTAL_FRAMES } from './compositions/ApiBienvenida.jsx'
import { ApiBotEnAccion, API_BOT_EN_ACCION_TOTAL_FRAMES } from './compositions/ApiBotEnAccion.jsx'
import { CyberBienvenida, CYBER_BIENVENIDA_TOTAL_FRAMES } from './compositions/CyberBienvenida.jsx'
import { CyberBienvenidaVertical, CYBER_BIENVENIDA_VERTICAL_TOTAL_FRAMES } from './compositions/CyberBienvenidaVertical.jsx'
import { CyberClimax, CYBER_CLIMAX_TOTAL_FRAMES } from './compositions/CyberClimax.jsx'
import { CyberClimaxVertical, CYBER_CLIMAX_VERTICAL_TOTAL_FRAMES } from './compositions/CyberClimaxVertical.jsx'

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
      <Composition
        id="TalesDeMileto"
        component={TalesDeMileto}
        durationInFrames={TALES_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PitagorasYPitagoricos"
        component={PitagorasYPitagoricos}
        durationInFrames={PITAGORAS_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ElementosDeEuclides"
        component={ElementosDeEuclides}
        durationInFrames={EUCLIDES_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Arquimedes"
        component={Arquimedes}
        durationInFrames={ARQUIMEDES_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ApiBienvenida"
        component={ApiBienvenida}
        durationInFrames={API_BIENVENIDA_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ApiBotEnAccion"
        component={ApiBotEnAccion}
        durationInFrames={API_BOT_EN_ACCION_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CyberBienvenida"
        component={CyberBienvenida}
        durationInFrames={CYBER_BIENVENIDA_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CyberBienvenidaVertical"
        component={CyberBienvenidaVertical}
        durationInFrames={CYBER_BIENVENIDA_VERTICAL_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CyberClimax"
        component={CyberClimax}
        durationInFrames={CYBER_CLIMAX_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CyberClimaxVertical"
        component={CyberClimaxVertical}
        durationInFrames={CYBER_CLIMAX_VERTICAL_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  )
}
