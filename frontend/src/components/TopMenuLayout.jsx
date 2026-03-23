import { useState } from "react";
import { Header } from "./Header"; // Asegúrate de importar tu Header
import { RegisterShopModal } from "./RegisterShopModal";
import { Banana, Croissant, Beef, Leaf, House, PackageSearch, ShoppingBag, LayoutList, Wrench, Shirt, Amphora } from "lucide-react";

export const TopMenuLayout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="relative min-h-screen flex flex-col">

            {/* 1. EL HEADER: Le pasamos la función para que el SVG pueda abrir el menú */}
            <Header toggleMenu={toggleMenu} />

            {/* 2. EL MENÚ DESPLEGABLE (Estilo Amazon) */}
            {/* z-[40] para que esté por debajo del Header (si el header tiene z-[50]) */}
            <div
                className={`fixed top-0 left-0 w-full bg-base-100 shadow-2xl border-b border-base-200 z-40 transition-transform duration-500 ease-in-out ${isMenuOpen ? "translate-y-20" : "-translate-y-full"
                    }`}
            // Así el menú cae justo por debajo de él.
            >
                {/* Contenido del menú */}
                <div className="p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                    <ul className="menu w-full md:w-80 gap-2">
                        <div className="mb-4 font-bold text-xl text-jungle_teal flex items-center gap-2">
                            <span>
                                <LayoutList/>
                            </span> Menú Principal
                        </div>
                        <li><a href="/" className="text-lg font-medium hover:text-jungle_teal"><House/> Inicio</a></li>
                        {/*TODO Enlazar href para productos del usuario logueado y href a mis compras en caso de haber compras */}
                        {/*TODO Ocultar o eliminar este apartado si esta logueado como usuario base*/}
                        <li><a href="/tienda/:id"className="text-lg font-medium hover:text-jungle_teal"><PackageSearch/> Mis Productos</a></li>
                        <li><a className="text-lg font-medium hover:text-jungle_teal"><ShoppingBag/> Mis Compras</a></li>
                        <div className="divider"></div>
                        <li><a className="opacity-70"> <Wrench/> Soporte técnico</a></li>
                    </ul>

                    {/* SECCIÓN DERECHA: Categorías y Promoción */}
                    <div className="hidden md:flex flex-col flex-1 bg-base-200 rounded-2xl p-6 relative overflow-hidden">

                        {/* Decoración de fondo suave (un toque de luz) */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-jungle_teal/10 rounded-full blur-2xl pointer-events-none"></div>

                        <h3 className="font-bold text-jungle_teal mb-4 text-lg flex items-center gap-2">
                            Explorar por Categorías
                        </h3>

                        {/* Grid de 4 categorías rápidas */}
                        <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">

                            {/* Categoría 1: Fruterías */}
                            <a href="/explorar?categoria=Frutería" className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-yellow-500 border border-transparent transition-all cursor-pointer group">
                                <div className="bg-yellow-500/10 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                    <Banana className="w-6 h-6"/>
                                </div>
                                <span className="font-medium text-base-content">Fruterías</span>
                            </a>

                            {/* Categoría 2: Panaderías */}
                            <a href="/explorar?categoria=Panadería" className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-orange-500 border border-transparent transition-all cursor-pointer group">
                                <div className="bg-orange-500/10 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                    <Croissant className="w-6 h-6"/>
                                </div>
                                <span className="font-medium text-base-content">Panaderías</span>
                            </a>

                            {/* Categoría 3: Carnicerías */}
                            <a href="/explorar?categoria=Carnicería" className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-red-500 border border-transparent transition-all cursor-pointer group">
                                <div className="bg-red-500/10 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                    <Beef className="w-6 h-6"/>
                                </div>
                                <span className="font-medium text-base-content">Carnicerías</span>
                            </a>

                            {/* Categoría 4: Bio/Eco */}
                            <a href="/explorar?categoria=Bio" className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-sea_green border border-transparent transition-all cursor-pointer group">
                                <div className="bg-jungle_teal/10 dark:bg-jungle_teal/30 text-jungle_teal dark:text-jungle_teal p-2 rounded-lg group-hover:scale-110 transition-transform">
                                    <Leaf className="w-6 h-6"/>
                                </div>
                                <span className="font-medium text-base-content">Productos Bio</span>
                            </a>

                           {/* Categoría 5: Artesanía/Regalos */}
                            <a href="/explorar?categoria=Artesanía y regalos" className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-blue-500 border border-transparent transition-all cursor-pointer group">
                                <div className="bg-blue-500/10 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                    <Amphora className="w-6 h-6"/>
                                </div>
                                <span className="font-medium text-base-content">Artesanía y Regalos</span>
                            </a>

                            {/* Categoría 6: Textiles/Moda */}
                            <a href="/explorar?categoria=Textiles y moda" className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-purple-500 border border-transparent transition-all cursor-pointer group">
                                <div className="bg-purple-500/10 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                    <Shirt className="w-6 h-6"/>
                                </div>
                                <span className="font-medium text-base-content">Textiles y moda</span>
                            </a>

                        </div>

                        {/* Banner promocional*/}
                        <div className="mt-auto bg-linear-to-r from-jungle_teal to-sea_green p-4 rounded-xl text-white flex items-center justify-between relative z-10 shadow-lg">
                            <div>
                                <h4 className="font-black text-sm md:text-base">¿Tienes un negocio local?</h4>
                                <p className="text-xs md:text-sm opacity-90">Únete a LocalMarkt gratis</p>
                            </div>
                            <a onClick={() => document.getElementById('register_shop_modal').showModal()} className="btn btn-sm bg-white text-jungle_teal border-none hover:bg-base-200">Empezar</a>
                        </div>

                    </div>
                </div>
            </div>

            {/* 3. CAPA OSCURA (Overlay) */}
            {/* Si el menú está abierto, oscurecemos el fondo para que el usuario se centre en el menú */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
                    onClick={toggleMenu} // Si hacen clic fuera, se cierra
                ></div>
            )}

            {/* 4. EL CONTENIDO DE LA PÁGINA */}
            <main className="flex-1 "> 
                {children}
            </main>

        </div>
    );
};