import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearch, useLocation } from "wouter";
import { IconTicker } from "../components/IconTicker";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { obtenerTodosLosComercios } from "../services/ComerceService";
import { HeartPlus, MapPinCheck, MapPinned, MapPlus, Search } from "lucide-react";
import { renderToString } from "react-dom/server";

/* ---------------- ICONOS DEL MAPA (DEL ARCHIVO 2) ---------------- */
const categoryColors = {
  "Panadería": "#facc15",
  "Frutería": "#10b981",
  "Carnicería": "#ef4444",
  "Bio": "#84cc16",
  "Textiles y moda": "#9966CC",     // <-- Cambiado a 'moda'
  "Artesanía y regalos": "#468FEA", // <-- Cambiado a 'regalos'
  "default": "#0d9488"
};

// Componente visual del pin (burbuja de color)
const MapPin = ({ type }) => {
  const color = categoryColors[type] || categoryColors.default;
  return (
    <div className="relative flex items-center justify-center w-12 h-12 hover:scale-110 transition-transform">
      <div
        className="absolute w-8 h-8 rounded-full shadow-xl border-4 border-white"
        style={{ background: color }}
      />
      <div className="absolute w-3 h-3 bg-white rounded-full shadow-inner" />
    </div>
  );
};

// Generador del icono de Leaflet usando el componente MapPin
const customIcon = (type) =>
  L.divIcon({
    html: renderToString(<MapPin type={type} />),
    className: "border-none bg-transparent",
    iconSize: [48, 48],
    iconAnchor: [24, 24] // Centrado perfecto para que la punta coincida con las coordenadas
  });

// Componente invisible que controla el movimiento y zoom del mapa
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

/* =========================================================================
   COMPONENTE PRINCIPAL: MapPage
   ========================================================================= */
export const MapPage = () => {
  // --- Estados del Mapa ---
  const [mapCenter, setMapCenter] = useState([37.978, 12.961]);
  const [zoomLevel, setZoomLevel] = useState(15);

  // --- Estados de Datos ---
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [filter, setFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);

  // --- Estado del Buscador ---
  const [localSearch, setLocalSearch] = useState("");
  const [, setLocation] = useLocation(); // Hook de Wouter para redireccionar

  // --- Lectura de la URL ---
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  // Combinamos la búsqueda de la URL con la búsqueda local en vivo
  const searchQuery = searchParams.get("search")?.toLowerCase() || localSearch.toLowerCase();

  /* ---------------- CARGA INICIAL DE DATOS ---------------- */
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      const data = await obtenerTodosLosComercios();

      // Formateamos los datos para que el mapa los entienda fácilmente
      const mapped = data.map((c) => ({
        id: c.id_comercio,
        name: c.nombre,
        type: c.categoria || "General",
        coords: [c.latitud || 37.978, c.longitud || 12.961],
        img: c.imagen || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400"
      }));

      setShops(mapped);

      // Centramos el mapa en la primera tienda si no hay una búsqueda activa
      if (mapped.length > 0 && !searchQuery) {
        setMapCenter(mapped[0].coords);
      }

      setLoading(false);
    };

    cargar();
  }, []); // El array vacío asegura que esto solo se ejecute una vez al entrar a la página

  /* ---------------- EVENTO DEL BUSCADOR ---------------- */
  const handleSearch = (e) => {
    e.preventDefault(); // Evita que la página se recargue
    if (localSearch.trim()) {
      // Redirigimos a la página de explorar enviando lo escrito en la URL
      setLocation(`/explorar?search=${encodeURIComponent(localSearch)}`);
    }
  };

  /* ---------------- PANTALLA DE CARGA ---------------- */
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-ring loading-lg text-jungle_teal"></span>
      </div>
    );
  }

  /* ---------------- LÓGICA DE FILTRADO (CATEGORÍAS + BUSCADOR) ---------------- */
  const filteredShops = shops.filter((shop) => {
    const matchesFilter = filter === "Todos" || shop.type === filter;
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery) ||
      shop.type.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  /* ---------------- GEOLOCALIZACIÓN ---------------- */
  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada en este navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setMapCenter([latitude, longitude]);
      setZoomLevel(17);
    }, () => {
      alert("No se pudo obtener tu ubicación. Revisa los permisos.");
    });
  };

  /* ---------------- FUNCIONES DE ZOOM ---------------- */
  const zoomIn = () => setZoomLevel((z) => Math.min(z + 1, 18)); // Límite máximo
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 1, 5)); // Límite mínimo

  return (
    <div className="w-full min-h-screen bg-base-100 pb-10">

     {/* ---------------- HERO ---------------- */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-16 pt-16 pb-16 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        
        {/* TEXTO PRINCIPAL */}
        <div className="w-full lg:w-3/5 text-center lg:text-left z-10">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-base-content leading-tight tracking-tighter"
          >
            Comercios <br className="hidden md:block" />
            cerca de ti <br className="hidden md:block" />
            a un <span className="text-transparent bg-clip-text bg-linear-to-r from-jungle_teal to-sea_green pb-2 inline-block">click.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-base-content/60 font-medium max-w-md mx-auto lg:mx-0"
          >
            Encuentra pan fresco, fruta de temporada y los mejores servicios a menos de 10 minutos de tu casa.
          </motion.p>
        </div>

        {/* TARJETA DE BÚSQUEDA */}
       <div className="w-full lg:w-2/5 relative flex justify-center lg:justify-end mt-8 lg:mt-0">
          
          {/* Efecto de luz de fondo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-jungle_teal/20 rounded-full blur-[80px] -z-10 animate-pulse"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-base-200/95 backdrop-blur-2xl border border-base-300 shadow-2xl rounded-[2.5rem] p-8 max-w-sm w-full relative z-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full border-4 border-base-200 bg-jungle_teal text-white flex items-center justify-center font-bold text-xl shadow-md">
                +12
              </div>
              <p className="font-bold text-base-content leading-tight">Tiendas activas<br/>en tu zona</p>
            </div>
            
            <form onSubmit={handleSearch} className="relative flex items-center bg-base-100 rounded-full shadow-inner border border-jungle_teal/70 focus-within:border-yellow-400 overflow-hidden transition-colors duration-300">
              <input 
                type="text" 
                value={localSearch} 
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="¿Qué buscas hoy?" 
                className="w-full bg-transparent py-4 px-6 text-base-content outline-none placeholder:text-base-content/40 font-medium"
              />
              <button 
                type="submit"
                className="btn btn-circle bg-jungle_teal hover:bg-teal-700 text-white border-none mr-2 min-h-0 h-10 w-10 flex items-center justify-center transition-transform active:scale-95"
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </form>

          </motion.div>
        </div>
      </section>

      {/* ---------------- RIBBON (ESTILO ORIGINAL) ---------------- */}
      <section className="w-full relative py-20 overflow-hidden flex items-center justify-center">
        <div className="map-ribbon-main w-[110vw] h-20 shadow-1xl flex items-center -rotate-2 z-11 transition-colors bg-jungle_teal">
          <IconTicker />
        </div>
        <div className="map-ribbon-bg absolute w-[110vw] h-20 rotate-2 z-10 opacity-30 blur-[6px] bg-yellow-400"></div>
      </section>

      {/* ---------------- MAPA (ESTILO Y LÓGICA)  ---------------- */}
      <section className="w-full max-w-7xl mx-auto px-6 mb-10 mt-20">
        
        {/* TÍTULO DEL MAPA */}
       <div className="flex flex-col items-center justify-center mb-20 text-center ">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-black text-base-content flex items-center justify-center gap-4 pb-2"
          >
            Mapa interactivo
            <span className="text-sea_green flex items-center">
              <MapPinned size={48} strokeWidth={2.5} />
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base-content/60 font-medium text-lg max-w-xl mt-2"
          >
            Navega por el mapa, filtra por categorías y descubre los comercios que tienes a la vuelta de la esquina.
          </motion.p>
        </div>

        <div className="relative w-full h-175 rounded-[3rem] overflow-hidden shadow-2xl bg-base-200">

          {/* FILTROS FLOTANTES SOBRE EL MAPA */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-11 w-full max-w-md px-4">
            <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-xl flex gap-2 overflow-x-auto 
              [&::-webkit-scrollbar]:h-1.5 
              [&::-webkit-scrollbar-track]:bg-transparent 
              [&::-webkit-scrollbar-thumb]:bg-gray-300 
              [&::-webkit-scrollbar-thumb]:rounded-full 
              hover:[&::-webkit-scrollbar-thumb]:bg-jungle_teal/50 
              pb-3"
            >
              {["Todos", "Frutería", "Panadería", "Carnicería", "Bio", "Textiles y moda", "Artesanía y regalos"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                  ${filter === cat 
                    ? "bg-jungle_teal text-white shadow-md shadow-jungle_teal/30" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <MapContainer
            center={mapCenter}
            zoom={zoomLevel}
            zoomControl={false}
            className="w-full h-full z-10"
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <MapController center={mapCenter} zoom={zoomLevel} />

            {/* Renderizado de los marcadores en el mapa */}
            {filteredShops.map((shop) => (
              <Marker
                key={shop.id}
                position={shop.coords}
                icon={customIcon(shop.type)}
                eventHandlers={{
                  click: () => {
                    setSelectedShop(shop); // Abre la tarjeta flotante
                    setMapCenter(shop.coords); // Centra la cámara
                  }
                }}
              />
            ))}
          </MapContainer>

          {/* CONTROLES DE ZOOM Y GEOLOCALIZACIÓN */}
          <div className="absolute right-6 top-24 flex flex-col gap-3 z-11">
            <button
              onClick={handleGeoLocation}
              className="w-12 h-12 rounded-xl bg-jungle_teal text-white shadow-lg hover:scale-110 transition flex items-center justify-center"
              title="Mi ubicación"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </button>

            <button
              onClick={zoomIn}
              className="w-12 h-12 rounded-xl bg-white shadow-lg text-2xl font-bold flex items-center justify-center text-gray-700 hover:bg-gray-50 transition"
            >
              +
            </button>

            <button
              onClick={zoomOut}
              className="w-12 h-12 rounded-xl bg-white shadow-lg text-2xl font-bold flex items-center justify-center text-gray-700 hover:bg-gray-50 transition"
            >
              −
            </button>
          </div>

          {/* LEYENDA DEL MAPA */}
          <div className="absolute bottom-6 left-6 z-11 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 space-y-2 text-sm font-medium">
            {Object.entries(categoryColors).map(([cat, color]) => {
              if (cat === "default") return null;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ background: color }} />
                  <span className="text-gray-700">{cat}</span>
                </div>
              )
            })}
          </div>

          {/* TARJETA DE INFORMACIÓN DEL COMERCIO FLOTANTE */}
          <AnimatePresence>
            {selectedShop && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="absolute bottom-6 right-6 w-87.5 bg-white p-6 rounded-3xl shadow-2xl z-11"
              >
                <img
                  src={selectedShop.img}
                  className="w-full h-32 object-cover rounded-xl mb-4"
                />
                <h3 className="text-xl font-black text-gray-800">
                  {selectedShop.name}
                </h3>
                <p className="text-xs text-jungle_teal font-bold uppercase tracking-wide mb-4 mt-1">
                  {selectedShop.type}
                </p>
                <Link
                  href={`/tienda/${selectedShop.id}`}
                  className="btn btn-sm w-full bg-jungle_teal hover:bg-teal-700 text-white border-none rounded-xl"
                >
                  Entrar ➔
                </Link>
                <button
                  onClick={() => setSelectedShop(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition flex items-center justify-center w-8 h-8 rounded-full bg-base-200"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* ---------------- SECCIÓN DE CARACTERÍSTICAS (Explora tu barrio) ---------------- */}
      <section className="py-12 md:py-16 px-4 max-w-7xl mx-auto w-full">
    
    <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black  pb-2 inline-block">
            Explora tu <strong className="text-transparent bg-clip-text bg-gradient-to-r from-bright_fern to-jungle_teal">barrio</strong>
        </h2>
        <p className="text-base-content/70 mt-4 max-w-2xl mx-auto text-lg font-medium">
          Recorre nuestras calles digitales para encontrar los mejores productos de proximidad. Todo lo que necesitas está mucho más cerca de lo que imaginas.        
        </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TARJETA 1 - Ubicación (Jungle Teal) */}
        <div className="bg-base-200/50 rounded-3xl p-8 border border-base-300 hover:border-jungle_teal/30 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-jungle_teal text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPinCheck/>
            </div>
            <h3 className="text-xl font-bold text-base-content mb-3">Encuentra lo más cercano</h3>
            <p className="text-base-content/60">Localiza tiendas, panaderías y mercados a pocos pasos de tu ubicación actual.</p>
        </div>

        {/* TARJETA 2 - Variedad (Yellow) */}
        <div className="bg-base-200/50 rounded-3xl p-8 border border-base-300 hover:border-yellow-400/50 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-yellow-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <MapPlus/>
            </div>
            <h3 className="text-xl font-bold text-base-content mb-3">Gran variedad local</h3>
            <p className="text-base-content/60">Filtra rápidamente por categorías para encontrar exactamente lo que necesitas hoy.</p>
        </div>

        {/* TARJETA 3 - Comunidad (Sea Green) */}
        <div className="bg-base-200/50 rounded-3xl p-8 border border-base-300 hover:border-sea_green/40 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-sea_green text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HeartPlus/>
            </div>
            <h3 className="text-xl font-bold text-base-content mb-3">Apoya tu comunidad</h3>
            <p className="text-base-content/60">Cada compra fortalece la economía de tu barrio y fomenta el comercio sostenible.</p>
        </div>

    </div>
</section>
    </div>
  );
};