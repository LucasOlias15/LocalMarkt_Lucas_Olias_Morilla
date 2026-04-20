import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: "Carmen R.",
    role: "Vecina del barrio",
    text: "Por fin puedo comprar la fruta fresca de la frutería de Paco sin tener que salir corriendo del trabajo. ¡Una iniciativa maravillosa!",
    rating: "⭐⭐⭐⭐⭐",
    color: "bg-jungle_teal text-white"
  },
  {
    id: 2,
    name: "Panadería El Horno",
    role: "Vendedor local",
    text: "Desde que estamos en LocalMarkt, hemos duplicado las ventas de nuestros panes de masa madre los fines de semana. La plataforma es facilísima de usar.",
    rating: "⭐⭐⭐⭐⭐",
    color: "bg-yellow-400 text-jungle_teal-200"
  },
  {
    id: 3,
    name: "Miguel A.",
    role: "Comprador habitual",
    text: "Descubrí una tienda de quesos artesanales a 3 calles de mi casa que no conocía. El envío fue súper rápido y el producto espectacular.",
    rating: "⭐⭐⭐⭐⭐",
    color: "bg-sea_green text-white"
  },
  {
    id: 4,
    name: "Laura G.",
    role: "Amante de lo eco",
    text: "Poder apoyar al pequeño comercio desde el móvil me encanta. Además, la atención al cliente de las tiendas es súper cercana, nada que ver con grandes cadenas.",
    rating: "⭐⭐⭐⭐⭐",
    color: "bg-base-200 text-base-content"
  }
];

export const TestimonialsStack = () => {
  const [cards, setCards] = useState(testimonials);

  const handleNext = () => {
    setCards((prev) => {
      const newArray = [...prev];
      const firstCard = newArray.shift();
      newArray.push(firstCard);
      return newArray;
    });
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Lado Izquierdo: Título y Contexto */}
        <div className="flex-1 text-center lg:text-left z-10 w-full">
          <h2 className="text-4xl md:text-5xl font-black text-base-content mb-6 leading-tight">
            El corazón de <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-jungle_teal to-sea_green">
              nuestro barrio.
            </span>
          </h2>
          <p className="text-base-content/70 text-lg mb-8 max-w-md mx-auto lg:mx-0">
            No lo decimos nosotros, lo dicen los vecinos y comerciantes que ya forman parte de la familia LocalMarkt.
          </p>
          
          <button 
            onClick={handleNext}
            className="btn btn-outline border-base-300 text-base-content hover:bg-jungle_teal hover:text-white hover:border-jungle_teal rounded-full px-8 transition-all hover:scale-105"
          >
            Siguiente opinión ➔
          </button>
        </div>

        {/* Lado Derecho: La Baraja de Cartas (Stack) */}
        {/* ✨ AQUÍ ESTÁ LA MAGIA: h-[400px] fuerza al contenedor a tener altura real ✨ */}
        <div className="flex-1 relative w-full min-h-100 lg:min-h-112.5 flex justify-center items-center perspective-1000 pl-0 lg:pl-16 mt-8 lg:mt-0">
          <AnimatePresence mode="popLayout">
            {cards.map((testimonial, index) => {
              if (index > 2) return null;

              return (
                <motion.div
                  key={testimonial.id}
                  layout
                  // 1. ESTADO INICIAL (cuando la carta entra por detrás)
                  initial={{ opacity: 0, scale: 0.8, x: -50, y: 50 }}
                  
                  // 2. POSICIÓN DE LAS CARTAS APILADAS
                  animate={{ 
                    opacity: 1 - index * 0.15,
                    scale: 1 - index * 0.04,
                    x: -index * 15, // Ajustado para que no se salga tanto en móvil
                    y: index * 20,  
                    zIndex: cards.length - index 
                  }}
                  
                  // 3. ANIMACIÓN DE SALIDA
                  exit={{ 
                    opacity: 0, 
                    scale: 0.9, 
                    x: 300, 
                    y: -50, 
                    rotate: 10, 
                    transition: { duration: 0.3, ease: "easeOut" } 
                  }}
                  
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={index === 0 ? handleNext : undefined}
                  className={`absolute w-[90%] max-w-md p-6 md:p-8 rounded-3xl shadow-2xl cursor-pointer select-none border border-white/10 backdrop-blur-md ${testimonial.color}`}
                  style={{ transformOrigin: 'top center' }}
                >
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="text-4xl opacity-50 leading-none">❝</div>
                    <div className="text-xs md:text-sm font-black tracking-widest">{testimonial.rating}</div>
                  </div>
                  
                  <p className="text-base md:text-lg lg:text-xl font-medium mb-6 md:mb-8 leading-relaxed">
                    {testimonial.text}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/10 flex items-center justify-center font-bold text-base md:text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm md:text-base">{testimonial.name}</h4>
                      <p className="text-xs md:text-sm opacity-70">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};