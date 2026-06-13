# Disfraces de mascotas

Aquí van los modelos `.glb` que se usarán como "disfraces" (variantes visuales)
de las mascotas que ya están en `src/data/mascotRegistry.js`
(`mage.glb`, `mage_elder.glb`, `mage_fox.glb`, `lizard_mage.glb`,
`balloon_dog.glb`, `orange_cat.glb`).

## Cómo agregar un disfraz

1. Coloca el archivo `.glb` en esta carpeta, por ejemplo:
   `public/disfraces/mage_navidad.glb`
2. Agrega una entrada en `src/data/skinsRegistry.js` con un `modelPath`
   apuntando a `/disfraces/<archivo>.glb` (además de `id`, `name`, `color`,
   `accessory`).
3. El componente `MascotMesh` centra y escala el modelo automáticamente; si
   queda girado o desplazado, ajusta `modelRotationY` / `modelOffsetY` igual
   que se hace en `mascotRegistry.js`.
