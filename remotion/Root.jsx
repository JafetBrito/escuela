import { Composition } from 'remotion'
import { Ejemplo } from './compositions/Ejemplo.jsx'
import { IntroCrearCuenta } from './compositions/IntroCrearCuenta.jsx'

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
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  )
}
