import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRoute } from "wouter";
import { ProductCard } from "../components/product/ProductCard";
import { Heart, MapPinHouse, ShieldBan, Star } from "lucide-react";
import { ContactModal } from "../components/common/ContactModal";
import useToastStore from "../store/useToastStore";

export const ShopDetail = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const toast = useToastStore();

  const [, params] = useRoute("/tienda/:id");

  // Rescatamos el usuario con useEffect para que solo se ejecute en el navegador
  const [usuario, setUsuario] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUsuario(JSON.parse(storedUser));
  }, []);

  // 1. ESTADOS
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopInfo, setShopInfo] = useState(null);
  const [errorTienda, setErrorTienda] = useState(false);
  const [contactModalAbierto, setContactModalAbierto] = useState(false);

  // El estado para guardar la lista de IDs favoritos de este usuario
  const [favProductos, setFavProductos] = useState([]);
  const [favComercios, setFavComercios] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorTienda(false);

        // 1. Pedimos tienda y productos (para todos)
        const [resProductos, resComercio] = await Promise.all([
          fetch(`${API_URL}/productos/comercio/${params.id}`),
          fetch(`${API_URL}/comercios/${params.id}`),
        ]);

        if (!resComercio.ok) {
          setErrorTienda(true);
          return;
        }

        const dataProductos = await resProductos.json();
        const dataComercio = await resComercio.json();

        // 2. Pedimos favoritos (SOLO si hay usuario)
        if (usuario) {
          const userId = usuario.id || usuario.id_usuario;
          const resFavs = await fetch(`${API_URL}/favoritos/${userId}`);
          if (resFavs.ok) {
            const dataFavs = await resFavs.json();
            // Filtramos solo los IDs de los productos favoritos
            setFavProductos(
              dataFavs
                .filter((fav) => fav.id_producto)
                .map((fav) => fav.id_producto),
            );
            setFavComercios(
              dataFavs
                .filter((fav) => fav.id_comercio)
                .map((fav) => fav.id_comercio),
            );
          }
        }

        setShopInfo({
          name: dataComercio.nombre,
          description:
            dataComercio.descripcion ||
            "Productos de máxima calidad directos para ti.",
          address: dataComercio.direccion || "Dirección no disponible",
          rating: 4.8,
          categories: dataComercio.categoria
            ? [dataComercio.categoria]
            : ["General"],
          image: dataComercio.imagen,
          contacto: dataComercio.contacto,
          email: dataComercio.email_contacto,
        });

        const productosFormateados = dataProductos.map((p) => ({
          id: p.id_producto,
          name: p.nombre,
          price: p.precio,
          description: p.descripcion,
          img: p.imagen,
          stock: p.stock,
          id_comercio: Number(params.id),
        }));

        setProducts(productosFormateados);
      } catch (error) {
        setErrorTienda(true);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) fetchData(); // Solo intentamos cargar si tenemos un ID válido

    const recargar = () => fetchData();
    window.addEventListener("actualizarCatalogo", recargar);
    return () => window.removeEventListener("actualizarCatalogo", recargar);
  }, [params?.id]); // Volvemos a ejecutar el efecto cada vez que cambie el ID de la ruta

  // Lógica para guardar LA TIENDA en favoritos
  const handleToggleTienda = async () => {
    if (!usuario) {
      toast.warning("Inicia sesión para guardar favoritos.");
      return;
    }

    const idComercioNum = Number(params.id);
    const yaEsFavorita = favComercios.includes(idComercioNum);

    // Actualizamos el array visualmente
    if (yaEsFavorita) {
      setFavComercios(favComercios.filter((id) => id !== idComercioNum));
    } else {
      setFavComercios([...favComercios, idComercioNum]);
    }

    // Enviamos a la BD
    try {
      const res = await fetch(`${API_URL}/favoritos/toggleFavs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id || usuario.id_usuario,
          id_comercio: idComercioNum,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          data.message ||
            (yaEsFavorita
              ? "Tienda eliminada de favoritos"
              : "Tienda añadida a favoritos ⭐"),
        );
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error al guardar tienda", error);
      toast.error("Error al guardar favorito");
      // Revertir cambio visual
      if (yaEsFavorita) {
        setFavComercios((prev) => [...prev, idComercioNum]);
      } else {
        setFavComercios((prev) => prev.filter((id) => id !== idComercioNum));
      }
    }
  };

  if (errorTienda) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <h1 className="text-9xl font-black text-base-300">404</h1>
          <h2 className="text-3xl font-bold mt-4 mb-6 tracking-tighter text-base-content">
            ¡Ups! Esta tienda no existe
          </h2>
          <p className="text-base-content/60 mb-8 italic">
            "Parece que el comercio que buscas ha cerrado sus puertas o el
            enlace es incorrecto."
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="btn bg-jungle_teal text-white border-none rounded-full px-8 hover:bg-sea_green shadow-lg shadow-jungle_teal/20 transition-all"
          >
            Volver al inicio
          </button>
        </motion.div>
      </div>
    );
  }
  // 3. PINTAR EL HTML (RENDER)
  return (
    <div className="w-full min-h-screen bg-base-100 pb-20">
      {/* 1. CABECERA CON IMAGEN ÚNICA */}
      <section className="h-[70vh] w-full relative group overflow-hidden">
        <div className="relative w-full h-full">
          {/* Imagen principal del comercio */}
          {shopInfo ? (
            <img
              src={shopInfo.image}
              className="w-full h-full object-cover"
              alt={shopInfo.name}
            />
          ) : (
            // Aquí van los puntos de carga (Loading)
            <div className="flex h-full w-full items-center justify-center bg-base-200">
              <span className="loading loading-dots loading-lg text-jungle_teal"></span>
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-base-100 via-transparent to-black/20" />
        </div>
      </section>

      {/* 2. CABECERA DE INFO (Pintamos los datos solo si shopInfo ya cargó) */}
      <section className="max-w-7xl mx-auto px-6 mt-12 mb-16">
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-12 bg-base-300 rounded w-1/2"></div>
              <div className="h-4 bg-base-300 rounded w-3/4"></div>
            </div>
          </div>
        ) : (
          shopInfo && (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start">
              <div className="lg:col-span-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center gap-6 mb-8">
                    <h1 className="text-5xl md:text-7xl font-black text-base-content tracking-tighter">
                      {shopInfo.name}
                    </h1>

                    <button
                      onClick={handleToggleTienda}
                      className={`group p-4 rounded-2xl transition-all duration-500 cursor-pointer backdrop-blur-md border-2 ${
                        favComercios.includes(Number(params.id))
                          ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-lg shadow-red-500/10"
                          : "bg-base-200/50 border-transparent text-base-content/30 hover:text-red-400 hover:bg-red-50/50"
                      }`}
                      title={
                        favComercios.includes(Number(params.id))
                          ? "Quitar de favoritos"
                          : "Añadir a favoritos"
                      }
                    >
                      <Heart
                        size={32}
                        className={`transition-transform duration-300 group-active:scale-125 ${
                          favComercios.includes(Number(params.id))
                            ? "fill-current"
                            : "fill-none"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="badge badge-lg bg-jungle_teal dark:bg-jungle_teal-400 text-white border-none py-4.5 font-bold shadow-lg shadow-jungle_teal/20">
                      <MapPinHouse className="text-gray-800" />{" "}
                      {shopInfo.address}
                    </span>
                    <span className="badge badge-lg bg-yellow-600 text-jungle_teal-200 border-none py-4.5 font-bold">
                      <Star className="text-amber-400 fill-amber-400" />{" "}
                      {shopInfo.rating} Calificación
                    </span>
                  </div>

                  <p className="text-xl md:text-2xl text-base-content/70 leading-relaxed mb-8 italic max-w-4xl">
                    "{shopInfo.description}"
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {shopInfo.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-5 py-2 bg-base-200 dark:bg-base-300 rounded-xl text-xs font-black uppercase tracking-widest text-base-content/50 border border-base-300"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* HORARIO (Estático) */}
              <aside className="lg:col-span-2">
                <div className="bg-base-200/50 dark:bg-base-200/20 backdrop-blur-md p-6 rounded-[2.5rem] border border-base-300 shadow-xl">
                  <h3 className="font-black text-lg mb-4 text-jungle_teal dark:text-jungle_teal-600 uppercase tracking-tighter">
                    Horarios
                  </h3>
                  <ul className="space-y-3 text-xs font-bold">
                    <li className="flex justify-between border-b border-base-300 pb-1">
                      <span className="opacity-40">L-V</span>
                      <span>09:00 - 20:30</span>
                    </li>
                    <li className="flex justify-between border-b border-base-300 pb-1">
                      <span className="opacity-40">Sáb</span>
                      <span>10:00 - 14:30</span>
                    </li>
                    <li className="flex justify-between text-error italic">
                      <span>Dom</span>
                      <span>Cerrado</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setContactModalAbierto(true)}
                    className="w-full mt-6 py-3 bg-jungle_teal text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sea_green transition-colors"
                  >
                    Contactar
                  </button>
                </div>
              </aside>
            </div>
          )
        )}
      </section>

      {/* 3. SECCIÓN DE PRODUCTOS */}
      <section className="max-w-7xl mx-auto px-6 pt-12 border-t border-base-200">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-black text-base-content tracking-tighter">
            Catálogo de <span className="text-jungle_teal">productos</span>
          </h2>
          <div className="text-sm font-bold opacity-40 uppercase tracking-widest">
            {products.length} artículos
          </div>
        </div>

        {loading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-jungle_teal">
            <span className="loading loading-spinner loading-lg mb-4"></span>
            <p className="font-bold tracking-widest uppercase text-sm animate-pulse">
              Cargando productos...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="w-full py-20 text-center opacity-50 font-bold text-xl">
            Este comercio aún no ha subido productos <ShieldBan />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  isFavorito={favProductos.includes(product.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>
      <ContactModal
        isOpen={contactModalAbierto}
        onClose={() => setContactModalAbierto(false)}
        comercio={{
          nombre: shopInfo?.name,
          contacto: shopInfo?.contacto || null,
          email_contacto: shopInfo?.email_contacto || shopInfo?.email || null,
        }}
      />
    </div>
  );
};
