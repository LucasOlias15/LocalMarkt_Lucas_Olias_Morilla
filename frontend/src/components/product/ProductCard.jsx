import { motion } from "framer-motion";
import { useCartStore } from "../../store/useCartStore";
import { Heart } from "lucide-react";
import { useState } from "react";
import useToastStore from "../../store/useToastStore";

export const ProductCard = ({ product, isFavorito }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  
  const addToCart = useCartStore((state) => state.addToCart);
  const toast = useToastStore();
  const [prodFavorito, setProdFavorito] = useState(isFavorito);

  const handleAdd = () => {
    const userString = localStorage.getItem("user");
    const usuario = userString ? JSON.parse(userString) : null;
    
    if (!usuario) {
      toast.warning("Inicia sesión para añadir productos.");
      return;
    }
    
    const userId = usuario.id || usuario.id_usuario;

    const productForCart = {
      id_producto: product.id || product.id_producto,
      nombre: product.name || product.nombre,
      precio: product.price || product.precio,
      imagen: product.img || product.imagen,
      id_comercio: product.id_comercio,
    };

    addToCart(userId, productForCart);
    window.dispatchEvent(new CustomEvent("openCart"));
    toast.success(`¡${productForCart.nombre} añadido al carrito!`);
  };

  const handleFavorito = async (e) => {
    e.preventDefault();
    const userString = localStorage.getItem("user");
    const usuario = userString ? JSON.parse(userString) : null;

    if (!usuario) {
      toast.warning("Inicia sesión para guardar favoritos.");
      return;
    }

    const nuevoEstado = !prodFavorito;
    setProdFavorito(nuevoEstado);

    try {
      const res = await fetch(`${API_URL}/favoritos/toggleFavs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id || usuario.id_usuario,
          id_producto: product.id || product.id_producto,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || (nuevoEstado ? "Añadido a favoritos" : "Eliminado de favoritos"));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error al guardar favorito", error);
      toast.error("Error al guardar favorito");
      setProdFavorito(!nuevoEstado); // Revertir de true a false y viceversa
    }
  };

  return (
    <div className="group bg-white dark:bg-base-200 rounded-[2.5rem] p-5 border-2 border-base-200 dark:border-white/10 shadow-md hover:shadow-2xl transition-all duration-500">
      <div className="relative h-60 w-full rounded-4xl overflow-hidden bg-base-100 dark:bg-base-300">
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute top-4 right-4 bg-yellow-400 text-jungle_teal-100 px-5 py-2 rounded-2xl font-black shadow-xl border border-white/20">
          {product.price}€
          <span className="text-[10px] opacity-70 ml-1">
            /{product.unit || "ud"}
          </span>
        </div>
      </div>

      <div className="mt-8 px-2 pb-2">
        <h3 className="text-2xl font-black text-base-content leading-tight mb-3 tracking-tighter">
          {product.name}
        </h3>

        <p className="text-sm text-base-content/60 line-clamp-2 mb-8 font-medium">
          {product.description}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            className="cursor-pointer flex-3 bg-jungle_teal hover:bg-sea_green text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-jungle_teal/20 active:scale-95"
          >
            Añadir al carrito
          </button>

          <button
            onClick={handleFavorito}
            className={`flex-1 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer ${
              prodFavorito
                ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                : "bg-base-200 dark:bg-base-300 text-base-content/40 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            }`}
          >
            <Heart
              size={24}
              fill={prodFavorito ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </div>
  );
};