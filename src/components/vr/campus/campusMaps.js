import campus from '../../../data/campusLayout.json'
import hospital from '../../../data/hospitalLayout.json'
import santuario from '../../../data/santuarioLayout.json'
import caverna from '../../../data/cavernaLayout.json'
import { setTerrainMode } from './campusWorld'

// Registro de mapas por datos: cada uno es un layout JSON + su ruta. Para sumar otro mapa: genera su JSON,
// agrégalo aquí y crea la ruta en App.jsx (ver .claude/skills/mapas-vr-lowpoly/SKILL.md).
export const MAPS = {
  campus: { id: 'campus', label: ['Campus Universitario', 'University Campus'], data: campus, route: '/vr/campus', file: 'campusLayout.json' },
  hospital: { id: 'hospital', label: ['Hospital Escuela El Sagrado Corazón', 'El Sagrado Corazón Teaching Hospital'], data: hospital, route: '/vr/hospital', file: 'hospitalLayout.json' },
  santuario: { id: 'santuario', label: ['Santuario de los Caminos', 'Sanctuary of the Paths'], data: santuario, route: '/vr/santuario', file: 'santuarioLayout.json' },
  caverna: { id: 'caverna', label: ['La Caverna de Platón', "Plato's Cave"], data: caverna, route: '/vr/caverna', file: 'cavernaLayout.json' },
}
export const getMap = (id) => { const m = MAPS[id] || MAPS.campus; setTerrainMode(m.data.terrain, m.data); return m }
