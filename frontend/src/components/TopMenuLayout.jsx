import { useState } from "react";
import { Link } from "wouter"; 
import { Header } from "./Header"; 
// 1. IMPORTAMOS EL NUEVO ICONO (Cake)
import { Banana, Croissant, Beef, Leaf, House, PackageSearch, ShoppingBag, LayoutList, Wrench, Shirt, Amphora, LocateFixed, Cake } from "lucide-react";

export const TopMenuLayout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // LÓGICA DE USUARIO 
    const usuario = JSON.parse(localStorage.getItem('user'));
    const estaLogueado = !!usuario;
    const esDueño = usuario?.rol === 'dueño';

    // Función para el botón del Header (abrir/cerrar)
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Función a prueba de balas solo para los enlaces del menú (cerrar siempre)
    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <div className="relative min-h-screen flex flex-col">

            {/* 1. EL HEADER */}
            <Header toggleMenu={toggleMenu} />

            {/* 2. EL MENÚ DESPLEGABLE */}
            <div
                className={`fixed top-0 left-0 w-full bg-base-100 shadow-2xl border-b border-base-200 z-40 transition-transform duration-500 ease-in-out ${
                    isMenuOpen ? "translate-y-20" : "-translate-y-full"
                }`}
            >
                <div className="p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                    
             {/* SECCIÓN IZQUIERDA: Menú de Navegación */}
                    <ul className="menu w-full md:w-80 gap-2">
                        <div className="mb-4 font-bold text-xl text-jungle_teal flex items-center gap-2">
                            <span>
                                <LayoutList/>
                            </span> Menú Principal
                        </div>
                        
                        {/* INICIO */}
                        <li>
                            <Link href="/">
                                <a onClick={closeMenu} className="text-lg font-medium hover:text-jungle_teal flex items-center gap-3 py-3">
                                    <House size={20}/> Inicio
                                </a>
                            </Link>
                        </li>

                        {esDueño && (
                            <li>
                                <Link href={`/panel-tienda/${usuario.id_comercio || usuario.id}`}>
                                    <a onClick={closeMenu} className="text-lg font-medium hover:text-jungle_teal flex items-center gap-3 py-3">
                                        <PackageSearch size={20}/> Mis Productos
                                    </a>
                                </Link>
                            </li>
                        )}

                        {estaLogueado && (
                            <li>
                                <Link href="/perfil/pedidos">
                                    <a onClick={closeMenu} className="text-lg font-medium hover:text-jungle_teal flex items-center gap-3 py-3">
                                        <ShoppingBag size={20}/> Mis Compras
                                    </a>
                                </Link>
                            </li>
                        )}

                         {/* ENLACE A MAPA */}
                        <li>
                            <Link href="/mapa">
                                <a onClick={closeMenu} className="text-lg font-medium hover:text-jungle_teal flex items-center gap-3 py-3">
                                    <LocateFixed size={20}/> Mapa Interactivo
                                </a>
                            </Link>
                        </li>

                        <div className="divider my-2"></div>
                        
                        {/* SOPORTE TÉCNICO */}
                        <li>
                            <Link href="/soporte">
                                <a onClick={closeMenu} className="opacity-70 text-lg font-medium hover:text-jungle_teal hover:opacity-100 transition-all flex items-center gap-3 py-3"> 
                                    <Wrench size={20}/> Soporte técnico
                                </a>
                            </Link>
                        </li>
                        
                    </ul>

                    {/* SECCIÓN DERECHA: Categorías y Promoción */}
                    <div className="hidden md:flex flex-col flex-1 bg-base-200 rounded-2xl p-6 relative overflow-hidden">
                        {/* Decoración de fondo suave (un toque de luz) */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-jungle_teal/10 rounded-full blur-2xl pointer-events-none"></div>

                        {/* 2. ENCABEZADO CON BOTÓN DE "VER TODAS" */}
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h3 className="font-bold text-jungle_teal text-lg flex items-center gap-2">
                                Explorar por Categorías
                            </h3>
                            <Link href="/explorar">
                                <a onClick={closeMenu} className="text-sm font-bold text-jungle_teal/70 hover:text-jungle_teal transition-colors">
                                    Ver todas &rarr;
                                </a>
                            </Link>
                        </div>

                        {/* Grid de categorías */}
                        <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                            {/* Categoría 1: Fruterías */}
                            <Link href="/explorar?categoria=Frutería">
                                <a onClick={closeMenu} className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-yellow-500 border border-transparent transition-all cursor-pointer group">
                                    <div className="bg-yellow-500/10 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                        <Banana className="w-6 h-6"/>
                                    </div>
                                    <span className="font-medium text-base-content">Fruterías</span>
                                </a>
                            </Link>

                            {/* Categoría 2: Panaderías */}
                            <Link href="/explorar?categoria=Panadería">
                                <a onClick={closeMenu} className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-orange-500 border border-transparent transition-all cursor-pointer group">
                                    <div className="bg-orange-500/10 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                        <Croissant className="w-6 h-6"/>
                                    </div>
                                    <span className="font-medium text-base-content">Panaderías</span>
                                </a>
                            </Link>

                            {/* Categoría 3: Carnicerías */}
                            <Link href="/explorar?categoria=Carnicería">
                                <a onClick={closeMenu} className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-red-500 border border-transparent transition-all cursor-pointer group">
                                    <div className="bg-red-500/10 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                        <Beef className="w-6 h-6"/>
                                    </div>
                                    <span className="font-medium text-base-content">Carnicerías</span>
                                </a>
                            </Link>

                            {/* Categoría 4: Bio/Eco */}
                            <Link href="/explorar?categoria=Bio">
                                <a onClick={closeMenu} className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-sea_green border border-transparent transition-all cursor-pointer group">
                                    <div className="bg-jungle_teal/10 dark:bg-jungle_teal/30 text-jungle_teal dark:text-jungle_teal p-2 rounded-lg group-hover:scale-110 transition-transform">
                                        <Leaf className="w-6 h-6"/>
                                    </div>
                                    <span className="font-medium text-base-content">Productos Bio</span>
                                </a>
                            </Link>

                            {/* Categoría 5: Artesanía/Regalos */}
                            <Link href="/explorar?categoria=Artesanía y regalos">
                                <a onClick={closeMenu} className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-blue-500 border border-transparent transition-all cursor-pointer group">
                                    <div className="bg-blue-500/10 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                        <Amphora className="w-6 h-6"/>
                                    </div>
                                    <span className="font-medium text-base-content">Artesanía y Regalos</span>
                                </a>
                            </Link>

                            {/* Categoría 6: Textiles/Moda */}
                            <Link href="/explorar?categoria=Textiles y moda">
                                <a onClick={closeMenu} className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-purple-500 border border-transparent transition-all cursor-pointer group">
                                    <div className="bg-purple-500/10 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                        <Shirt className="w-6 h-6"/>
                                    </div>
                                    <span className="font-medium text-base-content">Textiles y moda</span>
                                </a>
                            </Link>

                            {/* 3. NUEVA CATEGORÍA: Pastelería */}
                            <Link href="/explorar?categoria=Pastelería">
                                <a onClick={closeMenu} className="flex items-center gap-3 p-3 bg-base-100 rounded-xl hover:shadow-md hover:border-pink-500 border border-transparent transition-all cursor-pointer group">
                                    <div className="bg-pink-500/10 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                        <Cake className="w-6 h-6"/>
                                    </div>
                                    <span className="font-medium text-base-content">Pastelerías</span>
                                </a>
                            </Link>
                        </div>

                        {/* Banner promocional*/}
                        <div className="mt-auto bg-linear-to-r from-jungle_teal to-sea_green p-4 rounded-xl text-white flex items-center justify-between relative z-10 shadow-lg">
                            <div>
                                <h4 className="font-black text-sm md:text-base">¿Tienes un negocio local?</h4>
                                <p className="text-xs md:text-sm opacity-90">Únete a LocalMarkt gratis</p>
                            </div>
                            <button onClick={() => { closeMenu(); document.getElementById('register_shop_modal').showModal(); }} className="btn btn-sm bg-white text-jungle_teal border-none hover:bg-base-200 cursor-pointer">
                                Empezar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. CAPA OSCURA (Overlay) */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
                    onClick={closeMenu}
                ></div>
            )}

            {/* 4. EL CONTENIDO DE LA PÁGINA */}
            <main className="flex-1 "> 
                {children}
            </main>

        </div>
    );
};