import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PanelTopOpen, Search, ShoppingBasket, Store, Heart } from "lucide-react";

export const ExplorePage = () => {
    // 1. Estados de Datos
    const [shops, setShops] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Estados de Filtros 
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todas");
    const [viewMode, setViewMode] = useState("tiendas");

    const categorias = ["Todas", "Frutería", "Panadería", "Carnicería", "Bio", "Textiles y moda", "Artesanía y regalos"];

    useEffect(() => {

        // Se guardan los parametros de la búsqueda que vienen en window.location.search junto a la 
        // palabra que viene de search=${encodeURIComponent(query)}
        const parametros = new URLSearchParams(window.location.search);
        const palabraBuscada = parametros.get("search");
        const categoriaBuscada = parametros.get("categoria");

        if (palabraBuscada) {
            setSearchQuery(palabraBuscada);
            setViewMode("todos");
        } else if (categoriaBuscada) {
            setSelectedCategory(categoriaBuscada);
            setViewMode("todos");

        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [resShops, resProducts] = await Promise.all([
                    fetch("http://localhost:3000/api/comercios"),
                    fetch("http://localhost:3000/api/productos/explorar")
                ]);

                if (!resShops.ok || !resProducts.ok) throw new Error("Error en el servidor");

                const dataShops = await resShops.json();
                const dataProducts = await resProducts.json();

                setShops(dataShops);
                setProducts(dataProducts);
            } catch (err) {
                console.error("❌ Error:", err);
                setError("Error al conectar con el mercado.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- LÓGICA DE FILTRADO ---
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

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <span className="loading loading-dots loading-lg text-jungle_teal"></span>
        </div>
    );

    const sinResultados = filteredShops.length === 0 && filteredProducts.length === 0;

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto px-4 py-8 w-full">
            {/* BARRA LATERAL */}
            <aside className="w-full md:w-64 shrink-0">
                <h2 className="font-bold text-xl mb-4 text-base-content">Categorías</h2>
                <div className="flex flex-col gap-2">
                    {categorias.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`text-left px-4 py-2 rounded-xl transition-all font-medium border ${selectedCategory === cat ? "btn-categoria-activo shadow-sm" : "border-transparent hover:bg-base-200 text-base-content/70"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </aside>

            <main className="flex-1">
                <header className="mb-10">
                    {/* BUSCADOR */}
                    <div className="relative group w-full mb-8">
                        <div className="absolute -inset-0.5 bg-linear-to-r from-jungle_teal to-sea_green rounded-full blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                        <div className="relative flex items-center bg-base-100 rounded-full shadow-sm border border-base-300 overflow-hidden">
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

                    {/* TABS */}
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

                <section>
                    {!sinResultados && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Render COMERCIOS (Si el modo de vista lo permite) */}
                            {/* TODO Funcionalidad clickar en tienda y redrigir a esa tienda */}
                            {(viewMode === "tiendas" || viewMode === "todos") && filteredShops.map((shop) => (
                                <div key={`shop-${shop.id_comercio}`} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all rounded-3xl">
                                    <figure className="h-50 bg-base-200 overflow-hidden rounded-t-3xl">
                                        <img className="w-full h-full object-cover" src={shop.imagen} />
                                    </figure>
                                    <div className="card-body p-4">
                                        <h2 className="card-title text-base">{shop.nombre}</h2>
                                        <p className="text-xs opacity-60">{shop.categoria}</p>
                                        <p className="text-xs italic">{shop.direccion}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Render PRODUCTOS (Si el modo de vista lo permite) */}
                            {(viewMode === "productos" || viewMode === "todos") && filteredProducts.map((product) => (
                                <div key={`prod-${product.id_producto}`} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all rounded-3xl">

                                    {/* 👇 CAMBIO: Añadimos 'relative' al figure 👇 */}
                                    <figure className="h-32 bg-base-200 overflow-hidden rounded-t-3xl relative">
                                        <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />

                                        {/* 👇 NUEVO: Botón de Favorito flotante 👇 */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault(); // Por si la tarjeta entera fuera un enlace
                                                console.log("¡Clic en favorito! Producto ID:", product.id_producto);
                                                // Aquí llamaremos a la función del backend más adelante
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-base-100/80 backdrop-blur-sm rounded-full text-base-content/50 hover:text-red-500 hover:bg-base-100 transition-all shadow-sm z-10"
                                        >
                                            {/* Cuando esté guardado, le añadiremos fill="currentColor" para que se pinte por dentro */}
                                            <Heart size={18} />
                                        </button>
                                    </figure>

                                    <div className="card-body p-4">
                                        <div className="flex justify-between items-start w-full gap-4 mb-2">
                                            <h2 className="card-title text-base m-0 leading-tight">{product.nombre}</h2>
                                            <p className="text-xs font-bold opacity-60 m-0 shrink-0 whitespace-nowrap pt-1">
                                                Stock: {product.stock}
                                            </p>
                                        </div>

                                        <p className="text-xs italic">{product.descripcion}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="font-bold text-jungle_teal">{product.precio}€</span>
                                            {/* TODO Funcionalidad boton de añadir productos */}
                                            <button className="btn btn-xs bg-jungle_teal text-white border-none rounded-full px-4 hover:bg-jungle_teal/90">Añadir</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 👻 SI NO HAY RESULTADOS, MOSTRAMOS EL MENSAJE 'ESTADO VACÍO' 👻 */}
                    {sinResultados && (
                        <div className="flex flex-col items-center justify-center text-center p-10 bg-base-100 rounded-4xl border border-base-300 shadow-sm min-h-[50vh]">
                            <div className="w-48 h-48 mb-6 text-jungle_teal">
                                {/* Un icono SVG o una ilustración limpia */}
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
                            {/* Un botón útil para limpiar la búsqueda rápidamente */}
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
        </div>
    );
};