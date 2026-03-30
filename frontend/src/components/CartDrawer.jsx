import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { useState } from 'react';
import { Link } from 'wouter'; // Lo importamos por si necesitamos mandarlo a iniciar sesión

export const CartDrawer = ({ isOpen, onClose }) => {

  // 1. OBTENEMOS EL USUARIO ACTIVO
  // Nota: Usa user.id o user.id_usuario dependiendo de cómo lo guardaras en tu login
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id || user?.id_usuario;

  // 2. EXTRAEMOS EL ESTADO GLOBAL DE ZUSTAND
  const carts = useCartStore((state) => state.carts);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  // 3. AISLAMOS EL CARRITO ESPECÍFICO DE ESTE USUARIO
  // Si hay usuario, le damos su cajón. Si no, un array vacío.
  const cart = userId ? (carts[userId] || []) : [];

  // 4. CALCULAMOS LOS TOTALES AL VUELO (Mejor práctica de React)
  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const totalAmount = cart.reduce((acc, item) => acc + (item.precio * (item.quantity || 0)), 0);

  // 5. UNA VEZ QUE SEA EXITOSO EL PAGO SE LIMPIA EL CARRITO
  const clearUserCart = useCartStore((state) => state.clearUserCart);

  // 6. ESTADO PARA CHECKOUT 
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!userId || cart.length === 0) return;

    try {
      setIsCheckingOut(true);

      // --- EL ARREGLO DE LÓGICA ---
      // Forzamos que si el primer producto no tiene id_comercio (que es lo que daba el error),
      // use el ID 1 para que la transacción de MySQL no falle.
      const id_comercio_seguro = cart[0].id_comercio || 1;

      const payload = {
        id_usuario: userId,
        id_comercio: id_comercio_seguro, // Usamos el ID seguro
        total: totalAmount,
        productos: cart
      };

      const response = await fetch("http://localhost:3000/api/pedidos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Si el backend responde 201, limpiamos y cerramos
        clearUserCart(userId);
        onClose();
        alert("¡Pedido realizado con éxito! 🚀");
      } else {
        // Si el backend responde error (400, 500...), avisamos
        const errorData = await response.json();
        console.error("Error capturado:", errorData);
        alert("Hubo un problema al procesar tu pedido.");
      }

    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200 cursor-pointer"
          />

          {/* 2. PANEL LATERAL */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-base-100 shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-201 flex flex-col border-l border-base-200"
          >
            {/* Cabecera del Carrito */}
            <div className="p-8 flex justify-between items-center border-b border-base-200">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-base-content">Tu Cesta</h2>
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

            {/* --- LÓGICA DE VISTAS (Sin Login / Vacío / Lleno) --- */}

            {!userId ? (
              // VISTA 1: Usuario no logueado
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-80">
                <span className="text-6xl mb-4">🔐</span>
                <p className="font-bold text-xl mb-2">Inicia sesión para comprar</p>
                <p className="text-sm mb-6 max-w-62.5">Guarda tus productos favoritos y apoya al comercio de tu barrio.</p>
                <Link href="/login">
                  <button onClick={onClose} className="btn bg-jungle_teal text-white rounded-full px-8 border-none hover:bg-sea_green">
                    Ir a Iniciar Sesión
                  </button>
                </Link>
              </div>
            ) : cart.length === 0 ? (
              // VISTA 2: Carrito Vacío
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-50">
                <span className="text-6xl mb-4">🛒</span>
                <p className="font-bold text-lg">Tu cesta está vacía</p>
                <p className="text-sm">¡Añade algo delicioso!</p>
              </div>
            ) : (
              // VISTA 3: Lista de Productos
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.map(item => (
                  <div key={item.id_producto} className="group bg-base-200/50 p-4 rounded-4xl border border-transparent hover:border-jungle_teal/30 transition-all flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md shrink-0">
                      <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base-content leading-tight">{item.nombre}</h4>
                      <p className="text-sm font-black text-jungle_teal mt-1">
                        {(item.precio * item.quantity).toFixed(2)}€
                      </p>

                      <div className="flex items-center gap-3 mt-3 ">
                        {/* 👇 Pasamos el userId al actualizar cantidad 👇 */}
                        <button
                          onClick={() => updateQuantity(userId, item.id_producto, item.quantity - 1)}
                          className="cursor-pointer w-8 h-8 rounded-xl bg-base-300 hover:bg-jungle_teal hover:text-white transition-colors flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(userId, item.id_producto, item.quantity + 1)}
                          className="cursor-pointer w-8 h-8 rounded-xl bg-base-300 hover:bg-jungle_teal hover:text-white transition-colors flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {/* 👇 Pasamos el userId al eliminar 👇 */}
                    <button
                      onClick={() => removeFromCart(userId, item.id_producto)}
                      className="text-base-content/20 hover:text-error transition-colors p-2 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer del Carrito (Resumen y Pago) */}
            <div className="p-8 bg-base-100 border-t border-base-200 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-end mb-6 px-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-1">Subtotal</p>
                  <p className="text-3xl font-black text-base-content">
                    {totalAmount.toFixed(2)}€
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-jungle_teal mb-1">Envío</p>
                  <p className="font-bold text-base-content">¡Gratis!</p>
                </div>
              </div>

              {/* Bloqueamos el botón si no hay carrito o si no hay usuario */}
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
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">Pago 100% Seguro</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};