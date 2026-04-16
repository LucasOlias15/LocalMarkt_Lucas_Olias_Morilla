import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
    Package, Store, Clock, CheckCircle2, XCircle, SearchX, ArrowRight,
    ShoppingBag, Banana, Croissant, Beef, Leaf, Shirt, Amphora, Cake
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const OrdersPage = () => {
    // ==========================================
    // 1. ESTADOS DE LA APLICACIÓN
    // ==========================================
    const [activeTab, setActiveTab] = useState("Todos");
    const [pedidos, setPedidos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

    const pestañas = ["Todos", "En proceso", "Completado", "Cancelado"];
    
    // Obtenemos de forma segura el ID del usuario desde localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || user?.id_usuario;

    // ==========================================
    // 2. OBTENCIÓN DE DATOS (FETCH)
    // ==========================================
    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        const fetchMisPedidos = async () => {
            try {
                // Llamamos al backend que ya agrupa las tiendas y productos con el .reduce()
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

    // ==========================================
    // 3. FUNCIONES DE FORMATEO Y HELPERS
    // ==========================================
    const formatearFecha = (fechaIso) => {
        const fecha = new Date(fechaIso);
        return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Función dinámica para devolver el icono correcto según el string de la categoría
    const getIconoCategoria = (categoria, size = 18) => {
        switch (categoria) {
            case "Frutería": return <Banana className="text-yellow-500" size={size} />;
            case "Panadería": return <Croissant className="text-orange-400" size={size} />;
            case "Carnicería": return <Beef className="text-red-500" size={size} />;
            case "Bio": return <Leaf className="text-sea_green" size={size} />;
            case "Textiles y moda": return <Shirt className="text-purple-500" size={size} />;
            case "Artesanía y regalos": return <Amphora className="text-blue-500" size={size} />;
            case "Pastelería": return <Cake className="text-pink-400" size={size} />;
            default: return <Store className="text-jungle_teal" size={size} />;
        }
    };

    // Devuelve un diseño distinto (colores/iconos) según el estado del pedido
    const renderEstadoBadge = (estado) => {
        switch (estado) {
            case "En proceso":
                return <span className="badge bg-yellow-400 text-yellow-900 border-none font-bold gap-1 px-4 py-3 text-xs"><Clock size={14} /> En proceso</span>;
            case "Completado":
                return <span className="badge bg-sea_green text-white border-none font-bold gap-1 px-4 py-3 text-xs"><CheckCircle2 size={14} /> Completado</span>;
            case "Cancelado":
                return <span className="badge bg-red-500 text-white border-none font-bold gap-1 px-4 py-3 text-xs"><XCircle size={14} /> Cancelado</span>;
            default:
                return <span className="badge bg-base-300 text-base-content border-none font-bold px-4 py-3 text-xs">{estado}</span>;
        }
    };

    // Pantalla de carga mientras se ejecuta el useEffect
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-jungle_teal"></span>
            </div>
        );
    }

    // Filtramos los pedidos basándonos en la pestaña activa
    const tieneHistorial = pedidos.length > 0;
    const pedidosFiltrados = pedidos.filter(pedido => activeTab === "Todos" || pedido.estado === activeTab);

    // ==========================================
    // 4. RENDERIZADO DEL COMPONENTE
    // ==========================================
    return (
        <div className="min-h-screen bg-base-200 pb-20">
            {/* Contenedor principal devuelto a max-w-4xl para mayor amplitud */}
            <div className="max-w-4xl mx-auto px-4 pt-12">
                <header className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black text-base-content flex items-center justify-center md:justify-start gap-3 mb-3">
                        <Package className="text-jungle_teal" size={40} strokeWidth={2.5} />
                        Mis Pedidos
                    </h1>
                    <p className="text-base-content/60 text-lg font-medium">
                        Revisa tus compras recientes y haz seguimiento de tus productos.
                    </p>
                </header>

                {!tieneHistorial ? (
                    // ESTADO: El usuario nunca ha comprado nada
                    <div className="flex flex-col items-center justify-center text-center p-12 bg-base-100 rounded-[3rem] border border-base-200 shadow-sm mt-10">
                        <div className="w-32 h-32 mb-6 text-jungle_teal relative">
                            <ShoppingBag className="w-full h-full" strokeWidth={1} />
                        </div>
                        <h3 className="font-black text-3xl text-base-content mb-3">Tu cesta está vacía</h3>
                        <p className="text-base-content/60 text-lg max-w-md mb-8">
                            Aún no has realizado ningún pedido. ¡Es el momento perfecto para descubrir las joyas de tu barrio!
                        </p>
                        <Link href="/explorar">
                            <button className="btn h-12 bg-jungle_teal text-white border-none rounded-full px-8 text-base hover:bg-sea_green">
                                Empezar a explorar
                            </button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Selector de pestañas (Todos, En proceso, etc.) */}
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 [&::-webkit-scrollbar]:hidden">
                            {pestañas.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all
                                        ${activeTab === tab ? "bg-jungle_teal text-white shadow-md" : "bg-base-200 text-base-content/70 hover:bg-base-300"}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-6">
                            {pedidosFiltrados.length > 0 ? (
                                // RENDERIZAMOS CADA PEDIDO DE LA LISTA
                                pedidosFiltrados.map((pedido) => (
                                    <div key={pedido.id_pedido} className="bg-base-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-base-content/5 border-l-8 border-l-jungle_teal hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                                        
                                        {/* Cabecera del Pedido (ID, Fecha y Estado) */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-base-200 pb-4 mb-5 gap-4">
                                            <div>
                                                <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-1">
                                                    Pedido LM-{pedido.id_pedido}
                                                </p>
                                                <p className="text-sm font-medium text-base-content/70">
                                                    {formatearFecha(pedido.fecha)}
                                                </p>
                                            </div>
                                            <div>{renderEstadoBadge(pedido.estado)}</div>
                                        </div>

                                        {/* Cuerpo: Iteramos sobre las tiendas del pedido actual */}
                                        <div className="flex flex-col gap-5">
                                            {pedido.tiendas?.map((tienda, idx) => (
                                                <div key={idx} className="w-full">
                                                    {/* Etiqueta de la Tienda (Tamaño aumentado) */}
                                                    <div className="flex items-center gap-2 mb-2 pl-1">
                                                        <div className="w-8 h-8 rounded-xl bg-base-200 flex items-center justify-center shrink-0 border border-base-300/50">
                                                            {getIconoCategoria(tienda.categoria, 16)}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-base sm:text-lg font-bold text-base-content leading-none">{tienda.nombre}</h3>
                                                            <span className="w-1 h-1 rounded-full bg-base-300 hidden sm:block"></span>
                                                            <p className="text-[10px] sm:text-xs font-bold text-base-content/40 uppercase tracking-widest hidden sm:block">{tienda.categoria}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Lista de productos anidados visualmente bajo la tienda */}
                                                    <div className="ml-10">
                                                        <ul className="space-y-2">
                                                            {tienda.productos.map((prod, pIdx) => (
                                                                <li key={pIdx} className="flex items-start gap-3 text-sm">
                                                                    <span className="bg-base-200/80 text-base-content/70 font-black px-2 py-1 rounded-md text-xs shrink-0 mt-0.5">
                                                                        {prod.cantidad}x
                                                                    </span>
                                                                    <span className="font-medium text-base-content leading-tight mt-1">
                                                                        {prod.nombre}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pie del Pedido: Diseño asimétrico (Total izq, Botones der) */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 mt-6 pt-5 border-t border-base-200/50">
                                            <div className="text-left">
                                                <p className="text-xs text-base-content/50 font-bold uppercase mb-1">Total Pagado</p>
                                                <p className="text-3xl font-black text-jungle_teal leading-none">{Number(pedido.total).toFixed(2)}€</p>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row justify-end gap-3 w-full sm:w-auto">
                                                <button className="btn btn-ghost text-base-content/70 hover:bg-base-200 rounded-xl text-sm px-5">
                                                    Contactar tienda
                                                </button>
                                                <button
                                                    onClick={() => setPedidoSeleccionado(pedido)}
                                                    className="btn bg-jungle_teal hover:bg-teal-700 text-white border-none rounded-xl text-sm px-6"
                                                >
                                                    Ver ticket <ArrowRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // ESTADO: El usuario no tiene pedidos en la pestaña seleccionada
                                <div className="flex flex-col items-center justify-center text-center p-10 bg-base-100/50 rounded-3xl border border-dashed border-base-300 mt-4">
                                    <div className="w-20 h-20 mb-4 text-base-content/20"><SearchX className="w-full h-full" strokeWidth={1.5} /></div>
                                    <h3 className="font-bold text-xl text-base-content mb-2">Nada por aquí</h3>
                                    <p className="text-base-content/60 text-base max-w-sm">
                                        No hay pedidos con estado <span className="font-bold text-jungle_teal">"{activeTab}"</span>.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ========================================== */}
            {/* 5. MODAL DE DETALLES DEL TICKET            */}
            {/* ========================================== */}
            <AnimatePresence>
                {pedidoSeleccionado && (
                    <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        {/* Animación fluida de entrada/salida del modal */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="w-full max-w-lg bg-base-100 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-6 border-b border-base-200 bg-base-200/30 flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="font-black text-2xl text-base-content">Ticket de Compra</h3>
                                    <p className="font-bold text-sm text-jungle_teal mt-1">Pedido LM-{pedidoSeleccionado.id_pedido}</p>
                                </div>
                                <button onClick={() => setPedidoSeleccionado(null)} className="btn btn-circle btn-ghost bg-base-200 hover:bg-error/20 hover:text-error">
                                    ✕
                                </button>
                            </div>

                            {/* Contenido con scroll independiente si hay muchos productos */}
                            <div className="p-6 overflow-y-auto space-y-8 flex-1">
                                {pedidoSeleccionado.tiendas?.map((tienda, idxT) => (
                                    <div key={idxT} className="space-y-4">
                                        <h4 className="font-bold text-base text-base-content flex items-center gap-2 border-b border-base-200 pb-2">
                                            {getIconoCategoria(tienda.categoria, 20)} {tienda.nombre}
                                        </h4>
                                        {tienda.productos.map((prod, idxP) => (
                                            <div key={idxP} className="flex justify-between items-center p-4 bg-base-100 border border-base-200 rounded-2xl gap-4">
                                                
                                                <div className="flex items-center gap-4">
                                                    {/* Mostrar Imagen real del producto o fallback si no existe en BD */}
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-base-200 shrink-0 border border-base-300">
                                                        {prod.imagen ? (
                                                            <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-base-content/30">
                                                                <Package size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div>
                                                        <p className="font-bold text-base text-base-content leading-tight mb-1">{prod.nombre}</p>
                                                        <p className="text-sm font-medium text-base-content/60">
                                                            {prod.cantidad} x {Number(prod.precio_unitario).toFixed(2)}€
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="font-black text-lg text-base-content shrink-0">
                                                    {(prod.cantidad * prod.precio_unitario).toFixed(2)}€
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

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