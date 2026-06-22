// Diablo/WoW-style equippable items. Your weapon is your class's signature
// tool and can grant a usable VR action (see useWeaponStore + the 'V'
// keybind in VRPage.jsx). Today only the Hacker's Teléfono is wired to a
// real action — other classes get a weapon slot too so the system is ready
// to grow (procedural item generation, more tiers) without re-plumbing.
export const WEAPON_REGISTRY = {
  telefono_viejo: {
    id: 'telefono_viejo',
    name: 'Teléfono Viejo',
    icon: '📱',
    requiredClass: 'hacker',
    requiredLevel: 1,
    stats: { power: 1, speed: 2, range: 1 },
    description: 'Apenas enciende, pero corre lo justo para abrir una terminal remota.',
  },
  telefono_flagship: {
    id: 'telefono_flagship',
    name: 'Teléfono Flagship',
    icon: '📲',
    requiredClass: 'hacker',
    requiredLevel: 10,
    stats: { power: 3, speed: 4, range: 3 },
    description: 'Última generación. Acceso root instantáneo desde cualquier punto del campus.',
  },
}

export function getWeaponById(id) {
  return WEAPON_REGISTRY[id] ?? null
}

export function getWeaponsForClass(classId) {
  return Object.values(WEAPON_REGISTRY).filter((w) => w.requiredClass === classId)
}
