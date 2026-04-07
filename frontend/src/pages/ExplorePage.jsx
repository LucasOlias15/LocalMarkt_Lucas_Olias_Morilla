import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { PanelTopOpen, Search, ShoppingBasket, Store, Heart, SquareCheckBig, Trash, AlertCircle } from "lucide-react";
import { useCartStore } from '../store/useCartStore';
import { motion } from "framer-motion";

export const ExplorePage = () => {
    
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
    
    // 👇 1. ESTADOS SEPARADOS PARA EVITAR CONFLICTOS DE IDs 👇
    const [favProductos, setFavProductos] = useState([]);
    const [favComercios, setFavComercios] = useState([]);

    const categorias = ["Todas", "Frutería", "Panadería", "Carnicería", "Bio", "Textiles y moda", "Artesanía y regalos"];
    const usuario = JSON.parse(localStorage.getItem('user'));

    // --- Enrutamiento (Wouter) ---
    const searchString = useSearch(); 

    // 2. EFECTOS (Carga de datos y lectura de URL)
    useEffect(() => {
        const parametros = new URLSearchParams(searchString);
        const palabraBuscada = parametros.get("search");
        const categoriaBuscada = parametros.get("categoria");

        if (palabraBuscada) {
            setSearchQuery(palabraBuscada);
            setViewMode("todos");
        } else if (categoriaBuscada) {
            setSelectedCategory(categoriaBuscada);
            setViewMode("todos");
        } else {
            setSelectedCategory("Todas");
        }

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

                if (usuario) {
                    const resFavs = await fetch(`http://localhost:3000/api/favoritos/${usuario.id || usuario.id_usuario}`);
                    if (resFavs.ok) {
                        const dataFavs = await resFavs.json();
                        
                        // 👇 2. SEPARAMOS LOS FAVORITOS AL RECIBIRLOS DEL BACKEND 👇
                        setFavProductos(dataFavs.filter(fav => fav.id_producto).map(fav => fav.id_producto));
                        setFavComercios(dataFavs.filter(fav => fav.id_comercio).map(fav => fav.id_comercio));
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
    }, [searchString]); 

    // 3. FUNCIONES AUXILIARES Y LÓGICA DE NEGOCIO
    const mostrarNotificacion = (mensaje, tipo) => {
        setToast({ mensaje, tipo });
        setTimeout(() => setToast(null), 3000);
    };

    // 👇 3. FUNCIÓN INTELIGENTE PARA MANEJAR AMBOS TIPOS 👇
    const handleToggleFavorito = async (e, id, tipo) => {
        e.preventDefault();
        e.stopPropagation(); // MUY IMPORTANTE: Evita que el clic en el corazón te lleve a la tienda

        if (!usuario) {
            return mostrarNotificacion("Inicia sesión para guardar favoritos.", "error");
        }

        // Preparamos el paquete dinámicamente según lo que estemos guardando
        const payload = { id_usuario: usuario.id || usuario.id_usuario };
        if (tipo === 'producto') payload.id_producto = id;
        if (tipo === 'comercio') payload.id_comercio = id;

        try {
            const res = await fetch(`http://localhost:3000/api/favoritos/toggleFavs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                if (data.isFavorite) {
                    mostrarNotificacion(data.message || `Añadido a favoritos`, "success");
                    if (tipo === 'producto') setFavProductos(prev => [...prev, id]);
                    if (tipo === 'comercio') setFavComercios(prev => [...prev, id]);
                } else {
                    mostrarNotificacion(data.message || `Eliminado de favoritos`, "removed");
                    if (tipo === 'producto') setFavProductos(prev => prev.filter(item => item !== id));
                    if (tipo === 'comercio') setFavComercios(prev => prev.filter(item => item !== id));
                }
            }
        } catch (error) {
            mostrarNotificacion("Error de conexión al guardar favorito.", "error");
        }
    };

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

    const handleAddToCart = (producto) => {
        if (usuario) {
            const userId = usuario.id || usuario.id_usuario;
            const productoParaElCarrito = {
                id_producto: producto.id_producto || producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                id_comercio: producto.id_comercio 
            };
            
            addToCart(userId, productoParaElCarrito);
            window.dispatchEvent(new CustomEvent('openCart'));
            mostrarNotificacion(`Añadido: ${producto.nombre}`, "success");
        } else {
            mostrarNotificacion("Inicia sesión para añadir productos a tu cesta.", "error");
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <span className="loading loading-dots loading-lg text-jungle_teal"></span>
        </div>
    );

    // 4. RENDERIZADO (HTML/JSX)
    return (
        <div className="relative overflow-hidden min-h-screen">
            
            <motion.div 
                className="fixed inset-0 w-[200vw] h-[150vh] -top-[25%] -left-[50%] pointer-events-none -z-10 blur-[100px] opacity-60 dark:opacity-40 bg-[linear-gradient(110deg,transparent_0%,rgba(0,163,136,0.3)_25%,rgba(234,179,8,0.2)_50%,rgba(0,163,136,0.3)_75%,transparent_100%)] bg-size-[200%_100%]"
                animate={{ backgroundPosition: ["200% 0%", "0% 0%"] }}
                transition={{ duration: 25, ease: "linear", repeat: Infinity }}
            />

            <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto px-4 py-8 w-full relative z-0">
                
                {/* --- BARRA LATERAL --- */}
                <aside className="w-full md:w-64 shrink-0">
                    <h2 className="font-bold text-xl mb-4 text-base-content">Categorías</h2>
                    <div className="flex flex-col gap-2">
                        {categorias.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`text-left px-4 py-2 rounded-xl transition-all font-medium border ${selectedCategory === cat ? "btn-categoria-activo shadow-sm" : "border-transparent hover:bg-base-200/50 backdrop-blur-sm text-base-content/70"}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* --- ÁREA PRINCIPAL --- */}
                <main className="flex-1">
                    <header className="mb-10">
                        <div className="relative group w-full mb-8">
                            <div className="absolute -inset-0.5 bg-linear-to-r from-jungle_teal to-sea_green rounded-full blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
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

                        <div className="flex gap-6 border-b border-base-200">
                            <button onClick={() => setViewMode("tiendas")} className={`pb-3 px-2 font-bold border-b-2 flex items-center gap-2 ${viewMode === "tiendas" ? "border-jungle_teal text-jungle_teal" : "border-transparent opacity-50 cursor-pointer"}`}>
                                <Store size={18} /> Tiendas
                            </button>
                            <button onClick={() => setViewMode("productos")} className={`pb-3 px-2 font-bold border-b-2 flex items-center gap-2 ${viewMode === "productos" ? "border-jungle_teal text-jungle_teal" : "border-transparent opacity-50 cursor-pointer"}`}>
                                <ShoppingBasket size={18} /> Productos
                            </button>
                            <button onClick={() => setViewMode("todos")} className={`pb-3 px-2 font-bold border-b-2 flex items-center gap-2 ${viewMode === "todos" ? "border-jungle_teal text-jungle_teal" : "border-transparent opacity-50 cursor-pointer"}`}>
                                <PanelTopOpen size={18} /> Tod@s
                            </button>
                        </div>
                    </header>

                    <section>
                        {!sinResultados && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                
                                {/* Render COMERCIOS */}
                                {(viewMode === "tiendas" || viewMode === "todos") && filteredShops.map((shop) => (
                                    <Link key={`shop-${shop.id_comercio}`} href={`/tienda/${shop.id_comercio}`}>
                                        <div className="card bg-base-100/80 backdrop-blur-md shadow-sm border border-base-200 hover:shadow-md transition-all rounded-3xl cursor-pointer h-full">
                                            {/* 👇 4. LE HEMOS AÑADIDO 'relative' Y EL BOTÓN DE CORAZÓN A LOS COMERCIOS 👇 */}
                                            <figure className="h-48 bg-base-200 overflow-hidden rounded-t-3xl relative">
                                                <img className="w-full h-full object-cover" src={shop.imagen} alt={shop.nombre} />
                                                <button
                                                    onClick={(e) => handleToggleFavorito(e, shop.id_comercio, 'comercio')}
                                                    className={`absolute top-2 right-2 p-2 backdrop-blur-sm rounded-full transition-all shadow-md z-10 cursor-pointer ${favComercios.includes(shop.id_comercio)
                                                        ? "text-red-500 bg-white"
                                                        : "text-base-content/50 bg-base-100/80 hover:text-red-400"
                                                        }`}
                                                >
                                                    <Heart size={20} fill={favComercios.includes(shop.id_comercio) ? "currentColor" : "none"} />
                                                </button>
                                            </figure>
                                            <div className="card-body p-4">
                                                <h2 className="card-title text-base">{shop.nombre}</h2>
                                                <p className="text-xs font-bold text-jungle_teal">{shop.categoria}</p>
                                                <p className="text-xs italic opacity-70">{shop.direccion}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {/* Render PRODUCTOS */}
                                {(viewMode === "productos" || viewMode === "todos") && filteredProducts.map((product) => (
                                    <div key={`prod-${product.id_producto}`} className="card bg-base-100/80 backdrop-blur-md shadow-sm border border-base-200 hover:shadow-md transition-all rounded-3xl flex flex-col">
                                        <figure className="h-48 bg-base-200 overflow-hidden rounded-t-3xl relative shrink-0">
                                            <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />
                                            {/* 👇 5. LE PASAMOS 'producto' COMO TIPO 👇 */}
                                            <button
                                                onClick={(e) => handleToggleFavorito(e, product.id_producto, 'producto')}
                                                className={`absolute top-2 right-2 p-2 backdrop-blur-sm rounded-full transition-all shadow-md z-10 cursor-pointer ${favProductos.includes(product.id_producto)
                                                    ? "text-red-500 bg-white"
                                                    : "text-base-content/50 bg-base-100/80 hover:text-red-400"
                                                    }`}
                                            >
                                                <Heart size={20} fill={favProductos.includes(product.id_producto) ? "currentColor" : "none"} />
                                            </button>
                                        </figure>

                                        <div className="card-body p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start w-full gap-4 mb-2">
                                                    <h2 className="card-title text-base m-0 leading-tight">{product.nombre}</h2>
                                                    <p className="text-xs font-bold opacity-60 m-0 shrink-0 whitespace-nowrap pt-1">
                                                        Stock: {product.stock}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-base-content/60 line-clamp-2">{product.descripcion}</p>
                                            </div>
                                            
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="font-black text-jungle_teal text-xl">{product.precio}€</span>
                                                <button onClick={() => handleAddToCart(product)} className="btn btn-sm bg-jungle_teal text-white border-none rounded-xl px-6 hover:bg-jungle_teal/80 cursor-pointer shadow-md shadow-jungle_teal/20">Añadir</button>
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
                                    className="btn bg-jungle_teal text-white border-none rounded-full px-8 hover:bg-sea_green cursor-pointer"
                                >
                                    Limpiar búsqueda
                                </button>
                            </div>
                        )}
                    </section>
                </main>

                {/* 5. TOAST NOTIFICATIONS */}
                {toast && (
                    <div className="toast toast-top toast-center z-100 animate-fade-in-down mt-16 md:mt-4">
                        <div className={`alert shadow-2xl text-white font-bold border-none rounded-2xl flex items-center gap-3
                            ${toast.tipo === 'error' ? 'bg-error' : 
                              toast.tipo === 'removed' ? 'bg-orange-500' : 
                              'bg-jungle_teal'}`}
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