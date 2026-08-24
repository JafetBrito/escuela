// Lista de reproducción de "Clase Online" — se reproduce en bucle, uno tras
// otro (VideoPlayer llama onEnded al terminar cada video, OnlineClassPage
// avanza al siguiente índice con módulo % length). Totalmente independiente
// de las clases en vivo/de práctica: no usa live_classes ni el Hub, es un
// canal continuo con chat global aparte.
//
// Para agregar más videos, solo agrega otro objeto { title, videoId } al
// final del arreglo.
export const ONLINE_CLASS_PLAYLIST = [
  { title: 'Fundamentos de la IA', videoId: 'Pg3DXxBD638' },
  { title: 'Antiguo Egipto', videoId: 'nUB6XYg9K3o' },
  { title: 'Medicina en el antiguo Egipto', videoId: 'DmlIBouEyng' },
  { title: 'El Enfoque Cognitivo', videoId: 'a283A0Ry5m0' },
]
