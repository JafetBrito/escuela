// ponytail: interruptor único de "modo prueba" — desbloquea todos los cursos
// y todas las clases (sin necesitar llave/licencia, sin importar el orden de
// módulos ni si el quiz de la clase anterior está resuelto). No toca
// misiones (nunca bloquearon nada) ni el flag `locked` de cursos "próximamente"
// (esos siguen sin contenido real, desbloquearlos solo daría una página vacía).
//
// Para revertir a la normalidad: cambia esto a `false`. Un solo lugar.
export const DEV_UNLOCK_ALL = true
