import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LocateFixed } from 'lucide-react';

export const FloatingMapButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [location] = useLocation(); 

  if (location === '/mapa') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, y: 20, transition: { duration: 0.2 } }}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-100"
        >
          <div className="relative group flex items-center justify-center w-12 h-12 md:w-14 md:h-14">
            
            {/* Botón de cerrar (X) */}
            <button 
              onClick={() => setIsVisible(false)}
              // CAMBIOS AQUÍ:
              // 1. md:opacity-0 -> Oculto por defecto solo en PC. En móvil siempre se ve (opacity-100 implícito)
              // 2. md:pointer-events-none -> En PC no se puede clicar si no se ve.
              // 3. group-hover:pointer-events-auto -> Al pasar el ratón se vuelve clicable.
              className="absolute -top-2 -right-2 z-20 bg-base-100 text-base-content hover:bg-error hover:text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-md border border-base-300 transition-all md:opacity-0 group-hover:opacity-100 md:scale-75 group-hover:scale-100 cursor-pointer md:pointer-events-none group-hover:pointer-events-auto"
              title="Ocultar mapa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Botón principal del mapa */}
            <Link href="/mapa">
              <button className="relative z-10 w-10 h-10 md:w-11 md:h-11 bg-jungle_teal text-white rounded-full flex items-center justify-center shadow-lg shadow-jungle_teal/30 border border-white/10 transition-transform duration-300 group-hover:scale-110 cursor-pointer">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-4 h-4 md:w-5 md:h-5" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </button>
            </Link>
            
            {/* Tooltip */}
            {/* CAMBIOS AQUÍ: En móvil ocultamos el tooltip con hidden md:block porque en táctil no tiene sentido un tooltip al vuelo */}
            <span className="hidden md:block absolute -top-10 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 whitespace-nowrap bg-base-100 text-base-content text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none border border-base-200">
               Cerca de mí
            </span>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};