import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../store/useCartStore";
import { useState } from "react";
import { Link } from "wouter";
import { AlertCircle, CheckCircle2, ShoppingCart } from "lucide-react"; // 👈 Importamos iconos para las alertas

export const CartDrawer = ({ isOpen, onClose }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?.id_usuario;

  const carts = useCartStore((state) => state.carts);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearUserCart = useCartStore((state) => state.clearUserCart);

  const cart = userId ? carts[userId] || [] : [];

  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const totalAmount = cart.reduce(
    (acc, item) => acc + item.precio * (item.quantity || 0),
    0,
  );

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // 👇 1. ESTADO PARA NUESTRO SISTEMA DE NOTIFICACIONES (TOAST) 👇
  const [toast, setToast] = useState(null);

  // Función para mostrar la alerta durante 3.5 segundos
  const mostrarNotificacion = (mensaje, tipo = "error") => {
    setToast({ mensaje, tipo });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const productoValido = cart.find((item) => item.id_comercio != null);

      if (!productoValido) {
        // Sustituimos el alert por nuestra notificación
        mostrarNotificacion(
          "Carrito desactualizado. Por favor, vacíalo y vuelve a añadir los productos.",
          "error",
        );
        setIsCheckingOut(false);
        return;
      }

      const id_comercio_real = productoValido.id_comercio;

      const payload = {
        id_usuario: userId,
        id_comercio: id_comercio_real,
        total: totalAmount,
        productos: cart,
      };

      const token = localStorage.getItem("token");
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";

      const response = await fetch(`${API_URL}/pedidos/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (response.ok) {
        cart.forEach((item) =>
          removeFromCart(userId, item.id_producto || item.id),
        );
        // Notificación de éxito
        mostrarNotificacion(
          "¡Pedido realizado con éxito! Preparando tu compra...",
          "success",
        );

        // Retrasamos el cierre del cajón un segundito para que el usuario vea el mensaje de éxito
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        try {
          const errorData = JSON.parse(responseText);
          mostrarNotificacion(
            "Error del servidor: " +
              (errorData.error || errorData.message || "Desconocido"),
            "error",
          );
        } catch (parseError) {
          console.error(
            "🔥 EL SERVIDOR DEVOLVIÓ ESTO (No es JSON):",
            responseText,
          );
          mostrarNotificacion(
            `Error crítico en el servidor (Código ${response.status}).`,
            "error",
          );
        }
      }
    } catch (error) {
      console.error("🚨 Error de Red o de Código en el checkout:", error);
      mostrarNotificacion(
        "Error de conexión. Revisa tu internet o el estado del servidor.",
        "error",
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              // Cambiamos z-199 por z-[999]
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-999 cursor-pointer"
            />

            {/* PANEL LATERAL */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              // Cambiamos z-999 por z-[1000]
              className="fixed right-0 top-0 h-full w-full max-w-md bg-base-100 shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-1000 flex flex-col border-l border-base-200"
            >
              {/* Cabecera del Carrito */}
              <div className="p-8 flex justify-between items-center border-b border-base-200">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-base-content">
                    Tu Cesta
                  </h2>
                  <p className="text-xs font-bold text-jungle_teal uppercase tracking-widest mt-1">
                    {totalItems} Productos
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="btn btn-circle btn-ghost text-base-content hover:bg-error/10 hover:text-error transition-all"
                >
                  ✕
                </button>
              </div>

              {/* --- LÓGICA DE VISTAS --- */}
              {!userId ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-80">
                  <span className="text-6xl mb-4">🔐</span>
                  <p className="font-bold text-xl mb-2">
                    Inicia sesión para comprar
                  </p>
                  <p className="text-sm mb-6 max-w-62.5">
                    Guarda tus productos favoritos y apoya al comercio de tu
                    barrio.
                  </p>
                  <Link href="/login">
                    <button
                      onClick={onClose}
                      className="btn bg-jungle_teal text-white rounded-full px-8 border-none hover:bg-sea_green"
                    >
                      Ir a Iniciar Sesión
                    </button>
                  </Link>
                </div>
              ) : cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-50">
                    <ShoppingCart className="w-18 h-18 mb-2" />
                  <p className="font-bold text-lg">Tu cesta está vacía</p>
                  <p className="text-sm">¡Añade algo delicioso!</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id_producto}
                      className="group bg-base-200/50 p-4 rounded-4xl border border-transparent hover:border-jungle_teal/30 transition-all flex gap-4 items-center"
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md shrink-0">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base-content leading-tight">
                          {item.nombre}
                        </h4>
                        <p className="text-sm font-black text-jungle_teal mt-1">
                          {(item.precio * item.quantity).toFixed(2)}€
                        </p>

                        <div className="flex items-center gap-3 mt-3 ">
                          <button
                            onClick={() =>
                              updateQuantity(
                                userId,
                                item.id_producto,
                                item.quantity - 1,
                              )
                            }
                            className="cursor-pointer w-8 h-8 rounded-xl bg-base-300 hover:bg-jungle_teal hover:text-white transition-colors flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-sm w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                userId,
                                item.id_producto,
                                item.quantity + 1,
                              )
                            }
                            className="cursor-pointer w-8 h-8 rounded-xl bg-base-300 hover:bg-jungle_teal hover:text-white transition-colors flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(userId, item.id_producto)}
                        className="text-base-content/20 hover:text-error transition-colors p-2 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-trash2-icon lucide-trash-2"
                        >
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer del Carrito */}
              <div className="p-8 bg-base-100 border-t border-base-200 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-end mb-6 px-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-1">
                      Subtotal
                    </p>
                    <p className="text-3xl font-black text-base-content">
                      {totalAmount.toFixed(2)}€
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-jungle_teal mb-1">
                      Envío
                    </p>
                    <p className="font-bold text-base-content">¡Gratis!</p>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || !userId || isCheckingOut}
                  className="cursor-pointer w-full bg-jungle_teal hover:bg-sea_green disabled:bg-base-300 disabled:text-base-content/30 text-white font-black py-5 rounded-4xl text-lg shadow-xl shadow-jungle_teal/20 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {isCheckingOut ? (
                    <span className="loading loading-spinner loading-md"></span>
                  ) : (
                    <>
                      Finalizar pedido
                      <span className="text-xl">➔</span>
                    </>
                  )}
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 opacity-40">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Pago 100% Seguro
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 👇 2. EL TOAST ANIMADO (Se renderiza por encima de todo) 👇 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="toast toast-top toast-center z-1000 mt-4"
          >
            <div
              className={`alert shadow-2xl text-white font-bold border-none rounded-2xl flex items-center gap-3 pr-6
                  ${toast.tipo === "error" ? "bg-error" : "bg-green-900"}`}
            >
              {toast.tipo === "error" ? (
                <AlertCircle size={22} />
              ) : (
                <CheckCircle2 size={22} />
              )}
              <span>{toast.mensaje}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
