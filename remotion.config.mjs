import { Config } from '@remotion/cli/config'

// Carpeta de archivos estáticos (audio, imágenes) solo para Remotion —
// separada de public/ del sitio (esa sí se despliega al hosting real).
Config.setPublicDir('remotion/public')
