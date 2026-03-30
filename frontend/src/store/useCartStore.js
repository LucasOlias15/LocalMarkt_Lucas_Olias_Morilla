import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      // 1. EL MUEBLE PRINCIPAL
      // Aquí se guardarán todos los carritos. 
      // Quedará algo así por detrás: { "id_paco": [{pan}, {agua}], "id_maria": [{carne}] }
      carts: {}, 

      // --- ACCIONES PRINCIPALES ---

      // 1️⃣ AÑADIR AL CARRITO
      addToCart: (userId, product) => {
        // Por seguridad: si entra alguien sin iniciar sesión (sin ID), detenemos la función.
        if (!userId) return; 

        // Paso A: Miramos el mueble entero
        const allCarts = get().carts;
        
        // Paso B: Abrimos solo la taquilla de nuestro usuario. 
        // Si es nuevo y no tiene nada, le asignamos una cesta vacía: []
        const userCart = allCarts[userId] || []; 
        
        // Paso C: Revisamos si el producto que quiere añadir YA ESTÁ en su cesta.
        const existing = userCart.find(item => item.id_producto === product.id_producto);

        if (existing) {
            // Si ya lo tiene, recorremos su cesta uno a uno con .map()
            // Cuando encontremos ese producto, le sumamos +1 a su cantidad.
            const updatedCart = userCart.map(item =>
              item.id_producto === product.id_producto
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
            );
            // Finalmente, guardamos el mueble entero, pero actualizando su taquilla.
            set({ carts: { ...allCarts, [userId]: updatedCart } });
        } else {
            // Si no lo tenía, cogemos todo lo que ya había en su cesta (...userCart)
            // y metemos el producto nuevo al final, indicando que hay 1 unidad.
            const updatedCart = [...userCart, { ...product, quantity: 1 }];
            set({ carts: { ...allCarts, [userId]: updatedCart } });
        }
      },

      // 2️⃣ ELIMINAR DEL CARRITO (Botón de la basura)
      removeFromCart: (userId, productId) => {
        if (!userId) return;
        const allCarts = get().carts;
        const userCart = allCarts[userId] || [];
        
        // El método .filter() se queda con todos los productos MENOS el que le hemos dicho.
        const updatedCart = userCart.filter(item => item.id_producto !== productId);
        
        // Guardamos el resultado en su taquilla.
        set({ carts: { ...allCarts, [userId]: updatedCart } });
      },

      // 3️⃣ ACTUALIZAR CANTIDAD (Botones de + y - dentro del carrito)
      updateQuantity: (userId, productId, newQuantity) => {
        // Evitamos que pongan "0" o números negativos. Para borrar, ya está removeFromCart.
        if (!userId || newQuantity < 1) return;
        const allCarts = get().carts;
        const userCart = allCarts[userId] || [];

        // Cambiamos el número de cantidad por el que nos haya pasado el usuario.
        const updatedCart = userCart.map(item =>
            item.id_producto === productId ? { ...item, quantity: newQuantity } : item
        );
        set({ carts: { ...allCarts, [userId]: updatedCart } });
      },

      // --- FUNCIONES DE CÁLCULO (Para mostrar arriba en el Header) ---

      // Cuántos artículos hay en total (Ej: 3 panes + 2 aguas = 5)
      getTotalItems: (userId) => {
        if (!userId) return 0;
        const userCart = get().carts[userId] || [];
        // Reduce va sumando las cantidades de cada producto
        return userCart.reduce((acumulador, item) => acumulador + (item.quantity || 0), 0);
      },
      
      // Cuánto dinero cuesta todo
      getTotalAmount: (userId) => {
        if (!userId) return 0;
        const userCart = get().carts[userId] || [];
        // Reduce multiplica el precio x cantidad de cada producto y lo suma todo
        return userCart.reduce((acumulador, item) => acumulador + (item.precio * (item.quantity || 0)), 0);
      },

      // 4️⃣ VACIAR EL CARRITO (La usaremos cuando simulemos el pago con éxito)
      clearUserCart: (userId) => {
        if (!userId) return;
        const allCarts = get().carts;
        // Simplemente sobrescribimos su taquilla con un array vacío.
        set({ carts: { ...allCarts, [userId]: [] } });
      }
    }),
    
    // El nombre que tendrá nuestro mueble en las tripas del navegador (DevTools > Local Storage)
    { name: 'localmarkt-cart' } 
  )
);