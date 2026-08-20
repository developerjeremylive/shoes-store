// ============================================================
// SoleStyle — Catálogo de productos (contrato §6)
// 36 productos · 6 categorías · 8 marcas · pool de imágenes Unsplash
// ============================================================

// Construye la URL completa de una imagen desde el pool autorizado de Unsplash.
const img = (id) => `https://images.unsplash.com/${id}?w=800&auto=format&fit=crop&q=80`;

export const products = [
  // ---------- RUNNING (7) ----------
  {
    id: 1, name: "TurboFlex Runner", brand: "Nike", category: "running",
    price: 2899, discountPrice: 2319,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1542291026-7eec264c27ff') },
      { name: "Naranja", hex: "#FF6B35", image: img('photo-1600185365483-26d7a4cc7519') },
      { name: "Azul", hex: "#1E3A8A", image: img('photo-1606107557195-0e29a4b5b4aa') }
    ],
    images: [
      img('photo-1595950653106-6c9ebd614d3a'),
      img('photo-1560769629-975ec94e6a86'),
      img('photo-1549298916-b41d501d3772')
    ],
    description: "Zapatilla de running con espuma reactiva que devuelve energía en cada zancada. Ideal para entrenamientos diarios y carreras de hasta 10 km.",
    specs: { upper: "Malla transpirable", sole: "Espuma React", weight: "265g" },
    rating: 4.5, reviews: 128,
    isNew: false, isBestseller: true,
    stock: {
      "39-Negro": 5, "40-Negro": 0, "41-Negro": 12, "42-Negro": 8, "43-Negro": 6, "44-Negro": 4, "45-Negro": 2,
      "39-Naranja": 0, "40-Naranja": 7, "41-Naranja": 9, "42-Naranja": 5, "43-Naranja": 3, "44-Naranja": 2, "45-Naranja": 1,
      "39-Azul": 4, "40-Azul": 6, "41-Azul": 3, "42-Azul": 7, "43-Azul": 5, "44-Azul": 2, "45-Azul": 0
    }
  },
  {
    id: 2, name: "AeroStride 5", brand: "Adidas", category: "running",
    price: 3499, discountPrice: null,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1552346154-21d32810aba3') },
      { name: "Gris", hex: "#6B6B6B", image: img('photo-1543163521-1bf539c55dd2') }
    ],
    images: [
      img('photo-1608231387042-66d1773070a5'),
      img('photo-1608256246200-53e635b5b65f'),
      img('photo-1595341888016-a392ef81b7de')
    ],
    description: "Ligera y aerodinámica, con malla técnica que mantiene el pie fresco en kilómetros largos. Perfecta para ritmos rápidos.",
    specs: { upper: "Malla técnica Primeknit", sole: "Suela Boost", weight: "240g" },
    rating: 4.5, reviews: 96,
    isNew: true, isBestseller: false,
    stock: {
      "39-Blanco": 6, "40-Blanco": 8, "41-Blanco": 10, "42-Blanco": 7, "43-Blanco": 5, "44-Blanco": 3, "45-Blanco": 0,
      "39-Gris": 0, "40-Gris": 4, "41-Gris": 6, "42-Gris": 5, "43-Gris": 4, "44-Gris": 2, "45-Gris": 1
    }
  },
  {
    id: 3, name: "Velocity Track", brand: "ASICS", category: "running",
    price: 3199, discountPrice: null,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Azul", hex: "#1E3A8A", image: img('photo-1603808033192-082d6919d3e1') },
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1548036328-c9fa89d128fa') }
    ],
    images: [
      img('photo-1539185441755-769473a23570'),
      img('photo-1556906781-9a412961c28c'),
      img('photo-1560343090-f0409e92791a')
    ],
    description: "Amortiguación Gel en el talón para absorber impactos en asfalto. Estabilidad y confort para corredores de medio fondo.",
    specs: { upper: "Malla transpirable", sole: "Gel Cushioning", weight: "290g" },
    rating: 5.0, reviews: 210,
    isNew: false, isBestseller: true,
    stock: {
      "39-Azul": 3, "40-Azul": 5, "41-Azul": 8, "42-Azul": 9, "43-Azul": 6, "44-Azul": 4, "45-Azul": 2,
      "39-Blanco": 7, "40-Blanco": 6, "41-Blanco": 5, "42-Blanco": 4, "43-Blanco": 0, "44-Blanco": 3, "45-Blanco": 0
    }
  },
  {
    id: 4, name: "FreshFoam Pace", brand: "New Balance", category: "running",
    price: 3299, discountPrice: 2804,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Gris", hex: "#6B6B6B", image: img('photo-1579338559194-a162d19bf842') },
      { name: "Verde", hex: "#166534", image: img('photo-1584735175315-9d5df23860e6') }
    ],
    images: [
      img('photo-1600269452121-4f2416e55c28'),
      img('photo-1605348532760-6753d2c43329'),
      img('photo-1591047139829-d91aecb6caea')
    ],
    description: "Espuma FreshFoam de suela completa para una pisada suave y estable. Tu aliada para rodajes largos de fin de semana.",
    specs: { upper: "Malla transpirable", sole: "Espuma FreshFoam", weight: "275g" },
    rating: 4.0, reviews: 74,
    isNew: false, isBestseller: false,
    stock: {
      "39-Gris": 4, "40-Gris": 6, "41-Gris": 7, "42-Gris": 5, "43-Gris": 3, "44-Gris": 2, "45-Gris": 0,
      "39-Verde": 0, "40-Verde": 3, "41-Verde": 5, "42-Verde": 4, "43-Verde": 2, "44-Verde": 1, "45-Verde": 1
    }
  },
  {
    id: 5, name: "SpeedCell Runner", brand: "Puma", category: "running",
    price: 2799, discountPrice: null,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Rojo", hex: "#B91C1C", image: img('photo-1596703263926-eb0762ee17e4') },
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1605810230434-7631ac76ec81') }
    ],
    images: [
      img('photo-1512374382149-233c42b6a83b'),
      img('photo-1525966222134-fcfa99b8ae77'),
      img('photo-1491553895911-0055eca6402d')
    ],
    description: "Tecnología SpeedCell en la entresuela para propulsión extra en cada paso. Diseñada para corredores que buscan velocidad.",
    specs: { upper: "Malla transpirable", sole: "SpeedCell", weight: "255g" },
    rating: 4.0, reviews: 58,
    isNew: false, isBestseller: false,
    stock: {
      "39-Rojo": 5, "40-Rojo": 7, "41-Rojo": 6, "42-Rojo": 4, "43-Rojo": 3, "44-Rojo": 2, "45-Rojo": 0,
      "39-Negro": 0, "40-Negro": 5, "41-Negro": 8, "42-Negro": 6, "43-Negro": 4, "44-Negro": 3, "45-Negro": 2
    }
  },
  {
    id: 6, name: "ZigKinetica Run", brand: "Reebok", category: "running",
    price: 2799, discountPrice: 1959,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1608667508764-33cf0726b13a') },
      { name: "Naranja", hex: "#FF6B35", image: img('photo-1543508282-6319a3e2621f') }
    ],
    images: [
      img('photo-1614252369475-531eba835eb1'),
      img('photo-1585386959984-a4155224a1ad'),
      img('photo-1542291026-7eec264c27ff')
    ],
    description: "Suela Zig con geometría que convierte el impacto en impulso. Comodidad diferencial para entrenamientos intensos.",
    specs: { upper: "Malla transpirable", sole: "Goma Zig", weight: "300g" },
    rating: 3.5, reviews: 41,
    isNew: false, isBestseller: false,
    stock: {
      "39-Negro": 6, "40-Negro": 8, "41-Negro": 5, "42-Negro": 4, "43-Negro": 3, "44-Negro": 2, "45-Negro": 0,
      "39-Naranja": 0, "40-Naranja": 4, "41-Naranja": 6, "42-Naranja": 5, "43-Naranja": 3, "44-Naranja": 2, "45-Naranja": 1
    }
  },
  {
    id: 7, name: "AirZoom Sprint", brand: "Nike", category: "running",
    price: 3899, discountPrice: null,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1600185365483-26d7a4cc7519') },
      { name: "Rojo", hex: "#B91C1C", image: img('photo-1606107557195-0e29a4b5b4aa') }
    ],
    images: [
      img('photo-1595950653106-6c9ebd614d3a'),
      img('photo-1560769629-975ec94e6a86'),
      img('photo-1549298916-b41d501d3772')
    ],
    description: "Unidad Zoom Air en el antepié para una respuesta explosiva. Perfecta para series y competiciones de velocidad.",
    specs: { upper: "Malla transpirable", sole: "Zoom Air", weight: "230g" },
    rating: 4.5, reviews: 152,
    isNew: true, isBestseller: false,
    stock: {
      "39-Blanco": 4, "40-Blanco": 6, "41-Blanco": 9, "42-Blanco": 7, "43-Blanco": 5, "44-Blanco": 3, "45-Blanco": 0,
      "39-Rojo": 0, "40-Rojo": 5, "41-Rojo": 4, "42-Rojo": 6, "43-Rojo": 3, "44-Rojo": 2, "45-Rojo": 1
    }
  },

  // ---------- CASUAL (7) ----------
  {
    id: 8, name: "Clásico Court", brand: "Converse", category: "casual",
    price: 1899, discountPrice: 1709,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1552346154-21d32810aba3') },
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1543163521-1bf539c55dd2') }
    ],
    images: [
      img('photo-1608231387042-66d1773070a5'),
      img('photo-1608256246200-53e635b5b65f'),
      img('photo-1595341888016-a392ef81b7de')
    ],
    description: "El clásico de lona con suela de goma que nunca pasa de moda. Versátil para el día a día y looks casuales.",
    specs: { upper: "Lona resistente", sole: "Goma vulcanizada", weight: "320g" },
    rating: 4.5, reviews: 320,
    isNew: false, isBestseller: false,
    stock: {
      "36-Blanco": 8, "37-Blanco": 10, "38-Blanco": 12, "39-Blanco": 9, "40-Blanco": 7, "41-Blanco": 6, "42-Blanco": 5, "43-Blanco": 3, "44-Blanco": 0,
      "36-Negro": 0, "37-Negro": 6, "38-Negro": 8, "39-Negro": 7, "40-Negro": 5, "41-Negro": 4, "42-Negro": 3, "43-Negro": 2, "44-Negro": 1
    }
  },
  {
    id: 9, name: "Urban Step", brand: "Vans", category: "casual",
    price: 1699, discountPrice: 1274,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1603808033192-082d6919d3e1') },
      { name: "Beige", hex: "#D6C7A9", image: img('photo-1548036328-c9fa89d128fa') }
    ],
    images: [
      img('photo-1539185441755-769473a23570'),
      img('photo-1556906781-9a412961c28c'),
      img('photo-1560343090-f0409e92791a')
    ],
    description: "Sneaker de perfil bajo con suela waffle antiderrapante. Comodidad urbana para caminar todo el día.",
    specs: { upper: "Lona resistente", sole: "Goma waffle", weight: "310g" },
    rating: 4.0, reviews: 265,
    isNew: false, isBestseller: false,
    stock: {
      "36-Negro": 6, "37-Negro": 8, "38-Negro": 10, "39-Negro": 7, "40-Negro": 5, "41-Negro": 4, "42-Negro": 3, "43-Negro": 2, "44-Negro": 0,
      "36-Beige": 0, "37-Beige": 5, "38-Beige": 7, "39-Beige": 6, "40-Beige": 4, "41-Beige": 3, "42-Beige": 2, "43-Beige": 1, "44-Beige": 1
    }
  },
  {
    id: 10, name: "Campus Low", brand: "Adidas", category: "casual",
    price: 2299, discountPrice: null,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Verde", hex: "#166534", image: img('photo-1579338559194-a162d19bf842') },
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1584735175315-9d5df23860e6') }
    ],
    images: [
      img('photo-1600269452121-4f2416e55c28'),
      img('photo-1605348532760-6753d2c43329'),
      img('photo-1591047139829-d91aecb6caea')
    ],
    description: "Silueta retro de gamuza con detalles en tonos suaves. Un básico atemporal para el street style.",
    specs: { upper: "Gamuza suave", sole: "Goma vulcanizada", weight: "330g" },
    rating: 4.5, reviews: 187,
    isNew: true, isBestseller: false,
    stock: {
      "36-Verde": 5, "37-Verde": 7, "38-Verde": 9, "39-Verde": 6, "40-Verde": 4, "41-Verde": 3, "42-Verde": 2, "43-Verde": 0, "44-Verde": 1,
      "36-Blanco": 0, "37-Blanco": 6, "38-Blanco": 8, "39-Blanco": 7, "40-Blanco": 5, "41-Blanco": 4, "42-Blanco": 3, "43-Blanco": 2, "44-Blanco": 1
    }
  },
  {
    id: 11, name: "Skyline 90s", brand: "New Balance", category: "casual",
    price: 2599, discountPrice: null,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Gris", hex: "#6B6B6B", image: img('photo-1596703263926-eb0762ee17e4') },
      { name: "Azul", hex: "#1E3A8A", image: img('photo-1605810230434-7631ac76ec81') }
    ],
    images: [
      img('photo-1512374382149-233c42b6a83b'),
      img('photo-1525966222134-fcfa99b8ae77'),
      img('photo-1491553895911-0055eca6402d')
    ],
    description: "Inspirada en los 90, con paneles de gamuza y malla. Estilo retro con la comodidad moderna.",
    specs: { upper: "Gamuza y malla", sole: "Goma EVA", weight: "340g" },
    rating: 4.5, reviews: 143,
    isNew: false, isBestseller: true,
    stock: {
      "36-Gris": 4, "37-Gris": 6, "38-Gris": 8, "39-Gris": 7, "40-Gris": 5, "41-Gris": 4, "42-Gris": 3, "43-Gris": 2, "44-Gris": 0,
      "36-Azul": 0, "37-Azul": 5, "38-Azul": 6, "39-Azul": 5, "40-Azul": 4, "41-Azul": 3, "42-Azul": 2, "43-Azul": 1, "44-Azul": 1
    }
  },
  {
    id: 12, name: "Suede Classic", brand: "Puma", category: "casual",
    price: 2199, discountPrice: 1759,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Rojo", hex: "#B91C1C", image: img('photo-1608667508764-33cf0726b13a') },
      { name: "Beige", hex: "#D6C7A9", image: img('photo-1543508282-6319a3e2621f') }
    ],
    images: [
      img('photo-1614252369475-531eba835eb1'),
      img('photo-1585386959984-a4155224a1ad'),
      img('photo-1542291026-7eec264c27ff')
    ],
    description: "La icónica silueta de gamuza con la franja característica. Elegancia casual para cualquier ocasión.",
    specs: { upper: "Gamuza suave", sole: "Goma vulcanizada", weight: "325g" },
    rating: 4.0, reviews: 98,
    isNew: false, isBestseller: false,
    stock: {
      "36-Rojo": 6, "37-Rojo": 8, "38-Rojo": 7, "39-Rojo": 5, "40-Rojo": 4, "41-Rojo": 3, "42-Rojo": 2, "43-Rojo": 0, "44-Rojo": 1,
      "36-Beige": 0, "37-Beige": 4, "38-Beige": 6, "39-Beige": 5, "40-Beige": 3, "41-Beige": 2, "42-Beige": 2, "43-Beige": 1, "44-Beige": 1
    }
  },
  {
    id: 13, name: "Club C 85", brand: "Reebok", category: "casual",
    price: 1999, discountPrice: 1599,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1600185365483-26d7a4cc7519') },
      { name: "Verde", hex: "#166534", image: img('photo-1606107557195-0e29a4b5b4aa') }
    ],
    images: [
      img('photo-1595950653106-6c9ebd614d3a'),
      img('photo-1560769629-975ec94e6a86'),
      img('photo-1549298916-b41d501d3772')
    ],
    description: "Diseño limpio de los 80 con cuero suave y forro acolchado. Minimalismo que combina con todo.",
    specs: { upper: "Cuero suave", sole: "Goma EVA", weight: "335g" },
    rating: 4.0, reviews: 112,
    isNew: false, isBestseller: false,
    stock: {
      "36-Blanco": 7, "37-Blanco": 9, "38-Blanco": 8, "39-Blanco": 6, "40-Blanco": 5, "41-Blanco": 4, "42-Blanco": 3, "43-Blanco": 2, "44-Blanco": 0,
      "36-Verde": 0, "37-Verde": 5, "38-Verde": 6, "39-Verde": 4, "40-Verde": 3, "41-Verde": 2, "42-Verde": 2, "43-Verde": 1, "44-Verde": 1
    }
  },
  {
    id: 14, name: "Chuck Taylor All Star", brand: "Converse", category: "casual",
    price: 1799, discountPrice: null,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1552346154-21d32810aba3') },
      { name: "Rojo", hex: "#B91C1C", image: img('photo-1543163521-1bf539c55dd2') }
    ],
    images: [
      img('photo-1608231387042-66d1773070a5'),
      img('photo-1608256246200-53e635b5b65f'),
      img('photo-1595341888016-a392ef81b7de')
    ],
    description: "El tenis más famoso del mundo, con punta de goma y parche clásico. Un ícono que trasciende generaciones.",
    specs: { upper: "Lona resistente", sole: "Goma vulcanizada", weight: "300g" },
    rating: 4.5, reviews: 480,
    isNew: false, isBestseller: false,
    stock: {
      "36-Negro": 10, "37-Negro": 12, "38-Negro": 14, "39-Negro": 10, "40-Negro": 8, "41-Negro": 6, "42-Negro": 5, "43-Negro": 3, "44-Negro": 0,
      "36-Rojo": 0, "37-Rojo": 6, "38-Rojo": 8, "39-Rojo": 7, "40-Rojo": 5, "41-Rojo": 4, "42-Rojo": 3, "43-Rojo": 2, "44-Rojo": 1
    }
  },

  // ---------- FORMAL (5) ----------
  {
    id: 15, name: "Executive Derby", brand: "Adidas", category: "formal",
    price: 4599, discountPrice: 2990,
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1603808033192-082d6919d3e1') },
      { name: "Beige", hex: "#D6C7A9", image: img('photo-1548036328-c9fa89d128fa') }
    ],
    images: [
      img('photo-1539185441755-769473a23570'),
      img('photo-1556906781-9a412961c28c'),
      img('photo-1560343090-f0409e92791a')
    ],
    description: "Derby de piel pulida con costuras finas y suela de cuero. La elección perfecta para la oficina y eventos formales.",
    specs: { upper: "Piel pulida", sole: "Cuero y goma", weight: "480g" },
    rating: 4.5, reviews: 67,
    isNew: false, isBestseller: false,
    stock: {
      "38-Negro": 4, "39-Negro": 6, "40-Negro": 8, "41-Negro": 7, "42-Negro": 5, "43-Negro": 3, "44-Negro": 0,
      "38-Beige": 0, "39-Beige": 3, "40-Beige": 5, "41-Beige": 4, "42-Beige": 3, "43-Beige": 2, "44-Beige": 1
    }
  },
  {
    id: 16, name: "Monaco Loafer", brand: "New Balance", category: "formal",
    price: 3899, discountPrice: null,
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Beige", hex: "#D6C7A9", image: img('photo-1579338559194-a162d19bf842') },
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1584735175315-9d5df23860e6') }
    ],
    images: [
      img('photo-1600269452121-4f2416e55c28'),
      img('photo-1605348532760-6753d2c43329'),
      img('photo-1591047139829-d91aecb6caea')
    ],
    description: "Mocasín de piel con hebilla metálica y construcción sin cordones. Sofisticación y facilidad para vestir.",
    specs: { upper: "Piel suave", sole: "Cuero y goma", weight: "450g" },
    rating: 4.0, reviews: 52,
    isNew: true, isBestseller: false,
    stock: {
      "38-Beige": 3, "39-Beige": 5, "40-Beige": 6, "41-Beige": 5, "42-Beige": 4, "43-Beige": 2, "44-Beige": 0,
      "38-Negro": 0, "39-Negro": 4, "40-Negro": 6, "41-Negro": 5, "42-Negro": 3, "43-Negro": 2, "44-Negro": 1
    }
  },
  {
    id: 17, name: "Oxford Classic", brand: "Puma", category: "formal",
    price: 4299, discountPrice: null,
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1596703263926-eb0762ee17e4') },
      { name: "Gris", hex: "#6B6B6B", image: img('photo-1605810230434-7631ac76ec81') }
    ],
    images: [
      img('photo-1512374382149-233c42b6a83b'),
      img('photo-1525966222134-fcfa99b8ae77'),
      img('photo-1491553895911-0055eca6402d')
    ],
    description: "Oxford de amarre cerrado con acabado brillante. Clásico de vestir que eleva cualquier traje.",
    specs: { upper: "Piel pulida", sole: "Cuero y goma", weight: "470g" },
    rating: 4.5, reviews: 89,
    isNew: false, isBestseller: false,
    stock: {
      "38-Negro": 5, "39-Negro": 7, "40-Negro": 8, "41-Negro": 6, "42-Negro": 4, "43-Negro": 3, "44-Negro": 0,
      "38-Gris": 0, "39-Gris": 4, "40-Gris": 5, "41-Gris": 4, "42-Gris": 3, "43-Gris": 2, "44-Gris": 1
    }
  },
  {
    id: 18, name: "Milano Brogue", brand: "Nike", category: "formal",
    price: 4999, discountPrice: null,
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Beige", hex: "#D6C7A9", image: img('photo-1608667508764-33cf0726b13a') },
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1543508282-6319a3e2621f') }
    ],
    images: [
      img('photo-1614252369475-531eba835eb1'),
      img('photo-1585386959984-a4155224a1ad'),
      img('photo-1542291026-7eec264c27ff')
    ],
    description: "Brogue con perforaciones decorativas y piel de primera calidad. Detalle artesanal para ocasiones especiales.",
    specs: { upper: "Piel grabada", sole: "Cuero y goma", weight: "490g" },
    rating: 4.0, reviews: 36,
    isNew: false, isBestseller: false,
    stock: {
      "38-Beige": 2, "39-Beige": 4, "40-Beige": 5, "41-Beige": 4, "42-Beige": 3, "43-Beige": 2, "44-Beige": 0,
      "38-Negro": 0, "39-Negro": 3, "40-Negro": 5, "41-Negro": 4, "42-Negro": 3, "43-Negro": 2, "44-Negro": 1
    }
  },
  {
    id: 19, name: "Veneto Monk", brand: "Reebok", category: "formal",
    price: 4699, discountPrice: null,
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1600185365483-26d7a4cc7519') },
      { name: "Beige", hex: "#D6C7A9", image: img('photo-1606107557195-0e29a4b5b4aa') }
    ],
    images: [
      img('photo-1595950653106-6c9ebd614d3a'),
      img('photo-1560769629-975ec94e6a86'),
      img('photo-1549298916-b41d501d3772')
    ],
    description: "Monk strap de doble hebilla con piel flexible. Un toque contemporáneo para el guardarropa formal.",
    specs: { upper: "Piel suave", sole: "Cuero y goma", weight: "460g" },
    rating: 3.5, reviews: 28,
    isNew: false, isBestseller: false,
    stock: {
      "38-Negro": 3, "39-Negro": 5, "40-Negro": 6, "41-Negro": 5, "42-Negro": 4, "43-Negro": 2, "44-Negro": 0,
      "38-Beige": 0, "39-Beige": 2, "40-Beige": 4, "41-Beige": 3, "42-Beige": 2, "43-Beige": 1, "44-Beige": 1
    }
  },

  // ---------- DEPORTIVO (7) ----------
  {
    id: 20, name: "Veloz Track", brand: "ASICS", category: "deportivo",
    price: 3499, discountPrice: 2799,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Azul", hex: "#1E3A8A", image: img('photo-1552346154-21d32810aba3') },
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1543163521-1bf539c55dd2') }
    ],
    images: [
      img('photo-1608231387042-66d1773070a5'),
      img('photo-1608256246200-53e635b5b65f'),
      img('photo-1595341888016-a392ef81b7de')
    ],
    description: "Zapatilla de pista con placa de propulsión para máxima velocidad. Diseñada para sprints y entrenamientos de velocidad.",
    specs: { upper: "Malla transpirable", sole: "Placa de propulsión", weight: "220g" },
    rating: 4.5, reviews: 176,
    isNew: false, isBestseller: true,
    stock: {
      "39-Azul": 5, "40-Azul": 7, "41-Azul": 9, "42-Azul": 8, "43-Azul": 6, "44-Azul": 4, "45-Azul": 0,
      "39-Blanco": 0, "40-Blanco": 6, "41-Blanco": 7, "42-Blanco": 5, "43-Blanco": 4, "44-Blanco": 3, "45-Blanco": 2
    }
  },
  {
    id: 21, name: "Court Smash", brand: "Adidas", category: "deportivo",
    price: 3099, discountPrice: null,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1603808033192-082d6919d3e1') },
      { name: "Verde", hex: "#166534", image: img('photo-1548036328-c9fa89d128fa') }
    ],
    images: [
      img('photo-1539185441755-769473a23570'),
      img('photo-1556906781-9a412961c28c'),
      img('photo-1560343090-f0409e92791a')
    ],
    description: "Zapatilla de cancha con agarre multidireccional en la suela. Estabilidad para cambios de dirección rápidos.",
    specs: { upper: "Malla transpirable", sole: "Goma multidireccional", weight: "310g" },
    rating: 4.0, reviews: 84,
    isNew: true, isBestseller: false,
    stock: {
      "39-Blanco": 6, "40-Blanco": 8, "41-Blanco": 7, "42-Blanco": 5, "43-Blanco": 4, "44-Blanco": 3, "45-Blanco": 0,
      "39-Verde": 0, "40-Verde": 4, "41-Verde": 6, "42-Verde": 5, "43-Verde": 3, "44-Verde": 2, "45-Verde": 1
    }
  },
  {
    id: 22, name: "PowerStrike Trainer", brand: "Nike", category: "deportivo",
    price: 3599, discountPrice: null,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1579338559194-a162d19bf842') },
      { name: "Naranja", hex: "#FF6B35", image: img('photo-1584735175315-9d5df23860e6') }
    ],
    images: [
      img('photo-1600269452121-4f2416e55c28'),
      img('photo-1605348532760-6753d2c43329'),
      img('photo-1591047139829-d91aecb6caea')
    ],
    description: "Entrenamiento funcional con soporte lateral y amortiguación firme. Lista para pesas, crossfit y HIIT.",
    specs: { upper: "Malla transpirable", sole: "Goma EVA firme", weight: "330g" },
    rating: 4.5, reviews: 203,
    isNew: false, isBestseller: false,
    stock: {
      "39-Negro": 7, "40-Negro": 9, "41-Negro": 8, "42-Negro": 6, "43-Negro": 5, "44-Negro": 3, "45-Negro": 0,
      "39-Naranja": 0, "40-Naranja": 5, "41-Naranja": 7, "42-Naranja": 6, "43-Naranja": 4, "44-Naranja": 3, "45-Naranja": 2
    }
  },
  {
    id: 23, name: "FlexCourt 3", brand: "New Balance", category: "deportivo",
    price: 3099, discountPrice: 2479,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1596703263926-eb0762ee17e4') },
      { name: "Azul", hex: "#1E3A8A", image: img('photo-1605810230434-7631ac76ec81') }
    ],
    images: [
      img('photo-1512374382149-233c42b6a83b'),
      img('photo-1525966222134-fcfa99b8ae77'),
      img('photo-1491553895911-0055eca6402d')
    ],
    description: "Flexibilidad en la zona del antepié para movimientos ágiles en cancha. Ligera y con excelente tracción.",
    specs: { upper: "Malla transpirable", sole: "Goma flexible", weight: "295g" },
    rating: 4.0, reviews: 61,
    isNew: false, isBestseller: false,
    stock: {
      "39-Blanco": 5, "40-Blanco": 7, "41-Blanco": 8, "42-Blanco": 6, "43-Blanco": 4, "44-Blanco": 3, "45-Blanco": 0,
      "39-Azul": 0, "40-Azul": 5, "41-Azul": 6, "42-Azul": 5, "43-Azul": 3, "44-Azul": 2, "45-Azul": 1
    }
  },
  {
    id: 24, name: "Rapid Fire", brand: "Puma", category: "deportivo",
    price: 2899, discountPrice: null,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Rojo", hex: "#B91C1C", image: img('photo-1608667508764-33cf0726b13a') },
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1543508282-6319a3e2621f') }
    ],
    images: [
      img('photo-1614252369475-531eba835eb1'),
      img('photo-1585386959984-a4155224a1ad'),
      img('photo-1542291026-7eec264c27ff')
    ],
    description: "Respuesta rápida en cada arranque con suela de goma de alto agarre. Para entrenamientos explosivos.",
    specs: { upper: "Malla transpirable", sole: "Goma de alto agarre", weight: "305g" },
    rating: 3.5, reviews: 45,
    isNew: false, isBestseller: false,
    stock: {
      "39-Rojo": 6, "40-Rojo": 8, "41-Rojo": 7, "42-Rojo": 5, "43-Rojo": 4, "44-Rojo": 2, "45-Rojo": 0,
      "39-Negro": 0, "40-Negro": 6, "41-Negro": 7, "42-Negro": 5, "43-Negro": 3, "44-Negro": 2, "45-Negro": 1
    }
  },
  {
    id: 25, name: "CrossFit Pro", brand: "Reebok", category: "deportivo",
    price: 3299, discountPrice: null,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1600185365483-26d7a4cc7519') },
      { name: "Gris", hex: "#6B6B6B", image: img('photo-1606107557195-0e29a4b5b4aa') }
    ],
    images: [
      img('photo-1595950653106-6c9ebd614d3a'),
      img('photo-1560769629-975ec94e6a86'),
      img('photo-1549298916-b41d501d3772')
    ],
    description: "Suela plana y estable para levantamiento, con flexión en el antepié. La herramienta completa del box.",
    specs: { upper: "Malla transpirable", sole: "Goma plana estable", weight: "360g" },
    rating: 4.0, reviews: 132,
    isNew: false, isBestseller: false,
    stock: {
      "39-Negro": 8, "40-Negro": 9, "41-Negro": 7, "42-Negro": 6, "43-Negro": 5, "44-Negro": 3, "45-Negro": 0,
      "39-Gris": 0, "40-Gris": 5, "41-Gris": 6, "42-Gris": 5, "43-Gris": 4, "44-Gris": 2, "45-Gris": 1
    }
  },
  {
    id: 26, name: "Striker FG", brand: "Nike", category: "deportivo",
    price: 3799, discountPrice: null,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Rojo", hex: "#B91C1C", image: img('photo-1552346154-21d32810aba3') },
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1543163521-1bf539c55dd2') }
    ],
    images: [
      img('photo-1608231387042-66d1773070a5'),
      img('photo-1608256246200-53e635b5b65f'),
      img('photo-1595341888016-a392ef81b7de')
    ],
    description: "Tacos de fútbol en pasto natural con agarre firme. Precisión y control en cada toque.",
    specs: { upper: "Sintético ligero", sole: "Tacos FG", weight: "250g" },
    rating: 4.5, reviews: 168,
    isNew: true, isBestseller: false,
    stock: {
      "39-Rojo": 5, "40-Rojo": 7, "41-Rojo": 9, "42-Rojo": 8, "43-Rojo": 6, "44-Rojo": 4, "45-Rojo": 0,
      "39-Blanco": 0, "40-Blanco": 6, "41-Blanco": 8, "42-Blanco": 7, "43-Blanco": 5, "44-Blanco": 3, "45-Blanco": 2
    }
  },

  // ---------- LIFESTYLE (6) ----------
  {
    id: 27, name: "Retro Runner 84", brand: "New Balance", category: "lifestyle",
    price: 2599, discountPrice: 2079,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Gris", hex: "#6B6B6B", image: img('photo-1603808033192-082d6919d3e1') },
      { name: "Beige", hex: "#D6C7A9", image: img('photo-1548036328-c9fa89d128fa') }
    ],
    images: [
      img('photo-1539185441755-769473a23570'),
      img('photo-1556906781-9a412961c28c'),
      img('photo-1560343090-f0409e92791a')
    ],
    description: "Silueta retro de corredor con amortiguación suave. Nostalgia de los 80 con confort actual.",
    specs: { upper: "Gamuza y malla", sole: "Goma EVA", weight: "345g" },
    rating: 4.5, reviews: 240,
    isNew: false, isBestseller: true,
    stock: {
      "36-Gris": 5, "37-Gris": 7, "38-Gris": 9, "39-Gris": 8, "40-Gris": 6, "41-Gris": 5, "42-Gris": 4, "43-Gris": 2, "44-Gris": 0,
      "36-Beige": 0, "37-Beige": 5, "38-Beige": 7, "39-Beige": 6, "40-Beige": 5, "41-Beige": 4, "42-Beige": 3, "43-Beige": 2, "44-Beige": 1
    }
  },
  {
    id: 28, name: "Classic Suede", brand: "Converse", category: "lifestyle",
    price: 2099, discountPrice: null,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Verde", hex: "#166534", image: img('photo-1579338559194-a162d19bf842') },
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1584735175315-9d5df23860e6') }
    ],
    images: [
      img('photo-1600269452121-4f2416e55c28'),
      img('photo-1605348532760-6753d2c43329'),
      img('photo-1591047139829-d91aecb6caea')
    ],
    description: "Gamuza premium con suela de goma y detalles minimalistas. Un básico elegante para el fin de semana.",
    specs: { upper: "Gamuza suave", sole: "Goma vulcanizada", weight: "315g" },
    rating: 4.0, reviews: 156,
    isNew: false, isBestseller: false,
    stock: {
      "36-Verde": 6, "37-Verde": 8, "38-Verde": 7, "39-Verde": 6, "40-Verde": 5, "41-Verde": 4, "42-Verde": 3, "43-Verde": 2, "44-Verde": 0,
      "36-Negro": 0, "37-Negro": 6, "38-Negro": 8, "39-Negro": 7, "40-Negro": 5, "41-Negro": 4, "42-Negro": 3, "43-Negro": 2, "44-Negro": 1
    }
  },
  {
    id: 29, name: "Heritage Low", brand: "Vans", category: "lifestyle",
    price: 1899, discountPrice: null,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1596703263926-eb0762ee17e4') },
      { name: "Rojo", hex: "#B91C1C", image: img('photo-1605810230434-7631ac76ec81') }
    ],
    images: [
      img('photo-1512374382149-233c42b6a83b'),
      img('photo-1525966222134-fcfa99b8ae77'),
      img('photo-1491553895911-0055eca6402d')
    ],
    description: "Perfil bajo con la franja clásica y suela waffle. El estilo callejero en su forma más pura.",
    specs: { upper: "Lona resistente", sole: "Goma waffle", weight: "305g" },
    rating: 4.0, reviews: 198,
    isNew: false, isBestseller: false,
    stock: {
      "36-Blanco": 7, "37-Blanco": 9, "38-Blanco": 8, "39-Blanco": 7, "40-Blanco": 6, "41-Blanco": 5, "42-Blanco": 4, "43-Blanco": 2, "44-Blanco": 0,
      "36-Rojo": 0, "37-Rojo": 5, "38-Rojo": 7, "39-Rojo": 6, "40-Rojo": 5, "41-Rojo": 4, "42-Rojo": 3, "43-Rojo": 2, "44-Rojo": 1
    }
  },
  {
    id: 30, name: "Metro Sneaker", brand: "ASICS", category: "lifestyle",
    price: 2399, discountPrice: null,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Azul", hex: "#1E3A8A", image: img('photo-1608667508764-33cf0726b13a') },
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1543508282-6319a3e2621f') }
    ],
    images: [
      img('photo-1614252369475-531eba835eb1'),
      img('photo-1585386959984-a4155224a1ad'),
      img('photo-1542291026-7eec264c27ff')
    ],
    description: "Diseño urbano con amortiguación ligera y líneas modernas. Para moverte por la ciudad con estilo.",
    specs: { upper: "Malla transpirable", sole: "Goma EVA", weight: "285g" },
    rating: 4.5, reviews: 121,
    isNew: true, isBestseller: false,
    stock: {
      "36-Azul": 5, "37-Azul": 7, "38-Azul": 9, "39-Azul": 8, "40-Azul": 6, "41-Azul": 5, "42-Azul": 4, "43-Azul": 2, "44-Azul": 0,
      "36-Blanco": 0, "37-Blanco": 6, "38-Blanco": 8, "39-Blanco": 7, "40-Blanco": 5, "41-Blanco": 4, "42-Blanco": 3, "43-Blanco": 2, "44-Blanco": 1
    }
  },
  {
    id: 31, name: "Iconic 70s", brand: "Converse", category: "lifestyle",
    price: 1999, discountPrice: null,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1600185365483-26d7a4cc7519') },
      { name: "Beige", hex: "#D6C7A9", image: img('photo-1606107557195-0e29a4b5b4aa') }
    ],
    images: [
      img('photo-1595950653106-6c9ebd614d3a'),
      img('photo-1560769629-975ec94e6a86'),
      img('photo-1549298916-b41d501d3772')
    ],
    description: "Homenaje a los 70 con punta más delgada y lona de alta densidad. Autenticidad vintage en cada paso.",
    specs: { upper: "Lona de alta densidad", sole: "Goma vulcanizada", weight: "295g" },
    rating: 4.5, reviews: 290,
    isNew: false, isBestseller: false,
    stock: {
      "36-Negro": 8, "37-Negro": 10, "38-Negro": 12, "39-Negro": 9, "40-Negro": 7, "41-Negro": 6, "42-Negro": 5, "43-Negro": 3, "44-Negro": 0,
      "36-Beige": 0, "37-Beige": 6, "38-Beige": 8, "39-Beige": 7, "40-Beige": 5, "41-Beige": 4, "42-Beige": 3, "43-Beige": 2, "44-Beige": 1
    }
  },
  {
    id: 32, name: "Street Classic", brand: "Adidas", category: "lifestyle",
    price: 2499, discountPrice: null,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: [
      { name: "Blanco", hex: "#FFFFFF", image: img('photo-1552346154-21d32810aba3') },
      { name: "Verde", hex: "#166534", image: img('photo-1543163521-1bf539c55dd2') }
    ],
    images: [
      img('photo-1608231387042-66d1773070a5'),
      img('photo-1608256246200-53e635b5b65f'),
      img('photo-1595341888016-a392ef81b7de')
    ],
    description: "Tres franjas icónicas sobre gamuza y malla. El equilibrio perfecto entre deporte y moda urbana.",
    specs: { upper: "Gamuza y malla", sole: "Goma EVA", weight: "320g" },
    rating: 4.0, reviews: 173,
    isNew: false, isBestseller: false,
    stock: {
      "36-Blanco": 6, "37-Blanco": 8, "38-Blanco": 10, "39-Blanco": 8, "40-Blanco": 6, "41-Blanco": 5, "42-Blanco": 4, "43-Blanco": 2, "44-Blanco": 0,
      "36-Verde": 0, "37-Verde": 5, "38-Verde": 7, "39-Verde": 6, "40-Verde": 4, "41-Verde": 3, "42-Verde": 2, "43-Verde": 1, "44-Verde": 1
    }
  },

  // ---------- OUTDOOR (4) ----------
  {
    id: 33, name: "TrailMax 5", brand: "Nike", category: "outdoor",
    price: 4299, discountPrice: 3439,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Verde", hex: "#166534", image: img('photo-1603808033192-082d6919d3e1') },
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1548036328-c9fa89d128fa') }
    ],
    images: [
      img('photo-1539185441755-769473a23570'),
      img('photo-1556906781-9a412961c28c'),
      img('photo-1560343090-f0409e92791a')
    ],
    description: "Botín de trail con agarre agresivo y protección en la puntera. Domina senderos rocosos y terrenos irregulares.",
    specs: { upper: "Malla resistente al agua", sole: "Goma lug", weight: "380g" },
    rating: 4.5, reviews: 214,
    isNew: false, isBestseller: true,
    stock: {
      "38-Verde": 4, "39-Verde": 6, "40-Verde": 8, "41-Verde": 7, "42-Verde": 6, "43-Verde": 5, "44-Verde": 3, "45-Verde": 0,
      "38-Negro": 0, "39-Negro": 5, "40-Negro": 7, "41-Negro": 6, "42-Negro": 5, "43-Negro": 4, "44-Negro": 3, "45-Negro": 2
    }
  },
  {
    id: 34, name: "Summit Hiker", brand: "ASICS", category: "outdoor",
    price: 4699, discountPrice: null,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Beige", hex: "#D6C7A9", image: img('photo-1579338559194-a162d19bf842') },
      { name: "Verde", hex: "#166534", image: img('photo-1584735175315-9d5df23860e6') }
    ],
    images: [
      img('photo-1600269452121-4f2416e55c28'),
      img('photo-1605348532760-6753d2c43329'),
      img('photo-1591047139829-d91aecb6caea')
    ],
    description: "Bota de senderismo con soporte de tobillo y suela de tracción profunda. Estabilidad en cada ascenso.",
    specs: { upper: "Cuero y malla", sole: "Goma lug profunda", weight: "420g" },
    rating: 4.5, reviews: 87,
    isNew: true, isBestseller: false,
    stock: {
      "38-Beige": 3, "39-Beige": 5, "40-Beige": 7, "41-Beige": 6, "42-Beige": 5, "43-Beige": 4, "44-Beige": 2, "45-Beige": 0,
      "38-Verde": 0, "39-Verde": 4, "40-Verde": 6, "41-Verde": 5, "42-Verde": 4, "43-Verde": 3, "44-Verde": 2, "45-Verde": 1
    }
  },
  {
    id: 35, name: "Rock Ridge Boot", brand: "Vans", category: "outdoor",
    price: 3999, discountPrice: null,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Negro", hex: "#1A1A1A", image: img('photo-1596703263926-eb0762ee17e4') },
      { name: "Beige", hex: "#D6C7A9", image: img('photo-1605810230434-7631ac76ec81') }
    ],
    images: [
      img('photo-1512374382149-233c42b6a83b'),
      img('photo-1525966222134-fcfa99b8ae77'),
      img('photo-1491553895911-0055eca6402d')
    ],
    description: "Bota resistente con forro térmico y suela antiderrapante. Aventura sin sacrificar el estilo.",
    specs: { upper: "Cuero resistente", sole: "Goma antiderrapante", weight: "440g" },
    rating: 4.0, reviews: 73,
    isNew: false, isBestseller: false,
    stock: {
      "38-Negro": 5, "39-Negro": 7, "40-Negro": 8, "41-Negro": 7, "42-Negro": 6, "43-Negro": 4, "44-Negro": 3, "45-Negro": 0,
      "38-Beige": 0, "39-Beige": 4, "40-Beige": 6, "41-Beige": 5, "42-Beige": 4, "43-Beige": 3, "44-Beige": 2, "45-Beige": 1
    }
  },
  {
    id: 36, name: "Expedition GTX", brand: "Adidas", category: "outdoor",
    price: 5199, discountPrice: null,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: "Gris", hex: "#6B6B6B", image: img('photo-1608667508764-33cf0726b13a') },
      { name: "Naranja", hex: "#FF6B35", image: img('photo-1543508282-6319a3e2621f') }
    ],
    images: [
      img('photo-1614252369475-531eba835eb1'),
      img('photo-1585386959984-a4155224a1ad'),
      img('photo-1542291026-7eec264c27ff')
    ],
    description: "Membrana impermeable GTX y suela de agarre máximo. Preparada para las condiciones más exigentes.",
    specs: { upper: "Gore-Tex", sole: "Goma lug", weight: "410g" },
    rating: 4.5, reviews: 105,
    isNew: false, isBestseller: false,
    stock: {
      "38-Gris": 4, "39-Gris": 6, "40-Gris": 8, "41-Gris": 7, "42-Gris": 5, "43-Gris": 4, "44-Gris": 2, "45-Gris": 0,
      "38-Naranja": 0, "39-Naranja": 5, "40-Naranja": 6, "41-Naranja": 5, "42-Naranja": 4, "43-Naranja": 3, "44-Naranja": 2, "45-Naranja": 1
    }
  }
];

// Devuelve el producto con el id indicado, o null si no existe.
export function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}

// Devuelve los productos destacados: primero los bestsellers, luego por rating descendente.
export function getFeaturedProducts(n = 4) {
  return [...products]
    .sort((a, b) => (b.isBestseller - a.isBestseller) || (b.rating - a.rating))
    .slice(0, n);
}

// Devuelve productos relacionados: misma categoría, excluyendo el producto actual, ordenados por rating.
export function getRelatedProducts(product, n = 4) {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, n);
}

// Devuelve todos los productos de una categoría.
export function getProductsByCategory(cat) {
  return products.filter((p) => p.category === cat);
}

// Categorías del catálogo con su conteo exacto de productos.
export const categories = [
  { id: 'running', name: 'Running', count: 7 },
  { id: 'casual', name: 'Casual', count: 7 },
  { id: 'formal', name: 'Formal', count: 5 },
  { id: 'deportivo', name: 'Deportivo', count: 7 },
  { id: 'lifestyle', name: 'Lifestyle', count: 6 },
  { id: 'outdoor', name: 'Outdoor', count: 4 }
];