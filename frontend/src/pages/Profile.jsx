import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import { Store } from "lucide-react";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileSettings } from "../components/profile/ProfieSettings";
import { OwnerSection } from "../components/profile/OwnerSection";
import { ClientSection } from "../components/profile/ClientSection";
import { ShopEditForm } from "../components/profile/ShopEditForm";
import { FavoritesDropdown } from "../components/profile/FavoritesDropdown";
import { RatingsDropdown } from "../components/profile/RatingsDropdown";
import useToastStore from "../store/useToastStore";


export const Profile = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const [user, setUser] = useState(null);
  const [, setLocation] = useLocation();
  const toast = useToastStore();

  // Estados de desplegables
  const [showSettings, setShowSettings] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showValoraciones, setShowValoraciones] = useState(false);

  // Estados de favoritos
  const [favShops, setFavShops] = useState([]);
  const [favProducts, setFavProducts] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  // Estados de valoraciones
  const [valoraciones, setValoraciones] = useState([]);
  const [loadingValoraciones, setLoadingValoraciones] = useState(false);
  const [promedioValoraciones, setPromedioValoraciones] = useState({
    promedio: "0.0",
    total: 0,
  });

  // Estados de comercio (dueño)
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

  // ========================================================================
  // EFECTOS
  // ========================================================================

  // Cargar usuario del localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  // Cargar comercio si es dueño
  useEffect(() => {
    const fetchComercio = async () => {
      if (!user || user.rol !== "dueño") return;
      setLoadingComercio(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/comercios/mi-comercio`,
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
        }
      } catch (error) {
        console.error("Error de red al obtener comercio:", error);
      } finally {
        setLoadingComercio(false);
      }
    };
    fetchComercio();
  }, [user]);

  // Cargar favoritos cuando se abre el desplegable
  useEffect(() => {
    const fetchFavoritesData = async () => {
      if (!user || !showFavorites) return;
      setLoadingFavs(true);
      try {
        const [resShops, resProducts, resFavs] = await Promise.all([
         fetch(`${API_URL}/comercios`),
          fetch(`${API_URL}/productos/explorar`),
          fetch(`${API_URL}/favoritos/${user.id || user.id_usuario}`,
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
  // FUNCIONES DE VALORACIONES
  // ========================================================================

  const fetchValoracionesDueño = async () => {
    if (!comercio) return;
    setLoadingValoraciones(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/valoraciones/comercio/${comercio.id_comercio}/todas`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setValoraciones(data.valoraciones || []);
        setPromedioValoraciones({ promedio: data.promedio, total: data.total });
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
      const res = await fetch(`${API_URL}/valoraciones/mis-valoraciones/${user.id || user.id_usuario}`,
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
  // HANDLERS
  // ========================================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocation("/");
    toast.info("Sesión cerrada correctamente")
  };

  const handleLocationSelect = (coords) => {
    setShopFormData((prev) => ({
      ...prev,
      latitud: coords.lat.toString(),
      longitud: coords.lng.toString(),
    }));
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
      const res = await fetch(`${API_URL}/comercios/${comercio.id_comercio}`,
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
      if (imagenFile) {
        const formDataImg = new FormData();
        formDataImg.append("imagen", imagenFile);
        const imgRes = await fetch(`${API_URL}/comercios/${comercio.id_comercio}/imagen`,
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
      setComercio({ ...comercio, ...shopFormData, imagen: imagenPreview });
      setImagenFile(null);
      setShowShopForm(false);
    } catch (error) {
      toast.error(error.message || "Error al actualizar el comercio");
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (!user) return null;

  return (
    <div className="min-h-screen bg-base-100 py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <ProfileHeader user={user} onLogout={handleLogout} />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {user.rol === "dueño" ? (
            <>
              <OwnerSection
                comercio={comercio}
                showFavorites={showFavorites}
                setShowFavorites={setShowFavorites}
                showValoraciones={showValoraciones}
                setShowValoraciones={setShowValoraciones}
                setShowShopForm={setShowShopForm}
                promedioValoraciones={promedioValoraciones}
                fetchValoracionesDueño={fetchValoracionesDueño}
                toast={toast}
              />

              {/* DESPLEGABLES */}
              <AnimatePresence>
                {showFavorites && (
                  <FavoritesDropdown
                    loadingFavs={loadingFavs}
                    favShops={favShops}
                    favProducts={favProducts}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showValoraciones && (
                  <RatingsDropdown
                    loadingValoraciones={loadingValoraciones}
                    valoraciones={valoraciones}
                    promedioValoraciones={promedioValoraciones}
                    userRol={user.rol}
                  />
                )}
              </AnimatePresence>

              {/* BLOQUE EDITAR COMERCIO */}
              <div className="md:col-span-3 bg-base-200 rounded-[2.5rem] p-8 shadow-sm border border-base-300">
                <div
                  onClick={() => {
                    if (comercio) {
                      setShowShopForm(!showShopForm);
                    } else {
                      toast.warning("Aún no has registrado un comercio.");
                    }
                  }}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center group-hover:bg-jungle_teal/20">
                      <Store className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">
                        Editar mi comercio
                      </h2>
                      <p className="text-base-content/60 text-sm">
                        Modifica tus datos
                      </p>
                    </div>
                  </div>
                  {!comercio && (
                    <span className="badge badge-warning">Sin comercio</span>
                  )}
                </div>

                <AnimatePresence>
                  {showShopForm && comercio && (
                    <ShopEditForm
                      shopFormData={shopFormData}
                      setShopFormData={setShopFormData}
                      imagenPreview={imagenPreview}
                      imagenFile={imagenFile}
                      setImagenFile={setImagenFile}
                      setImagenPreview={setImagenPreview}
                      onLocationSelect={handleLocationSelect}
                      onImageChange={handleImagenChange}
                      onSubmit={handleShopSubmit}
                      onCancel={() => setShowShopForm(false)}
                      toast={toast}
                    />
                  )}
                </AnimatePresence>
              </div>

            </>
          ) : (
            // BLOQUE USUARIO = CLIENTE
            <>
              <ClientSection
                showFavorites={showFavorites}
                setShowFavorites={setShowFavorites}
                showValoraciones={showValoraciones}
                setShowValoraciones={setShowValoraciones}
                fetchValoracionesCliente={fetchValoracionesCliente}
              />

              <AnimatePresence>
                {showFavorites && (
                  <FavoritesDropdown
                    loadingFavs={loadingFavs}
                    favShops={favShops}
                    favProducts={favProducts}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showValoraciones && (
                  <RatingsDropdown
                    loadingValoraciones={loadingValoraciones}
                    valoraciones={valoraciones}
                    userRol={user.rol}
                  />
                )}
              </AnimatePresence>
            </>
          )}
        </section>

        {/* AJUSTES DE CUENTA (COMÚN) */}
        <ProfileSettings
          user={user}
          setUser={setUser}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />
      </div>
    </div>
  );
};
