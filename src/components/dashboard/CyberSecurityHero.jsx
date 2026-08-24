// Portada especial para /escuela/ciberseguridad — pedida explícitamente
// "más épica, como una estación de investigación", a diferencia del
// gradiente genérico que usan las demás escuelas (SchoolPage.jsx). Estética
// de centro de mando: rejilla técnica, barrido de radar, texto de terminal,
// anillos de señal — reutiliza el acento teal ya definido en categoryMeta.js
// (Ciberseguridad.accent = #2dd4bf) para no inventar una paleta nueva.
export default function CyberSecurityHero({ courseCount }) {
  return (
    <div className="relative overflow-hidden bg-[#050b0a] px-6 py-14 sm:py-20">
      {/* Rejilla técnica de fondo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(#2dd4bf 1px, transparent 1px), linear-gradient(90deg, #2dd4bf 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Viñeta para que la rejilla se desvanezca hacia los bordes */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 0%, #050b0a 75%)' }}
      />

      {/* Anillos de señal detrás del ícono central */}
      <div className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
        <span className="absolute -inset-16 animate-ping rounded-full border border-[#2dd4bf]/20" style={{ animationDuration: '3s' }} />
        <span className="absolute -inset-24 animate-ping rounded-full border border-[#2dd4bf]/10" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
      </div>

      {/* Barrido de radar horizontal */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] animate-[radar-sweep_4s_linear_infinite]"
        style={{ background: 'linear-gradient(90deg, transparent, #2dd4bf, transparent)', boxShadow: '0 0 12px 1px #2dd4bf' }}
      />

      <div className="relative mx-auto max-w-xl text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#2dd4bf]/70">
          ● Sistema en línea — acceso concedido
        </p>
        <p className="mt-5 text-6xl drop-shadow-[0_0_20px_rgba(45,212,191,0.5)]">🔐</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Academia de <span className="text-[#2dd4bf]">Ciberseguridad</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium text-white/60">
          Tu estación de investigación: hacking ético, defensa y análisis de amenazas, con las herramientas reales del oficio.
        </p>
        <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 px-4 py-1.5 font-mono text-xs font-bold text-[#2dd4bf]">
          &gt; {courseCount} módulos de entrenamiento disponibles
        </p>
      </div>
    </div>
  )
}
