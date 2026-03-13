import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRoute } from 'wouter';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ProductCard } from '../components/ProductCard';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export const ShopDetail = () => {
  const [, params] = useRoute("/tienda/:id");
  
  // 1. ESTADOS
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopInfo, setShopInfo] = useState(null); // Aquí guardaremos la tienda real

  const gallery = [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200",
    "https://images.unsplash.com/photo-1601599561213-832382fd07ba?q=80&w=1200",
    "https://images.unsplash.com/photo-1574944985070-8f3ebf6b79d2?q=80&w=1200"
  ];

  // 2. LÓGICA (PETICIÓN AL BACKEND)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [resProductos, resComercio] = await Promise.all([
          fetch(`http://localhost:3000/api/productos/comercio/${params.id}`),
          fetch(`http://localhost:3000/api/comercios/${params.id}`)
        ]);

        if (!resComercio.ok) throw new Error("Error al obtener comercio");

        const dataProductos = await resProductos.json();
        const dataComercio = await resComercio.json();

        // LÓGICA: Guardamos los datos de la tienda en el estado
        setShopInfo({
          name: dataComercio.nombre,
          description: dataComercio.descripcion || "Productos de máxima calidad directos para ti.",
          address: dataComercio.direccion || "Dirección no disponible",
          rating: 4.8,
          categories: dataComercio.categoria ? [dataComercio.categoria] : ["General"]
        });

        // LÓGICA: Guardamos los productos en el estado
        const productosFormateados = dataProductos.map(p => ({
          id: p.id_producto,
          name: p.nombre,
          price: p.precio,
          description: p.descripcion,
          img: p.imagen || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400"
        }));

        setProducts(productosFormateados);
      } catch (error) {
        console.error("Fallo al conectar con el backend:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) fetchData();
  }, [params?.id]);

  // 3. PINTAR EL HTML (RENDER)
  return (
    <div className="w-full min-h-screen bg-base-100 pb-20">
      
      {/* 1. CAROUSEL SUPERIOR */}
      <section className="h-[70vh] w-full relative group overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect={'fade'}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="h-full w-full"
        >
          {gallery.map((img, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <img src={img} className="w-full h-full object-cover" alt="Imagen tienda" />
                <div className="absolute inset-0 bg-linear-to-t from-base-100 via-transparent to-black/20" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 2. CABECERA DE INFO (Pintamos los datos solo si shopInfo ya cargó) */}
      <section className="max-w-7xl mx-auto px-6 mt-12 mb-16">
        {loading ? (
           <div className="animate-pulse flex space-x-4">
             <div className="flex-1 space-y-6 py-1">
               <div className="h-12 bg-base-300 rounded w-1/2"></div>
               <div className="h-4 bg-base-300 rounded w-3/4"></div>
             </div>
           </div>
        ) : shopInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start">
            
            {/* INFORMACIÓN PRINCIPAL (80%) */}
            <div className="lg:col-span-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                {/* Aquí inyectamos el nombre real */}
                <h1 className="text-5xl md:text-7xl font-black text-base-content mb-6 tracking-tighter">
                  {shopInfo.name} 
                </h1>
                
                <div className="flex flex-wrap gap-3 mb-8">
                  <span className="badge badge-lg bg-jungle_teal dark:bg-jungle_teal-400 text-white border-none py-4 px-6 font-bold shadow-lg shadow-jungle_teal/20">
                    📍 {shopInfo.address}
                  </span>
                  <span className="badge badge-lg bg-yellow-400 text-jungle_teal-200 border-none py-4 px-6 font-bold">
                    ⭐ {shopInfo.rating} Calificación
                  </span>
                </div>

                <p className="text-xl md:text-2xl text-base-content/70 leading-relaxed mb-8 italic max-w-4xl">
                  "{shopInfo.description}"
                </p>

                <div className="flex flex-wrap gap-2">
                  {shopInfo.categories.map(cat => (
                    <span key={cat} className="px-5 py-2 bg-base-200 dark:bg-base-300 rounded-xl text-xs font-black uppercase tracking-widest text-base-content/50 border border-base-300">
                      {cat}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* HORARIO (20%) */}
            <aside className="lg:col-span-2">
              <div className="bg-base-200/50 dark:bg-base-200/20 backdrop-blur-md p-6 rounded-[2.5rem] border border-base-300 shadow-xl">
                <h3 className="font-black text-lg mb-4 text-jungle_teal dark:text-jungle_teal-600 uppercase tracking-tighter">Horarios</h3>
                <ul className="space-y-3 text-xs font-bold">
                  <li className="flex justify-between border-b border-base-300 pb-1">
                    <span className="opacity-40">L-V</span>
                    <span>09:00 - 20:30</span>
                  </li>
                  <li className="flex justify-between border-b border-base-300 pb-1">
                    <span className="opacity-40">Sáb</span>
                    <span>10:00 - 14:30</span>
                  </li>
                  <li className="flex justify-between text-error italic">
                    <span>Dom</span>
                    <span>Cerrado</span>
                  </li>
                </ul>
                <button className="w-full mt-6 py-3 bg-jungle_teal text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sea_green transition-colors">
                  Contactar
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* 3. SECCIÓN DE PRODUCTOS */}
      <section className="max-w-7xl mx-auto px-6 pt-12 border-t border-base-200">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-black text-base-content tracking-tighter">
            Catálogo de <span className="text-jungle_teal">productos</span>
          </h2>
          <div className="text-sm font-bold opacity-40 uppercase tracking-widest">
            {products.length} artículos
          </div>
        </div>

        {loading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-jungle_teal">
             <span className="loading loading-spinner loading-lg mb-4"></span>
             <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Cargando huerto...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="w-full py-20 text-center opacity-50 font-bold text-xl">
            Este comercio aún no ha subido productos 😔
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};  