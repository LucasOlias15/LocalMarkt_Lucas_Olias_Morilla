import { motion } from "framer-motion";
import { NotebookPen } from "lucide-react";

export const RatingsDropdown = ({ 
  loadingValoraciones, 
  valoraciones, 
  promedioValoraciones, 
  userRol 
}) => {
  const isOwner = userRol === "dueño";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: "auto", scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
      className="md:col-span-3 overflow-hidden origin-top relative z-30"
    >
      <div className="bg-base-200 rounded-[2.5rem] p-8 border border-base-300 shadow-inner">
        {loadingValoraciones ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-amber-500"></span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl"><NotebookPen/></span>
              <h3 className="font-black text-2xl text-base-content">
                {isOwner ? "Valoraciones recibidas" : "Mis valoraciones"}
              </h3>
              {isOwner && promedioValoraciones?.total >= 5 && (
                <span className="badge badge-lg bg-amber-500 text-white font-black ml-auto">
                  {promedioValoraciones.promedio} ★ ({promedioValoraciones.total})
                </span>
              )}
            </div>

            {valoraciones.length === 0 ? (
              <p className="text-sm text-base-content/40 italic bg-base-100 p-6 rounded-3xl border border-base-200 text-center">
                {isOwner
                  ? "Aún no has recibido ninguna valoración."
                  : "Aún no has hecho ninguna valoración."}
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {valoraciones.map((val) => (
                  <div
                    key={val.id_valoracion}
                    className="bg-base-100 p-4 rounded-2xl border border-base-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base-content">
                          {isOwner ? val.nombre_usuario : val.nombre_comercio || "Tienda"}
                        </span>
                        <span className="text-amber-500 font-black">
                          {"★".repeat(val.puntuacion)}{"☆".repeat(5 - val.puntuacion)}
                        </span>
                      </div>
                      <span className="text-xs text-base-content/40">
                        {val.fecha ? new Date(val.fecha).toLocaleDateString("es-ES") : ""}
                      </span>
                    </div>
                    {val.comentario && (
                      <p className="text-sm text-base-content/70 italic">
                        "{val.comentario}"
                      </p>
                    )}
                    {val.nombre_producto && (
                      <p className="text-xs text-base-content/50 mt-1">
                        Producto: {val.nombre_producto}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};