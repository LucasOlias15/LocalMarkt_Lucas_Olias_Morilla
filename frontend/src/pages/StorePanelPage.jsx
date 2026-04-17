import {
  MapPinCheckInside,
  PackageSearch,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  PackageOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import {
  REGEX_NOMBRE,
  REGEX_DESCRIPCION,
  REGEX_PRECIO,
  REGEX_STOCK
} from "../../../common/validaciones";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const imageDefault =
  "https://res.cloudinary.com/defaik2fl/image/upload/v1776084820/Gemini_Generated_Image_cswtzlcswtzlcswt_fn6vew.png";

export const StorePanelPage = () => {
  // ========================================================================
  // 1. RUTAS Y EXTRACCIÓN DE PARÁMETROS
  // ========================================================================
  const [, params] = useRoute("/panel-tienda/:id");
  const storeId = params.id;

  // ========================================================================
  // 2. ESTADOS GLOBALES DE LA PÁGINA
  // Aquí guardamos la información que el componente necesita recordar
  // ========================================================================
  const [store, setStore] = useState(null); // Info de la tienda (nombre, logo...)
  const [products, setProducts] = useState([]); // Lista de productos
  const [pedidos, setPedidos] = useState([]); // Lista de pedidos de los clientes
  const [activeTab, setActiveTab] = useState("productos"); // Pestaña actual seleccionada
  const [loading, setLoading] = useState(true); // Controla el spinner inicial
  const [toast, setToast] = useState(null); // Notificaciones flotantes

  // ========================================================================
  // 3. ESTADOS PARA MODALES Y FORMULARIOS
  // Variables temporales mientras el usuario rellena datos
  // ========================================================================

  // -- Formulario de Productos --
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    imagen: "",
  });

  // -- Borrado de Productos --
  const [productToDelete, setProductToDelete] = useState(null);

  // -- Actualización del Logo de la Tienda --
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [storeImageFile, setStoreImageFile] = useState(null);

  // ========================================================================
  // 4. FUNCIONES UTILITARIAS
  // Pequeñas herramientas compartidas
  // ========================================================================
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const formatearFecha = (fechaIso) =>
    new Date(fechaIso).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Decide de qué color pintar la etiqueta del pedido según su estado
  const getStatusColor = (estado) => {
    if (estado === "Completado") return "text-sea_green bg-sea_green/10";
    if (estado === "Cancelado") return "text-error bg-error/10";
    // Cambiamos el amarillo pálido por un naranja/ámbar fuerte con alto contraste
    return "text-yellow-500 bg-yellow-900 dark:text-yellow-400 dark:bg-yellow-900/50";
  };

  // ========================================================================
  // 5. CARGA INICIAL DE DATOS DESDE EL BACKEND (Al entrar a la página)
  // ========================================================================
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // 1. Pedimos datos de la tienda
        const resStore = await fetch(`${API_URL}/comercios/${storeId}`);
        setStore(await resStore.json());

        // 2. Pedimos catálogo de productos
        const resProducts = await fetch(
          `${API_URL}/productos/comercio/${storeId}`,
        );
        setProducts(await resProducts.json());

        // 3. Pedimos lista de pedidos
        const resPedidos = await fetch(
          `${API_URL}/pedidos/comercio/${storeId}`,
        );
        if (resPedidos.ok) {
          setPedidos(await resPedidos.json());
        }
      } catch (error) {
        console.error("Error cargando el panel:", error);
      } finally {
        setLoading(false); // Todo cargado, quitamos el spinner
      }
    };
    fetchStoreData();
  }, [storeId]);

  // ========================================================================
  // 6. LÓGICA DE NEGOCIO: PRODUCTOS
  // ========================================================================

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewProduct({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      imagen: "",
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingId(product.id_producto);
    setNewProduct({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      imagen: product.imagen,
    });
    setImageFile(null);
    setIsModalOpen(true);
  };
  // Guardar (Crear o Editar)

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    const nombre = newProduct.nombre.trim();
    const descripcion = newProduct.descripcion.trim();
    const precio = Number(newProduct.precio);
    const stock = Number(newProduct.stock);

    if (!REGEX_NOMBRE.test(nombre)) {
      return mostrarNotificacion("El nombre debe tener al menos 3 caracteres.", "error");
    }
    
    if (!REGEX_DESCRIPCION.test(descripcion)) {
      return mostrarNotificacion("Añade una descripción más detallada (min. 10 caracteres).", "error");
    }

    if (!REGEX_PRECIO.test(precio)) {
      return mostrarNotificacion("El precio debe ser un número mayor que 0.", "error");
    }

    // El stock no puede ser negativo ni tener decimales
    if (!REGEX_STOCK.test(stock)) {
      return mostrarNotificacion("El stock debe ser un número entero válido (0 o mayor).", "error");
    }

    // Si pasamos todas las validaciones, preparamos los datos

    const formData = new FormData();
    formData.append("nombre", newProduct.nombre.trim());
    formData.append("precio", Number(newProduct.precio));
    formData.append("descripcion", newProduct.descripcion.trim());
    formData.append("stock", Number(newProduct.stock));
    formData.append("id_comercio", storeId);
    
    if (imageFile) {
      // Si el usuario ha seleccionado una foto nueva, la enviamos
      formData.append("imagen", imageFile);
    } else if (!editingId) {
      // SI NO hay foto nueva Y NO estamos editando (es producto nuevo), ERROR
      return mostrarNotificacion("Debes subir una imagen para el nuevo producto.", "error");
    }
    // Si estamos editando y imageFile es null, el backend simplemente no actualizará el campo de imagen

    try {
      const token = localStorage.getItem("token");
      const url = editingId
        ? `${API_URL}/productos/actualizar/${editingId}`
        : `${API_URL}/productos/registrar`;
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        // Actualizamos la lista local para no recargar la página
        if (editingId) {
          setProducts(
            products.map((p) =>
              p.id_producto === editingId
                ? { ...p, ...newProduct, imagen: data.imagen || p.imagen }
                : p,
            ),
          );
        } else {
          setProducts([
            {
              id_producto: data.id,
              ...newProduct,
              imagen: data.imagen,
              id_comercio: storeId,
            },
            ...products,
          ]);
        }
        setIsModalOpen(false);
        mostrarNotificacion(
          `Producto ${editingId ? "actualizado" : "añadido"} correctamente`,
          "success",
        );
      } else {
        mostrarNotificacion(
          data.error || "Error al procesar el producto",
          "error",
        );
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión al guardar el producto.", "error");
    }
  };

  // Eliminar
  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/productos/${productToDelete.id_producto}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        setProducts(
          products.filter((p) => p.id_producto !== productToDelete.id_producto),
        );
        mostrarNotificacion("Producto eliminado correctamente", "success");
      } else {
        mostrarNotificacion("Error al eliminar el producto", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión al intentar eliminar", "error");
    } finally {
      setProductToDelete(null);
    }
  };

  // ========================================================================
  // 7. LÓGICA DE NEGOCIO: PEDIDOS
  // ========================================================================
  const handleUpdateOrderStatus = async (id_pedido, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/pedidos/${id_pedido}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        setPedidos(
          pedidos.map((p) =>
            p.id_pedido === id_pedido ? { ...p, estado: nuevoEstado } : p,
          ),
        );
        mostrarNotificacion("Estado actualizado", "success");
      } else {
        mostrarNotificacion("Error al actualizar el estado", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión", "error");
    }
  };

  // ========================================================================
  // 8. LÓGICA DE NEGOCIO: TIENDA
  // ========================================================================
  const handleUpdateStoreImage = async (e) => {
    e.preventDefault();
    if (!storeImageFile)
      return mostrarNotificacion("Selecciona una imagen primero.", "error");

    const formData = new FormData();
    formData.append("imagen", storeImageFile);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/comercios/${storeId}/imagen`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setStore({ ...store, imagen: data.imagenUrl });
        setIsStoreModalOpen(false);
        setStoreImageFile(null);
        mostrarNotificacion("¡Imagen de la tienda actualizada!", "success");
      } else {
        mostrarNotificacion(
          data.error || "Error al actualizar la imagen",
          "error",
        );
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión con el servidor", "error");
    }
  };

  // ========================================================================
  // 9. PROTECCIÓN DE RUTA (SEGURIDAD FRONTEND)
  // Evita que alguien sin permisos vea el panel
  // ========================================================================
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.rol !== "dueño" || String(user.id_comercio) !== String(storeId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <h1 className="text-4xl font-black text-error mb-4">
            Acceso Denegado
          </h1>
          <p>No tienes permiso para gestionar esta tienda.</p>
          <Link href="/" className="btn mt-6">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-jungle_teal"></span>
      </div>
    );

  const necesitaFoto = !store?.imagen || store?.imagen === imageDefault;

  // ========================================================================
  // 10. RENDERIZADO VISUAL (EL HTML/JSX)
  // ========================================================================
  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto">
        {/* -- CABECERA -- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-base-content">
              Panel de <span className="text-jungle_teal">Gestión</span>
            </h1>
            <p className="text-base-content/60 font-medium">
              Estás editando: <span className="font-bold">{store?.nombre}</span>
            </p>
          </div>
          {activeTab === "productos" && (
            <button
              className="btn bg-jungle_teal text-white border-none rounded-2xl hover:bg-teal-700 shadow-sm"
              onClick={handleOpenAdd}
            >
              + Añadir Producto
            </button>
          )}
        </header>

        {/* -- AVISO FOTO POR DEFECTO -- */}
        {necesitaFoto && (
          <div className="alert bg-emerald-200 border-yellow-200 text-green-900 shadow-sm mb-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center">
            <Info className="stroke-current shrink-0 w-6 h-6 text-green-900"></Info>
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                ¡Haz que tu escaparate destaque!
              </h3>
              <div className="text-sm opacity-80">
                Sube el logo o una foto de tu local para atraer más clientes.
              </div>
            </div>
            <button
              className="btn btn-sm bg-green-900 text-white border-none hover:bg-green-600 rounded-xl mt-3 sm:mt-0"
              onClick={() => setIsStoreModalOpen(true)}
            >
              Actualizar perfil
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ================= BARRA LATERAL IZQUIERDA ================= */}
          <div className="flex flex-col gap-4">
            {/* Info Tienda */}
            <div className="bg-base-100 p-6 rounded-4xl shadow-sm border border-base-content/10 h-fit">
              <img
                src={store?.imagen}
                className="w-full h-40 object-cover rounded-2xl mb-4 shadow-inner"
                alt="Tienda"
              />
              <h2 className="text-xl font-bold mb-2 text-base-content">
                {store?.nombre}
              </h2>
              <span className="badge badge-outline border-jungle_teal text-jungle_teal font-bold mb-4">
                {store?.categoria}
              </span>
              <p className="flex items-center gap-2 text-sm opacity-70 text-base-content mt-1">
                <MapPinCheckInside size={16} className="shrink-0" />
                {store?.direccion}
              </p>
            </div>

            {/* Menú de Pestañas */}
            <div className="bg-base-100 p-2 rounded-3xl shadow-sm border border-base-content/10 flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("productos")}
                className={`btn justify-start border-none rounded-2xl ${activeTab === "productos" ? "bg-jungle_teal text-white shadow-md" : "bg-transparent hover:bg-base-200 text-base-content/70"}`}
              >
                <PackageSearch size={18} /> Mis Productos
              </button>
              <button
                onClick={() => setActiveTab("pedidos")}
                className={`btn justify-start border-none rounded-2xl ${activeTab === "pedidos" ? "bg-jungle_teal text-white shadow-md" : "bg-transparent hover:bg-base-200 text-base-content/70"}`}
              >
                <ClipboardList size={18} /> Pedidos
                {pedidos.filter((p) => p.estado === "En proceso").length >
                  0 && (
                  <div className="badge badge-sm badge-warning ml-auto border-none font-bold">
                    {pedidos.filter((p) => p.estado === "En proceso").length}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* ================= ÁREA PRINCIPAL (DERECHA) ================= */}
          <div className="lg:col-span-2 bg-base-100 p-6 rounded-4xl shadow-sm border border-base-content/10">
            {/* --- CONTENIDO: PRODUCTOS --- */}
            {activeTab === "productos" && (
              <>
                <h2 className="text-2xl font-black mb-6 text-base-content">
                  Tus Productos
                </h2>
                {products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-base-200/30 rounded-3xl border-2 border-dashed border-base-content/20">
                    <PackageOpen className="w-24 h-24 text-base-content/50 mb-4 stroke-[1.5]" />
                    <h3 className="text-2xl font-black text-base-content mb-2">
                      Tu escaparate está vacío
                    </h3>
                    <p className="text-base-content/60 max-w-md mx-auto mb-8">
                      Aún no has subido ningún artículo. ¡Empieza a mostrar lo
                      que ofreces!
                    </p>
                    <button
                      className="btn bg-jungle_teal text-white border-none rounded-2xl hover:bg-teal-700 shadow-md"
                      onClick={handleOpenAdd}
                    >
                      + Añadir mi primer producto
                    </button>
                  </div>
                ) : (
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
                        {products.map((product) => (
                          <tr
                            key={product.id_producto}
                            className="hover:bg-base-200/50 transition-colors border-b border-base-200/50"
                          >
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                  <img
                                    src={product.imagen}
                                    alt={product.nombre}
                                    className={`w-full h-full object-cover transition-all duration-300 ${product.stock <= 0 ? 'grayscale opacity-40' : ''}`}
                                  />
                                </div>
                                <div>
                                  <div className="font-bold text-base-content flex items-center gap-2">
                                    {product.nombre}
                                    {/* ✨ ALERTA VISUAL DE STOCK PARA EL DUEÑO ✨ */}
                                    {product.stock <= 0 ? (
                                      <span className="badge badge-error badge-sm text-white font-black ">
                                        Sin stock
                                      </span>
                                    ) : (
                                      <span className="badge badge-ghost badge-sm text-base-content/60">
                                        Stock: {product.stock}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm opacity-50 text-base-content line-clamp-1 max-w-50">
                                    {product.descripcion}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="font-black text-jungle_teal">
                              {Number(product.precio).toFixed(2)}€
                            </td>
                            <td>
                              <button
                                className="btn btn-ghost btn-xs text-info mr-2"
                                onClick={() => handleOpenEdit(product)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => setProductToDelete(product)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* --- CONTENIDO: PEDIDOS --- */}
            {activeTab === "pedidos" && (
              <>
                <h2 className="text-2xl font-black mb-6 text-base-content">
                  Pedidos de Clientes
                </h2>
                <div className="flex flex-col gap-4">
                  {pedidos.length === 0 ? (
                    <div className="text-center py-16 text-base-content/50 italic bg-base-200/30 rounded-3xl border border-base-200">
                      Aún no has recibido ningún pedido. ¡Pronto llegará el
                      primero!
                    </div>
                  ) : (
                    pedidos.map((pedido) => (
                      <div
                        key={pedido.id_pedido}
                        // ✨ AQUI ESTÁ LA MAGIA DE DISEÑO DE LOS PEDIDOS ✨
                        className="bg-base-100 p-5 rounded-3xl border-2 border-base-200 hover:border-jungle_teal/40 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-4 justify-between group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-black text-base-content/40 uppercase tracking-wider">
                              #LM-{pedido.id_pedido}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider ${getStatusColor(pedido.estado)}`}
                            >
                              {pedido.estado === "En proceso" && (
                                <Clock size={12} />
                              )}
                              {pedido.estado === "Completado" && (
                                <CheckCircle2 size={12} />
                              )}
                              {pedido.estado === "Cancelado" && (
                                <XCircle size={12} />
                              )}
                              {pedido.estado}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-base-content leading-tight">
                            {pedido.nombre_cliente}
                          </h3>
                          <p className="text-sm text-base-content/50 mb-3 font-medium">
                            {pedido.email_cliente}
                          </p>
                          <p className="text-sm text-base-content/70 bg-base-200/50 p-2 rounded-xl border border-base-200">
                            <span className="font-bold text-jungle_teal">
                              {pedido.productos.reduce(
                                (acc, p) => acc + p.cantidad,
                                0,
                              )}{" "}
                              arts:
                            </span>{" "}
                            {pedido.productos.map((p) => p.nombre).join(", ")}
                          </p>
                        </div>

                        <div className="flex flex-col justify-between items-start md:items-end gap-4 border-t md:border-t-0 md:border-l border-base-200 pt-4 md:pt-0 md:pl-5">
                          <div className="text-left md:text-right w-full">
                            <p className="text-2xl font-black text-base-content">
                              {Number(pedido.total).toFixed(2)}€
                            </p>
                            <p className="text-xs text-base-content/40 font-medium">
                              {formatearFecha(pedido.fecha)}
                            </p>
                          </div>
                          <select
                            className="select select-bordered select-sm rounded-xl bg-base-200 hover:bg-base-300 focus:bg-base-100 font-bold w-full md:w-auto transition-colors border-none shadow-inner"
                            value={pedido.estado}
                            onChange={(e) =>
                              handleUpdateOrderStatus(
                                pedido.id_pedido,
                                e.target.value,
                              )
                            }
                          >
                            <option value="En proceso">En proceso</option>
                            <option value="Completado">Completado</option>
                            <option value="Cancelado">Cancelado</option>
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

        {/* ========================================================================
            11. ZONA DE MODALES Y NOTIFICACIONES (INVISIBLES HASTA QUE SE ACTIVAN)
            ======================================================================== */}

        {/* Modal: Editar/Añadir Producto */}
        {isModalOpen && (
          <div className="modal modal-open bg-black/40 backdrop-blur-sm transition-all z-60">
            <div className="modal-box rounded-4xl shadow-2xl bg-base-100 border border-base-200">
              <h3 className="font-black text-2xl mb-6 text-base-content">
                {editingId ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <form
                onSubmit={handleSaveProduct}
                className="flex flex-col gap-4"
              >
                <input
                  type="text"
                  placeholder="Nombre"
                  required
                  className="input input-bordered w-full bg-base-200"
                  value={newProduct.nombre}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, nombre: e.target.value })
                  }
                />
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Precio (€)"
                    required
                    min="0.01" 
                    step="0.01" 
                    className="input input-bordered w-full bg-base-200"
                    value={newProduct.precio}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, precio: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Stock ud."
                    required
                    min="0" 
                    step="1" 
                    className="input input-bordered w-full bg-base-200"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                  />
                </div>
                <textarea
                  placeholder="Descripción del artículo..."
                  required
                  className="textarea textarea-bordered w-full bg-base-200 h-24"
                  value={newProduct.descripcion}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      descripcion: e.target.value,
                    })
                  }
                />
                 {editingId && (
                  <span className="text-xs opacity-50 ml-1">
                    Déjalo en blanco para mantener la imagen actual.
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  required={!editingId}
                  className="file-input file-input-bordered w-full bg-jungle_teal"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
               
                <div className="modal-action mt-6">
                  <button
                    type="button"
                    className="btn btn-ghost rounded-2xl"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn bg-jungle_teal text-white border-none rounded-2xl hover:bg-teal-700 shadow-md"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirmar Borrado */}
        {productToDelete && (
          <div className="modal modal-open bg-black/40 backdrop-blur-sm transition-all z-70">
            <div className="modal-box rounded-4xl shadow-2xl bg-base-100 max-w-sm text-center border border-base-200">
              <div className="flex justify-center mb-4 text-error">
                <XCircle className="w-16 h-16" />
              </div>
              <h3 className="font-black text-2xl mb-2 text-base-content">
                ¿Estás seguro?
              </h3>
              <p className="text-base-content/70 mb-6">
                Vas a eliminar{" "}
                <span className="font-bold">"{productToDelete.nombre}"</span> de
                tu catálogo de forma permanente.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="btn btn-ghost rounded-2xl"
                  onClick={() => setProductToDelete(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn bg-error text-white border-none rounded-2xl shadow-md"
                  onClick={confirmDelete}
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Actualizar Tienda */}
        {isStoreModalOpen && (
          <div className="modal modal-open bg-black/40 backdrop-blur-sm transition-all z-60">
            <div className="modal-box rounded-4xl shadow-2xl bg-base-100 border border-base-200">
              <h3 className="font-black text-2xl mb-6 text-base-content">
                Foto de Portada
              </h3>
              <form
                onSubmit={handleUpdateStoreImage}
                className="flex flex-col gap-4"
              >
                <p className="text-sm text-base-content/70">
                  Sube un archivo nuevo para el escaparate de{" "}
                  <strong>{store?.nombre}</strong>.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  required
                  className="file-input file-input-bordered w-full bg-base-200"
                  onChange={(e) => setStoreImageFile(e.target.files[0])}
                />
                <div className="modal-action mt-6">
                  <button
                    type="button"
                    className="btn btn-ghost rounded-2xl"
                    onClick={() => {
                      setIsStoreModalOpen(false);
                      setStoreImageFile(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn bg-jungle_teal text-white border-none rounded-2xl shadow-md"
                  >
                    Subir foto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notificaciones */}
        {toast && (
          <div className="toast toast-top toast-center z-9999 mt-24 animate-fade-in-down">
            <div
              className={`alert shadow-2xl font-bold rounded-2xl text-white border-none pr-6 ${
                toast.tipo === "error" ? "bg-error" : "bg-jungle_teal"
              }`}
            >
              {toast.tipo === "error" ? (
                <XCircle size={22} />
              ) : (
                <CheckCircle2 size={22} />
              )}
              <span>{toast.mensaje}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
