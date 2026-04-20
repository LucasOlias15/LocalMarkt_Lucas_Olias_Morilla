import { useState, useRef, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Info } from "lucide-react";

// ICONO PERSONALIZADO (Mismo estilo que tu MapPage pero en Jungle Teal puro)
const pickerIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-12 h-12 hover:scale-110 transition-transform -mt-6 -ml-6">
      <div class="absolute w-8 h-8 rounded-full shadow-xl border-4 border-white bg-jungle_teal"></div>
      <div class="absolute w-3 h-3 bg-white rounded-full shadow-inner"></div>
    </div>
  `,
  className: "border-none bg-transparent",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// COMPONENTE INVISIBLE PARA MOVER LA CÁMARA
const MapUpdater = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 18, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

// ==========================================
// COMPONENTE PRINCIPAL
// Recibe una prop clave: onLocationSelect (función para avisar al padre)
// ==========================================
export const LocationPicker = ({ onLocationSelect, onError, initialCoords = null }) => {
  // ESTADOS
  const [actualCoords, setActualCoords] = useState(initialCoords);
  const [ubicacionIntroducida, setUbicacionIntroducida] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const markerRef = useRef(null);

  // Centro por defecto (Ej: Centro de España) si no hay coordenadas previas
  const defaultCenter = [40.4168, -3.7038]; 

  // 1. LÓGICA DE BÚSQUEDA (Geocodificación)
  const gestionaBusqueda = async (e) => {
    if (e) e.preventDefault();
    if (!ubicacionIntroducida.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ubicacionIntroducida)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const nuevaUbicacion = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        setActualCoords(nuevaUbicacion);
        
        // ¡AVISAMOS AL PADRE DE LAS NUEVAS COORDENADAS!
        if (onLocationSelect) onLocationSelect(nuevaUbicacion);
      } else {
        if (onError) {
          onError("No hemos podido encontrar esa dirección. Prueba a añadir la ciudad.");
        }
      }
    } catch (error) {
      console.error("Error buscando la dirección:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // 2. LÓGICA DE ARRASTRE DEL PIN (Drag & Drop)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const position = marker.getLatLng();
          const nuevasCoords = { lat: position.lat, lng: position.lng };
          
          setActualCoords(nuevasCoords);
          
          // ¡AVISAMOS AL PADRE DE LAS COORDENADAS AJUSTADAS!
          if (onLocationSelect) onLocationSelect(nuevasCoords);
        }
      },
    }),
    [onLocationSelect]
  );

  return (
    <div className="flex flex-col gap-4 w-full bg-base-100 p-6 rounded-3xl border border-base-200 shadow-lg">
      
      {/* CABECERA: Título y Buscador */}
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-base-content text-lg flex items-center gap-2">
          <MapPin className="text-jungle_teal" size={20} />
          Ubicación del Local
        </h3>
        
        <div className="flex gap-2 relative">
          <input
            type="text"
            placeholder="Ej. Calle Sierpes 12, Sevilla"
            className="input input-bordered w-full bg-base-200 focus:bg-base-100 focus:border-jungle_teal transition-colors"
            value={ubicacionIntroducida}
            onChange={(e) => setUbicacionIntroducida(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); 
                gestionaBusqueda();
              }
            }}
          />
          <button 
            type="button" 
            onClick={gestionaBusqueda} 
            disabled={isSearching}
            className="btn bg-jungle_teal text-white hover:bg-teal-700 border-none"
          >
            {isSearching ? <span className="loading loading-spinner loading-sm"></span> : <Search size={18} />}
            Buscar
          </button>
        </div>
      </div>

      {/* EL MAPA DE LEAFLET */}
      <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-inner border-2 border-base-200/50 bg-base-200 z-0">
        <MapContainer
          center={actualCoords ? [actualCoords.lat, actualCoords.lng] : defaultCenter}
          zoom={actualCoords ? 18 : 4} // Zoom lejano si no hay coords, cerca si las hay
          zoomControl={true}
          className="w-full h-full z-0" // z-0 para no tapar los menús desplegables del padre
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          
          {/* Este componente mueve la cámara cuando buscamos una dirección */}
          <MapUpdater coords={actualCoords} />

          {/* Solo dibujamos el pin si tenemos coordenadas */}
          {actualCoords && (
            <Marker
              draggable={true}
              eventHandlers={eventHandlers}
              position={[actualCoords.lat, actualCoords.lng]}
              ref={markerRef}
              icon={pickerIcon}
            />
          )}
        </MapContainer>

        {/* TOOLTIP EXPLICATIVO FLOTANTE */}
        {actualCoords && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-jungle_teal/20 flex items-center gap-1 text-xs font-medium animate-fade-in-down">
            <Info size={16} className="text-jungle_teal" />
            <span className="text-gray-700">Puedes arrastrar el pin para ajustar la puerta exacta</span>
          </div>
        )}
      </div>

      {/* FOOTER: Coordenadas Capturadas (Solo visual, para dar feedback al usuario) */}
      <div className="flex justify-between items-center text-sm font-medium text-base-content/60 px-2">
        <span>Coordenadas exactas:</span>
        {actualCoords ? (
          <span className="text-jungle_teal bg-jungle_teal/10 px-3 py-1 rounded-lg">
            {actualCoords.lat.toFixed(5)}, {actualCoords.lng.toFixed(5)}
          </span>
        ) : (
          <span className="italic">Esperando búsqueda...</span>
        )}
      </div>
      
    </div>
  );
};