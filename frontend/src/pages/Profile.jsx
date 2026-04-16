import { UserRoundKey, UserRoundCog, Heart, Store, ShoppingBasket, ExternalLink, ArrowRight, Settings, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [, setLocation] = useLocation();

  // --- ESTADOS DE LOS DESPLEGABLES ---
  const [showSettings, setShowSettings] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // --- ESTADOS PARA FAVORITOS ---
  const [favShops, setFavShops] = useState([]);
  const [favProducts, setFavProducts] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  // --- ESTADOS PARA AJUSTES ---
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    claveActual: "", 
    nuevaClave: ""
  });

  // Cuando el usuario cargue, rellenamos el formulario con sus datos reales
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        claveActual: "", 
        nuevaClave: ""   
      });
    }
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
          fetch(`http://localhost:3000/api/favoritos/${user.id || user.id_usuario}`)
        ]);

        const dataShops = await resShops.json();
        const dataProducts = await resProducts.json();
        const dataFavs = resFavs.ok ? await resFavs.json() : [];

        const favsSeguros = Array.isArray(dataFavs) ? dataFavs : [];
        const idsProductosFavs = favsSeguros.filter(f => f.id_producto).map(f => f.id_producto);
        const idsComerciosFavs = favsSeguros.filter(f => f.id_comercio).map(f => f.id_comercio);

        setFavShops(Array.isArray(dataShops) ? dataShops.filter(shop => idsComerciosFavs.includes(shop.id_comercio)) : []);
        setFavProducts(Array.isArray(dataProducts) ? dataProducts.filter(prod => idsProductosFavs.includes(prod.id_producto)) : []);

      } catch (error) {
        console.error("Error cargando favoritos:", error);
      } finally {
        setLoadingFavs(false);
      }
    };

    fetchFavoritesData();
  }, [showFavorites, user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.claveActual) {
      alert("Debes introducir tu contraseña actual para guardar los cambios.");
      return;
    }

    const updatedData = {
      nombre: formData.nombre,
      email: formData.email,
      clave: formData.claveActual, 
      ...(formData.nuevaClave && { nuevaClave: formData.nuevaClave }) 
    };

    try {
      const response = await fetch(`http://localhost:3000/api/users/perfil`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("¡Perfil actualizado con éxito!");
        setFormData(prev => ({ ...prev, claveActual: "", nuevaClave: "" }));
        setShowSettings(false); 
      } else {
        alert(`Error: ${data.error || "No se pudo actualizar el perfil"}`);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocation("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-base-100 py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 🎨 CABECERA DEL PERFIL */}
        <section className="bg-base-200 rounded-[3rem] p-8 md:p-12 shadow-sm border border-base-300 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-sea_green/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="avatar z-10">
            <div className="w-32 h-32 rounded-[2.5rem] p-1.5 bg-linear-to-tr from-jungle_teal to-bright_fern shadow-xl">
              <div className="w-full h-full rounded-[2.2rem] bg-base-100 flex items-center justify-center text-jungle_teal">
                {user.rol === 'dueño' ? <UserRoundKey className="w-12 h-12"/> : <UserRoundCog className="w-12 h-12"/>}
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
            <span className={`badge badge-lg border-none py-4 px-5 font-bold shadow-sm inline-flex items-center gap-2 ${
              user.rol === 'dueño' ? 'bg-jungle_teal text-white' : 'bg-bright_fern text-white'
            }`}>
              {user.rol === 'dueño' ? <><Store className="w-4 h-4" /> DUEÑO DE COMERCIO</> : <><UserRoundCog className="w-4 h-4" /> CLIENTE LOCAL</>}
            </span>
          </div>

          <button 
            onClick={handleLogout}
            className="z-10 btn btn-circle btn-ghost text-base-content/40 hover:bg-error/10 hover:text-error transition-colors md:self-start"
            title="Cerrar sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </section>

        {/* 🧩 BENTO GRID (EL PUZZLE PRINCIPAL) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {user.rol === 'dueño' ? (
            <>
              {/* BLOQUE DUEÑO 1 */}
              <div className="md:col-span-1 bg-base-100 rounded-[2.5rem] p-8 shadow-sm border border-base-300 hover:shadow-md hover:border-jungle_teal/30 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-2xl font-black mb-2 text-base-content group-hover:text-jungle_teal transition-colors">Mi Tienda</h2>
                  <p className="text-base-content/60 max-w-sm">Gestiona tu inventario, revisa pedidos activos y actualiza tu perfil público.</p>
                </div>
                <div className="mt-8 flex justify-end relative z-10">
                  <Link href={`/panel-tienda/${user.id_comercio}`}>
                    <span className="text-sm font-bold text-jungle_teal uppercase tracking-widest bg-jungle_teal/10 px-5 py-3 rounded-2xl group-hover:bg-jungle_teal group-hover:text-white transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2">
                      Acceder al panel <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* BLOQUE DUEÑO 2 */}
              <div className="md:col-span-1 bg-green-900 text-white rounded-[2.5rem] p-8 shadow-sm hover:bg-sea_green transition-colors cursor-pointer flex flex-col justify-center">
                <h2 className="font-black opacity-80 uppercase tracking-wider text-sm mb-2">Ventas del mes</h2>
                <div className="text-6xl font-black mb-1">24</div>
                <p className="text-white/70 text-sm font-medium">Pedidos completados</p>
              </div>
              {/* BLOQUE FAVORITOS DEL DUEÑO 3 */}
              <div 
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  if (!showFavorites) setShowSettings(false); 
                }}
                className={`md:col-span-1 rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-center relative overflow-hidden ${
                  showFavorites
                    ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 scale-[0.97]' // Se hunde cuando está activo
                    : 'bg-jungle_teal text-white hover:bg-sea_green hover:-translate-y-1'
                }`}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    {/* El corazón ya no gira, pero late suavemente y se rellena si está activo */}
                    <Heart className={`w-12 h-12 mb-3 transition-all duration-500 ${showFavorites ? 'fill-white drop-shadow-md scale-110' : 'fill-white/20'}`} />
                    <h2 className="font-black opacity-90 uppercase tracking-wider text-sm mb-1">
                        Tus Favoritos
                    </h2>
                    <p className="text-white/80 text-sm font-medium">
                       Ver guardados
                    </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* BLOQUE CLIENTE 1: PEDIDOS (2 Columnas) */}
              <div className="md:col-span-2 bg-base-200 rounded-[2.5rem] p-8 shadow-sm border border-base-300 hover:shadow-md hover:border-jungle_teal/40 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-full bg-linear-to-l from-base-200/50 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-2 text-base-content group-hover:text-jungle_teal transition-colors">
                        Historial de Pedidos
                    </h2>
                    <p className="text-base-content/60 max-w-sm">Revisa el estado de tus compras recientes, descarga tus recibos y vuelve a pedir lo que te gusta.</p>
                </div>
                <div className="mt-8 flex justify-end relative z-10">
                  <Link href="/perfil/pedidos">
                    <span className="text-sm font-bold text-jungle_teal uppercase tracking-widest bg-jungle_teal/10 px-5 py-3 rounded-2xl group-hover:bg-jungle_teal group-hover:text-white transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2">
                        Ver pedidos <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* BLOQUE CLIENTE 2: FAVORITOS TRIGGER (1 Columna interactiva) */}
              <div 
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  if (!showFavorites) setShowSettings(false); 
                }}
                className={`md:col-span-1 rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-center relative overflow-hidden ${
                  showFavorites
                    ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 scale-[0.97]' // Se hunde cuando está activo
                    : 'bg-jungle_teal text-white hover:bg-sea_green hover:-translate-y-1'
                }`}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    {/* El corazón ya no gira, pero late suavemente y se rellena si está activo */}
                    <Heart className={`w-12 h-12 mb-3 transition-all duration-500 ${showFavorites ? 'fill-white drop-shadow-md scale-110' : 'fill-white/20'}`} />
                    <h2 className="font-black opacity-90 uppercase tracking-wider text-sm mb-1">
                        Tus Favoritos
                    </h2>
                    <p className="text-white/80 text-sm font-medium">
                       Ver guardados
                    </p>
                </div>
              </div>
            </>
          )}

          {/* 🌟 DESPLEGABLE DE FAVORITOS (Aparece Mágicamente dentro del Puzzle) 🌟 */}
          <AnimatePresence>
            {showFavorites && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                className="md:col-span-3 overflow-hidden origin-top"
              >
                <div className="bg-base-200 rounded-[2.5rem] p-8 border border-base-300 shadow-inner">
                  {loadingFavs ? (
                    <div className="flex justify-center py-12">
                      <span className="loading loading-spinner loading-lg text-red-500"></span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* COLUMNA TIENDAS */}
                      <div>
                        <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-base-content">
                          <Store className="w-6 h-6 text-red-500" /> Tiendas Favoritas
                          <span className="badge badge-sm bg-red-100 text-red-600 border-none font-bold">{favShops.length}</span>
                        </h3>
                        {favShops.length === 0 ? (
                          <p className="text-sm text-base-content/40 italic bg-base-100 p-6 rounded-3xl border border-base-200 text-center">No has guardado ninguna tienda aún.</p>
                        ) : (
                          <div className="space-y-3">
                            {favShops.map(shop => (
                              <Link key={shop.id_comercio} href={`/tienda/${shop.id_comercio}`}>
                                <div className="flex items-center gap-4 bg-base-100 p-3 rounded-2xl border border-base-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group">
                                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                                    <img src={shop.imagen} alt={shop.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-base-content">{shop.nombre}</h4>
                                    <p className="text-xs text-base-content/50">{shop.categoria}</p>
                                  </div>
                                  <ExternalLink className="w-5 h-5 text-base-content/20 group-hover:text-red-500 transition-colors mr-3" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* COLUMNA PRODUCTOS */}
                      <div>
                        <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-base-content">
                          <ShoppingBasket className="w-6 h-6 text-red-500" /> Productos Favoritos
                          <span className="badge badge-sm bg-red-100 text-red-600 border-none font-bold">{favProducts.length}</span>
                        </h3>
                        {favProducts.length === 0 ? (
                          <p className="text-sm text-base-content/40 italic bg-base-100 p-6 rounded-3xl border border-base-200 text-center">No has guardado ningún producto aún.</p>
                        ) : (
                          <div className="space-y-3">
                            {favProducts.map(prod => (
                              <div key={prod.id_producto} className="flex items-center gap-4 bg-base-100 p-3 rounded-2xl border border-base-200 hover:border-red-300 hover:shadow-md transition-all group">
                                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                                  <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-base-content leading-tight mb-1">{prod.nombre}</h4>
                                  <p className="text-sm font-black text-jungle_teal">{prod.precio}€</p>
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

          {/* BLOQUE COMÚN: AJUSTES (3 Columnas - Puzzle base) */}
          <div className="md:col-span-3 bg-base-200 rounded-[2.5rem] p-8 shadow-sm border border-base-300 transition-all duration-300 relative overflow-hidden">
            <div 
              onClick={() => {
                setShowSettings(!showSettings);
                if (!showSettings) setShowFavorites(false); 
              }}
              className="flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${showSettings ? 'bg-yellow text-white' : 'bg-base-200 text-base-content group-hover:bg-yellow-100 group-hover:text-yellow-600'}`}>
                  <Settings className={`w-7 h-7 transition-transform duration-500 ${showSettings ? 'rotate-90' : ''}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-base-content">Ajustes de la cuenta</h2>
                  <p className="text-base-content/60 text-sm mt-1">Modifica tus datos, contraseña y privacidad.</p>
                </div>
              </div>
            </div>

            {/* FORMULARIO DE AJUSTES DESPLEGABLE */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleSave} className="mt-8 pt-8 border-t border-base-200">
                    <div className="mb-6 p-5 bg-yellow-700 border border-yellow rounded-2xl flex gap-3 text-info items-start">
                      <Lock className="text-yellow-300"/>
                      <p className="text-sm font-medium text-yellow-300">Por tu seguridad, necesitas introducir tu contraseña actual para guardar cualquier cambio.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">Nombre completo</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium" placeholder="Tu nombre" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">Correo electrónico</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium" placeholder="tu@email.com" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2 flex items-center gap-1">Contraseña Actual <span className="text-error">*</span></label>
                        <input type="password" name="claveActual" value={formData.claveActual} onChange={handleInputChange} required className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-error focus:ring-4 focus:ring-error/10 transition-all font-medium" placeholder="Obligatoria para guardar" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2 flex items-center justify-between"><span>Nueva Contraseña</span><span className="text-[10px] font-normal lowercase opacity-70">(opcional)</span></label>
                        <input type="password" name="nuevaClave" value={formData.nuevaClave} onChange={handleInputChange} className="w-full p-4 rounded-2xl bg-base-300   border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium" placeholder="Dejar en blanco si no cambia" />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-4">
                      <button type="button" onClick={() => setShowSettings(false)} className="btn btn-ghost text-base-content/60 hover:bg-error/10 hover:text-error rounded-xl transition-colors font-bold">Cancelar</button>
                      <button type="submit" className="btn bg-sea_green hover:bg-jungle_teal text-white font-bold rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-none px-8">Guardar Cambios</button>
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