import { useState } from "react";
import { motion } from "framer-motion";
import { PanelTopOpen, Search, ShoppingBasket, Store } from "lucide-react";

export const ExplorePage = () => {
    // 1. Los estados (El cerebro)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todas");
    const [viewMode, setViewMode] = useState("tiendas");

    const categorias = ["Todas", "Frutería", "Panadería", "Carnicería", "Bio"];

    // DATOS DE PRUEBA (MOCKS)
    const dummyShops = [
        { id: 1, nombre: "Frutería Paco", categoria: "Frutería", rating: 4.8, emoji: "🍎" },
        { id: 2, nombre: "Panadería La Abuela", categoria: "Panadería", rating: 4.9, emoji: "🥖" },
        { id: 3, nombre: "Carnes Premium", categoria: "Carnicería", rating: 4.5, emoji: "🥩" },
        { id: 4, nombre: "EcoVida", categoria: "Bio", rating: 5.0, emoji: "🌱" },
        { id: 5, nombre: "El Horno de Juan", categoria: "Panadería", rating: 4.2, emoji: "🥐" },
        { id: 6, nombre: "Frutas del Bosque", categoria: "Frutería", rating: 4.7, emoji: "🍓" },
    ];

    const dummyProducts = [
        { id: 1, nombre: "Manzanas Fuji (1kg)", tienda: "Frutería Paco", precio: "2.50€", emoji: "🍏" },
        { id: 2, nombre: "Hogaza de Masa Madre", tienda: "Panadería La Abuela", precio: "3.20€", emoji: "🍞" },
        { id: 3, nombre: "Chuletón de Vaca", tienda: "Carnes Premium", precio: "24.00€", emoji: "🍖" },
        { id: 4, nombre: "Tomates Rosa", tienda: "EcoVida", precio: "4.10€", emoji: "🍅" },
        { id: 5, nombre: "Croissant de Mantequilla", tienda: "El Horno de Juan", precio: "1.50€", emoji: "🥐" },
        { id: 6, nombre: "Fresas Huelva (500g)", tienda: "Frutas del Bosque", precio: "3.90€", emoji: "🍓" },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto px-4 py-8 w-full">

            {/* BARRA LATERAL (Filtros) */}
            <aside className="w-full md:w-64 shrink-0">
                <h2 className="font-bold text-xl mb-4 text-base-content">Categorías</h2>

                <div className="flex flex-col gap-2">
                    {categorias.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`text-left px-4 py-2 rounded-xl transition-all font-medium border ${selectedCategory === cat
                                ? "btn-categoria-activo shadow-sm" /* 👈 Magia limpia */
                                : "border-transparent hover:bg-base-200 text-base-content/70 hover:text-base-content"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1">
                <header className="mb-10">
                    {/* 1. Barra de búsqueda (Híbrida y Discreta) */}
                    <div className="relative group w-full mb-8">

                        {/* El halo de luz: Ahora empieza invisible (opacity-0) y solo aparece al pasar el ratón o hacer focus */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-jungle_teal to-sea_green rounded-full blur opacity-0 group-hover:opacity-20 focus-within:opacity-30 transition duration-500"></div>

                        {/* Contenedor del input: focus-within detecta si el usuario está escribiendo */}
                        <div className="relative flex items-center bg-base-100 rounded-full shadow-sm border border-base-300 focus-within:border-jungle_teal focus-within:ring-1 focus-within:ring-jungle_teal overflow-hidden transition-all duration-300">

                            {/* Icono de la lupa: Cambia a verde cuando haces clic en el input */}
                            <div className="pl-5 text-base-content/40 group-focus-within:text-jungle_teal transition-colors duration-300">
                                <Search />
                            </div>

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar tiendas, panaderos, productos..."
                                className="w-full bg-transparent py-3 px-4 text-base-content outline-none placeholder:text-base-content/40"
                            />

                            {/* Botón más compacto y pegado al borde derecho */}
                            <button
                                type="button"
                                className="mr-1.5 px-6 py-2 bg-jungle_teal hover:bg-jungle_teal/90 text-white font-medium rounded-full transition-transform active:scale-95 text-sm"
                            >
                                Buscar
                            </button>
                        </div>
                    </div>

                    {/* 2. Pestañas (Tabs) para Tiendas / Productos (Mantenemos las de antes) */}
                    <div className="flex gap-6 border-b border-base-200 px-2">
                        <button
                            onClick={() => setViewMode("tiendas")}
                            className={`pb-3 px-2 font-bold transition-all border-b-2 flex items-center gap-2 ${viewMode === "tiendas"
                                ? "border-jungle_teal text-jungle_teal"
                                : "border-transparent text-base-content/50 hover:text-base-content"
                                }`}
                        >
                            <Store />
                            Tiendas
                        </button>
                        <button
                            onClick={() => setViewMode("productos")}
                            className={`pb-3 px-2 font-bold transition-all border-b-2 flex items-center gap-2 ${viewMode === "productos"
                                ? "border-jungle_teal text-jungle_teal"
                                : "border-transparent text-base-content/50 hover:text-base-content"
                                }`}
                        >
                            <ShoppingBasket />
                            Productos
                        </button>
                        <button
                            onClick={() => setViewMode("todos")}
                            className={`pb-3 px-2 font-bold transition-all border-b-2 flex items-center gap-2 ${viewMode === "todos"
                                    ? "border-jungle_teal text-jungle_teal"
                                    : "border-transparent text-base-content/50 hover:text-base-content"
                                }`}
                        >
                            <PanelTopOpen />
                            Tod@s
                        </button>
                    </div>
                </header>
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* --- RENDERIZAMOS TIENDAS (Si es 'tiendas' o 'todos') --- */}
                        {(viewMode === "tiendas" || viewMode === "todos") &&
                            dummyShops.map((shop) => (
                                <div key={`shop-${shop.id}`} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-xl hover:border-jungle_teal/50 transition-all cursor-pointer group overflow-hidden">
                                    <figure className="h-40 bg-base-200/50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                                        {shop.emoji}
                                    </figure>
                                    <div className="card-body p-5">
                                        <div className="flex justify-between items-start">
                                            <h2 className="card-title text-lg">{shop.nombre}</h2>
                                            <div className="badge badge-ghost gap-1 bg-base-200 font-bold">⭐ {shop.rating}</div>
                                        </div>
                                        <p className="text-sm text-base-content/60 font-medium">{shop.categoria}</p>
                                        <div className="card-actions justify-end mt-4">
                                            <button className="btn btn-sm btn-outline text-jungle_teal border-jungle_teal hover:bg-jungle_teal hover:text-white hover:border-jungle_teal transition-colors">
                                                Visitar Tienda
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }

                        {/* --- RENDERIZAMOS PRODUCTOS (Si es 'productos' o 'todos') --- */}
                        {(viewMode === "productos" || viewMode === "todos") &&
                            dummyProducts.map((product) => (
                                <div key={`prod-${product.id}`} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-xl hover:border-yellow-500/50 transition-all cursor-pointer group overflow-hidden">
                                    <figure className="h-40 bg-base-200/50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                                        {product.emoji}
                                    </figure>
                                    <div className="card-body p-5">
                                        <h2 className="card-title text-lg">{product.nombre}</h2>
                                        <p className="text-sm text-base-content/60">de {product.tienda}</p>
                                        <div className="card-actions flex justify-between items-center mt-4">
                                            <span className="text-xl font-bold text-jungle_teal dark:text-yellow-400">{product.precio}</span>
                                            <button className="btn btn-sm bg-jungle_teal text-white hover:bg-jungle_teal/90 border-none">
                                                Añadir 🛒
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }

                    </div>
                </section>
            </main>

        </div>
    );
};