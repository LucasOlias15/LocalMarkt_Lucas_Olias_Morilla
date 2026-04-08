import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "../store/useCartStore";
import { ChevronLeft, ChevronRight, ShoppingBasket, Store } from "lucide-react";
import { Link } from "wouter";

export const ProductsCarousel = () => {
  const carouselRef = useRef(null);

  // 1. ESTADOS PARA LOS DATOS REALES
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. EXTRAEMOS LA LÓGICA DEL CARRITO
  const addToCart = useCartStore((state) => state.addToCart);
  const user = JSON.parse(localStorage.getItem("user"));

  // 3. CARGAMOS LOS PRODUCTOS DESDE TU BACKEND
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/productos/explorar");
        const data = await res.json();

        // Cogemos solo los primeros 8 productos para no saturar el carrusel
        if (Array.isArray(data)) {
          setProducts(data.slice(0, 8));
        }
      } catch (error) {
        console.error("Error cargando productos destacados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Función de scroll del carrusel
  const scroll = (direction) => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.clientWidth / 3;
      const scrollAmount = direction === "left" ? -itemWidth : itemWidth;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Función para añadir al carrito real
  const handleAdd = (producto) => {
    if (!user) {
      alert("Inicia sesión para añadir productos a tu cesta.");
      return;
    }
    const userId = user.id || user.id_usuario;
    const productForCart = {
      id_producto: producto.id_producto || producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      id_comercio: producto.id_comercio,
    };

    addToCart(userId, productForCart);
    window.dispatchEvent(new CustomEvent("openCart"));
  };

  // Si está cargando o no hay productos, no renderizamos la sección para que no quede un hueco feo
  if (isLoading || products.length === 0) return null;

  return (
    <section className="w-full py-24 bg-base-200/30 relative z-10 border-y border-base-200/50">
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* CABECERA Y BOTONES */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-base-content mb-2 tracking-tight">
              Descubre las Novedades
            </h2>
            <p className="text-base-content/60 font-medium">
              Lo más fresco de tus tiendas locales, directo a tu mesa.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="btn btn-circle bg-base-200 hover:bg-jungle_teal hover:text-white transition-colors shadow-sm border-base-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="btn btn-circle bg-base-200 hover:bg-jungle_teal hover:text-white transition-colors shadow-sm border-base-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* CONTENEDOR DEL CARRUSEL */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto py-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div
              key={product.id_producto}
              className="snap-center shrink-0 w-[85%] md:w-[calc(33.333%-1rem)] group"
            >
              <motion.div
                whileHover={{ y: -8 }}
                className="w-full bg-base-200 rounded-4xl shadow-sm hover:shadow-xl border border-base-300 overflow-hidden relative flex flex-col h-full transition-all duration-300"
              >
                {/* 🔗 Enlace a la tienda (envuelve imagen e info) */}
                <Link href={`/tienda/${product.id_comercio}`}>
                  <div className="cursor-pointer">
                    <figure className="h-52 overflow-hidden relative">
                      <img
                        src={product.imagen}
                        alt={product.nombre}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-3 left-3 bg-base-100/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-jungle_teal shadow-sm flex items-center gap-1.5">
                        <Store className="w-3 h-3" />
                        {product.nombre_comercio || "Comercio Local"}
                      </div>
                    </figure>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-base-content mb-1 line-clamp-1 group-hover:text-jungle_teal transition-colors">
                        {product.nombre}
                      </h3>
                      <p className="text-xs text-base-content/50 line-clamp-2">
                        {product.descripcion}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Footer (Precio y Botón) - Fuera del Link para evitar conflictos de clic */}
                <div className="p-5 pt-0 mt-auto">
                  <div className="flex justify-between items-center pt-4 border-t border-base-300/50">
                    <span className="text-2xl font-black text-jungle_teal">
                      {product.precio}€
                    </span>
                    <button
                      onClick={() => handleAdd(product)}
                      className="btn btn-circle bg-base-300 hover:bg-jungle_teal text-base-content hover:text-white border-none transition-all duration-300 shadow-sm hover:scale-110 active:scale-95"
                    >
                      <ShoppingBasket className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
