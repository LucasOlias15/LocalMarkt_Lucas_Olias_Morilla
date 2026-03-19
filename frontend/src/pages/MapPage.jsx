import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearch } from "wouter";
import { IconTicker } from "../components/IconTicker";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { obtenerTodosLosComercios } from "../services/ComerceService";
import { renderToString } from "react-dom/server";

/* ---------------- ICONOS DEL MAPA (DEL ARCHIVO 2) ---------------- */
const categoryColors = {
  "Panadería": "#facc15",
  "Frutería": "#10b981",
  "Carnicería": "#ef4444",
  "Bio": "#84cc16",
  "default": "#0d9488"
};

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

const customIcon = (type) =>
  L.divIcon({
    html: renderToString(<MapPin type={type} />),
    className: "border-none bg-transparent",
    iconSize: [48, 48],
    iconAnchor: [24, 24] // Centrado perfecto
  });


const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

export const MapPage = () => {
  //  Estado inicial 
  const [mapCenter, setMapCenter] = useState([37.978, 12.961]);
  const [zoomLevel, setZoomLevel] = useState(15);

  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [filter, setFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);

  // Variable de estado temporal para conectar el buscador de la UI
  const [localSearch, setLocalSearch] = useState("");

  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const searchQuery = searchParams.get("search")?.toLowerCase() || localSearch.toLowerCase();

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      const data = await obtenerTodosLosComercios();

      const mapped = data.map((c) => ({
        id: c.id_comercio,
        name: c.nombre,
        type: c.categoria || "General",
        coords: [c.latitud || 37.978, c.longitud || 12.961],
        img: c.imagen || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400"
      }));

      setShops(mapped);

      // Si no hay búsqueda, centramos el mapa en la primera tienda que cargue de la base de datos
      if (mapped.length > 0 && !searchQuery) {
        setMapCenter(mapped[0].coords);
      }

      setLoading(false);
    };

    cargar();
  }, []); // Solo se ejecuta al montar

  /* ---------------- BUSCADOR ---------------- */
  useEffect(() => {
    if (searchQuery && shops.length > 0) {
      const found = shops.find(
        (s) =>
          s.name.toLowerCase().includes(searchQuery) ||
          s.type.toLowerCase().includes(searchQuery)
      );

      if (found) {
        setMapCenter(found.coords);
        setZoomLevel(17);
      }
    }
  }, [searchQuery, shops]);

  /* ---------------- PANTALLA DE CARGA PREVENIENDO ERROR DE HOOKS ---------------- */
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-ring loading-lg text-jungle_teal"></span>
      </div>
    );
  }

  /* ---------------- FILTROS ---------------- */
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

  /* ---------------- ZOOM ---------------- */
  const zoomIn = () => setZoomLevel((z) => Math.min(z + 1, 18));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 1, 5));

  return (
    <div className="w-full min-h-screen bg-base-100 pb-10">

      {/* ---------------- HERO (ESTILO ORIGINAL ARCHIVO 1) ---------------- */}
      <section className="w-full max-w-7xl mx-auto px-8 md:px-16 pt-32 pb-16 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
        <div className="w-full lg:w-3/5 text-left z-10">
          <motion.h1
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black text-base-content leading-[1.05] tracking-tighter"
          >
            Comercios <br />
            cerca de ti <br />
            a un <span className="text-transparent bg-clip-text bg-linear-to-r from-jungle_teal to-sea_green-500 pb-2 inline-block">click.</span>
          </motion.h1>
          <motion.p className="mt-6 text-xl text-base-content/60 font-medium max-w-md">
            Encuentra pan fresco, fruta de temporada y los mejores servicios a menos de 10 minutos de tu casa.
          </motion.p>
        </div>

        <div className="w-full lg:w-2/5 relative flex justify-center lg:justify-end">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-jungle_teal/20 rounded-full blur-[80px] -z-10 animate-pulse"></div>
          <motion.div className="bg-base-100/60 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[2.5rem] p-8 max-w-sm w-full relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full border-4 border-base-100 bg-jungle_teal text-white flex items-center justify-center font-bold">+120</div>
              <p className="font-bold text-base-content">Tiendas activas en tu zona</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej: Panadería..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-base-200/80 px-6 py-4 rounded-2xl focus:outline-none text-base-content placeholder:text-base-content/50"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- RIBBON (ESTILO ORIGINAL ARCHIVO 1) ---------------- */}
      <section className="w-full relative py-20 overflow-hidden flex items-center justify-center">
        <div className="map-ribbon-main w-[110vw] h-20 shadow-2xl flex items-center -rotate-2 z-20 transition-colors bg-jungle_teal">
          <IconTicker />
        </div>
        <div className="map-ribbon-bg absolute w-[110vw] h-20 rotate-2 z-10 opacity-30 blur-[6px] bg-yellow-400"></div>
      </section>

      {/* ---------------- MAPA (ESTILO Y LÓGICA ARCHIVO 2) ---------------- */}
      <section className="w-full max-w-7xl mx-auto px-6 mb-10 mt-20">
        <div className="relative w-full h-175 rounded-[3rem] overflow-hidden shadow-2xl bg-base-200">

          {/* FILTROS */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-100 w-full max-w-md px-4">
            <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-xl flex gap-2 overflow-x-auto no-scrollbar">
              {["Todos", "Frutería", "Panadería", "Carnicería", "Bio"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                  ${filter === cat ? "bg-jungle_teal text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
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

            {filteredShops.map((shop) => (
              <Marker
                key={shop.id}
                position={shop.coords}
                icon={customIcon(shop.type)}
                eventHandlers={{
                  click: () => {
                    setSelectedShop(shop);
                    setMapCenter(shop.coords);
                  }
                }}
              />
            ))}
          </MapContainer>

          {/* CONTROLES */}
          <div className="absolute right-6 top-24 flex flex-col gap-3 z-100">            <button
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

          {/* LEYENDA */}
          <div className="absolute bottom-6 left-6 z-100 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 space-y-2 text-sm font-medium">
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

          {/* TARJETA COMERCIO */}
          <AnimatePresence>
            {selectedShop && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="absolute bottom-6 right-6 w-87.5 bg-white p-6 rounded-3xl shadow-2xl z-100"
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
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      <section className="py-12 md:py-16 px-4 max-w-7xl mx-auto w-full">
    
    <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-bright_fern to-jungle_teal pb-2 inline-block">
            Explora tu barrio
        </h2>
        <p className="text-base-content/70 mt-4 max-w-2xl mx-auto text-lg font-medium">
            Navega por el mapa interactivo y descubre los tesoros que los comerciantes locales tienen preparados para ti, a la vuelta de la esquina.
        </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TARJETA 1 - Ubicación (Jungle Teal) */}
        <div className="bg-base-200/50 rounded-3xl p-8 border border-base-300 hover:border-jungle_teal/30 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-jungle_teal text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-base-content mb-3">Encuentra lo más cercano</h3>
            <p className="text-base-content/60">Localiza tiendas, panaderías y mercados a pocos pasos de tu ubicación actual.</p>
        </div>

        {/* TARJETA 2 - Variedad (Yellow) */}
        <div className="bg-base-200/50 rounded-3xl p-8 border border-base-300 hover:border-yellow-400/50 hover:shadow-lg transition-all group">
            {/* Usamos text-yellow-900 para asegurar el contraste sobre el fondo amarillo */}
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-yellow-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-base-content mb-3">Gran variedad local</h3>
            <p className="text-base-content/60">Filtra rápidamente por categorías para encontrar exactamente lo que necesitas hoy.</p>
        </div>

        {/* TARJETA 3 - Comunidad (Sea Green) */}
        <div className="bg-base-200/50 rounded-3xl p-8 border border-base-300 hover:border-sea_green/40 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-sea_green text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-base-content mb-3">Apoya tu comunidad</h3>
            <p className="text-base-content/60">Cada compra fortalece la economía de tu barrio y fomenta el comercio sostenible.</p>
        </div>

    </div>
</section>
    </div>
  );
};