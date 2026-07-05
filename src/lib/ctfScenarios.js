// ─────────────────────────────────────────────────────────────────────────────
// CTF Scenarios — each is a self-contained "machine" to hack
// ─────────────────────────────────────────────────────────────────────────────

export const CTF_SCENARIOS = [
  {
    id: 'nivel-0',
    title: 'Orientación: La Terminal',
    difficulty: 'Principiante',
    difficultyColor: 'text-emerald-400',
    category: 'Bash básico',
    points: 50,
    briefing: `Bienvenido, recluta. Este es tu primer contacto con la terminal de Linux.
Tu misión: encontrar el archivo de bienvenida y leer su contenido.
Ningún sistema es demasiado simple para ignorarlo.`,
    objectives: [
      { id: 'find-welcome', label: 'Lee el archivo de bienvenida', done: false },
      { id: 'find-flag',    label: 'Encuentra y muestra el FLAG', done: false },
    ],
    checkFlag: (output) => output.some((l) => l.includes('FLAG{welcome_to_oliver_academy}')),
    hint: 'Usa ls para ver qué hay en el directorio. Luego cat para leer el archivo.',
    initialFs: {
      '/': {
        type: 'dir', children: {
          home: { type: 'dir', children: {
            student: { type: 'dir', children: {
              'bienvenida.txt': {
                type: 'file', permissions: '644', owner: 'student',
                content: `Bienvenido a Oliver Academy — Sistema de Entrenamiento Hacker.

Este sistema te enseñará a moverte por Linux.
El flag de esta misión está en un archivo llamado flag.txt.

¡Buena suerte, recluta!`,
              },
              'flag.txt': {
                type: 'file', permissions: '644', owner: 'student',
                content: 'FLAG{welcome_to_oliver_academy}',
              },
            }},
          }},
          etc:  { type: 'dir', children: { 'hostname': { type: 'file', permissions: '644', owner: 'root', content: 'oliver-academy' } } },
          bin:  { type: 'dir', children: {} },
          tmp:  { type: 'dir', children: {} },
        },
      },
    },
  },

  {
    id: 'nivel-1',
    title: 'Archivos Ocultos',
    difficulty: 'Principiante',
    difficultyColor: 'text-emerald-400',
    category: 'Permisos y archivos',
    points: 100,
    briefing: `En Linux, los archivos que comienzan con punto (.) están ocultos.
Un agente dejó información crítica en este servidor.
La encontrarás solo si sabes buscar donde nadie mira.`,
    objectives: [
      { id: 'find-hidden',  label: 'Descubre los archivos ocultos', done: false },
      { id: 'read-secret',  label: 'Lee el archivo .secret', done: false },
      { id: 'find-flag',    label: 'Encuentra el FLAG', done: false },
    ],
    checkFlag: (output) => output.some((l) => l.includes('FLAG{hidden_files_master}')),
    hint: 'Los archivos ocultos se ven con ls -a o ls -la. Busca en el directorio home.',
    initialFs: {
      '/': {
        type: 'dir', children: {
          home: { type: 'dir', children: {
            student: { type: 'dir', children: {
              'notes.txt': { type: 'file', permissions: '644', owner: 'student', content: 'Mis apuntes del día... nada interesante aquí.' },
              '.secret':   { type: 'file', permissions: '644', owner: 'student', content: 'No creí que llegarías hasta aquí.\nEl flag está en el directorio .hidden/\n' },
              '.hidden': { type: 'dir', permissions: '755', owner: 'student', children: {
                'flag.txt': { type: 'file', permissions: '644', owner: 'student', content: 'FLAG{hidden_files_master}' },
                'README':   { type: 'file', permissions: '644', owner: 'student', content: 'Bien hecho, encontraste el directorio oculto.' },
              }},
              '.bash_history': { type: 'file', permissions: '600', owner: 'student', content: 'ls -la\ncd .hidden\ncat flag.txt' },
            }},
          }},
          etc:  { type: 'dir', children: {} },
          tmp:  { type: 'dir', children: {} },
        },
      },
    },
  },

  {
    id: 'nivel-2',
    title: 'El Mensaje Cifrado',
    difficulty: 'Intermedio',
    difficultyColor: 'text-yellow-400',
    category: 'Codificación',
    points: 200,
    briefing: `Interceptamos una transmisión sospechosa. El mensaje fue codificado en base64,
el cifrado más simple del mundo — pero sorprendentemente efectivo contra quien no lo conoce.
Decodifícalo y extrae el flag.`,
    objectives: [
      { id: 'read-transmission', label: 'Lee el archivo transmision.b64', done: false },
      { id: 'decode-base64',     label: 'Decodifica el mensaje', done: false },
      { id: 'find-flag',         label: 'Extrae el FLAG del mensaje', done: false },
    ],
    checkFlag: (output) => output.some((l) => l.includes('FLAG{base64_is_not_encryption}')),
    hint: 'Usa base64 -d transmision.b64 para decodificar. base64 NO es encriptación, es solo codificación.',
    initialFs: {
      '/': {
        type: 'dir', children: {
          home: { type: 'dir', children: {
            student: { type: 'dir', children: {
              'transmision.b64': {
                type: 'file', permissions: '644', owner: 'student',
                content: btoa('Mensaje interceptado - Agente 7.\nMisión completada.\nFLAG{base64_is_not_encryption}\nRecuerda: base64 codifica, NO encripta.'),
              },
              'README.txt': {
                type: 'file', permissions: '644', owner: 'student',
                content: 'Se interceptó una transmisión cifrada en base64.\nUsa el comando base64 para decodificarla.',
              },
            }},
          }},
          etc: { type: 'dir', children: {} },
          tmp: { type: 'dir', children: {} },
        },
      },
    },
  },

  {
    id: 'nivel-3',
    title: 'Permisos de Acceso',
    difficulty: 'Intermedio',
    difficultyColor: 'text-yellow-400',
    category: 'chmod & permisos',
    points: 300,
    briefing: `Un administrador descuidado dejó archivos con permisos incorrectos.
Hay información valiosa que no puedes leer... todavía.
Aprende a cambiar permisos y entra donde no deberías poder.`,
    objectives: [
      { id: 'find-locked',    label: 'Encuentra el archivo bloqueado', done: false },
      { id: 'chmod-file',     label: 'Cambia los permisos con chmod', done: false },
      { id: 'read-flag',      label: 'Lee el FLAG', done: false },
    ],
    checkFlag: (output) => output.some((l) => l.includes('FLAG{chmod_unlocked_the_door}')),
    hint: 'El archivo tiene permisos 000. Usa chmod 644 para poder leerlo (necesitas ser el dueño o root).',
    initialFs: {
      '/': {
        type: 'dir', children: {
          home: { type: 'dir', children: {
            student: { type: 'dir', children: {
              'info.txt': {
                type: 'file', permissions: '644', owner: 'student',
                content: 'Los permisos de Linux usan notación octal:\n  4 = leer (r)\n  2 = escribir (w)\n  1 = ejecutar (x)\n\nEjemplo: chmod 644 archivo  →  rw-r--r--\nEjemplo: chmod 755 archivo  →  rwxr-xr-x\nEjemplo: chmod 000 archivo  →  ----------\n\nEl archivo secreto.dat tiene permisos 000...',
              },
              'secreto.dat': {
                type: 'file', permissions: '000', owner: 'student',
                content: 'FLAG{chmod_unlocked_the_door}\n\nBien hecho. Ahora sabes que los permisos no son inmutables.',
              },
            }},
          }},
          etc: { type: 'dir', children: {} },
          tmp: { type: 'dir', children: {} },
        },
      },
    },
  },

  {
    id: 'nivel-4',
    title: 'El Servidor Comprometido',
    difficulty: 'Avanzado',
    difficultyColor: 'text-red-400',
    category: 'Escalada de privilegios',
    points: 500,
    briefing: `Lograste acceso a un servidor comprometido como usuario normal.
El flag está en /root/flag.txt — territorio de root.
Encuentra la contraseña del administrador escondida en el sistema y úsala para escalar privilegios.
Esta es la esencia del hacking ético.`,
    objectives: [
      { id: 'read-passwd',    label: 'Investiga /etc/passwd y /etc/shadow', done: false },
      { id: 'find-password',  label: 'Encuentra la contraseña del admin', done: false },
      { id: 'switch-root',    label: 'Escala a root con su o sudo', done: false },
      { id: 'read-flag',      label: 'Lee /root/flag.txt', done: false },
    ],
    checkFlag: (output) => output.some((l) => l.includes('FLAG{root_access_granted}')),
    hint: 'Busca en /opt y /var/log archivos de configuración. Admins descuidados dejan contraseñas en texto plano.',
    initialFs: {
      '/': {
        type: 'dir', children: {
          home: { type: 'dir', children: {
            student: { type: 'dir', children: {
              'notas.txt': { type: 'file', permissions: '644', owner: 'student', content: 'Tengo acceso al servidor pero el flag está en /root.\nNecesito escalar privilegios...\nQuizás haya algo útil en /opt o en los logs.' },
            }},
          }},
          etc: { type: 'dir', children: {
            'passwd': { type: 'file', permissions: '644', owner: 'root', content: 'root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000::/home/student:/bin/bash' },
            'shadow': { type: 'file', permissions: '000', owner: 'root', content: 'root:$6$salt$hashedpassword:19000:0:99999:7:::\nstudent:$6$salt$hashedpassword2:19000:0:99999:7:::' },
            'hostname': { type: 'file', permissions: '644', owner: 'root', content: 'servidor-comprometido' },
          }},
          opt: { type: 'dir', children: {
            'admin': { type: 'dir', permissions: '755', owner: 'root', children: {
              'setup.sh': {
                type: 'file', permissions: '644', owner: 'root',
                content: '#!/bin/bash\n# Script de configuración inicial\n# TODO: cambiar esto antes de producción\nROOT_PASS=0l1v3r4c4d3my\nexport ROOT_PASS\n# fin del script',
              },
            }},
          }},
          var: { type: 'dir', children: {
            log: { type: 'dir', children: {
              'auth.log': { type: 'file', permissions: '644', owner: 'root', content: 'Jul 04 10:23:01 servidor su[1234]: pam_unix(su:auth): authentication failure\nJul 04 10:23:05 servidor su[1234]: pam_unix(su:auth): authentication failure\nJul 04 10:25:00 servidor sudo[2345]: student : TTY=pts/0 ; PWD=/home/student ; USER=root' },
            }},
          }},
          root: { type: 'dir', permissions: '700', owner: 'root', children: {
            'flag.txt': { type: 'file', permissions: '600', owner: 'root', content: 'FLAG{root_access_granted}\n\nFelicitaciones. Lograste escalar privilegios.\nEn un pentest real, aquí reportarías la vulnerabilidad al cliente.' },
          }},
          tmp:  { type: 'dir', children: {} },
          bin:  { type: 'dir', children: {} },
        },
      },
    },
    passwords: { root: '0l1v3r4c4d3my' },
    sudoPassword: '0l1v3r4c4d3my',
  },

  {
    id: 'nivel-5',
    title: 'Búsqueda y Reconocimiento',
    difficulty: 'Avanzado',
    difficultyColor: 'text-red-400',
    category: 'grep & find',
    points: 400,
    briefing: `Un atacante fragmentó el flag en varios archivos distribuidos por el sistema.
Cada fragmento está guardado como "parte_N=" seguido de texto.
Reúne todos los fragmentos en orden y reconstruye el flag completo.
Esta es la habilidad más importante de un investigador forense.`,
    objectives: [
      { id: 'find-fragments', label: 'Encuentra todos los fragmentos con grep o find', done: false },
      { id: 'reconstruct',    label: 'Reconstruye el FLAG completo', done: false },
    ],
    checkFlag: (output) => {
      const joined = output.join('')
      return joined.includes('parte_1=FLAG{') && joined.includes('parte_2=grep_') && joined.includes('parte_3=finds_')
    },
    hint: 'Usa grep -r "parte_" / para buscar en todo el sistema. O find / -type f seguido de cat en cada uno.',
    initialFs: {
      '/': {
        type: 'dir', children: {
          home: { type: 'dir', children: {
            student: { type: 'dir', children: {
              'README.txt': { type: 'file', permissions: '644', owner: 'student', content: 'El flag fue fragmentado y distribuido por el sistema.\nBusca archivos que contengan "parte_N=".' },
              'fragmento_a.txt': { type: 'file', permissions: '644', owner: 'student', content: 'parte_1=FLAG{' },
            }},
          }},
          var: { type: 'dir', children: {
            log:  { type: 'dir', children: {
              'system.log': { type: 'file', permissions: '644', owner: 'root', content: 'Jul 04 - System boot OK\nparte_2=grep_\nJul 04 - All services nominal' },
            }},
            tmp:  { type: 'dir', children: {
              'cache.dat': { type: 'file', permissions: '644', owner: 'root', content: 'cache_version=3\nparte_3=finds_\nexpiry=none' },
            }},
          }},
          opt: { type: 'dir', children: {
            config: { type: 'dir', children: {
              'app.conf': { type: 'file', permissions: '644', owner: 'root', content: 'app_name=oliver\nparte_4=everything}\ndebug=false' },
            }},
          }},
          etc:  { type: 'dir', children: { 'hostname': { type: 'file', permissions: '644', owner: 'root', content: 'oliver-academy' } } },
          tmp:  { type: 'dir', children: {} },
        },
      },
    },
  },
]
