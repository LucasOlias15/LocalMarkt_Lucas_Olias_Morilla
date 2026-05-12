# 🛒 LocalMarkt – El mercado de tu barrio, ahora en digital

![LocalMarkt](./frontend/public/LogoLocalMarkt.svg)

**Aplicación web para conectar el comercio local con los vecinos.**  
Los clientes descubren tiendas, compran productos y valoran sus pedidos.  
Los dueños gestionan su catálogo, pedidos y perfil desde un panel de administración.

---

## 🚀 Demo en producción

| Entorno | URL |
|---------|-----|
| **Frontend** | [https://proyecto-final-grado-lucas-olias-mo.vercel.app](https://proyecto-final-grado-lucas-olias-mo.vercel.app) |
| **Backend API** | [https://localmarkt-backend.onrender.com](https://localmarkt-backend.onrender.com) |

> ⚠️ El backend entra en modo suspensión tras 15 minutos de inactividad. La primera petición puede tardar unos segundos en responder.

---

## ✨ Funcionalidades principales

### 👤 Clientes
- 🔐 Registro e inicio de sesión seguros (JWT + bcrypt)
- 🔍 Explorar tiendas y productos por categoría y búsqueda
- 🗺️ Mapa interactivo con geolocalización (Leaflet + Nominatim)
- 🛒 Carrito de compras con Zustand
- 💳 Realizar pedidos (simulación de pago con transacciones SQL)
- 📋 Historial de pedidos con ticket detallado
- ⭐ Valorar compras (1-5 estrellas + comentario opcional)
- ❤️ Guardar tiendas y productos favoritos
- 📞 Contactar con comercios (teléfono y email)
- 🌙 Modo oscuro / claro

### 🏪 Dueños
- 📊 Panel de gestión de tienda
- ➕ Añadir, editar y eliminar productos
- 📦 Gestionar pedidos (cambiar estado)
- 🖼️ Subir imágenes con Cloudinary
- ✏️ Editar datos del comercio (nombre, dirección, ubicación en mapa, contacto)
- ⭐ Ver valoraciones recibidas
- 🚀 Impulsar tienda con planes de visibilidad
- ❌ Eliminar cuenta

---

## 🧱 Stack tecnológico

### 🎨 Frontend

| Categoría | Tecnología |
|-----------|------------|
| Librería | React 19 |
| Bundler | Vite 5 |
| Enrutador | Wouter |
| Estado global | Zustand |
| Estilos | TailwindCSS 4 + DaisyUI 5 |
| Animaciones | Framer Motion |
| Iconos | Lucide React |
| Mapas | Leaflet + React Leaflet + Nominatim |

### ⚙️ Backend

| Categoría | Tecnología |
|-----------|------------|
| Entorno | Node.js 18+ |
| Framework | Express 5 |
| Autenticación | JWT (jsonwebtoken) + bcrypt |
| Middlewares | CORS, Multer |

### ☁️ Base de datos y servicios cloud

| Categoría | Tecnología |
|-----------|------------|
| Base de datos | MySQL 8.0 (Clever Cloud) |
| Driver | mysql2 (promesas nativas) |
| Imágenes | Cloudinary |
| Despliegue frontend | Vercel |
| Despliegue backend | Render |

### 🛠️ Herramientas de desarrollo

- **Nodemon** – Reinicio automático del backend
- **Git + GitHub** – Control de versiones
- **VS Code** – Editor de código
- **localStorage** – Persistencia de sesión en el navegador

---

## 📁 Estructura del proyecto
Proyecto/
| ── frontend/ # React + Vite
│ └── src/
│ ├── components/ # Componentes reutilizables
│ │ ├── common/ # Footer, Header, Logo, ToastContainer...
│ │ ├── home/ # HeroSection, CategoriesBento, ProductsCarousel...
│ │ ├── cart/ # CartDrawer
│ │ ├── map/ # LocationPicker, FloatingMapButton
│ │ ├── product/ # ProductCard
│ │ ├── profile/ # ProfileHeader, OwnerSection, ClientSection...
│ │ └── shop/ # RegisterShopModal, ShopPromotionModal...
│ ├── pages/ # Páginas de la aplicación
│ │ ├── Home.jsx
│ │ ├── ExplorePage.jsx
│ │ ├── ShopDetail.jsx
│ │ ├── MapPage.jsx
│ │ ├── LoginPage.jsx
│ │ ├── RegisterPage.jsx
│ │ ├── Profile.jsx
│ │ ├── OrdersPage.jsx
│ │ └── panel/
│ │ └── StorePanelPage.jsx
│ ├── store/ # Estado global (Zustand)
│ │ ├── useCartStore.js
│ │ └── useToastStore.js
│ └── services/ # Servicios API
│ └── api.js
│
├── backend/ # Node.js + Express
│ └── src/
│ ├── controllers/ # Lógica de negocio
│ ├── models/ # Consultas SQL
│ ├── routes/ # Definición de rutas API
│ ├── middlewares/ # authMiddleware, cloudinary
│ ├── db/ # Conexión MySQL y scripts seed
│ └── app.js # Punto de entrada del servidor
│
└── common/ # Validaciones compartidas
└── validaciones.js

text

---

## ⚡ Instalación y uso rápido

### 📋 Requisitos previos
- Node.js 18+ y npm
- MySQL 8.0+

### 🔧 Backend

```bash
cd backend
npm install
npm run dev        # → http://localhost:3000
```
### 🎨 Frontend
```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```
### 🌱 Base de datos
```bash
cd backend
npm run seed       # Poblar la base de datos con datos de prueba
```
### 🔐 Variables de entorno
Backend (backend/.env)
```env
JWT_SECRET=clave_secreta
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=localmarkt
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret
Frontend (frontend/.env)
```
VITE_API_URL=http://localhost:3000/api
### 🗄️ Esquema de base de datos
```text
usuario (id_usuario, nombre, email, contraseña, rol)
comercio (id_comercio, id_usuario, nombre, descripcion, categoria, contacto, direccion, latitud, longitud, imagen)
producto (id_producto, id_comercio, nombre, descripcion, stock, precio, imagen)
pedido (id_pedido, id_usuario, id_comercio, fecha, total, estado)
detalle_pedido (id_detalle, id_pedido, id_producto, cantidad, precio_unitario)
favorito (id_favorito, id_usuario, id_comercio, id_producto)
valoracion (id_valoracion, id_usuario, id_comercio, id_producto, puntuacion, comentario, fecha)
```
### 🗺️ Roadmap – Próximos pasos
📊 Panel de estadísticas para dueños

💳 Pasarela de pago real (Stripe / PayPal)

⭐ Sistema de valoraciones completo

💬 Chat en tiempo real cliente-dueño

📱 PWA para instalar en móvil

### 👨‍💻 Autor
Lucas Olías Morilla – Proyecto Final de Grado Superior en Desarrollo de Aplicaciones Web (DAW)

https://img.shields.io/badge/GitHub-LucasOlias15-black?logo=github

📄 Licencia
Este proyecto es de uso académico para el ciclo formativo de DAW.
