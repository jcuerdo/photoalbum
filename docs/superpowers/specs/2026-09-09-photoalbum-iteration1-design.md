# Photoalbum, iteración 1: selección de fotos locales

## Objetivo

POC de una web que genera un álbum de fotos imprimible o exportable a PDF. En esta primera iteración las fotos se seleccionan desde el disco local del usuario (ya descargadas). La integración con Google Photos se hará en una iteración posterior, reutilizando el mismo modelo de estado.

## Arquitectura

React + Vite, SPA estática, sin backend, sin autenticación, sin llamadas externas. Pensada para desplegarse en GitHub Pages. Las imágenes se cargan como `URL.createObjectURL()`, por lo que no hay restricciones de CORS ni de canvas.

## Pantallas y componentes

1. **Selector de fotos**: input de archivo múltiple más zona de arrastrar y soltar. Acepta imágenes.
2. **Galería de selección**: miniaturas de las fotos cargadas, con opción de quitar alguna o reordenarlas.
3. **Configuración**: plantilla (6 opciones), fotos por página (1 a 10), bordes o márgenes entre fotos.
4. **Vista previa**: páginas del álbum montadas con CSS Grid según la configuración elegida, paginando las fotos seleccionadas.
5. **Imprimir o exportar PDF**: `window.print()` con hoja `@media print`. El propio diálogo de impresión del navegador permite imprimir en papel o guardar como PDF.

## Plantillas

1. Fondo blanco simple, cuadrícula uniforme.
2. Fondo negro, estilo galería oscura.
3. Polaroid, marco blanco tipo instantánea con sombra ligera.
4. Collage, tamaños de foto variados dentro de la página.
5. Álbum vintage, fondo con textura de papel y bordes suaves.
6. Revista, una foto grande destacada y el resto en fotos pequeñas alrededor.

Cada plantilla es una hoja de CSS distinta aplicada a la misma estructura de cuadrícula; cambiar de plantilla no cambia el marcado, solo la clase CSS aplicada.

## Manejo de errores

Mínimo: aviso si un archivo seleccionado no es una imagen válida, o si no queda ninguna foto seleccionada al intentar generar la vista previa.

## Testing

Manual, verificando el flujo completo en el navegador. Sin tests automatizados en esta iteración.

## Fuera de alcance (iteración 2)

Integración con Google Photos vía Picker API: login con Google Identity Services, selección remota de fotos, y la incertidumbre ya identificada sobre CORS en las llamadas directas desde el navegador a `photospicker.googleapis.com`. El proyecto de Google Cloud (`photoalbum-508114`) ya está creado para cuando llegue ese momento.
