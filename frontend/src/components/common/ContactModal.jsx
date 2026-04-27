import { motion } from "framer-motion";
import { Phone, Mail, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import useToastStore from "../../store/useToastStore";

export const ContactModal = ({ isOpen, onClose, comercio }) => {
  const toast = useToastStore();
  const [copiado, setCopiado] = useState(null); // "telefono" | "email" | null

  const copiarAlPortapapeles = async (texto, tipo) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(tipo);
      toast.success(`${tipo === "telefono" ? "Teléfono" : "Email"} copiado`);
      setTimeout(() => setCopiado(null), 2000);
    } catch (error) {
      toast.error("No se pudo copiar. Hazlo manualmente.");
    }
  };

  if (!isOpen || !comercio) return null;

  return (
    <div className="fixed inset-0 z-400 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-base-100 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Cabecera */}
        <div className="p-6 border-b border-base-200 bg-base-200/30 flex justify-between items-center">
          <div>
            <h3 className="font-black text-2xl text-base-content">
              Contactar con la tienda
            </h3>
            <p className="font-bold text-sm text-jungle_teal mt-1">
              {comercio.nombre || comercio.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-circle btn-ghost bg-base-200 hover:bg-error/20 hover:text-error"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Teléfono */}
          <div className="bg-base-200/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-jungle_teal/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-jungle_teal" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-base-content/50">
                  Teléfono
                </p>
                <p className="text-lg font-bold text-base-content">
                  {comercio.contacto || "No disponible"}
                </p>
              </div>
            </div>
            {comercio.contacto && (
              <button
                onClick={() =>
                  copiarAlPortapapeles(comercio.contacto, "telefono")
                }
                className="btn btn-sm w-full bg-base-100 hover:bg-jungle_teal hover:text-white transition-colors rounded-xl gap-2"
              >
                {copiado === "telefono" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copiar número
                  </>
                )}
              </button>
            )}
          </div>
          {/* Email (del dueño) */}
          <div className="bg-base-200/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-900 flex items-center justify-center">
                <Mail className="w-5 h-5 text-yellow" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-base-content/50">
                  Email
                </p>
                <p className="text-lg font-bold text-base-content break-all">
                  {comercio.email || comercio.email_contacto || "No disponible"}
                </p>
              </div>
            </div>
            {(comercio.email || comercio.email_contacto) && (
              <button
                onClick={() =>
                  copiarAlPortapapeles(
                    comercio.email || comercio.email_contacto,
                    "email",
                  )
                }
                className="btn btn-sm w-full bg-base-100 hover:bg-yellow hover:text-white transition-colors rounded-xl gap-2"
              >
                {copiado === "email" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copiar email
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-base-200 bg-base-200/30 text-center">
          <p className="text-xs text-base-content/50">
            Contacta con la tienda para cualquier consulta sobre tu
            pedido.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
