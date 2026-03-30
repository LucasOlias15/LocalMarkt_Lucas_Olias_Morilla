import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { PanelTopOpen, Search, ShoppingBasket, Store, Heart, SquareCheckBig, Trash, AlertCircle } from "lucide-react";
import { useCartStore } from '../store/useCartStore';
import { motion } from "framer-motion";

export const ExplorePage = () => {
     
    // 1. ESTADOS
     
    
    // --- Datos ---
    const [shops, setShops] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Filtros y Vistas ---
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todas");
    const [viewMode, setViewMode] = useState("tiendas");

    // --- UI y Usuario ---
    const [toast, setToast] = useState(null);
    const [favoritos, setFavoritos] = useState([]);

    const categorias = ["Todas", "Frutería", "Panadería", "Carnicería", "Bio", "Textiles y moda", "Artesanía y regalos"];
    const usuario = JSON.parse(localStorage.getItem('user'));

    // --- Enrutamiento (Wouter) ---
    const searchString = useSearch(); 

     
    // 2. EFECTOS (Carga de datos y lectura de URL)
     
    useEffect(() => {
        // Leemos los parámetros dinámicos de la URL usando searchString de Wouter
        const parametros = new URLSearchParams(searchString);
        const palabraBuscada = parametros.get("search");
        const categoriaBuscada = parametros.get("categoria");

        // Ajustamos los filtros según lo que venga en la URL
        if (palabraBuscada) {
            setSearchQuery(palabraBuscada);
            setViewMode("todos");
        } else if (categoriaBuscada) {
            setSelectedCategory(categoriaBuscada);
            setViewMode("todos");
        } else {
            setSelectedCategory("Todas");
        }

        // Función para traer todos los datos en paralelo (Comercios, Productos y Favoritos)
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [resShops, resProducts] = await Promise.all([
                    fetch("http://localhost:3000/api/comercios"),
                    fetch("http://localhost:3000/api/productos/explorar")
                ]);

                const dataShops = await resShops.json();
                const dataProducts = await resProducts.json();

                setShops(dataShops);
                setProducts(dataProducts);

                // Si hay un usuario logueado, traemos sus favoritos para marcar los corazones
                if (usuario) {
                    const resFavs = await fetch(`http://localhost:3000/api/favoritos/${usuario.id}`);
                    if (resFavs.ok) {
                        const dataFavs = await resFavs.json();
                        // Extraemos solo los IDs de los productos favoritos
                        const idsFavoritos = dataFavs
                            .filter(fav => fav.id_producto !== null)
                            .map(fav => fav.id_producto);

                        setFavoritos(idsFavoritos);
                    }
                }
            } catch (err) {
                console.error("❌ Error conectando con el backend:", err);
                setError("Error al conectar con el mercado.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        
    // Se ejecuta al montar el componente y cada vez que cambia la URL
    }, [searchString]); 

     
    // 3. FUNCIONES AUXILIARES Y LÓGICA DE NEGOCIO
     

    // Control del Toast (Notificaciones)
    const mostrarNotificacion = (mensaje, tipo) => {
        setToast({ mensaje, tipo });
        setTimeout(() => setToast(null), 3000);
    };

    // Función para añadir/quitar favoritos
    const handleToggleFavorito = async (e, id_producto) => {
        e.preventDefault();

        if (usuario) {
            try {
                const res = await fetch(`http://localhost:3000/api/favoritos/toggleFavs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        id_usuario: usuario.id,
                        id_producto: id_producto
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    // Diferenciación en toast para mostrar añadido o eliminado
                    if (data.isFavorite) {
                        mostrarNotificacion(data.message || "Añadido a favoritos", "success");
                        setFavoritos(prev => [...prev, id_producto]);
                    } else {
                        mostrarNotificacion(data.message || "Eliminado de favoritos", "removed");
                        setFavoritos(prev => prev.filter(id => id !== id_producto));
                    }
                }
            } catch (error) {
                mostrarNotificacion("Error de conexión al guardar favorito.", "error");
            }
        } else {
            mostrarNotificacion("Inicia sesión para guardar favoritos.", "error");
        }
    };

    // Aplicar filtros a los arrays de datos
    const filteredShops = shops.filter((shop) => {
        const matchCategoria = selectedCategory === "Todas" || shop.categoria === selectedCategory;
        const matchBusqueda = shop.nombre.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategoria && matchBusqueda;
    });

    const filteredProducts = products.filter((product) => {
        const matchCategoria = selectedCategory === "Todas" || product.categoria === selectedCategory;
        const matchBusqueda = product.nombre.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategoria && matchBusqueda;
    });

    const sinResultados = filteredShops.length === 0 && filteredProducts.length === 0;

    const addToCart = useCartStore((state) => state.addToCart);

    // 👇 2. Creamos la función que se ejecutará al hacer clic
    const handleAddToCart = (producto) => {
        if (usuario) {
            // Cogemos el ID (dependiendo de cómo lo llames en tu BD, puede ser id o id_usuario)
            const userId = usuario.id || usuario.id_usuario;
            
            // Enviamos el usuario y el producto al carrito de Zustand
            addToCart(userId, producto);
            
            // Disparamos un toast bonito
            mostrarNotificacion(`Añadido: ${producto.nombre}`, "success");
        } else {
            // Si no está logueado, le avisamos
            mostrarNotificacion("Inicia sesión para añadir productos a tu cesta.", "error");
        }
    };

    // Pantalla de carga inicial
    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <span className="loading loading-dots loading-lg text-jungle_teal"></span>
        </div>
    );

     
    // 4. RENDERIZADO (HTML/JSX)
     
    return (
        // 👇 Añadido 'relative overflow-hidden min-h-screen' para que la aurora no se salga ni rompa el scroll
        <div className="relative overflow-hidden min-h-screen">
            
            {/* 👇 EFECTO AURORA BOREAL INFINITA (100% Tailwind) 👇 */}
            <motion.div 
                // Fijado (fixed) en lugar de absolute para que siempre cubra la pantalla entera aunque hagas scroll
                className="fixed inset-0 w-[200vw] h-[150vh] -top-[25%] -left-[50%] pointer-events-none -z-10 blur-[100px] opacity-60 dark:opacity-40 bg-[linear-gradient(110deg,transparent_0%,rgba(0,163,136,0.3)_25%,rgba(234,179,8,0.2)_50%,rgba(0,163,136,0.3)_75%,transparent_100%)] bg-size-[200%_100%]"
                animate={{
                    backgroundPosition: ["200% 0%", "0% 0%"],
                }}
                transition={{
                    duration: 25,
                    ease: "linear",
                    repeat: Infinity,
                }}
            />

            {/* Contenedor principal de la página (flexbox, max-width, etc) */}
            <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto px-4 py-8 w-full relative z-0">
                
                {/* --- BARRA LATERAL (Categorías) --- */}
                <aside className="w-full md:w-64 shrink-0">
                    <h2 className="font-bold text-xl mb-4 text-base-content">Categorías</h2>
                    <div className="flex flex-col gap-2">
                        {categorias.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`text-left px-4 py-2 rounded-xl transition-all font-medium border ${selectedCategory === cat ? "btn-categoria-activo shadow-sm" : "border-transparent hover:bg-base-200/50 backdrop-blur-sm text-base-content/70"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* --- ÁREA PRINCIPAL --- */}
                <main className="flex-1">
                    <header className="mb-10">
                        
                        {/* Buscador de texto */}
                        <div className="relative group w-full mb-8">
                            <div className="absolute -inset-0.5 bg-linear-to-r from-jungle_teal to-sea_green rounded-full blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                            {/* Le he añadido /80 y backdrop-blur para que el input sea medio transparente sobre la aurora */}
                            <div className="relative flex items-center bg-base-100/80 backdrop-blur-md rounded-full shadow-sm border border-base-300 overflow-hidden">
                                <div className="pl-5 text-base-content/40"><Search size={20} /></div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="¿Qué buscas hoy?"
                                    className="w-full bg-transparent py-3 px-4 outline-none"
                                />
                            </div>
                        </div>

                        {/* Pestañas de Navegación (Tabs) */}
                        <div className="flex gap-6 border-b border-base-200">
                            <button onClick={() => setViewMode("tiendas")} className={`pb-3 px-2 font-bold border-b-2 flex items-center gap-2 ${viewMode === "tiendas" ? "border-jungle_teal text-jungle_teal" : "border-transparent opacity-50"}`}>
                                <Store size={18} /> Tiendas
                            </button>
                            <button onClick={() => setViewMode("productos")} className={`pb-3 px-2 font-bold border-b-2 flex items-center gap-2 ${viewMode === "productos" ? "border-jungle_teal text-jungle_teal" : "border-transparent opacity-50"}`}>
                                <ShoppingBasket size={18} /> Productos
                            </button>
                            <button onClick={() => setViewMode("todos")} className={`pb-3 px-2 font-bold border-b-2 flex items-center gap-2 ${viewMode === "todos" ? "border-jungle_teal text-jungle_teal" : "border-transparent opacity-50"}`}>
                                <PanelTopOpen size={18} /> Tod@s
                            </button>
                        </div>
                    </header>

                    {/* --- GRID DE RESULTADOS --- */}
                    <section>
                        {!sinResultados && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                
                                {/* Render COMERCIOS */}
                                {(viewMode === "tiendas" || viewMode === "todos") && filteredShops.map((shop) => (
                                    <Link key={`shop-${shop.id_comercio}`} href={`/tienda/${shop.id_comercio}`}>
                                        {/* Tarjetas medio transparentes para aprovechar el fondo */}
                                        <div className="card bg-base-100/80 backdrop-blur-md shadow-sm border border-base-200 hover:shadow-md transition-all rounded-3xl cursor-pointer">
                                            <figure className="h-48 bg-base-200 overflow-hidden rounded-t-3xl">
                                                <img className="w-full h-full object-cover" src={shop.imagen} alt={shop.nombre} />
                                            </figure>
                                            <div className="card-body p-4">
                                                <h2 className="card-title text-base">{shop.nombre}</h2>
                                                <p className="text-xs opacity-60">{shop.categoria}</p>
                                                <p className="text-xs italic">{shop.direccion}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {/* Render PRODUCTOS */}
                                {(viewMode === "productos" || viewMode === "todos") && filteredProducts.map((product) => (
                                    <div key={`prod-${product.id_producto}`} className="card bg-base-100/80 backdrop-blur-md shadow-sm border border-base-200 hover:shadow-md transition-all rounded-3xl">
                                        <figure className="h-48 bg-base-200 overflow-hidden rounded-t-3xl relative">
                                            <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />

                                            {/* Botón Corazón Favoritos */}
                                            <button
                                                onClick={(e) => handleToggleFavorito(e, product.id_producto)}
                                                className={`absolute top-2 right-2 p-2 backdrop-blur-sm rounded-full transition-all shadow-md z-10 ${favoritos.includes(product.id_producto)
                                                    ? "text-red-500 bg-white"
                                                    : "text-base-content/50 bg-base-100/80 hover:text-red-400"
                                                    }`}
                                            >
                                                <Heart
                                                    size={20}
                                                    fill={favoritos.includes(product.id_producto) ? "currentColor" : "none"}
                                                />
                                            </button>
                                        </figure>

                                        <div className="card-body p-4">
                                            <div className="flex justify-between items-start w-full gap-4 mb-2">
                                                <h2 className="card-title text-base m-0 leading-tight">{product.nombre}</h2>
                                                <p className="text-xs font-bold opacity-60 m-0 shrink-0 whitespace-nowrap pt-1">
                                                    Stock: {product.stock}
                                                </p>
                                            </div>

                                            <p className="text-xs italic line-clamp-2">{product.descripcion}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold text-jungle_teal text-lg">{product.precio}€</span>
                                                <button onClick={() => handleAddToCart(product)} className="btn btn-sm bg-jungle_teal text-white border-none rounded-full px-6 hover:bg-jungle_teal/90">Añadir</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* --- ESTADO VACÍO (Sin Resultados) --- */}
                        {sinResultados && (
                            <div className="flex flex-col items-center justify-center text-center p-10 bg-base-100/80 backdrop-blur-md rounded-4xl border border-base-300 shadow-sm min-h-[50vh]">
                                <div className="w-48 h-48 mb-6 text-jungle_teal">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        <line x1="8" y1="8" x2="14" y2="14" />
                                        <line x1="14" y1="8" x2="8" y2="14" />
                                    </svg>
                                </div>
                                <h3 className="font-black text-2xl text-base-content mb-3">¡Vaya, parece que el mercado está muy tranquilo hoy!</h3>
                                <p className="text-base-content/70 max-w-md mb-8">
                                    No hemos encontrado ninguna tienda ni producto que coincida con tu búsqueda de "{searchQuery || selectedCategory}". Prueba a cambiar la categoría o busca otra cosa.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategory("Todas");
                                        setViewMode("todos");
                                    }}
                                    className="btn bg-jungle_teal text-white border-none rounded-full px-8 hover:bg-sea_green"
                                >
                                    Limpiar búsqueda
                                </button>
                            </div>
                        )}
                    </section>
                </main>

                {/* 5. TOAST NOTIFICATIONS */}
                {toast && (
                    <div className="toast toast-top toast-center z-999 animate-fade-in-down">
                        <div className={`alert shadow-lg text-white font-bold border-none flex items-center gap-3
                            ${toast.tipo === 'error' ? 'bg-red-500' : 
                              toast.tipo === 'removed' ? 'bg-orange-500' : 
                              'bg-linear-to-r from-jungle_teal to-sea_green'}`}
                        >
                            {toast.tipo === 'error' && <AlertCircle size={22} />}
                            {toast.tipo === 'removed' && <Trash size={22} />}
                            {toast.tipo === 'success' && <SquareCheckBig size={22} />}
                            
                            <span>{toast.mensaje}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};