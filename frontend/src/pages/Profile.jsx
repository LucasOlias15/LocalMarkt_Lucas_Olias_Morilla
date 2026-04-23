import {
  UserRoundKey,
  UserRoundCog,
  Heart,
  Store,
  ShoppingBasket,
  ExternalLink,
  ArrowRight,
  Settings,
  Lock,
  Tags,
  NotebookPen,
  Star,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LocationPicker } from "../components/LocationPicker";
import useToastStore from "../store/useToastStore";

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [, setLocation] = useLocation();

  const toast = useToastStore();

  // ========================================================================
  // 1. ESTADOS DE LOS DESPLEGABLES
  // ========================================================================
  const [showSettings, setShowSettings] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showValoraciones, setShowValoraciones] = useState(false);

  // ========================================================================
  // 2. ESTADOS PARA FAVORITOS
  // ========================================================================
  const [favShops, setFavShops] = useState([]);
  const [favProducts, setFavProducts] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  // ========================================================================
  // 3. ESTADOS PARA VALORACIONES
  // ========================================================================
  const [valoraciones, setValoraciones] = useState([]);
  const [loadingValoraciones, setLoadingValoraciones] = useState(false);
  const [promedioValoraciones, setPromedioValoraciones] = useState({
    promedio: "0.0",
    total: 0,
  });

  // ========================================================================
  // 4. ESTADOS PARA COMERCIO (dueño)
  // ========================================================================
  const [comercio, setComercio] = useState(null);
  const [loadingComercio, setLoadingComercio] = useState(false);
  const [shopFormData, setShopFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    contacto: "",
    direccion: "",
    latitud: "",
    longitud: "",
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const fileInputRef = useRef(null);

  // ========================================================================
  // 5. ESTADOS PARA AJUSTES DE CUENTA
  // ========================================================================
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    claveActual: "",
    nuevaClave: "",
  });

  // ========================================================================
  // 6. EFECTOS (carga inicial de datos)
  // ========================================================================

  // Efecto para cargar usuario del localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  // Cuando el usuario cargue, rellenamos el formulario de cuenta con sus datos
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        claveActual: "",
        nuevaClave: "",
      });
    }
  }, [user]);

  // Efecto para cargar el comercio si el usuario es dueño
  useEffect(() => {
    const fetchComercio = async () => {
      if (!user || user.rol !== "dueño") return;

      setLoadingComercio(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:3000/api/comercios/mi-comercio",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setComercio(data);
          setShopFormData({
            nombre: data.nombre || "",
            descripcion: data.descripcion || "",
            categoria: data.categoria || "",
            contacto: data.contacto || "",
            direccion: data.direccion || "",
            latitud: data.latitud || "",
            longitud: data.longitud || "",
          });
          setImagenPreview(data.imagen || null);

          // Sincronizar id_comercio en el objeto user de localStorage
          const storedUser = JSON.parse(localStorage.getItem("user"));
          if (storedUser && storedUser.id_comercio !== data.id_comercio) {
            const updatedUser = {
              ...storedUser,
              id_comercio: data.id_comercio,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        } else if (res.status === 404) {
          setComercio(null);
        } else {
          console.error("Error al obtener comercio");
        }
      } catch (error) {
        console.error("Error de red al obtener comercio:", error);
      } finally {
        setLoadingComercio(false);
      }
    };

    fetchComercio();
  }, [user]);

  // Efecto para cargar los favoritos SOLO cuando se abre la pestaña
  useEffect(() => {
    const fetchFavoritesData = async () => {
      if (!user || !showFavorites) return;

      setLoadingFavs(true);
      try {
        const [resShops, resProducts, resFavs] = await Promise.all([
          fetch("http://localhost:3000/api/comercios"),
          fetch("http://localhost:3000/api/productos/explorar"),
          fetch(
            `http://localhost:3000/api/favoritos/${user.id || user.id_usuario}`,
          ),
        ]);

        const dataShops = await resShops.json();
        const dataProducts = await resProducts.json();
        const dataFavs = resFavs.ok ? await resFavs.json() : [];

        const favsSeguros = Array.isArray(dataFavs) ? dataFavs : [];
        const idsProductosFavs = favsSeguros
          .filter((f) => f.id_producto)
          .map((f) => f.id_producto);
        const idsComerciosFavs = favsSeguros
          .filter((f) => f.id_comercio)
          .map((f) => f.id_comercio);

        setFavShops(
          Array.isArray(dataShops)
            ? dataShops.filter((shop) =>
                idsComerciosFavs.includes(shop.id_comercio),
              )
            : [],
        );
        setFavProducts(
          Array.isArray(dataProducts)
            ? dataProducts.filter((prod) =>
                idsProductosFavs.includes(prod.id_producto),
              )
            : [],
        );
      } catch (error) {
        console.error("Error cargando favoritos:", error);
      } finally {
        setLoadingFavs(false);
      }
    };

    fetchFavoritesData();
  }, [showFavorites, user]);

  // ========================================================================
  // 7. FUNCIONES PARA CARGAR VALORACIONES
  // ========================================================================

  const fetchValoracionesDueño = async () => {
    if (!comercio) return;

    setLoadingValoraciones(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/api/valoraciones/comercio/${comercio.id_comercio}/todas`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setValoraciones(data.valoraciones || []);
        setPromedioValoraciones({
          promedio: data.promedio,
          total: data.total,
        });
      }
    } catch (error) {
      console.error("Error cargando valoraciones:", error);
    } finally {
      setLoadingValoraciones(false);
    }
  };

  const fetchValoracionesCliente = async () => {
    if (!user) return;

    setLoadingValoraciones(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/valoraciones/mis-valoraciones/${user.id || user.id_usuario}`,
      );
      if (res.ok) {
        const data = await res.json();
        setValoraciones(data || []);
      }
    } catch (error) {
      console.error("Error cargando mis valoraciones:", error);
    } finally {
      setLoadingValoraciones(false);
    }
  };

  // ========================================================================
  // 8. HANDLERS PARA AJUSTES DE CUENTA
  // ========================================================================

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.claveActual) {
      toast.warning(
        "Debes introducir tu contraseña actual para guardar los cambios.",
      );
      return;
    }
    const updatedData = {
      nombre: formData.nombre,
      email: formData.email,
      clave: formData.claveActual,
      ...(formData.nuevaClave && { nuevaClave: formData.nuevaClave }),
    };
    try {
      const response = await fetch(`http://localhost:3000/api/users/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("¡Perfil actualizado con éxito!");
        setFormData((prev) => ({ ...prev, claveActual: "", nuevaClave: "" }));
        setShowSettings(false);
      } else {
        toast.error(data.error || "No se pudo actualizar el perfil");
      }
    } catch (error) {
      console.error("Error de red:", error);
      toast.error("No se pudo conectar con el servidor");
    }
  };

  // ========================================================================
  // 9. HANDLERS PARA FORMULARIO DE COMERCIO
  // ========================================================================

  const handleLocationSelect = (coords) => {
    setShopFormData((prev) => ({
      ...prev,
      latitud: coords.lat.toString(),
      longitud: coords.lng.toString(),
    }));
  };

  const handleShopInputChange = (e) => {
    setShopFormData({
      ...shopFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    if (!comercio) return;

    try {
      const token = localStorage.getItem("token");
      // 1. Actualizar datos textuales
      const res = await fetch(
        `http://localhost:3000/api/comercios/${comercio.id_comercio}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(shopFormData),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al actualizar el comercio");
      }

      // 2. Si hay una nueva imagen, subirla
      if (imagenFile) {
        const formDataImg = new FormData();
        formDataImg.append("imagen", imagenFile);
        const imgRes = await fetch(
          `http://localhost:3000/api/comercios/${comercio.id_comercio}/imagen`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formDataImg,
          },
        );
        if (!imgRes.ok) {
          const errorData = await imgRes.json();
          throw new Error(errorData.error || "Error al subir la imagen");
        }
        const imgData = await imgRes.json();
        setImagenPreview(imgData.imagenUrl);
      }

      toast.success("¡Comercio actualizado con éxito!");
      // Actualizar el objeto comercio local
      setComercio({
        ...comercio,
        ...shopFormData,
        imagen: imagenPreview,
      });
      setImagenFile(null);
      setShowShopForm(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error al actualizar el comercio");
    }
  };

  // ========================================================================
  // 10. HANDLER DE LOGOUT
  // ========================================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocation("/login");
  };

  if (!user) return null;

  // ========================================================================
  // 11. RENDERIZADO VISUAL
  // ========================================================================
  return (
    <div className="min-h-screen bg-base-100 py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ===== CABECERA DEL PERFIL ===== */}
        <section className="bg-base-200 rounded-[3rem] p-8 md:p-12 shadow-sm border border-base-300 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-sea_green/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="avatar z-10">
            <div className="w-32 h-32 rounded-[2.5rem] p-1.5 bg-linear-to-tr from-jungle_teal to-bright_fern shadow-xl">
              <div className="w-full h-full rounded-[2.2rem] bg-base-100 flex items-center justify-center text-jungle_teal">
                {user.rol === "dueño" ? (
                  <UserRoundKey className="w-12 h-12" />
                ) : (
                  <UserRoundCog className="w-12 h-12" />
                )}
              </div>
            </div>
          </div>

          <div className="z-10 text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-black text-base-content tracking-tight mb-2">
              {user.nombre}
            </h1>
            <p className="text-lg text-base-content/60 font-medium mb-5">
              {user.email}
            </p>
            <span
              className={`badge badge-lg border-none py-4 px-5 font-bold shadow-sm inline-flex items-center gap-2 ${
                user.rol === "dueño"
                  ? "bg-jungle_teal text-white"
                  : "bg-bright_fern text-white"
              }`}
            >
              {user.rol === "dueño" ? (
                <>
                  <Store className="w-4 h-4" /> DUEÑO DE COMERCIO
                </>
              ) : (
                <>
                  <UserRoundCog className="w-4 h-4" /> CLIENTE LOCAL
                </>
              )}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="z-10 btn btn-circle btn-ghost text-base-content/40 hover:bg-error/10 hover:text-error transition-colors md:self-start"
            title="Cerrar sesión"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </section>

        {/* ===== BENTO GRID ===== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ------------------------------------------------------------------
              VISTA PARA DUEÑO
              ------------------------------------------------------------------ */}
          {user.rol === "dueño" ? (
            <>
              {/* BLOQUE DUEÑO 1: Panel de Tienda */}
              <div className="md:col-span-1 bg-base-100 rounded-[2.5rem] p-8 shadow-sm border border-base-300 hover:shadow-md hover:border-jungle_teal/30 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-2xl font-black mb-2 text-base-content group-hover:text-jungle_teal transition-colors">
                    Panel Tienda
                  </h2>
                  <p className="text-base-content/60 max-w-sm">
                    Gestiona inventario, pedidos y más.
                  </p>
                </div>
                <div className="mt-8 flex justify-end relative z-10">
                  <Link
                    href={
                      comercio ? `/panel-tienda/${comercio.id_comercio}` : "#"
                    }
                  >
                    <span className="text-sm font-bold text-jungle_teal uppercase tracking-widest bg-jungle_teal/10 px-5 py-3 rounded-2xl group-hover:bg-jungle_teal group-hover:text-white transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2">
                      {comercio ? "Ir al panel" : "Sin comercio"}{" "}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* BLOQUE DUEÑO 2: Valoraciones Recibidas */}
              <div
                onClick={() => {
                  setShowValoraciones(!showValoraciones);
                  if (!showValoraciones) {
                    fetchValoracionesDueño();
                    setShowFavorites(false);
                    setShowSettings(false);
                  }
                }}
                className={`md:col-span-1 rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-center relative overflow-hidden ${
                  showValoraciones
                    ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20 scale-[0.97]"
                    : "bg-amber-600 text-white hover:bg-amber-500 hover:-translate-y-1"
                }`}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <span className="text-4xl mb-3 block">
                    <Star className="w-12 h-12 mb-3" />
                  </span>
                  <h2 className="font-black opacity-90 uppercase tracking-wider text-sm mb-1">
                    Valoraciones
                  </h2>
                  <p className="text-white/80 text-sm font-medium">
                    {promedioValoraciones.total} recibidas
                  </p>
                  {promedioValoraciones.total >= 5 && (
                    <p className="text-2xl font-black mt-2">
                      {promedioValoraciones.promedio} ★
                    </p>
                  )}
                </div>
              </div>

              {/* BLOQUE DUEÑO 3: Favoritos */}
              <div
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  if (!showFavorites) {
                    setShowValoraciones(false);
                    setShowSettings(false);
                  }
                }}
                className={`md:col-span-1 rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-center relative overflow-hidden ${
                  showFavorites
                    ? "bg-red-500 text-white shadow-xl shadow-red-500/20 scale-[0.97]"
                    : "bg-jungle_teal text-white hover:bg-sea_green hover:-translate-y-1"
                }`}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <Heart
                    className={`w-12 h-12 mb-3 transition-all duration-500 ${
                      showFavorites
                        ? "fill-white drop-shadow-md scale-110"
                        : "fill-white/20"
                    }`}
                  />
                  <h2 className="font-black opacity-90 uppercase tracking-wider text-sm mb-1">
                    Tus Favoritos
                  </h2>
                  <p className="text-white/80 text-sm font-medium">
                    Ver guardados
                  </p>
                </div>
              </div>

              {/* DESPLEGABLE DE FAVORITOS (DUEÑO) */}
              <AnimatePresence>
                {showFavorites && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                    className="md:col-span-3 overflow-hidden origin-top relative z-30"
                  >
                    <div className="bg-base-200 rounded-[2.5rem] p-8 border border-base-300 shadow-inner">
                      {loadingFavs ? (
                        <div className="flex justify-center py-12">
                          <span className="loading loading-spinner loading-lg text-red-500"></span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Tiendas favoritas */}
                          <div>
                            <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-base-content">
                              <Store className="w-6 h-6 text-red-500" /> Tiendas
                              Favoritas
                              <span className="badge badge-sm bg-red-100 text-red-600 border-none font-bold">
                                {favShops.length}
                              </span>
                            </h3>
                            {favShops.length === 0 ? (
                              <p className="text-sm text-base-content/40 italic bg-base-100 p-6 rounded-3xl border border-base-200 text-center">
                                No has guardado ninguna tienda aún.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {favShops.map((shop) => (
                                  <Link
                                    key={shop.id_comercio}
                                    href={`/tienda/${shop.id_comercio}`}
                                  >
                                    <div className="flex items-center gap-4 bg-base-100 p-3 rounded-2xl border border-base-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group">
                                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                                        <img
                                          src={shop.imagen}
                                          alt={shop.nombre}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-bold text-base-content">
                                          {shop.nombre}
                                        </h4>
                                        <p className="text-xs text-base-content/50">
                                          {shop.categoria}
                                        </p>
                                      </div>
                                      <ExternalLink className="w-5 h-5 text-base-content/20 group-hover:text-red-500 transition-colors mr-3" />
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Productos favoritos */}
                          <div>
                            <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-base-content">
                              <ShoppingBasket className="w-6 h-6 text-red-500" />{" "}
                              Productos Favoritos
                              <span className="badge badge-sm bg-red-100 text-red-600 border-none font-bold">
                                {favProducts.length}
                              </span>
                            </h3>
                            {favProducts.length === 0 ? (
                              <p className="text-sm text-base-content/40 italic bg-base-100 p-6 rounded-3xl border border-base-200 text-center">
                                No has guardado ningún producto aún.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {favProducts.map((prod) => (
                                  <div
                                    key={prod.id_producto}
                                    className="flex items-center gap-4 bg-base-100 p-3 rounded-2xl border border-base-200 hover:border-red-300 hover:shadow-md transition-all group"
                                  >
                                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                                      <img
                                        src={prod.imagen}
                                        alt={prod.nombre}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-base-content leading-tight mb-1">
                                        {prod.nombre}
                                      </h4>
                                      <p className="text-sm font-black text-jungle_teal">
                                        {prod.precio}€
                                      </p>
                                    </div>
                                    <Link href={`/tienda/${prod.id_comercio}`}>
                                      <button className="btn btn-sm btn-circle btn-ghost text-base-content/40 hover:text-red-500 hover:bg-red-50 transition-colors mr-1">
                                        <ExternalLink className="w-4 h-4" />
                                      </button>
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DESPLEGABLE DE VALORACIONES (DUEÑO) */}
              <AnimatePresence>
                {showValoraciones && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                    className="md:col-span-3 overflow-hidden origin-top relative z-30"
                  >
                    <div className="bg-base-200 rounded-[2.5rem] p-8 border border-base-300 shadow-inner">
                      {loadingValoraciones ? (
                        <div className="flex justify-center py-12">
                          <span className="loading loading-spinner loading-lg text-amber-500"></span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">
                              <Star className="w-12 h-12 mb-3" />
                            </span>
                            <h3 className="font-black text-2xl text-base-content">
                              Valoraciones recibidas
                            </h3>
                            {promedioValoraciones.total >= 5 && (
                              <span className="badge badge-lg bg-amber-500 text-white font-black ml-auto">
                                {promedioValoraciones.promedio} ★ (
                                {promedioValoraciones.total})
                              </span>
                            )}
                          </div>

                          {valoraciones.length === 0 ? (
                            <p className="text-sm text-base-content/40 italic bg-base-100 p-6 rounded-3xl border border-base-200 text-center">
                              Aún no has recibido ninguna valoración.
                            </p>
                          ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                              {valoraciones.map((val) => (
                                <div
                                  key={val.id_valoracion}
                                  className="bg-base-100 p-4 rounded-2xl border border-base-200"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-base-content">
                                        {val.nombre_usuario}
                                      </span>
                                      <span className="text-amber-500 font-black">
                                        {"★".repeat(val.puntuacion)}
                                        {"☆".repeat(5 - val.puntuacion)}
                                      </span>
                                    </div>
                                    <span className="text-xs text-base-content/40">
                                      {val.fecha
                                        ? new Date(
                                            val.fecha,
                                          ).toLocaleDateString("es-ES")
                                        : ""}
                                    </span>
                                  </div>
                                  {val.comentario && (
                                    <p className="text-sm text-base-content/70 italic">
                                      "{val.comentario}"
                                    </p>
                                  )}
                                  {val.nombre_producto && (
                                    <p className="text-xs text-base-content/50 mt-1">
                                      Producto: {val.nombre_producto}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BLOQUE DUEÑO 4: Editar Comercio */}
              <div className="md:col-span-3 bg-base-200 rounded-[2.5rem] p-8 shadow-sm border border-base-300 transition-all duration-300 relative overflow-hidden">
                <div
                  onClick={() => {
                    if (comercio) {
                      setShowShopForm(!showShopForm);
                      if (!showShopForm) {
                        setShowFavorites(false);
                        setShowValoraciones(false);
                      }
                    } else {
                      toast.warning(
                        "Aún no has registrado un comercio. Ve a 'Registrar comercio'.",
                      );
                    }
                  }}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                        showShopForm
                          ? "bg-jungle_teal text-white"
                          : "bg-base-200 text-base-content group-hover:bg-jungle_teal/20 group-hover:text-jungle_teal"
                      }`}
                    >
                      <Store
                        className={`w-7 h-7 transition-transform duration-500 ${
                          showShopForm ? "scale-110" : ""
                        }`}
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-base-content">
                        Editar mi comercio
                      </h2>
                      <p className="text-base-content/60 text-sm mt-1">
                        Modifica nombre, dirección, contacto, imagen y más.
                      </p>
                    </div>
                  </div>
                  {!comercio && (
                    <span className="badge badge-warning">Sin comercio</span>
                  )}
                </div>

                {/* FORMULARIO DE EDICIÓN DE COMERCIO */}
                <AnimatePresence>
                  {showShopForm && comercio && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <form
                        onSubmit={handleShopSubmit}
                        className="mt-8 pt-8 border-t border-base-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          {/* Nombre */}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">
                              Nombre del comercio
                            </label>
                            <input
                              type="text"
                              name="nombre"
                              value={shopFormData.nombre}
                              onChange={handleShopInputChange}
                              required
                              className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium"
                            />
                          </div>

                          {/* Categoría (selector) */}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">
                              Categoría
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40">
                                <Tags size={18} />
                              </div>
                              <select
                                name="categoria"
                                value={shopFormData.categoria}
                                onChange={handleShopInputChange}
                                required
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all appearance-none cursor-pointer font-bold"
                              >
                                <option value="" disabled>
                                  Seleccionar categoría...
                                </option>
                                <option value="Frutería">Frutería</option>
                                <option value="Panadería">Panadería</option>
                                <option value="Carnicería">Carnicería</option>
                                <option value="Pescadería">Pescadería</option>
                                <option value="Pastelería">Pastelería</option>
                                <option value="Bio">Productos Bio/Eco</option>
                                <option value="Artesanía y regalos">
                                  Artesanía y Regalos
                                </option>
                                <option value="Textiles y moda">
                                  Textiles y Moda
                                </option>
                                <option value="Otros">Otros</option>
                              </select>
                            </div>
                          </div>

                          {/* Contacto */}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">
                              Contacto (teléfono/email)
                            </label>
                            <input
                              type="text"
                              name="contacto"
                              value={shopFormData.contacto}
                              onChange={handleShopInputChange}
                              required
                              className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium"
                            />
                          </div>

                          {/* Dirección */}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">
                              Dirección
                            </label>
                            <input
                              type="text"
                              name="direccion"
                              value={shopFormData.direccion}
                              onChange={handleShopInputChange}
                              required
                              className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium"
                            />
                          </div>

                          {/* Ubicación en el mapa */}
                          <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">
                              Ubicación en el mapa
                            </label>
                            <LocationPicker
                              onLocationSelect={handleLocationSelect}
                              onError={(mensaje) => toast.error(mensaje)}
                              initialCoords={
                                shopFormData.latitud && shopFormData.longitud
                                  ? {
                                      lat: parseFloat(shopFormData.latitud),
                                      lng: parseFloat(shopFormData.longitud),
                                    }
                                  : null
                              }
                            />
                            {shopFormData.latitud && shopFormData.longitud && (
                              <p className="text-xs text-base-content/50 mt-1">
                                Coordenadas: {shopFormData.latitud},{" "}
                                {shopFormData.longitud}
                              </p>
                            )}
                          </div>

                          {/* Descripción */}
                          <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">
                              Descripción
                            </label>
                            <textarea
                              name="descripcion"
                              value={shopFormData.descripcion}
                              onChange={handleShopInputChange}
                              rows="3"
                              className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium"
                            ></textarea>
                          </div>

                          {/* Sección de imagen */}
                          <div className="md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2 mb-2 block">
                              Imagen del comercio
                            </label>
                            <div className="flex items-start gap-4">
                              <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-base-300 bg-base-100 flex items-center justify-center">
                                {imagenPreview ? (
                                  <img
                                    src={imagenPreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Store className="w-8 h-8 text-base-content/30" />
                                )}
                              </div>
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImagenChange}
                                  ref={fileInputRef}
                                  className="file-input file-input-bordered w-full max-w-xs"
                                />
                                <p className="text-xs text-base-content/50 mt-2">
                                  Sube una nueva imagen (opcional).
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-4">
                          <button
                            type="button"
                            onClick={() => setShowShopForm(false)}
                            className="btn btn-ghost text-base-content/60 hover:bg-error/10 hover:text-error rounded-xl transition-colors font-bold"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="btn bg-sea_green hover:bg-jungle_teal text-white font-bold rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-none px-8"
                          >
                            Guardar Cambios
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            // ------------------------------------------------------------------
            // VISTA PARA CLIENTE
            // ------------------------------------------------------------------
            <>
              {/* BLOQUE CLIENTE 1: Historial de Pedidos */}
              <div className="md:col-span-1 bg-base-200 rounded-[2.5rem] p-8 shadow-sm border border-base-300 hover:shadow-md hover:border-jungle_teal/40 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-full bg-linear-to-l from-base-200/50 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-black mb-2 text-base-content group-hover:text-jungle_teal transition-colors">
                    Historial de Pedidos
                  </h2>
                  <p className="text-base-content/60 max-w-sm text-sm">
                    Revisa tus compras recientes.
                  </p>
                </div>
                <div className="mt-8 flex justify-end relative z-10">
                  <Link href="/perfil/pedidos">
                    <span className="text-sm font-bold text-jungle_teal uppercase tracking-widest bg-jungle_teal/10 px-5 py-3 rounded-2xl group-hover:bg-jungle_teal group-hover:text-white transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2">
                      Ver pedidos <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* BLOQUE CLIENTE 2: Mis Valoraciones */}
              <div
                onClick={() => {
                  setShowValoraciones(!showValoraciones);
                  if (!showValoraciones) {
                    fetchValoracionesCliente();
                    setShowFavorites(false);
                    setShowSettings(false);
                  }
                }}
                className={`md:col-span-1 rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-center relative overflow-hidden ${
                  showValoraciones
                    ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20 scale-[0.97]"
                    : "bg-amber-600 text-white hover:bg-amber-500 hover:-translate-y-1"
                }`}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <span className="text-4xl mb-3 block">
                    <NotebookPen className="w-12 h-12 mb-3" />
                  </span>
                  <h2 className="font-black opacity-90 uppercase tracking-wider text-sm mb-1">
                    Mis Valoraciones
                  </h2>
                  <p className="text-white/80 text-sm font-medium">
                    Ver mis reseñas
                  </p>
                </div>
              </div>

              {/* BLOQUE CLIENTE 3: Favoritos */}
              <div
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  if (!showFavorites) {
                    setShowValoraciones(false);
                    setShowSettings(false);
                  }
                }}
                className={`md:col-span-1 rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-center relative overflow-hidden ${
                  showFavorites
                    ? "bg-red-500 text-white shadow-xl shadow-red-500/20 scale-[0.97]"
                    : "bg-jungle_teal text-white hover:bg-sea_green hover:-translate-y-1"
                }`}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <Heart
                    className={`w-12 h-12 mb-3 transition-all duration-500 ${
                      showFavorites
                        ? "fill-white drop-shadow-md scale-110"
                        : "fill-white/20"
                    }`}
                  />
                  <h2 className="font-black opacity-90 uppercase tracking-wider text-sm mb-1">
                    Tus Favoritos
                  </h2>
                  <p className="text-white/80 text-sm font-medium">
                    Ver guardados
                  </p>
                </div>
              </div>

              {/* DESPLEGABLE DE FAVORITOS (CLIENTE) */}
              <AnimatePresence>
                {showFavorites && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                    className="md:col-span-3 overflow-hidden origin-top relative z-30"
                  >
                    <div className="bg-base-200 rounded-[2.5rem] p-8 border border-base-300 shadow-inner">
                      {loadingFavs ? (
                        <div className="flex justify-center py-12">
                          <span className="loading loading-spinner loading-lg text-red-500"></span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Tiendas favoritas */}
                          <div>
                            <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-base-content">
                              <Store className="w-6 h-6 text-red-500" /> Tiendas
                              Favoritas
                              <span className="badge badge-sm bg-red-100 text-red-600 border-none font-bold">
                                {favShops.length}
                              </span>
                            </h3>
                            {favShops.length === 0 ? (
                              <p className="text-sm text-base-content/40 italic bg-base-100 p-6 rounded-3xl border border-base-200 text-center">
                                No has guardado ninguna tienda aún.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {favShops.map((shop) => (
                                  <Link
                                    key={shop.id_comercio}
                                    href={`/tienda/${shop.id_comercio}`}
                                  >
                                    <div className="flex items-center gap-4 bg-base-100 p-3 rounded-2xl border border-base-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group">
                                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                                        <img
                                          src={shop.imagen}
                                          alt={shop.nombre}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-bold text-base-content">
                                          {shop.nombre}
                                        </h4>
                                        <p className="text-xs text-base-content/50">
                                          {shop.categoria}
                                        </p>
                                      </div>
                                      <ExternalLink className="w-5 h-5 text-base-content/20 group-hover:text-red-500 transition-colors mr-3" />
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Productos favoritos */}
                          <div>
                            <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-base-content">
                              <ShoppingBasket className="w-6 h-6 text-red-500" />{" "}
                              Productos Favoritos
                              <span className="badge badge-sm bg-red-100 text-red-600 border-none font-bold">
                                {favProducts.length}
                              </span>
                            </h3>
                            {favProducts.length === 0 ? (
                              <p className="text-sm text-base-content/40 italic bg-base-100 p-6 rounded-3xl border border-base-200 text-center">
                                No has guardado ningún producto aún.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {favProducts.map((prod) => (
                                  <div
                                    key={prod.id_producto}
                                    className="flex items-center gap-4 bg-base-100 p-3 rounded-2xl border border-base-200 hover:border-red-300 hover:shadow-md transition-all group"
                                  >
                                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                                      <img
                                        src={prod.imagen}
                                        alt={prod.nombre}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-base-content leading-tight mb-1">
                                        {prod.nombre}
                                      </h4>
                                      <p className="text-sm font-black text-jungle_teal">
                                        {prod.precio}€
                                      </p>
                                    </div>
                                    <Link href={`/tienda/${prod.id_comercio}`}>
                                      <button className="btn btn-sm btn-circle btn-ghost text-base-content/40 hover:text-red-500 hover:bg-red-50 transition-colors mr-1">
                                        <ExternalLink className="w-4 h-4" />
                                      </button>
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DESPLEGABLE DE VALORACIONES (CLIENTE) */}
              <AnimatePresence>
                {showValoraciones && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                    className="md:col-span-3 overflow-hidden origin-top relative z-30"
                  >
                    <div className="bg-base-200 rounded-[2.5rem] p-8 border border-base-300 shadow-inner">
                      {loadingValoraciones ? (
                        <div className="flex justify-center py-12">
                          <span className="loading loading-spinner loading-lg text-amber-500"></span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">
                              <NotebookPen />
                            </span>
                            <h3 className="font-black text-2xl text-base-content">
                              Mis valoraciones
                            </h3>
                          </div>

                          {valoraciones.length === 0 ? (
                            <p className="text-sm text-base-content/40 italic bg-base-100 p-6 rounded-3xl border border-base-200 text-center">
                              Aún no has hecho ninguna valoración.
                            </p>
                          ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                              {valoraciones.map((val) => (
                                <div
                                  key={val.id_valoracion}
                                  className="bg-base-100 p-4 rounded-2xl border border-base-200"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-base-content">
                                        {val.nombre_comercio || "Tienda"}
                                      </span>
                                      <span className="text-amber-500 font-black">
                                        {"★".repeat(val.puntuacion)}
                                        {"☆".repeat(5 - val.puntuacion)}
                                      </span>
                                    </div>
                                    <span className="text-xs text-base-content/40">
                                      {val.fecha
                                        ? new Date(
                                            val.fecha,
                                          ).toLocaleDateString("es-ES")
                                        : ""}
                                    </span>
                                  </div>
                                  {val.comentario && (
                                    <p className="text-sm text-base-content/70 italic">
                                      "{val.comentario}"
                                    </p>
                                  )}
                                  {val.nombre_producto && (
                                    <p className="text-xs text-base-content/50 mt-1">
                                      Producto: {val.nombre_producto}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ===== BLOQUE COMÚN: AJUSTES DE CUENTA ===== */}
          <div className="md:col-span-3 bg-base-200 rounded-[2.5rem] p-8 shadow-sm border border-base-300 transition-all duration-300 relative overflow-hidden">
            <div
              onClick={() => {
                setShowSettings(!showSettings);
                if (!showSettings) {
                  setShowFavorites(false);
                  setShowValoraciones(false);
                }
              }}
              className="flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                    showSettings
                      ? "bg-yellow-500 text-white"
                      : "bg-base-200 text-base-content group-hover:bg-yellow-100 group-hover:text-yellow-600"
                  }`}
                >
                  <Settings
                    className={`w-7 h-7 transition-transform duration-500 ${
                      showSettings ? "rotate-90" : ""
                    }`}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-base-content">
                    Ajustes de la cuenta
                  </h2>
                  <p className="text-base-content/60 text-sm mt-1">
                    Modifica tus datos, contraseña y privacidad.
                  </p>
                </div>
              </div>
            </div>

            {/* FORMULARIO DE AJUSTES DESPLEGABLE */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <form
                    onSubmit={handleSave}
                    className="mt-8 pt-8 border-t border-base-200"
                  >
                    <div className="mb-6 p-5 bg-yellow-700 border border-yellow-500 rounded-2xl flex gap-3 items-start">
                      <Lock className="text-yellow-300" />
                      <p className="text-sm font-medium text-yellow-300">
                        Por tu seguridad, necesitas introducir tu contraseña
                        actual para guardar cualquier cambio.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium"
                          placeholder="tu@email.com"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2 flex items-center gap-1">
                          Contraseña Actual{" "}
                          <span className="text-error">*</span>
                        </label>
                        <input
                          type="password"
                          name="claveActual"
                          value={formData.claveActual}
                          onChange={handleInputChange}
                          required
                          className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-error focus:ring-4 focus:ring-error/10 transition-all font-medium"
                          placeholder="Obligatoria para guardar"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2 flex items-center justify-between">
                          <span>Nueva Contraseña</span>
                          <span className="text-[10px] font-normal lowercase opacity-70">
                            (opcional)
                          </span>
                        </label>
                        <input
                          type="password"
                          name="nuevaClave"
                          value={formData.nuevaClave}
                          onChange={handleInputChange}
                          className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium"
                          placeholder="Dejar en blanco si no cambia"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowSettings(false)}
                        className="btn btn-ghost text-base-content/60 hover:bg-error/10 hover:text-error rounded-xl transition-colors font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn bg-sea_green hover:bg-jungle_teal text-white font-bold rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-none px-8"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
};
