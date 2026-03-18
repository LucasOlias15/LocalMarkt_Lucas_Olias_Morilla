import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";

//TODO Añadir funcionalidad de botones y menú de datos personales, cerrar sesión, acceder al panel de gestión (si es dueño), etc.
//TODO Cambiar emojis por foto de perfil o algo similar 

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [, setLocation] = useLocation();

  const [showSettings, setShowSettings] = useState(false);
  
  // 1. Añadimos 'claveActual' y renombramos 'password' a 'nuevaClave'
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
        claveActual: "", // Siempre en blanco
        nuevaClave: ""   // Siempre en blanco
      });
    }
  }, [user]);

  // Manejador para actualizar el estado cuando se escribe
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Manejador del botón "Guardar"
  const handleSave = async (e) => {
    e.preventDefault();

    // 2. Validación en el Front: Exigir contraseña actual
    if (!formData.claveActual) {
      alert("Debes introducir tu contraseña actual para guardar los cambios.");
      return;
    }

    // 3. Preparamos el objeto EXACTAMENTE como lo espera el Backend
    const updatedData = {
      nombre: formData.nombre,
      email: formData.email,
      clave: formData.claveActual, // El backend lo llama 'clave'
      ...(formData.nuevaClave && { nuevaClave: formData.nuevaClave }) // Solo enviamos nuevaClave si escribió algo
    };

    try {
      // 4. Petición al backend (usamos tu endpoint de perfil)
const response = await fetch(`http://localhost:3000/api/users/perfil`, {
        method: 'PUT', // o PATCH
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();

      if (response.ok) {
        // 5. ¡Éxito! Usamos los datos frescos que devuelve el servidor
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("¡Perfil actualizado con éxito!");
        
        // Limpiamos las contraseñas del formulario por seguridad y lo cerramos
        setFormData(prev => ({ ...prev, claveActual: "", nuevaClave: "" }));
        setShowSettings(false); 
      } else {
        // Mostramos el mensaje de error específico del backend (ej: "Contraseña incorrecta" o "Email en uso")
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
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 🎨 Cabecera Rediseñada */}
        <section className="bg-base-200 rounded-[3rem] p-8 md:p-12 shadow-sm border border-base-300 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-sea_green/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="avatar z-10">
            <div className="w-32 h-32 rounded-[2.5rem] p-1.5 bg-gradient-to-tr from-jungle_teal to-bright_fern shadow-xl">
              <div className="w-full h-full rounded-[2.2rem] bg-base-100 flex items-center justify-center">
                {user.rol === 'dueño' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-base-content opacity-90 drop-shadow-sm">
                    <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 001.5 6.75v.528c0 .359.128.706.357.982l.94 1.139a2.993 2.993 0 00-.297.886l-.416 3.332A1.5 1.5 0 003.57 15.3l.02.138A.75.75 0 004.33 16h15.34a.75.75 0 00.74-.612l.02-.138a1.5 1.5 0 00-1.478-1.683l-.416-3.332a2.992 2.992 0 00-.297-.886l.94-1.139a1.493 1.493 0 00.357-.982V6.75a3.75 3.75 0 00-1.098-2.652l-1.3-1.298a1.875 1.875 0 00-1.325-.55H5.223z" />
                    <path fillRule="evenodd" d="M3 20.25v-3.375h18v3.375c0 .621-.504 1.125-1.125 1.125h-15.75c-.621 0-1.125-.504-1.125-1.125zm9-2.25a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75h-3z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-base-content opacity-90 drop-shadow-sm">
                    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                  </svg>
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

            <span className={`badge badge-lg border-none py-4 px-5 font-bold shadow-sm inline-flex items-center gap-2 ${
              user.rol === 'dueño' 
                ? 'bg-jungle_teal text-white' 
                : 'bg-bright_fern text-white'
            }`}>
              {user.rol === 'dueño' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                  DUEÑO DE COMERCIO
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  CLIENTE LOCAL
                </>
              )}
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

       {/* Sección Dinámica: Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {user.rol === 'dueño' ? (
            <>
              <div className="md:col-span-2 bg-base-100 rounded-[2.5rem] p-8 shadow-sm border border-base-300 hover:shadow-md hover:border-jungle_teal/30 transition-all cursor-pointer group flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-black mb-2 text-base-content group-hover:text-jungle_teal transition-colors">Mi Tienda</h2>
                  <p className="text-base-content/60">Gestiona tu inventario, revisa pedidos activos y actualiza tu perfil público.</p>
                </div>
                <div className="mt-8 flex justify-end">
                  <span className="text-sm font-bold text-jungle_teal uppercase tracking-widest bg-jungle_teal/10 px-4 py-2 rounded-xl group-hover:bg-jungle_teal group-hover:text-white transition-colors">
                    <Link href={`/panel-tienda/${user.id_comercio}`} >
                      Acceder al panel -&gt;
                    </Link>
                  </span>
                </div>
              </div>

              <div className="bg-jungle_teal text-white rounded-[2.5rem] p-8 shadow-sm hover:bg-sea_green transition-colors cursor-pointer flex flex-col justify-center">
                <h2 className=" font-black opacity-80 uppercase tracking-wider text-sm mb-2">Ventas del mes</h2>
                <div className="text-5xl font-black mb-1">24</div>
                <p className="text-white/70 text-sm font-medium">Pedidos completados</p>
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-2 bg-base-100 rounded-[2.5rem] p-8 shadow-sm border border-base-300 hover:shadow-md hover:border-yellow-400/50 transition-all cursor-pointer group flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-black mb-2 text-base-content group-hover:text-yellow-600 transition-colors">Historial de Pedidos</h2>
                  <p className="text-base-content/60">Revisa el estado de tus compras recientes y descarga tus recibos.</p>
                </div>
                <div className="mt-8 flex justify-end">
                  <span className="text-sm font-bold text-yellow-700 uppercase tracking-widest bg-yellow-400/20 px-4 py-2 rounded-xl group-hover:bg-yellow-400 group-hover:text-yellow-900 transition-colors">
                    Ver pedidos -&gt;
                  </span>
                </div>
              </div>

              <div className="bg-yellow-400 text-yellow-900 rounded-[2.5rem] p-8 shadow-sm hover:bg-yellow-300 transition-colors cursor-pointer flex flex-col justify-center">
                <h2 className="font-black opacity-80 uppercase tracking-wider text-sm mb-2">Tus Favoritos</h2>
                <div className="text-5xl font-black mb-1">3</div>
                <p className="text-yellow-900/70 text-sm font-medium">Comercios guardados</p>
              </div>
            </>
          )}

          {/* Bloque Común: Ajustes de cuenta */}
          <div className={`md:col-span-3 rounded-[2.5rem] p-8 transition-all duration-300 shadow-sm border ${
            showSettings 
              ? 'bg-base-100 border-yellow-400/30 shadow-md' 
              : 'bg-base-200 border-base-300 hover:border-base-content/20'
          }`}>
            
            <div 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-between group cursor-pointer"
            >
              <div>
                <h2 className="text-xl font-black text-base-content">Ajustes de perfil</h2>
                <p className="text-base-content/60 text-sm mt-1">
                  Modifica tus datos personales, contraseña y preferencias.
                </p>
              </div>
              
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all duration-500 ${
                showSettings 
                  ? 'rotate-90 bg-yellow-400 text-yellow-900 scale-110 shadow-md' 
                  : 'bg-base-100 text-base-content/50 group-hover:scale-110 group-hover:bg-base-300'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>

            {showSettings && (
              <form onSubmit={handleSave} className="mt-8 pt-8 border-t border-base-300/50 animate-fade-in-down">
                {/* NOTA DE SEGURIDAD PARA EL USUARIO */}
                <div className="mb-6 p-4 bg-info/10 border border-info/20 rounded-2xl flex gap-3 text-info items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mt-0.5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <p className="text-sm font-medium">Por tu seguridad, necesitas introducir tu contraseña actual para guardar cualquier cambio.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  
                  {/* Campo: Nombre */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">
                      Nombre completo
                    </label>
                    <input 
                      type="text" 
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="p-4 rounded-2xl bg-base-200/50 border border-base-300 text-base-content placeholder:text-base-content/30 outline-none focus:bg-base-100 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all font-medium"
                      placeholder="Tu nombre"
                    />
                  </div>

                  {/* Campo: Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">
                      Correo electrónico
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="p-4 rounded-2xl bg-base-200/50 border border-base-300 text-base-content placeholder:text-base-content/30 outline-none focus:bg-base-100 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all font-medium"
                      placeholder="tu@email.com"
                    />
                  </div>

                  {/* Campo NUEVO: Contraseña ACTUAL (Obligatoria) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2 flex items-center gap-1">
                      Contraseña Actual <span className="text-error">*</span>
                    </label>
                    <input 
                      type="password" 
                      name="claveActual"
                      value={formData.claveActual}
                      onChange={handleInputChange}
                      required
                      className="p-4 rounded-2xl bg-base-200/50 border border-base-300 text-base-content placeholder:text-base-content/30 outline-none focus:bg-base-100 focus:border-error focus:ring-4 focus:ring-error/20 transition-all font-medium"
                      placeholder="Obligatoria para guardar"
                    />
                  </div>

                  {/* Campo: Nueva Contraseña */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2 flex items-center justify-between">
                      <span>Nueva Contraseña</span>
                      <span className="text-[10px] font-normal lowercase opacity-70">(opcional)</span>
                    </label>
                    <input 
                      type="password" 
                      name="nuevaClave"
                      value={formData.nuevaClave}
                      onChange={handleInputChange}
                      className="p-4 rounded-2xl bg-base-200/50 border border-base-300 text-base-content placeholder:text-base-content/30 outline-none focus:bg-base-100 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all font-medium"
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
            )}
          </div>

        </section>
      </div>
    </div>
  );
};