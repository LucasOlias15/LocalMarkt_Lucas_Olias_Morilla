import { MapPinCheckInside, PackageSearch, ClipboardList, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";

// 🌟 Definimos la URL de la API de forma dinámica (Vite)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const StorePanelPage = () => {
    // 💡 1. RUTAS Y ESTADOS
    const [, params] = useRoute("/panel-tienda/:id");
    const storeId = params.id;

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [pedidos, setPedidos] = useState([]); // 🆕 Estado para los pedidos
    const [activeTab, setActiveTab] = useState("productos"); // 🆕 Control de pestañas
    const [loading, setLoading] = useState(true);

    const [imageFile, setImageFile] = useState(null);
    const [toast, setToast] = useState(null);

    const mostrarNotificacion = (mensaje, tipo = "success") => {
        setToast({ mensaje, tipo });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        nombre: "", descripcion: "", precio: "", stock: "", imagen: ""
    });
    const [editingId, setEditingId] = useState(null);

    const [productToDelete, setProductToDelete] = useState(null);

    // 💡 2. CARGA INICIAL DE DATOS
    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                // Usamos la variable de entorno
                const resStore = await fetch(`${API_URL}/comercios/${storeId}`);
                const storeData = await resStore.json();
                setStore(storeData);

                const resProducts = await fetch(`${API_URL}/productos/comercio/${storeId}`);
                const productsData = await resProducts.json();
                setProducts(productsData);

                // 🆕 Fetch de pedidos
                const resPedidos = await fetch(`${API_URL}/pedidos/comercio/${storeId}`);
                if (resPedidos.ok) {
                    const pedidosData = await resPedidos.json();
                    setPedidos(pedidosData);
                }
            } catch (error) {
                console.error("Error cargando el panel:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [storeId]);

    // 💡 3. FUNCIÓN ELIMINAR (Confirmada desde el modal)
    const confirmDelete = async () => {
        if (!productToDelete) return;
        const productId = productToDelete.id_producto;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/productos/${productId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (res.ok) {
                setProducts(products.filter(p => p.id_producto !== productId));
                mostrarNotificacion("Producto eliminado correctamente", "success");
            } else {
                mostrarNotificacion("Error al eliminar el producto", "error");
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            mostrarNotificacion("Error de conexión al intentar eliminar", "error");
        } finally {
            setProductToDelete(null); // Cerramos el modal de borrado
        }
    };

    // 💡 4. ABRIR MODALES
    const handleOpenAdd = () => {
        setEditingId(null);
        setNewProduct({ nombre: "", descripcion: "", precio: "", stock: "", imagen: "" });
        setImageFile(null); // Limpiamos el archivo residual si lo hubiera
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product) => {
        setEditingId(product.id_producto);
        setNewProduct({
            nombre: product.nombre,
            descripcion: product.descripcion,
            precio: product.precio,
            stock: product.stock,
            imagen: product.imagen
        });
        setImageFile(null); // Reseteamos la imagen nueva a subir
        setIsModalOpen(true);
    };

    // 💡 5. FUNCIÓN GUARDAR INTELIGENTE
    const handleSaveProduct = async (e) => {
        e.preventDefault();

        if (!newProduct.nombre || !newProduct.precio) {
            mostrarNotificacion("Por favor, rellena los campos obligatorios.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("nombre", newProduct.nombre);
        formData.append("precio", newProduct.precio);
        formData.append("descripcion", newProduct.descripcion);
        formData.append("stock", newProduct.stock);
        formData.append("id_comercio", storeId);

        if (imageFile) {
            formData.append("imagen", imageFile);
        } else if (!editingId) {
            mostrarNotificacion("Por favor, selecciona una imagen para el producto.", "error");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const method = editingId ? "PUT" : "POST";
            const url = editingId
                ? `${API_URL}/productos/actualizar/${editingId}`
                : `${API_URL}/productos/registrar`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                if (editingId) {
                    setProducts(products.map(p => p.id_producto === editingId ? {
                        ...p,
                        nombre: newProduct.nombre,
                        precio: newProduct.precio,
                        descripcion: newProduct.descripcion,
                        stock: newProduct.stock,
                        imagen: data.imagen || p.imagen
                    } : p));
                } else {
                    const nuevoProductoFisico = {
                        id_producto: data.id,
                        nombre: newProduct.nombre,
                        precio: newProduct.precio,
                        descripcion: newProduct.descripcion,
                        stock: newProduct.stock,
                        imagen: data.imagen,
                        id_comercio: storeId
                    };
                    setProducts([nuevoProductoFisico, ...products]);
                }

                setNewProduct({ nombre: "", precio: "", descripcion: "", stock: "", imagen: "" });
                setImageFile(null);
                setEditingId(null);
                setIsModalOpen(false);
                mostrarNotificacion(`Producto ${editingId ? 'actualizado' : 'añadido'} correctamente`, "success");

            } else {
                mostrarNotificacion(data.error || "Error al procesar el producto", "error");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            mostrarNotificacion("Error de conexión al guardar el producto.", "error");
        }
    };

    // 🆕 6. FUNCIONES DE PEDIDOS
    const handleUpdateOrderStatus = async (id_pedido, nuevoEstado) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/pedidos/${id_pedido}/estado`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (response.ok) {
                setPedidos(pedidos.map(p => p.id_pedido === id_pedido ? { ...p, estado: nuevoEstado } : p));
                mostrarNotificacion("Estado actualizado", "success");
            } else {
                mostrarNotificacion("Error al actualizar el estado", "error");
            }
        } catch (error) {
            console.error("Error:", error);
            mostrarNotificacion("Error de conexión", "error");
        }
    };

    const formatearFecha = (fechaIso) => new Date(fechaIso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
    
    const getStatusColor = (estado) => {
        if (estado === "Completado") return "text-sea_green bg-sea_green/10";
        if (estado === "Cancelado") return "text-error bg-error/10";
        return "text-yellow-600 bg-yellow-400/20"; // En proceso
    };

    // 💡 7. SEGURIDAD
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.rol !== 'dueño' || String(user.id_comercio) !== String(storeId)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-error mb-4">Acceso Denegado 🛑</h1>
                    <p>No tienes permiso para gestionar esta tienda.</p>
                    <Link href="/" className="btn mt-6">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-200"><span className="loading loading-spinner loading-lg text-jungle_teal"></span></div>;

    // 💡 8. LA INTERFAZ VISUAL
    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-8 relative">
            <div className="max-w-6xl mx-auto">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-base-content">Panel de <span className="text-jungle_teal">Gestión</span></h1>
                        <p className="text-base-content/60 font-medium">Estás editando: <span className="font-bold">{store?.nombre}</span></p>
                    </div>
                    {/* 🆕 El botón de añadir solo sale si estamos en la pestaña de productos */}
                    {activeTab === "productos" && (
                        <button className="btn bg-jungle_teal text-white border-none rounded-2xl hover:bg-teal-700" onClick={handleOpenAdd}>
                            + Añadir Producto
                        </button>
                    )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="bg-base-100 p-6 rounded-4xl shadow-xl border border-base-content/10 h-fit">
                            <img src={store?.imagen} className="w-full h-40 object-cover rounded-2xl mb-4" alt="Tienda" />
                            <h2 className="text-xl font-bold mb-2 text-base-content">{store?.nombre}</h2>
                            <span className="badge badge-outline border-jungle_teal text-jungle_teal font-bold mb-4">{store?.categoria}</span>
                            <p className="flex items-center gap-2 text-sm opacity-70 text-base-content mt-1">
                                <MapPinCheckInside size={16} className="shrink-0" />
                                {store?.direccion}
                            </p>
                        </div>
                        
                        {/* 🆕 PESTAÑAS NAVEGADORAS */}
                        <div className="bg-base-100 p-2 rounded-3xl shadow-xl border border-base-content/10 flex flex-col gap-2">
                            <button 
                                onClick={() => setActiveTab("productos")}
                                className={`btn justify-start border-none rounded-2xl ${activeTab === "productos" ? "bg-jungle_teal text-white hover:bg-jungle_teal" : "bg-transparent hover:bg-base-200 text-base-content/70"}`}
                            >
                                <PackageSearch size={18} /> Mis Productos
                            </button>
                            <button 
                                onClick={() => setActiveTab("pedidos")}
                                className={`btn justify-start border-none rounded-2xl ${activeTab === "pedidos" ? "bg-jungle_teal text-white hover:bg-jungle_teal" : "bg-transparent hover:bg-base-200 text-base-content/70"}`}
                            >
                                <ClipboardList size={18} /> Pedidos
                                {pedidos.filter(p => p.estado === "En proceso").length > 0 && (
                                    <div className="badge badge-sm badge-warning ml-auto border-none font-bold">
                                        {pedidos.filter(p => p.estado === "En proceso").length}
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-base-100 p-6 rounded-4xl shadow-xl border border-base-content/10">
                        
                        {/* ---------------- VISTA: PRODUCTOS ---------------- */}
                        {activeTab === "productos" && (
                            <>
                                <h2 className="text-2xl font-black mb-6 text-base-content">Tus Productos</h2>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr className="border-b border-base-200 text-base-content/50 uppercase text-xs">
                                                <th>Producto</th>
                                                <th>Precio</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(product => (
                                                <tr key={product.id_producto} className="hover:bg-base-200/50 transition-colors border-b border-base-200/50">
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <div className="avatar">
                                                                <div className="mask mask-squircle w-12 h-12">
                                                                    <img src={product.imagen} alt={product.nombre} className="object-cover" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-base-content">{product.nombre}</div>
                                                                <div className="text-sm opacity-50 text-base-content">{product.descripcion?.substring(0, 30)}...</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="font-bold text-jungle_teal">{Number(product.precio).toFixed(2)}€</td>
                                                    <td>
                                                        <button className="btn btn-ghost btn-xs text-info mr-2" onClick={() => handleOpenEdit(product)}>Editar</button>
                                                        <button className="btn btn-ghost btn-xs text-error" onClick={() => setProductToDelete(product)}>Eliminar</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {products.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-8 text-base-content/50">
                                                        No tienes productos todavía. ¡Añade el primero!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* ---------------- 🆕 VISTA: PEDIDOS ---------------- */}
                        {activeTab === "pedidos" && (
                            <>
                                <h2 className="text-2xl font-black mb-6 text-base-content">Pedidos de Clientes</h2>
                                <div className="flex flex-col gap-4">
                                    {pedidos.length === 0 ? (
                                        <div className="text-center py-12 text-base-content/50">
                                            Aún no has recibido ningún pedido. ¡Pronto llegará el primero!
                                        </div>
                                    ) : (
                                        pedidos.map(pedido => (
                                            <div key={pedido.id_pedido} className="bg-base-200/50 p-4 rounded-3xl border border-base-200 flex flex-col md:flex-row gap-4 justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-xs font-bold text-base-content/40 uppercase">#LM-{pedido.id_pedido}</span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${getStatusColor(pedido.estado)}`}>
                                                            {pedido.estado === "En proceso" && <Clock size={10}/>}
                                                            {pedido.estado === "Completado" && <CheckCircle2 size={10}/>}
                                                            {pedido.estado === "Cancelado" && <XCircle size={10}/>}
                                                            {pedido.estado}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-base-content">{pedido.nombre_cliente}</h3>
                                                    <p className="text-sm text-base-content/60 mb-2">{pedido.email_cliente}</p>
                                                    <p className="text-sm text-base-content/70">
                                                        <span className="font-bold">{pedido.productos.reduce((acc, p) => acc + p.cantidad, 0)} arts:</span> {pedido.productos.map(p => p.nombre).join(', ')}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col justify-between items-start md:items-end gap-3 border-t md:border-t-0 md:border-l border-base-300 pt-3 md:pt-0 md:pl-4">
                                                    <div className="text-left md:text-right">
                                                        <p className="text-xl font-black text-jungle_teal">{Number(pedido.total).toFixed(2)}€</p>
                                                        <p className="text-xs text-base-content/50">{formatearFecha(pedido.fecha)}</p>
                                                    </div>
                                                    <select 
                                                        className="select select-bordered select-sm rounded-xl bg-base-100 font-bold"
                                                        value={pedido.estado}
                                                        onChange={(e) => handleUpdateOrderStatus(pedido.id_pedido, e.target.value)}
                                                    >
                                                        <option value="En proceso">⏳ En proceso</option>
                                                        <option value="Completado">✅ Completado</option>
                                                        <option value="Cancelado">❌ Cancelado</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 💡 8. EL MODAL FLOTANTE DE PRODUCTOS */}
                {isModalOpen && (
                    <div className="modal modal-open bg-black/60 backdrop-blur-sm transition-all z-60">
                        <div className="modal-box rounded-4xl shadow-2xl bg-base-100">
                            <h3 className="font-black text-2xl mb-6 text-jungle_teal">
                                {editingId ? "Editar Producto" : "Añadir Nuevo Producto"}
                            </h3>

                            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
                                <input type="text" placeholder="Nombre del producto" required className="input input-bordered w-full bg-base-200 focus:bg-base-100 transition-colors"
                                    value={newProduct.nombre} onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                                />
                                <input type="number" placeholder="Precio" required className="input input-bordered w-full bg-base-200 focus:bg-base-100 transition-colors" step="0.01"
                                    value={newProduct.precio} onChange={(e) => setNewProduct({ ...newProduct, precio: e.target.value })}
                                />
                                <textarea placeholder="Descripción" required className="textarea textarea-bordered w-full bg-base-200 focus:bg-base-100 transition-colors h-24"
                                    value={newProduct.descripcion} onChange={(e) => setNewProduct({ ...newProduct, descripcion: e.target.value })}
                                />
                                <input type="number" placeholder="Stock" required className="input input-bordered w-full bg-base-200 focus:bg-base-100 transition-colors"
                                    value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                />

                                <input
                                    type="file"
                                    accept="image/*"
                                    required={!editingId}
                                    className="file-input file-input-bordered w-full file-input-success bg-base-200"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                />
                                {editingId && <span className="text-xs opacity-50 ml-1">Deja esto en blanco si no quieres cambiar la imagen actual.</span>}

                                <div className="modal-action mt-6">
                                    <button type="button" className="btn btn-ghost hover:bg-base-200" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn bg-jungle_teal text-white border-none hover:bg-teal-700">Guardar Producto</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* 🍞 TOAST CON Z-INDEX CORRECTO 🍞 */}
            {toast && (
                <div className="toast toast-top toast-center z-100 animate-fade-in-down mt-16 md:mt-4">
                    <div className={`alert shadow-2xl text-white font-bold rounded-2xl ${toast.tipo === 'error' ? 'alert-error' : 'bg-jungle_teal border-none'}`}>
                        {toast.tipo === 'error' ? <span>❌</span> : <span>✅</span>}
                        <span>{toast.mensaje}</span>
                    </div>
                </div>
            )}

            {/* 🚨 MODAL DE CONFIRMACIÓN DE BORRADO 🚨 */}
            {productToDelete && (
                <div className="modal modal-open bg-black/60 backdrop-blur-sm transition-all z-70">
                    <div className="modal-box rounded-4xl shadow-2xl bg-base-100 max-w-sm text-center">
                        <div className="flex justify-center mb-4 text-error">
                            {/* Icono de advertencia */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="font-black text-2xl mb-2 text-base-content">¿Estás seguro?</h3>
                        <p className="text-base-content/70 mb-6">
                            Vas a eliminar el producto <span className="font-bold text-base-content">"{productToDelete.nombre}"</span>. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button className="btn btn-ghost hover:bg-base-200" onClick={() => setProductToDelete(null)}>
                                Cancelar
                            </button>
                            <button className="btn bg-error text-white border-none hover:bg-red-700" onClick={confirmDelete}>
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};