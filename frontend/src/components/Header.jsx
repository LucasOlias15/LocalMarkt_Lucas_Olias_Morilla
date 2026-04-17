import { Logo } from './Logo';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CartDrawer } from './CartDrawer';
import { Link, useLocation } from 'wouter';
import { useCartStore } from '../store/useCartStore';

export const Header = ({ toggleMenu }) => {

    // 1. PRIMERO: Declaramos los estados locales y de enrutamiento
    const [user, setUser] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    // 👇 CAMBIO 1: Extraemos también 'setLocation' para navegar sin recargar la página 👇
    const [location, setLocation] = useLocation();

    // 2. SEGUNDO: Extraemos las cosas de Zustand
    const carts = useCartStore((state) => state.carts);
    const clearCart = useCartStore((state) => state.clearCart);

    // 3. TERCERO: Ahora sí, como 'user' ya existe, podemos usarlo para las matemáticas
    const userId = user?.id || user?.id_usuario;
    const userCart = userId ? (carts[userId] || []) : [];
    const totalItems = userCart.reduce((acc, item) => acc + (item.quantity || 0), 0);

    // --- LÓGICA DEL TEMA ---
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return true;
    });

    useEffect(() => {
        const root = document.documentElement;

        if (isDark) {
            root.setAttribute('data-theme', 'dark');
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.setAttribute('data-theme', 'light');
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = (e) => {
        setIsDark(e.target.checked ?? !isDark);
    };

    useEffect(() => {
        const handleOpenCart = () => setIsCartOpen(true);
        window.addEventListener('openCart', handleOpenCart);
        return () => window.removeEventListener('openCart', handleOpenCart);
    }, []);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("Error leyendo el usuario", err);
        }
    }, [location]);

    const handleLogout = () => {
        try {
            // 1. Vaciamos el almacenamiento (Esto es lo más crítico)
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // 2. Intentamos limpiar el estado de Zustand
            // (Si esto falla por algo, saltará al catch sin romper la web)
            if (typeof clearCart === 'function') {
                clearCart();
            }

            // 3. Quitamos el foco al menú para que se cierre visualmente
            if (document.activeElement) {
                document.activeElement.blur();
            }
            
            // 4. Limpiamos el estado local
            setUser(null);
            
        } catch (error) {
            console.error("Bug cazado durante el cierre de sesión:", error);
        } finally {
            // replace() borra el historial de esa pestaña y te manda al inicio.
            window.location.replace("/");
        }
    };

    return (
        <>
            <header className="navbar bg-base-100 shadow-sm px-4 sticky top-0 z-200 h-20 transition-all duration-300 border-b border-base-200">

                {/* Izquierda: Drawer (Menú) */}
                <div className="navbar-start">
                    <div className="flex items-center pl-2">
                        <button
                            onClick={toggleMenu}
                            className="btn btn-ghost hover:bg-jungle_teal/10 text-jungle_teal flex items-center justify-center h-14 w-14 rounded-2xl transition-all duration-300 group cursor-pointer border-none"
                        >
                            <motion.svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-10 h-10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial="initial"
                                animate="animate"
                                whileHover="hover"
                            >
                                <motion.line
                                    x1="3" x2="21" y1="7" y2="7"
                                    variants={{
                                        initial: { pathLength: 0, opacity: 0 },
                                        animate: { pathLength: 1, opacity: 1, transition: { duration: 0.5 } },
                                        hover: { x: 4, stroke: "#2b9348", transition: { duration: 0.3 } }
                                    }}
                                />
                                <motion.line
                                    x1="3" x2="16" y1="12" y2="12"
                                    variants={{
                                        initial: { pathLength: 0, opacity: 0 },
                                        animate: { pathLength: 1, opacity: 1, transition: { duration: 0.5, delay: 0.1 } },
                                        hover: { x: -3, stroke: "#55a630", transition: { duration: 0.3 } }
                                    }}
                                />
                                <motion.line
                                    x1="3" x2="21" y1="17" y2="17"
                                    variants={{
                                        initial: { pathLength: 0, opacity: 0 },
                                        animate: { pathLength: 1, opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
                                        hover: { x: 6, stroke: "#007f5f", transition: { duration: 0.3 } }
                                    }}
                                />
                            </motion.svg>
                        </button>
                    </div>
                </div>

                {/* Centro: Logo */}
                <div className="navbar-center">
                    <Logo />
                </div>

                {/* Derecha: Botones Alineados */}
                <div className="navbar-end flex items-center justify-end gap-3 sm:gap-4 pr-2">

                    {/* 1. BOTÓN TEMA (Oculto en móvil) */}
                    <label className="hidden md:inline-grid swap swap-rotate btn btn-circle btn-sm md:btn-md bg-jungle_teal border-2 border-jungle_teal text-base-100 hover:bg-transparent hover:text-jungle_teal hover:border-jungle_teal transition-all shadow-md">
                        <input type="checkbox" onChange={toggleTheme} checked={isDark} className="hidden" />
                        <svg className="swap-off w-5 h-5 md:w-6 md:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>
                        </svg>
                        <svg className="swap-on w-5 h-5 md:w-6 md:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                        </svg>
                    </label>

                    {/* 2. BOTÓN IDIOMA (Oculto en móvil) */}
                    <div className="hidden md:dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-circle btn-sm md:btn-md bg-jungle_teal border-2 border-jungle_teal text-base-100 hover:bg-transparent hover:text-jungle_teal transition-all shadow-md flex items-center justify-center cursor-pointer">
                            <svg className="w-5 h-5 md:w-6 md:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" />
                            </svg>
                        </label>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-2xl z-110 w-32 p-2 shadow-2xl border border-base-200 mt-4 font-bold">
                            <li><a className="text-sm">Español</a></li>
                            <li><a className="text-sm opacity-50">English</a></li>
                        </ul>
                    </div>

                    {/* 3. BOTÓN CARRITO */}
                    <button onClick={() => setIsCartOpen(true)} className="btn btn-circle btn-sm md:btn-md bg-jungle_teal border-2 border-jungle_teal text-base-100 hover:bg-transparent hover:text-jungle_teal transition-all shadow-md relative overflow-visible cursor-pointer">
                        <motion.div
                            key={isCartOpen}
                            initial={{ scale: 1 }}
                            animate={isCartOpen ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                            className="indicator"
                        >
                            <div className="indicator">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="badge badge-xs md:badge-sm indicator-item bg-yellow-400 border-2 border-base-100 text-jungle_teal-200 font-black">
                                    {totalItems}
                                </span>
                            </div>
                        </motion.div>
                    </button>

                    {/* 4. BOTÓN USUARIO */}
                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-circle btn-sm md:btn-md bg-jungle_teal border-2 border-jungle_teal text-base-100 hover:bg-transparent hover:text-jungle_teal transition-all shadow-md flex items-center justify-center overflow-hidden cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="4" /><path d="M18 20a6 6 0 0 0-12 0" />
                            </svg>
                        </label>

                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-2xl z-110 w-52 p-2 shadow-2xl border border-base-200 mt-4 font-bold">
                            {user?.nombre ? (
                                <>
                                    <li className="menu-title px-4 py-2 text-xs opacity-50 uppercase">Hola, {user.nombre}</li>
                                    {/*TODO Toggle entre comercio que ya tiene productos y foto de perfil y comercio al que le falta información */}
                                    {user.rol === 'dueño' && (
                                        <li>
                                            <Link href={`/panel-tienda/${user.id_comercio}`} className="text-jungle_teal bg-jungle_teal/10 hover:bg-jungle_teal hover:text-white transition-colors">
                                                Gestionar mi comercio
                                            </Link>
                                        </li>
                                    )}
                                    <li><Link href="/perfil">Mi Perfil</Link></li>
                                    <li><Link href='/perfil/pedidos'>Mis Pedidos</Link></li>
                                    <div className="divider my-1"></div>
                                    <li><button onClick={handleLogout} className="text-error hover:bg-error/10 cursor-pointer">Cerrar sesión</button></li>
                                </>
                            ) : (
                                <>
                                    <li><Link href="/login" className="text-jungle_teal">Iniciar Sesión</Link></li>
                                    <li><Link href="/registro">Crear Cuenta</Link></li>
                                </>
                            )}

                            {/* ✨ OPCIONES EXTRA SOLO PARA MÓVIL ✨ */}
                            <div className="divider md:hidden my-1"></div>
                            
                            <li className="md:hidden">
                                <a onClick={toggleTheme} className="flex flex-col items-start gap-0 leading-tight cursor-pointer">
                                    <span>Tema</span>
                                    <span className="text-xs opacity-50 font-normal">{isDark ? 'Oscuro' : 'Claro'}</span>
                                </a>
                            </li>

                            <li className="md:hidden">
                                <details>
                                    <summary>Idioma</summary>
                                    <ul className="p-2 z-110 bg-base-100 shadow-sm border border-base-200">
                                        <li><a className="text-sm">Español</a></li>
                                        <li><a className="text-sm opacity-50 font-normal">English</a></li>
                                        <li><a className="text-sm opacity-50 font-normal">Italiano</a></li>
                                    </ul>
                                </details>
                            </li>

                        </ul>
                    </div>
                </div>
            </header>
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
};