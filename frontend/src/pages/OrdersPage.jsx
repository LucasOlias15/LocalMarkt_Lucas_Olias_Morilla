import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
    Package, Store, Clock, CheckCircle2, XCircle, SearchX, ArrowRight,
    ShoppingBag, Banana, Croissant, Beef, Leaf, Shirt, Amphora
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const OrdersPage = () => {
    // 1. ESTADOS DE LA VISTA Y DATOS
    const [activeTab, setActiveTab] = useState("Todos");
    const [pedidos, setPedidos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

    const pestañas = ["Todos", "En proceso", "Completado", "Cancelado"];

    // Obtenemos el usuario activo
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || user?.id_usuario;

    // 2. FETCH PARA TRAER LOS DATOS REALES
    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        const fetchMisPedidos = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/pedidos/usuario/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPedidos(data);
                } else {
                    console.error("Error al traer los pedidos");
                }
            } catch (error) {
                console.error("Error de red:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMisPedidos();
    }, [userId]);

    // --- FUNCIONES AUXILIARES DE FORMATEO ---

    // Genera el texto resumen a partir del array de productos que nos manda el backend
    const generarResumen = (productos) => {
        if (!productos || productos.length === 0) return "Sin artículos";
        // Sumamos todas las cantidades
        const totalArts = productos.reduce((acc, prod) => acc + prod.cantidad, 0);
        // Juntamos los nombres separados por comas
        const nombres = productos.map(prod => prod.nombre).join(", ");
        return `${totalArts} artículos: ${nombres}`;
    };

    // Formatea la fecha "fea" de la base de datos a algo bonito (ej. "24 Mar 2026")
    const formatearFecha = (fechaIso) => {
        const fecha = new Date(fechaIso);
        return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // 1. Renderiza el icono de la tienda según su categoría
    const getIconoCategoria = (categoria) => {
        // TODO Si se piden productos de varias caategorías mostrar los iconos de todas las categorías.
        switch (categoria) {
            case "Frutería": return <Banana className="text-yellow-500" size={20} />;
            case "Panadería": return <Croissant className="text-orange-400" size={20} />;
            case "Carnicería": return <Beef className="text-red-500" size={20} />;
            case "Bio": return <Leaf className="text-sea_green" size={20} />;
            case "Textiles y moda": return <Shirt className="text-purple-500" size={20} />;
            case "Artesanía y regalos": return <Amphora className="text-blue-500" size={20} />;
            default: return <Store className="text-jungle_teal" size={20} />;
        }
    };

    // 2. Renderiza el badge de estado
    const renderEstadoBadge = (estado) => {
        switch (estado) {
            case "En proceso":
                return <span className="badge bg-yellow-400 text-yellow-900 border-none font-bold gap-1 p-3"><Clock size={14} /> En proceso</span>;
            case "Completado":
                return <span className="badge bg-sea_green text-white border-none font-bold gap-1 p-3"><CheckCircle2 size={14} /> Completado</span>;
            case "Cancelado":
                return <span className="badge bg-red-500 text-white border-none font-bold gap-1 p-3"><XCircle size={14} /> Cancelado</span>;
            default:
                return <span className="badge bg-base-300 text-base-content border-none font-bold p-3">{estado}</span>;
        }
    };

    // --- LÓGICA DE FILTRADO ---

    // Si está cargando, mostramos un pequeño spinner antes de decidir qué pintar
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-jungle_teal"></span>
            </div>
        );
    }

    const tieneHistorial = pedidos.length > 0;

    const pedidosFiltrados = pedidos.filter(
        pedido => activeTab === "Todos" || pedido.estado === activeTab
    );

    return (
        <div className="min-h-screen bg-base-200 pb-20">
            <div className="max-w-4xl mx-auto px-4 pt-12">

                {/* --- ENCABEZADO (HERO) --- */}
                <header className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black text-base-content flex items-center justify-center md:justify-start gap-3 mb-3">
                        <Package className="text-jungle_teal" size={40} strokeWidth={2.5} />
                        Mis Pedidos
                    </h1>
                    <p className="text-base-content/60 text-lg font-medium">
                        Revisa tus compras recientes y haz seguimiento de tus productos locales.
                    </p>
                </header>

                {!tieneHistorial ? (
                    /* --- ESTADO VACÍO ABSOLUTO --- */
                    <div className="flex flex-col items-center justify-center text-center p-12 bg-base-100 rounded-[3rem] border border-base-200 shadow-sm mt-10">
                        <div className="w-32 h-32 mb-6 text-jungle_teal/30 relative">
                            <ShoppingBag className="w-full h-full" strokeWidth={1} />
                        </div>
                        <h3 className="font-black text-3xl text-base-content mb-3">Tu cesta está muy vacía</h3>
                        <p className="text-base-content/60 text-lg max-w-md mb-8">
                            Aún no has realizado ningún pedido en LocalMarkt. ¡Es el momento perfecto para descubrir las joyas de tu barrio!
                        </p>
                        <Link href="/explorar">
                            <button className="btn bg-jungle_teal text-white border-none rounded-full px-8 hover:bg-sea_green text-lg h-12">
                                Empezar a explorar
                            </button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* --- FILTROS (TABS) --- */}
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 [&::-webkit-scrollbar]:hidden">
                            {pestañas.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all
                                        ${activeTab === tab
                                            ? "bg-jungle_teal text-white shadow-md shadow-jungle_teal/30"
                                            : "bg-base-200 text-base-content/70 hover:bg-base-300"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* --- LISTA DE PEDIDOS --- */}
                        <div className="flex flex-col gap-6">
                            {pedidosFiltrados.length > 0 ? (
                                pedidosFiltrados.map((pedido) => (
                                    <div key={pedido.id_pedido} className="bg-base-100 rounded-4xl p-6 sm:p-8 shadow-xl border border-base-content/10 border-l-8 border-l-jungle_teal hover:-translate-y-1 hover:shadow-2xl hover:shadow-jungle_teal/20 transition-all duration-300">
                                        {/* Cabecera de la Tarjeta */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-base-200 pb-4 mb-4 gap-4">
                                            <div>
                                                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">
                                                    Pedido LM-{pedido.id_pedido}
                                                </p>
                                                <p className="text-sm font-medium text-base-content/70">
                                                    {formatearFecha(pedido.fecha)}
                                                </p>
                                            </div>
                                            <div>
                                                {renderEstadoBadge(pedido.estado)}
                                            </div>
                                        </div>

                                        {/* Cuerpo de la Tarjeta */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-base-content flex items-center gap-2 mb-2">
                                                    {getIconoCategoria(pedido.categoria)}
                                                    {pedido.tienda}
                                                </h3>
                                                <p className="text-base-content/70 text-sm line-clamp-2">
                                                    {generarResumen(pedido.productos)}
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right shrink-0">
                                                <p className="text-xs text-base-content/50 font-bold uppercase mb-1">Total Pagado</p>
                                                <p className="text-3xl font-black text-jungle_teal">{Number(pedido.total).toFixed(2)}€</p>
                                            </div>
                                        </div>

                                        {/* Pie de la Tarjeta (Acciones) */}
                                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-base-200/50">
                                            <button className="btn btn-outline border-base-300 text-base-content hover:bg-base-200 hover:border-base-300 rounded-xl">
                                                Contactar tienda
                                            </button>
                                            <button
                                                onClick={() => setPedidoSeleccionado(pedido)}
                                                className="btn bg-jungle_teal hover:bg-teal-700 text-white border-none rounded-xl cursor-pointer"
                                            >
                                                Ver detalles <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                /* --- ESTADO VACÍO RELATIVO (No hay pedidos en ESTA pestaña) --- */
                                <div className="flex flex-col items-center justify-center text-center p-10 bg-base-100/50 rounded-[3rem] border border-dashed border-base-300 mt-2">
                                    <div className="w-20 h-20 mb-4 ">
                                        <SearchX className="w-full h-full" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-xl text-base-content mb-2">Nada por aquí</h3>
                                    <p className="text-base-content/60 max-w-sm">
                                        No tienes ningún pedido con el estado <span className="font-bold text-jungle_teal">"{activeTab}"</span> actualmente.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            {/* --- MODAL DE DETALLES DEL PEDIDO --- */}
                <AnimatePresence>
                    {pedidoSeleccionado && (
                        <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-lg bg-base-100 rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                            >
                                {/* Cabecera del Modal */}
                                <div className="p-6 border-b border-base-200 bg-base-200/30 flex justify-between items-center shrink-0">
                                    <div>
                                        <h3 className="font-black text-2xl text-base-content">Ticket de Compra</h3>
                                        <p className="font-bold text-jungle_teal mt-1">Pedido LM-{pedidoSeleccionado.id_pedido}</p>
                                    </div>
                                    <button 
                                        onClick={() => setPedidoSeleccionado(null)}
                                        className="btn btn-circle btn-ghost bg-base-200 hover:bg-error/20 hover:text-error cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Lista Desplegada de Productos */}
                                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                                    {pedidoSeleccionado.productos.map((prod, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-base-100 border border-base-200 rounded-2xl hover:border-jungle_teal/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center text-xl">
                                                    {/* TODO Mostrar Imagen del producto comprado aquí */}
                                                    {prod.image}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-base-content leading-tight">{prod.nombre}</p>
                                                    <p className="text-sm font-medium text-base-content/60 mt-1">
                                                        {prod.cantidad} x {Number(prod.precio_unitario).toFixed(2)}€
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="font-black text-lg text-base-content">
                                                {(prod.cantidad * prod.precio_unitario).toFixed(2)}€
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer del Modal (Total) */}
                                <div className="p-6 border-t border-base-200 bg-base-200/50 flex justify-between items-end shrink-0">
                                    <p className="text-sm font-bold uppercase tracking-widest text-base-content/60">Total abonado</p>
                                    <p className="text-4xl font-black text-jungle_teal">
                                        {Number(pedidoSeleccionado.total).toFixed(2)}€
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
        </div>
    );
};