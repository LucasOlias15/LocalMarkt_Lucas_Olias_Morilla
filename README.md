# 🛒 LocalMarkt - El mercado de tu barrio, ahora en digital

![LocalMarkt](./frontend/public/LogoLocalMarkt.svg)

Aplicación web para conectar el comercio local con los vecinos. Los clientes pueden descubrir tiendas, comprar productos y valorar sus pedidos. Los dueños pueden gestionar su catálogo, pedidos y perfil desde un panel de administración.

---

## 🚀 Demo en producción

- **Frontend:** [https://proyecto-final-grado-lucas-olias-mo.vercel.app](https://proyecto-final-grado-lucas-olias-mo.vercel.app)
- **Backend API:** [https://localmarkt-backend.onrender.com](https://localmarkt-backend.onrender.com)

---

## 🎯 Funcionalidades principales

### 👤 Para Clientes
- Registro e inicio de sesión
- Explorar tiendas y productos por categoría
- Buscador con filtros
- Mapa interactivo con geolocalización
- Carrito de compras con Zustand
- Realizar pedidos (simulación de pago)
- Historial de pedidos con ticket detallado
- Valorar compras (1-5 estrellas + comentario)
- Guardar tiendas y productos favoritos
- Contactar con comercios (teléfono y email)
- Modo oscuro/claro

### 🏪 Para Dueños
- Panel de gestión de tienda
- Añadir, editar y eliminar productos
- Gestionar pedidos (cambiar estado)
- Editar datos del comercio (nombre, dirección, ubicación en mapa, imagen)
- Ver valoraciones recibidas
- Perfil con estadísticas
- Eliminar cuenta

---

## 🧠 Stack Tecnológico y Arquitectura

### 1. Frontend (Interfaz de Usuario)

| Categoría | Tecnología | Descripción |
|-----------|------------|-------------|
| **Core** | React 19 | Librería principal para interfaces basadas en componentes |
| **Bundler** | Vite 5 | Herramienta de construcción ultrarrápida |
| **Enrutador** | Wouter | Enrutador minimalista y ligero |
| **Estado global** | Zustand | Gestor de estado para carrito y toasts |
| **Estilos** | TailwindCSS 4 + DaisyUI 5 | CSS utilitario + componentes semánticos |
| **Animaciones** | Framer Motion | Transiciones suaves y animaciones |
| **Iconos** | Lucide React | Iconos SVG consistentes y personalizables |
| **Mapas** | Leaflet + React Leaflet | Mapa interactivo con geolocalización |

### 2. Backend (Servidor y API REST)

| Categoría | Tecnología | Descripción |
|-----------|------------|-------------|
| **Entorno** | Node.js 18+ | JavaScript en el servidor |
| **Framework** | Express 5 | API RESTful con rutas, controladores y middlewares |
| **Autenticación** | JWT (jsonwebtoken) + bcrypt | Tokens seguros y contraseñas encriptadas |
| **Middleware** | CORS, Multer | Peticiones cross-origin y subida de archivos |

### 3. Base de Datos y Servicios Cloud

| Categoría | Tecnología | Descripción |
|-----------|------------|-------------|
| **Base de datos** | MySQL 8.0 | Base de datos relacional |
| **Driver** | mysql2 | Conexión con promesas nativas (async/await) |
| **Hosting BD** | Clever Cloud | MySQL gestionado en la nube (gratuito) |
| **Imágenes** | Cloudinary | Almacenamiento y optimización de imágenes |
| **Frontend** | Vercel | Despliegue automático desde GitHub |
| **Backend** | Render | Servidor Node.js en la nube (gratuito) |

### 4. Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| **Nodemon** | Reinicio automático del backend en desarrollo |
| **Git + GitHub** | Control de versiones |
| **VS Code** | Editor de código recomendado |
| **localStorage** | Persistencia de sesión en el navegador |

---

## 📁 Estructura del proyecto
