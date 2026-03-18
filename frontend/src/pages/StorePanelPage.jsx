import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";

// TODO: CLOUDINARY - Cambiar el envío de datos a FormData.
// Como ahora enviamos una imagen (archivo físico) al backend, 
// NO podemos usar JSON.stringify(). Tenemos que crear un objeto FormData:
// const formData = new FormData();
// formData.append("nombre", nombre);
// formData.append("precio", precio);
// formData.append("imagen", archivoImagen);
// Y en el fetch, quitar el 'Content-Type': 'application/json' de los headers.

export const StorePanelPage = () => {
    // 💡 1. RUTAS Y ESTADOS (La "memoria" de la página)
    const [, params] = useRoute("/panel-tienda/:id");
    const storeId = params.id;

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para controlar el modal y el formulario de añadir/editar producto
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        nombre: "", descripcion: "", precio: "", stock: "", imagen: ""
    });
    
    // Si es null, estamos creando. Si tiene un número, estamos editando.
    const [editingId, setEditingId] = useState(null); 

    // 💡 2. CARGA INICIAL DE DATOS (Se ejecuta al abrir la página)
    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const resStore = await fetch(`http://localhost:3000/api/comercios/${storeId}`);
                const storeData = await resStore.json();
                setStore(storeData);

                const resProducts = await fetch(`http://localhost:3000/api/productos/comercio/${storeId}`);
                const productsData = await resProducts.json();
                setProducts(productsData);
            } catch (error) {
                console.error("Error cargando el panel:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [storeId]);

    // 💡 3. FUNCIÓN ELIMINAR (Borra en backend y actualiza frontend)
    const handleDeleteProduct = async (productId) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/api/productos/${productId}`, {
                method: "DELETE",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
            });

            if (res.ok) {
                setProducts(products.filter(p => p.id_producto !== productId));
                alert("Producto eliminado correctamente");
            } else {
                alert("Error al eliminar el producto");
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }
    };

    // 💡 4. ABRIR MODALES (Preparar el estado antes de abrir)
    const handleOpenAdd = () => {
        setEditingId(null); // Aseguramos que es un producto nuevo
        setNewProduct({ nombre: "", descripcion: "", precio: "", stock: "", imagen: "" }); // Vaciamos
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product) => {
        setEditingId(product.id_producto); // Guardamos qué producto estamos editando
        // Rellenamos el formulario con los datos actuales
        setNewProduct({
            nombre: product.nombre,
            descripcion: product.descripcion,
            precio: product.precio,
            stock: product.stock,
            imagen: product.imagen
        });
        setIsModalOpen(true);
    };

    // 💡 5. FUNCIÓN GUARDAR INTELIGENTE (Sirve para Añadir y Editar)
    const handleSaveProduct = async (e) => {
        e.preventDefault(); 
        
        try {
            const token = localStorage.getItem("token");
            const isEditing = editingId !== null;
            
            // Decidimos la ruta y el método
            const url = isEditing 
                ? `http://localhost:3000/api/productos/${editingId}`
                : "http://localhost:3000/api/productos";
            const method = isEditing ? "PUT" : "POST";

            // El backend necesita el id_comercio solo al crear, pero enviarlo siempre no suele hacer daño
            const bodyData = { ...newProduct, id_comercio: storeId };

            const res = await fetch(url, {
                method: method,
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(bodyData)
            });

            if (res.ok) {
                if (isEditing) {
                    // Si es edición, actualizamos ese producto específico en el array
                    setProducts(products.map(p => p.id_producto === editingId ? { ...p, ...newProduct } : p));
                } else {
                    // Si es nuevo, lo añadimos al final del array
                    const data = await res.json();
                    setProducts([...products, { ...newProduct, id_producto: data.id }]);
                }
                
                // Limpiamos y cerramos
                setNewProduct({ nombre: "", descripcion: "", precio: "", stock: "", imagen: "" });
                setEditingId(null);
                setIsModalOpen(false);
            } else {
                alert("Hubo un error al guardar.");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    // 💡 6. SEGURIDAD (El "portero" de la página)
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

    if (loading) return <div className="p-20 text-center"><span className="loading loading-ghost loading-lg"></span></div>;

    // 💡 7. LA INTERFAZ VISUAL
    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-8 relative">
            <div className="max-w-6xl mx-auto">
                
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-base-content">Panel de <span className="text-jungle_teal">Gestión</span></h1>
                        <p className="text-base-content/60 font-medium">Estás editando: <span className="font-bold">{store?.nombre}</span></p>
                    </div>
                    {/* Botón modificado para usar handleOpenAdd */}
                    <button className="btn bg-jungle_teal text-white border-none rounded-2xl" onClick={handleOpenAdd}>
                        + Añadir Producto
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-base-100 p-6 rounded-4xl shadow-xl border border-base-300 h-fit">
                        <img src={store?.imagen} className="w-full h-40 object-cover rounded-2xl mb-4" alt="Tienda" />
                        <h2 className="text-xl font-bold mb-2">{store?.nombre}</h2>
                        <span className="badge badge-outline border-jungle_teal text-jungle_teal font-bold mb-4">{store?.categoria}</span>
                        <p className="text-sm opacity-70">📍 {store?.direccion}</p>
                    </div>

                    <div className="lg:col-span-2 bg-base-100 p-6 rounded-4xl shadow-xl border border-base-300">
                        <h2 className="text-2xl font-black mb-6">Tus Productos</h2>
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
                                        <tr key={product.id_producto} className="hover:bg-base-200/50 transition-colors">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle w-12 h-12">
                                                            <img src={product.imagen} alt={product.nombre} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{product.nombre}</div>
                                                        <div className="text-sm opacity-50">{product.descripcion?.substring(0, 30)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-bold text-jungle_teal">{product.precio}€</td>
                                            <td>
                                                {/* Botón modificado para usar handleOpenEdit */}
                                                <button className="btn btn-ghost btn-xs text-info" onClick={() => handleOpenEdit(product)}>Editar</button>
                                                <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDeleteProduct(product.id_producto)}>Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 💡 8. EL MODAL FLOTANTE (Con título y form dinámicos) */}
                {isModalOpen && (
                    <div className="modal modal-open bg-black/10 backdrop-blur-md transition-all">
                        <div className="modal-box rounded-4xl shadow-2xl">
                            {/* El título cambia si estamos editando o creando */}
                            <h3 className="font-black text-2xl mb-6 text-jungle_teal">
                                {editingId ? "Editar Producto" : "Añadir Nuevo Producto"}
                            </h3>
                            
                            {/* Usamos handleSaveProduct que decide si hacer POST o PUT */}
                            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
                                <input type="text" placeholder="Nombre del producto" required className="input input-bordered w-full" 
                                    value={newProduct.nombre} onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value })}
                                />
                                <input type="number" placeholder="Precio" required className="input input-bordered w-full" 
                                    value={newProduct.precio} onChange={(e) => setNewProduct({ ...newProduct, precio: Number(e.target.value) })}
                                />
                                <input type="text" placeholder="Descripción" required className="input input-bordered w-full" 
                                    value={newProduct.descripcion} onChange={(e) => setNewProduct({ ...newProduct, descripcion: e.target.value })}
                                />
                                <input type="number" placeholder="Stock" required className="input input-bordered w-full" 
                                    value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                                />
                                <input type="text" placeholder="URL de la imagen" required className="input input-bordered w-full"
                                    value={newProduct.imagen} onChange={(e) => setNewProduct({ ...newProduct, imagen: e.target.value })}
                                />
                                
                                <div className="modal-action mt-6">
                                    <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn bg-jungle_teal text-white border-none">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};  