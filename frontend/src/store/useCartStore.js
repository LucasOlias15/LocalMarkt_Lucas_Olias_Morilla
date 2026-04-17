import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      // EL ALMACEN PRINCIPAL
      // Aquí se guardarán todos los carritos.
      // Quedará algo así por detrás: { "id_paco": [{pan}, {agua}], "id_maria": [{carne}] }
      carts: {},

      // 1 AÑADIR AL CARRITO
      addToCart: (userId, product) => {
        if (!userId) return;

        // Salvaguarda: Si por algún motivo nos llega un producto sin stock, cortamos de raíz.
        if (product.stock_maximo <= 0) return;

        const allCarts = get().carts;
        const userCart = allCarts[userId] || [];
        const existing = userCart.find(
          (item) => item.id_producto === product.id_producto,
        );

        if (existing) {
          // Comprobamos si hemos llegado al límite
          if (existing.quantity >= product.stock_maximo) {
            console.warn("Límite de stock alcanzado para este producto");
            return; // Detenemos la ejecución, no sumamos nada
          }

          // Si no ha llegado al límite, sumamos 1 con normalidad
          const updatedCart = userCart.map((item) =>
            item.id_producto === product.id_producto
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item,
          );
          set({ carts: { ...allCarts, [userId]: updatedCart } });
        } else {
          // Si no lo tiene, lo añadimos con cantidad 1
          const updatedCart = [...userCart, { ...product, quantity: 1 }];
          set({ carts: { ...allCarts, [userId]: updatedCart } });
        }
      },

      // 2 ELIMINAR DEL CARRITO
      removeFromCart: (userId, productId) => {
        if (!userId) return;
        const allCarts = get().carts;
        const userCart = allCarts[userId] || [];

        // El método .filter() se queda con todos los productos MENOS el que le hemos dicho.
        const updatedCart = userCart.filter(
          (item) => item.id_producto !== productId,
        );

        // Guardamos el resultado en su taquilla.
        set({ carts: { ...allCarts, [userId]: updatedCart } });
      },

      // 3 ACTUALIZAR CANTIDAD
      updateQuantity: (userId, productId, newQuantity) => {
        if (!userId || newQuantity < 1) return;
        const allCarts = get().carts;
        const userCart = allCarts[userId] || [];

        // Cambiamos el número de cantidad por el que nos haya pasado el usuario.
        const updatedCart = userCart.map((item) =>
          item.id_producto === productId
            ? { ...item, quantity: newQuantity }
            : item,
        );
        set({ carts: { ...allCarts, [userId]: updatedCart } });
      },

      // FUNCIONES DE CÁLCULO (Para mostrar arriba en el Header)

      // Cuántos artículos hay en total (Ej: 3 panes + 2 aguas = 5)
      getTotalItems: (userId) => {
        if (!userId) return 0;
        const userCart = get().carts[userId] || [];
        // Reduce recorre cada producto del carrito, coge su cantidad (o 0 si no tiene) y lo suma todo.
        return userCart.reduce(
          (acumulador, item) => acumulador + (item.quantity || 0),
          0,
        );
      },

      // Cuánto dinero cuesta todo
      getTotalAmount: (userId) => {
        if (!userId) return 0;
        const userCart = get().carts[userId] || [];
        // Reduce multiplica el precio x cantidad de cada producto y lo suma todo
        return userCart.reduce(
          (acumulador, item) => acumulador + item.precio * (item.quantity || 0),
          0,
        );
      },

      // 4 VACIAR EL CARRITO
      clearUserCart: (userId) => {
        if (!userId) return;
        const allCarts = get().carts;
        // Simplemente sobrescribimos su taquilla con un array vacío.
        set({ carts: { ...allCarts, [userId]: [] } });
      },
    }),

    // El nombre que tendrá el carrito en el navegador (DevTools > Local Storage)
    { name: "localmarkt-cart" },
  ),
);
