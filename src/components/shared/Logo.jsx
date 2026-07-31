// `tagline` es un subtítulo opcional bajo el nombre — hoy solo lo usa
// AppTopBar.jsx para mostrar "Script Kiddies" cuando la cuenta tiene el
// perfil de edad "niños" (profiles.age_profile), asignado por el admin.
// `className` (tamaño de texto, etc.) va en el wrapper para que OLIVER/
// ACADEMY lo hereden — así el tamaño responsive que ya usa AppTopBar.jsx
// (variant="course") sigue funcionando igual que antes.
export default function Logo({ className = '', tagline = null }) {
  return (
    <span className={`inline-flex flex-col leading-none text-xl font-extrabold tracking-tight ${className}`}>
      <span>
        <span className="text-text">OLIVER</span>
        <span className="text-primary"> ACADEMY</span>
      </span>
      {tagline && (
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-primary/70">{tagline}</span>
      )}
    </span>
  )
}
