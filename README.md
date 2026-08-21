# SoleStyle

Tienda e-commerce de zapatillas premium construida 100% con HTML5, CSS3 y JavaScript vanilla (ES6+ modules), sin frameworks. Las animaciones 3D scroll-driven corren sobre Three.js.

`HTML5` `CSS3` `JavaScript ES6+` `Three.js` `GSAP`

## Descripción

SoleStyle es una tienda de zapatillas de gama alta con catálogo de 36 productos en 6 categorías. El proyecto demuestra que una experiencia de compra moderna, con animaciones 3D, carrito persistente y filtros combinados, se puede construir sin un solo framework ni backend: solo navegador, ES modules y localStorage.

La propuesta de valor es doble. Para el visitante, una tienda rápida y fluida donde el scroll mueve escenas 3D, el carrito recuerda todo entre sesiones y los cupones se aplican al instante. Para quien la mantiene, un código base sin dependencias de npm, con comentarios en español y una estructura modular que se entiende de un vistazo.

## Características

### v1 — Base
- **Animaciones 3D scroll-driven** con Three.js: hero con zapatos low-poly y partículas, cubos de categorías, showcase de producto interactivo, línea de timeline y ondas en el footer.
- **Carrito con cupones**: hasta 50 ítems, cupones SOLE10 (10%) y WELCOME ($200 fijos), envío gratis en pedidos desde $2000, persistencia en localStorage.
- **Favoritos**: lista persistente con badge en el header y botón "Mover al carrito" desde la página de favoritos.
- **Filtros combinados + paginación**: categoría, marca, talla, color y rango de precio, con ordenamiento, 12 productos por página y estado sincronizado en la URL.
- **Búsqueda global con historial**: dropdown con hasta 5 resultados, navegación por teclado e historial de los últimos 10 términos.
- **Chrome global**: drawer del carrito con focus trap, modal de compra completada, toasts, menú móvil y sidebar de filtros, todo con delegación de eventos.
- **Responsive**: layout adaptativo con vista cuadrícula/lista persistida en sessionStorage.
- **Accesibilidad**: atributos ARIA, navegación por teclado en tabs y carrusel, focus trap en el drawer, Escape cierra todo.
- **Reduced motion**: `prefers-reduced-motion` desactiva las escenas Three y añade la clase `reduce-motion` al documento.

### v2 — Funcionalidades de valor
- **Checkout multi-paso**: modal con 3 pasos (envío → pago → revisión), validación por paso, barra de progreso a envío gratis, input de cupón integrado en el drawer.
- **Vista rápida**: botón en cada tarjeta de producto que abre un modal con imagen, tallas, colores, cantidad y añadir al carrito.
- **Comparador de productos**: botón "Comparar" en tarjetas, barra flotante con chips, modal con tabla comparativa (máx 4 productos), resalta el más barato.
- **Reseñas de clientes**: resumen con rating promedio y barras de distribución, ordenamiento, formulario para escribir reseñas con localStorage persistente.
- **Vistos recientemente**: sección dinámica en home y producto con los últimos 8 productos visitados.
- **Aviso de stock**: botón "Avísame" para tallas agotadas con notificación por email.
- **Modo oscuro**: toggle con persistencia, respeta `prefers-color-scheme`, variables CSS redefinidas bajo `[data-theme="dark"]`.
- **UX core**: back-to-top con progreso, sticky header, shortcuts de teclado (`/` busca, `c` abre carrito), skeleton loaders, lightbox de galería, sticky add-to-cart.
- **Animaciones**: announcement bar con marquee, sección de estadísticas con count-up, reveals ScrollTrigger, scroll progress bar, hero intro animado con IntersectionObserver.
- **Reseñas detalladas**: `getReviews()` y `getWarranty()` en products.js para datos mock deterministas.

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
| localStorage / sessionStorage | Navegador | Persistencia de carrito, favoritos, historial, vista, tema, reseñas |

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
│   ├── responsive.css      # Media queries y adaptación móvil
│   └── features/           # Estilos de features v2
│       ├── activity.css    # Vistos recientemente + aviso stock
│       ├── animations.css  # Marquee, stats, reveals, scroll progress
│       ├── checkout.css    # Checkout multi-paso, cupón, envío gratis
│       ├── compare.css     # Comparador de productos
│       ├── quickview.css   # Vista rápida modal
│       ├── reviews.css     # Reseñas de clientes
│       └── ux.css          # Modo oscuro, back-to-top, skeleton, lightbox
└── js/
    ├── main.js             # Entry point: chrome global, scroll, delegación, init por página
    ├── data/
    │   └── products.js     # 36 productos mock, 6 categorías, helpers, reseñas, garantía
    ├── modules/
    │   ├── utils.js        # formatPrice, DOM helpers, storage, toast, createProductCard
    │   ├── cart.js         # Singleton del carrito con cupones y envío
    │   ├── favorites.js    # Singleton de favoritos
    │   ├── filters.js      # FilterSystem: filtros, orden y paginación
    │   ├── search.js       # GlobalSearch: dropdown, teclado e historial
    │   ├── router.js       # getParam, setParams, onPopState
    │   ├── checkout.js     # Checkout multi-paso + barra envío gratis + cupón
    │   ├── quickview.js    # Vista rápida modal
    │   ├── compare.js      # Comparador hasta 4 productos
    │   ├── reviews.js      # Reseñas con localStorage
    │   ├── activity.js     # Vistos recientemente + aviso stock
    │   ├── ux.js           # Modo oscuro, back-to-top, shortcuts, skeleton, lightbox
    │   └── animations.js   # GSAP reveals, count-up, marquee, scroll progress
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
- WebGL para las animaciones 3D. Si no está disponible, las escenas fallan en silencio y el resto de la tienda funciona con normalidad.
- `prefers-reduced-motion: reduce` desactiva las animaciones automáticas y las escenas 3D.

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

### Arquitectura v2
- **Features modulares**: cada feature vive en `js/modules/` con su CSS en `css/features/`. Los prefijos de clases CSS (`ck-`, `qv-`, `cm-`, `rv-`, `act-`, `ux-`, `an-`) evitan colisiones.
- **Sin ediciones existentes**: las features v2 solo crean archivos nuevos y se integran via `main.js` con imports/init.
- **Eventos custom**: `checkout:completed`, `compare:changed`, `theme:changed`, `recently:changed` permiten comunicación entre features.
- **localStorage keys v2**: `solestyle_address`, `solestyle_orders`, `solestyle_compare` (sessionStorage), `solestyle_reviews_<productId>`, `solestyle_recently_viewed`, `solestyle_stock_alerts`, `solestyle_theme`.

### Rendimiento
- **Máximo 2 escenas Three activas**: cada escena usa `IntersectionObserver` para pausar su loop de `requestAnimationFrame` cuando sale del viewport y liberar recursos con `cleanup()`.
- **Evento `globalScroll`**: `ScrollManager` en `main.js` escucha el scroll con un solo listener pasivo, lo throttle con `requestAnimationFrame` y despacha `globalScroll` con `{ scrollY, velocity }`.
- **Skeleton loaders**: en tienda, se muestran 8 placeholders animados mientras se cargan los productos.
- **Lazy loading**: imágenes con `loading="lazy"` excepto hero y galería principal.

### Accesibilidad
- `aria-label` en todo botón de icono; `role="dialog" aria-modal` drawer/modal.
- Escape cierra lo último abierto; foco manejado con focus trap en drawer y modales.
- Navegación completa por teclado: Tab, Enter, Espacio en chips/swatches/tabs.
- `prefers-reduced-motion` → `.reduce-motion * { animation:none !important; transition:none !important }` + JS no inicia escenas ni animaciones automáticas.

### Keys de localStorage
| Key | Tipo | Descripción |
|-----|------|-------------|
| `solestyle_cart` | Array | Items del carrito (máx 50) |
| `solestyle_favorites` | Array | IDs de favoritos |
| `solestyle_search_history` | Array | Últimos 10 términos de búsqueda |
| `solestyle_theme` | String | `'dark'` o `'light'` |
| `solestyle_address` | Object | Dirección guardada del checkout |
| `solestyle_orders` | Array | Historial de pedidos |
| `solestyle_reviews_<id>` | Array | Reseñas guardadas por producto |
| `solestyle_recently_viewed` | Array | Últimos 8 productos vistos |
| `solestyle_stock_alerts` | Array | Alertas de stock por producto |
| `solestyle_view` | String | Vista grid/lista (sessionStorage) |
| `solestyle_compare` | Array | IDs a comparar (sessionStorage) |
