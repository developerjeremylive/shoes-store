# SoleStyle

Tienda e-commerce de zapatillas premium construida 100% con HTML5, CSS3 y JavaScript vanilla (ES6+ modules), sin frameworks. Las animaciones 3D scroll-driven corren sobre Three.js.

`HTML5` `CSS3` `JavaScript ES6+` `Three.js` `GSAP`

## Descripción

SoleStyle es una tienda de zapatillas de gama alta con catálogo de 36 productos en 6 categorías. El proyecto demuestra que una experiencia de compra moderna, con animaciones 3D, carrito persistente y filtros combinados, se puede construir sin un solo framework ni backend: solo navegador, ES modules y localStorage.

La propuesta de valor es doble. Para el visitante, una tienda rápida y fluida donde el scroll mueve escenas 3D, el carrito recuerda todo entre sesiones y los cupones se aplican al instante. Para quien la mantiene, un código base sin dependencias de npm, con comentarios en español y una estructura modular que se entiende de un vistazo.

## Características

- **Animaciones 3D scroll-driven** con Three.js: hero con zapatos low-poly y partículas, cubos de categorías, showcase de producto interactivo, línea de timeline y ondas en el footer.
- **Carrito con cupones**: hasta 50 ítems, cupones SOLE10 (10%) y WELCOME ($200 fijos), envío gratis en pedidos desde $2000, persistencia en localStorage.
- **Favoritos**: lista persistente con badge en el header y botón "Mover al carrito" desde la página de favoritos.
- **Filtros combinados + paginación**: categoría, marca, talla, color y rango de precio, con ordenamiento, 12 productos por página y estado sincronizado en la URL.
- **Búsqueda global con historial**: dropdown con hasta 5 resultados, navegación por teclado e historial de los últimos 10 términos.
- **Chrome global**: drawer del carrito con focus trap, modal de compra completada, toasts, menú móvil y sidebar de filtros, todo con delegación de eventos.
- **Responsive**: layout adaptativo con vista cuadrícula/lista persistida en sessionStorage.
- **Accesibilidad**: atributos ARIA, navegación por teclado en tabs y carrusel, focus trap en el drawer, Escape cierra todo.
- **Reduced motion**: `prefers-reduced-motion` desactiva las escenas Three y añade la clase `reduce-motion` al documento.

## Tech stack

| Tecnología | Versión | Propósito |
| --- | --- | --- |
| HTML5 | Estándar | Estructura semántica de las 4 páginas |
| CSS3 | Estándar | Estilos con design tokens en variables CSS |
| JavaScript (ES6+ modules) | Estándar | Toda la lógica de la app, sin transpilación |
| Three.js | r128 (cdnjs) | Escenas 3D: hero, cubos, showcase, timeline, ondas |
| OrbitControls | three@0.128.0 (jsdelivr) | Órbita de cámara del showcase de producto |
| GSAP + ScrollTrigger | 3.12.2 (cdnjs) | Animaciones de scroll en secciones del home |
| Lucide | latest (unpkg) | Iconos SVG inline |
| localStorage / sessionStorage | Navegador | Persistencia de carrito, favoritos, historial y vista |

No hay dependencias de npm. `package.json` solo declara `"type": "module"` para que los scripts se carguen como ES modules. Las librerías se sirven desde CDNs versionados.

## Estructura del proyecto

```
shoes-store/
├── index.html          # Home: hero 3D, cubos de categorías, timeline, testimonios
├── tienda.html         # Catálogo: filtros, orden, paginación, búsqueda, vista grid/lista
├── producto.html       # Detalle: showcase 3D, talla/color/cantidad, tabs, relacionados
├── favoritos.html      # Favoritos: grid con mover-al-carrito
├── package.json        # Solo {"type": "module"}
├── css/
│   ├── reset.css           # Normalización de estilos del navegador
│   ├── variables.css       # Design tokens: colores, tipografía, radios, sombras
│   ├── base.css            # Estilos base: tipografía, layout, botones
│   ├── components.css      # Componentes de UI (~55 KB)
│   ├── three-animations.css# Estilos de los canvas y animaciones 3D
│   └── responsive.css      # Media queries y adaptación móvil
└── js/
    ├── main.js             # Entry point: chrome global, scroll, delegación, init por página
    ├── data/
    │   └── products.js     # 36 productos mock, 6 categorías, helpers de consulta
    ├── modules/
    │   ├── utils.js        # formatPrice, DOM helpers, storage, toast, createProductCard
    │   ├── cart.js         # Singleton del carrito con cupones y envío
    │   ├── favorites.js    # Singleton de favoritos
    │   ├── filters.js      # FilterSystem: filtros, orden y paginación
    │   ├── search.js       # GlobalSearch: dropdown, teclado e historial
    │   └── router.js       # getParam, setParams, onPopState
    └── three/
        ├── hero-scene.js       # Zapatos low-poly + partículas del hero
        ├── category-cubes.js   # Cubos de categorías
        ├── product-showcase.js # Zapato interactivo con setShowcaseColor
        ├── timeline-line.js    # Línea de timeline scroll-driven
        └── footer-waves.js     # Ondas del footer
```

## Cómo ejecutar

Los ES modules no se cargan con `file://`, así que hace falta un servidor HTTP. Desde la raíz del proyecto:

```bash
python -m http.server 4173
```

O con npx:

```bash
npx serve -l 4173
```

Luego abre http://localhost:4173 en el navegador.

## Requisitos del navegador

- Navegadores modernos: Chrome, Firefox o Safari en sus versiones actuales.
- WebGL para las animaciones 3D. Si no está disponible, las escenas fallan en silencio y el resto de la tienda funciona con normalidad: el contenido estático, el carrito, los filtros y la búsqueda no dependen de Three.js.
- `prefers-reduced-motion: reduce` desactiva las escenas 3D de forma automática.

## Datos de prueba

- **Cupones**: `SOLE10` aplica 10% de descuento; `WELCOME` aplica $200 fijos.
- **Envío**: $150, gratis cuando (subtotal menos descuento) llega a $2000.
- **Catálogo**: 36 productos mock con ids del 1 al 36, repartidos en running (7), casual (7), formal (5), deportivo (7), lifestyle (6) y outdoor (4). Cada producto tiene tallas, colores, stock por combinación talla-color, rating, reseñas y especificaciones.
- **Imágenes**: pool de fotos de Unsplash servidas con `?w=800&auto=format&fit=crop&q=80`.

## Personalización

### Añadir productos

Edita `js/data/products.js` y agrega un objeto al array `products`. El formato es:

```js
{
  id: 37,                       // único, correlativo
  name: "Nombre del modelo",
  brand: "Marca",
  category: "running",          // running | casual | formal | deportivo | lifestyle | outdoor
  price: 2999,
  discountPrice: null,          // o un número menor para mostrar descuento
  sizes: [39, 40, 41, 42, 43],
  colors: [
    { name: "Negro", hex: "#1A1A1A", image: img('photo-xxxx') }
  ],
  images: [img('photo-xxxx'), img('photo-yyyy'), img('photo-zzzz')],
  description: "Descripción breve.",
  specs: { upper: "Material", sole: "Suela", weight: "300g" },
  rating: 4.5,
  reviews: 100,
  isNew: false,
  isBestseller: false,
  stock: { "39-Negro": 5, "40-Negro": 0 }
}
```

La paleta de colores permitida es la de los design tokens: `#FFFFFF`, `#1A1A1A`, `#FF6B35`, `#1E3A8A`, `#6B6B6B`, `#166534`, `#B91C1C`, `#D6C7A9`. Las imágenes se toman del pool de Unsplash usando el helper `img(id)` que ya está definido en el archivo. Si agregas una categoría nueva, actualiza también el array `categories` con su nombre y conteo.

### Ajustar el diseño

Los tokens de diseño viven en `css/variables.css`: colores base (`--color-white`, `--color-dark`, `--color-accent`), tipografías (Inter y Playfair Display), escala tipográfica, radios, sombras, espaciado y capas z-index. Cambiar un valor ahí se propaga a toda la tienda.

## Notas técnicas

- **Máximo 2 escenas Three activas**: cada escena usa `IntersectionObserver` para pausar su loop de `requestAnimationFrame` cuando sale del viewport y liberar recursos con `cleanup()`. Así el home, que tiene 5 escenas, nunca renderiza más de las que están visibles.
- **Evento `globalScroll`**: `ScrollManager` en `main.js` escucha el scroll con un solo listener pasivo, lo throttle con `requestAnimationFrame` y despacha `globalScroll` con `{ scrollY, velocity }`. Las escenas Three solo guardan esos valores y aplican el movimiento con lerp dentro de su loop, nunca en el listener.
- **Keys de localStorage**: `solestyle_cart` (carrito), `solestyle_favorites` (favoritos), `solestyle_search_history` (historial de búsqueda). La vista grid/lista se guarda en `sessionStorage` bajo `solestyle_view`.
- **Eventos personalizados**: `cart:changed` y `favorites:changed` se despachan tras cada mutación de carrito o favoritos, para que cualquier componente pueda reaccionar.
- **Delegación de eventos**: los botones `data-add-to-cart`, `data-favorite` y `data-move-to-cart` se manejan con un único listener en `document`, así las tarjetas generadas dinámicamente funcionan sin re-cablear.
- **Sin backend**: el checkout es simulado. El botón de compra valida stock, abre el modal de confirmación y vacía el carrito.