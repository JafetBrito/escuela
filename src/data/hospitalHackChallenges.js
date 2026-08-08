// Retos rápidos para el rol Hacker de "Oliver Cyber Range: Hospital" —
// mini-versiones de las escenas de ctfScenarios.js (mismo motor,
// createShell de bashSimulator.js), pero resolubles en 1-3 comandos: en
// este juego el ritmo importa, cada reto resuelto le quita seguridad al
// hospital en tiempo real mientras un Doctor intenta compensarlo.
export const HOSPITAL_HACK_CHALLENGES = [
  {
    id: 'historial-filtrado',
    title: 'Historial de Paciente Filtrado',
    briefing: 'Un archivo de historiales quedó expuesto en el servidor. Encuéntralo y léelo.',
    hint: 'Prueba "ls" para ver qué hay, y "cat" para leer un archivo.',
    initialFs: {
      '/': { type: 'dir', children: { home: { type: 'dir', children: { servidor: { type: 'dir', children: {
        'historiales_2024.csv': { type: 'file', permissions: '644', owner: 'student', content: 'paciente,diagnostico\nJ.Perez,Hipertension\nFLAG{historial_expuesto}' },
        'readme.txt': { type: 'file', permissions: '644', owner: 'student', content: 'Servidor de archivos del Hospital Central.' },
      } } } } } },
    },
    checkFlag: (output) => output.some((l) => l.includes('FLAG{historial_expuesto}')),
  },
  {
    id: 'password-monitor',
    title: 'Contraseña del Monitor Cardíaco',
    briefing: 'La contraseña del panel de monitores está guardada codificada en base64. Decodifícala.',
    hint: 'Usa "cat" para ver el archivo, luego "base64 -d" con el texto que encuentres.',
    initialFs: {
      '/': { type: 'dir', children: { home: { type: 'dir', children: { servidor: { type: 'dir', children: {
        'monitor.conf': { type: 'file', permissions: '644', owner: 'student', content: 'clave_codificada: RkxBR3ttb25pdG9yX2NhcmRpYWNvfQ==' },
      } } } } } },
    },
    checkFlag: (output) => output.some((l) => l.includes('FLAG{monitor_cardiaco}')),
  },
  {
    id: 'permisos-ventilador',
    title: 'Permisos del Ventilador',
    briefing: 'La configuración del ventilador mecánico quedó con permisos abiertos para cualquiera. Léela.',
    hint: '"ls -la" te muestra los permisos de cada archivo antes de leerlo.',
    initialFs: {
      '/': { type: 'dir', children: { home: { type: 'dir', children: { servidor: { type: 'dir', children: {
        'ventilador.cfg': { type: 'file', permissions: '666', owner: 'root', content: 'presion_max: 40\nFLAG{ventilador_abierto}' },
      } } } } } },
    },
    checkFlag: (output) => output.some((l) => l.includes('FLAG{ventilador_abierto}')),
  },
  {
    id: 'backdoor-farmacia',
    title: 'Backdoor en Farmacia',
    briefing: 'Alguien dejó un archivo oculto en el servidor de farmacia. Encuéntralo.',
    hint: '"ls -a" muestra también los archivos que empiezan con punto.',
    initialFs: {
      '/': { type: 'dir', children: { home: { type: 'dir', children: { servidor: { type: 'dir', children: {
        '.backdoor': { type: 'file', permissions: '644', owner: 'student', content: 'FLAG{backdoor_farmacia}' },
        'inventario.txt': { type: 'file', permissions: '644', owner: 'student', content: 'Paracetamol: 200 unidades' },
      } } } } } },
    },
    checkFlag: (output) => output.some((l) => l.includes('FLAG{backdoor_farmacia}')),
  },
  {
    id: 'log-sospechoso',
    title: 'Log de Acceso Sospechoso',
    briefing: 'Hay un log enorme de accesos. Busca la línea marcada como sospechosa.',
    hint: '"grep sospechoso access.log" busca esa palabra dentro del archivo.',
    initialFs: {
      '/': { type: 'dir', children: { home: { type: 'dir', children: { servidor: { type: 'dir', children: {
        'access.log': { type: 'file', permissions: '644', owner: 'student', content: '10:00 login ok\n10:02 login ok\n10:05 ACCESO SOSPECHOSO FLAG{log_detectado}\n10:06 login ok' },
      } } } } } },
    },
    checkFlag: (output) => output.some((l) => l.includes('FLAG{log_detectado}')),
  },
  {
    id: 'firmware-bomba-insulina',
    title: 'Firmware de la Bomba de Insulina',
    briefing: 'El firmware solo lo puede leer root. Necesitas privilegios de administrador.',
    hint: '"sudo cat firmware.bin" — la contraseña de sudo es "hospital123".',
    initialFs: {
      '/': { type: 'dir', children: { home: { type: 'dir', children: { servidor: { type: 'dir', children: {
        'firmware.bin': { type: 'file', permissions: '600', owner: 'root', content: 'v2.1.3\nFLAG{firmware_root}' },
      } } } } } },
    },
    sudoPassword: 'hospital123',
    checkFlag: (output) => output.some((l) => l.includes('FLAG{firmware_root}')),
  },
]
