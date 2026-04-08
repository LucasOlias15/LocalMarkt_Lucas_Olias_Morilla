import { useEffect } from "react";
import { useLocation } from "wouter";

export const ScrollToTop = () => {
  const [location] = useLocation(); // wouter nos chiva en qué ruta estamos

  useEffect(() => {
    // Cada vez que 'location' cambia, obligamos a la ventana a ir a las coordenadas 0, 0 (arriba del todo)
    window.scrollTo(0, 0);
  }, [location]);

  return null; // Este componente es invisible, no pinta nada en pantalla
};