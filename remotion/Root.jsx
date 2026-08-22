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
import { CyberTema1, CYBER_TEMA1_TOTAL_FRAMES } from './compositions/CyberTema1.jsx'
import { CyberTema2, CYBER_TEMA2_TOTAL_FRAMES } from './compositions/CyberTema2.jsx'
import { CyberTema3, CYBER_TEMA3_TOTAL_FRAMES } from './compositions/CyberTema3.jsx'
import { CyberTema4, CYBER_TEMA4_TOTAL_FRAMES } from './compositions/CyberTema4.jsx'
import { CyberTema5, CYBER_TEMA5_TOTAL_FRAMES } from './compositions/CyberTema5.jsx'
import { CyberTema6, CYBER_TEMA6_TOTAL_FRAMES } from './compositions/CyberTema6.jsx'
import { CyberTema7, CYBER_TEMA7_TOTAL_FRAMES } from './compositions/CyberTema7.jsx'
import { CyberTema8, CYBER_TEMA8_TOTAL_FRAMES } from './compositions/CyberTema8.jsx'
import { CyberTema9, CYBER_TEMA9_TOTAL_FRAMES } from './compositions/CyberTema9.jsx'
import { CyberTema10, CYBER_TEMA10_TOTAL_FRAMES } from './compositions/CyberTema10.jsx'
import { CyberTema11, CYBER_TEMA11_TOTAL_FRAMES } from './compositions/CyberTema11.jsx'
import { CyberTema12, CYBER_TEMA12_TOTAL_FRAMES } from './compositions/CyberTema12.jsx'
import { CyberTema13, CYBER_TEMA13_TOTAL_FRAMES } from './compositions/CyberTema13.jsx'
import { CyberTema14, CYBER_TEMA14_TOTAL_FRAMES } from './compositions/CyberTema14.jsx'
import { CyberTema16, CYBER_TEMA16_TOTAL_FRAMES } from './compositions/CyberTema16.jsx'
import { CyberTema17, CYBER_TEMA17_TOTAL_FRAMES } from './compositions/CyberTema17.jsx'

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
      <Composition id="CyberTema1" component={CyberTema1} durationInFrames={CYBER_TEMA1_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema2" component={CyberTema2} durationInFrames={CYBER_TEMA2_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema3" component={CyberTema3} durationInFrames={CYBER_TEMA3_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema4" component={CyberTema4} durationInFrames={CYBER_TEMA4_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema5" component={CyberTema5} durationInFrames={CYBER_TEMA5_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema6" component={CyberTema6} durationInFrames={CYBER_TEMA6_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema7" component={CyberTema7} durationInFrames={CYBER_TEMA7_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema8" component={CyberTema8} durationInFrames={CYBER_TEMA8_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema9" component={CyberTema9} durationInFrames={CYBER_TEMA9_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema10" component={CyberTema10} durationInFrames={CYBER_TEMA10_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema11" component={CyberTema11} durationInFrames={CYBER_TEMA11_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema12" component={CyberTema12} durationInFrames={CYBER_TEMA12_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema13" component={CyberTema13} durationInFrames={CYBER_TEMA13_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema14" component={CyberTema14} durationInFrames={CYBER_TEMA14_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema16" component={CyberTema16} durationInFrames={CYBER_TEMA16_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CyberTema17" component={CyberTema17} durationInFrames={CYBER_TEMA17_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    </>
  )
}
