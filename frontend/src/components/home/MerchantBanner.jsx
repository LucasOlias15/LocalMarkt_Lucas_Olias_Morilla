import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  BookOpenText,
  ChartColumnIncreasing,
  LucideHandshake,
  Package,
  Rocket,
  ChevronDown,
} from "lucide-react";
import { useState,useEffect } from "react";
import { ShopPromotionModal } from "../shop/ShopPromotionModal";

export const MerchantBanner = () => {
  
const [user, setUser] = useState(null);
useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) setUser(JSON.parse(storedUser));
}, []);

  const [infoAbierta, setInfoAbierta] = useState(false);

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-20">
      <div className="banner-container relative overflow-hidden rounded-[3rem] shadow-2xl transition-colors duration-700">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 skew-x-12 translate-x-20 pointer-events-none" />

        <div className="relative z-10 p-10 md:p-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* LADO IZQUIERDO: TEXTO */}
            <div className="flex-1 text-center md:text-left w-full">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest mb-6 bg-black/10"
              >
                Para comercios locales
              </motion.span>

              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Lleva tu negocio <br /> al siguiente nivel.
              </h2>

              <p className="text-lg md:text-xl mb-10 max-w-lg opacity-90 font-medium">
                Únete a la red de comercios de LocalMarkt y empieza a vender tus
                productos online sin complicaciones.
              </p>

              {/* ===== COLLAPSE + BOTÓN EN LÍNEA ===== */}
              <div className="max-w-2xl mx-auto md:mx-0">
                {/* Fila: Título del collapse + Botón */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Título clickeable */}
                  <button
                    onClick={() => setInfoAbierta(!infoAbierta)}
                    className="flex-1 flex items-center justify-between bg-black/5 border border-current border-opacity-20 rounded-2xl px-6 py-4 text-lg font-bold hover:bg-black/10 transition-colors w-full"
                  >
                    <span>¿Qué incluye ser vendedor?</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        infoAbierta ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Botón de acción (derecha, siempre visible) */}
                  <div className="sm:w-auto w-full shrink-0">
                    {user && user.rol === "dueño" ? (
                      <button
                        onClick={() =>
                          document.getElementById("shop_promotion_modal").showModal()
                        }
                        className="banner-btn-main btn border-none rounded-2xl px-8 h-16 text-lg font-bold shadow-lg transition-transform hover:scale-105 w-full sm:w-auto whitespace-nowrap"
                      >
                        <Rocket className="inline mr-2" size={18} />
                        Impulsar mi tienda
                      </button>
                    ) : (
                      <Link href="/registro">
                        <button className="banner-btn-main btn border-none rounded-2xl px-8 h-16 text-lg font-bold shadow-lg transition-transform hover:scale-105 w-full sm:w-auto whitespace-nowrap">
                          Registrar mi tienda
                        </button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Contenido desplegable (ancho completo, debajo de todo) */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: infoAbierta ? "auto" : 0,
                    opacity: infoAbierta ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-4 pb-6 border border-current border-opacity-20 rounded-lg">
                    <div className="ml-4">
                      <h4 className="font-bold mb-1 opacity-100 flex items-center gap-1">
                        <BookOpenText size={16} /> Alcance Total
                      </h4>
                      <p className="text-sm">
                        Tu tienda visible para miles de vecinos en un radio de 20km.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1 opacity-100 flex items-center gap-1">
                        <Package size={16} /> Gestión Fácil
                      </h4>
                      <p className="text-sm">
                        Panel de control intuitivo para subir stock y gestionar pedidos.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1 opacity-100 flex items-center gap-1">
                        <LucideHandshake size={16} /> Comunidad
                      </h4>
                      <p className="text-sm">
                        Apoyo mutuo entre comerciantes y logística compartida.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* LADO DERECHO: ELEMENTO VISUAL */}
            <div className="flex-1 relative w-full max-w-md hidden md:block ">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="aspect-square backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center p-8 relative bg-black/5 border border-current border-opacity-20 shadow-xl"
              >
                <div className="w-full h-full rounded-2xl shadow-2xl p-6 overflow-hidden bg-base-100 text-base-content">
                  <div className="h-4 w-32 rounded-full mb-6 bg-base-300"></div>
                  <div className="space-y-4">
                    <div className="h-32 w-full rounded-xl flex items-center justify-center text-4xl bg-base-200">
                      <ChartColumnIncreasing className="h-10 w-10" />
                    </div>
                    <div className="h-4 w-full rounded-full bg-base-200"></div>
                    <div className="h-4 w-2/3 rounded-full bg-base-200"></div>
                  </div>
                </div>
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute -top-2 -right-4 text-6xl drop-shadow-2xl"
                >
                  <Rocket className="h-10 w-10" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <ShopPromotionModal />
    </section>
  );
};