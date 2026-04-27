import { motion } from "framer-motion";
import { Link } from "wouter";
import { Store, ShoppingBasket, ExternalLink } from "lucide-react";

export const FavoritesDropdown = ({ loadingFavs, favShops, favProducts }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: "auto", scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
      className="md:col-span-3 overflow-hidden origin-top relative z-20"
    >
      <div className="bg-base-200 rounded-[2.5rem] p-8 border border-base-300 shadow-inner">
        {loadingFavs ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-red-500"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tiendas favoritas */}
            <div>
              <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-base-content">
                <Store className="w-6 h-6 text-red-500" /> Tiendas Favoritas
                <span className="badge badge-sm bg-red-100 text-red-600 border-none font-bold">
                  {favShops.length}
                </span>
              </h3>
              {favShops.length === 0 ? (
                <p className="text-sm text-base-content/40 italic bg-base-100 p-6 rounded-3xl border border-base-200 text-center">
                  No has guardado ninguna tienda aún.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {favShops.map((shop) => (
                    <Link
                      key={shop.id_comercio}
                      href={`/tienda/${shop.id_comercio}`}
                    >
                      <div className="flex items-center gap-4 bg-base-100 p-3 rounded-2xl border border-base-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                          <img
                            src={shop.imagen}
                            alt={shop.nombre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-base-content">
                            {shop.nombre}
                          </h4>
                          <p className="text-xs text-base-content/50">
                            {shop.categoria}
                          </p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-base-content/20 group-hover:text-red-500 transition-colors mr-3" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Productos favoritos */}
            <div>
              <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-base-content">
                <ShoppingBasket className="w-6 h-6 text-red-500" /> Productos
                Favoritos
                <span className="badge badge-sm bg-red-100 text-red-600 border-none font-bold">
                  {favProducts.length}
                </span>
              </h3>
              {favProducts.length === 0 ? (
                <p className="text-sm text-base-content/40 italic bg-base-100 p-6 rounded-3xl border border-base-200 text-center">
                  No has guardado ningún producto aún.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {favProducts.map((prod) => (
                    <div
                      key={prod.id_producto}
                      className="flex items-center gap-4 bg-base-100 p-3 rounded-2xl border border-base-200 hover:border-red-300 hover:shadow-md transition-all group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={prod.imagen}
                          alt={prod.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base-content leading-tight mb-1">
                          {prod.nombre}
                        </h4>
                        <p className="text-sm font-black text-jungle_teal">
                          {prod.precio}€
                        </p>
                      </div>
                      <Link href={`/tienda/${prod.id_comercio}`}>
                        <button className="btn btn-sm btn-circle btn-ghost text-base-content/40 hover:text-red-500 hover:bg-red-50 transition-colors mr-1">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
