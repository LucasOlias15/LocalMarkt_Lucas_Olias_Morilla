import { motion } from 'framer-motion';
import { useState } from 'react'; // 1. Añadimos el estado
import { useLocation } from 'wouter'; // 2. Añadimos la navegación

export const HeroSection = () => {
  // --- LÓGICA DE BÚSQUEDA ---
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/explorar?search=${encodeURIComponent(query)}`)
    }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
      
{/* --- EFECTO AURORA BOREAL INFINITA --- */}
      <motion.div 
        className="absolute top-[-10%] left-[-50%] w-[200vw] h-[150%] pointer-events-none -z-10 blur-[100px] opacity-60 dark:opacity-40 bg-[linear-gradient(110deg,transparent_0%,rgba(0,163,136,0.3)_25%,rgba(234,179,8,0.2)_50%,rgba(0,163,136,0.3)_75%,transparent_100%)] bg-[length:200%_100%]"
        animate={{
          backgroundPosition: ["200% 0%", "0% 0%"],
        }}
        transition={{
          duration: 25,
          ease: "linear",
          repeat: Infinity,
        }}
      />

      {/* Píldora animada */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="badge badge-outline border-jungle_teal text-jungle_teal font-semibold px-4 py-3 mb-8 gap-2 shadow-sm backdrop-blur-sm bg-base-100/50"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jungle_teal opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-jungle_teal"></span>
        </span>
        Más de 50 comercios locales unidos
      </motion.div>

      {/* Título: CORREGIDO bg-gradient-to-r */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight text-base-content mb-6 drop-shadow-sm"
      >
        El mercado de tu barrio, <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-jungle_teal to-yellow-500">
          ahora en digital.
        </span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="text-lg md:text-xl text-base-content/70 max-w-2xl mb-12"
      >
        Apoya al comercio local sin moverte de casa. Productos frescos, artesanía y servicios a un clic de distancia.
      </motion.p>

      {/* Buscador: Envuelto en un <form> para que funcione con la tecla Enter */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6, type: "spring", stiffness: 200 }}
        className="w-full max-w-2xl relative group z-10"
      >
        <div className="absolute -inset-1 bg-linear-to-r from-jungle_teal to-yellow-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        <form onSubmit={handleSearch} className="relative flex items-center bg-base-100 rounded-full shadow-xl border border-base-200 overflow-hidden backdrop-blur-md">
          <div className="pl-6 text-jungle_teal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué estás buscando hoy?" 
            className="w-full bg-transparent py-5 px-4 text-base-content outline-none placeholder:text-base-content/40"
          />
          
          <button 
            type="submit"
            className="btn bg-jungle_teal hover:bg-jungle_teal/90 text-white border-none rounded-full px-8 mr-2 h-12 min-h-0 transition-transform active:scale-95"
          >
            Buscar
          </button>
        </form>
      </motion.div>
    </section>
  );
};