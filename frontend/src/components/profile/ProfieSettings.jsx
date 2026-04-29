import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Lock } from "lucide-react";
import useToastStore from "../../store/useToastStore";

export const ProfileSettings = ({
  user,
  setUser,
  showSettings,
  setShowSettings,
}) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const toast = useToastStore();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    claveActual: "",
    nuevaClave: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        claveActual: "",
        nuevaClave: "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ===== ELIMINAR CUENTA (fuera de handleSave) =====
  const handleDeleteAccount = async (clave) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/cuenta`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clave }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Cuenta eliminada. Hasta pronto 👋");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.getElementById("modal_eliminar_cuenta").close();
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        toast.error(data.error || "Error al eliminar la cuenta");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.claveActual) {
      toast.warning("Debes introducir tu contraseña actual para guardar los cambios.");
      return;
    }

    const updatedData = {
      nombre: formData.nombre,
      email: formData.email,
      clave: formData.claveActual,
      ...(formData.nuevaClave && { nuevaClave: formData.nuevaClave }),
    };

    try {
      const response = await fetch(`${API_URL}/users/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("¡Perfil actualizado con éxito!");
        setFormData((prev) => ({ ...prev, claveActual: "", nuevaClave: "" }));
        setShowSettings(false);
      } else {
        toast.error(data.error || "No se pudo actualizar el perfil");
      }
    } catch (error) {
      console.error("Error de red:", error);
      toast.error("No se pudo conectar con el servidor");
    }
  };

  return (
    <div className="bg-base-200 rounded-[2.5rem] p-8 shadow-sm border border-base-300 transition-all duration-300 relative overflow-hidden mt-6">
      <div
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
              showSettings
                ? "bg-yellow-500 text-white"
                : "bg-base-200 text-base-content group-hover:bg-yellow-100 group-hover:text-yellow-600"
            }`}
          >
            <Settings
              className={`w-7 h-7 transition-transform duration-500 ${
                showSettings ? "rotate-90" : ""
              }`}
            />
          </div>
          <div>
            <h2 className="text-2xl font-black text-base-content">Ajustes de la cuenta</h2>
            <p className="text-base-content/60 text-sm mt-1">Modifica tus datos, contraseña y privacidad.</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSave} className="mt-8 pt-8 border-t border-base-200">
              <div className="mb-6 p-5 bg-yellow-700 border border-yellow-500 rounded-2xl flex gap-3 items-start">
                <Lock className="text-yellow-300" />
                <p className="text-sm font-medium text-yellow-300">
                  Por tu seguridad, necesitas introducir tu contraseña actual para guardar cualquier cambio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">Nombre completo</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange}
                    className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium" placeholder="Tu nombre" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2">Correo electrónico</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                    className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium" placeholder="tu@email.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2 flex items-center gap-1">Contraseña Actual <span className="text-error">*</span></label>
                  <input type="password" name="claveActual" value={formData.claveActual} onChange={handleInputChange} required
                    className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-error focus:ring-4 focus:ring-error/10 transition-all font-medium" placeholder="Obligatoria para guardar" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-base-content/70 ml-2 flex items-center justify-between"><span>Nueva Contraseña</span><span className="text-[10px] font-normal lowercase opacity-70">(opcional)</span></label>
                  <input type="password" name="nuevaClave" value={formData.nuevaClave} onChange={handleInputChange}
                    className="w-full p-4 rounded-2xl bg-base-300 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium" placeholder="Dejar en blanco si no cambia" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowSettings(false)}
                  className="btn btn-ghost text-base-content/60 hover:bg-error/10 hover:text-error rounded-xl transition-colors font-bold">Cancelar</button>
                <button type="submit"
                  className="btn bg-sea_green hover:bg-jungle_teal text-white font-bold rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-none px-8">Guardar Cambios</button>
              </div>
            </form>

            {/* Eliminar cuenta */}
            <div className="mt-8 pt-8 border-t border-error/20">
              <h3 className="text-lg font-black text-error mb-2">Eliminar Cuenta Permanentemente</h3>
              <p className="text-sm text-base-content/60 mb-4">
                Eliminar tu cuenta es una acción permanente. Se borrarán todos tus datos, pedidos y valoraciones.
              </p>
              <button type="button"
                onClick={() => document.getElementById("modal_eliminar_cuenta").showModal()}
                className="btn bg-error/10 hover:bg-error text-error hover:text-white border-none rounded-xl transition-colors font-bold">
                Eliminar mi cuenta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de eliminación */}
      <dialog id="modal_eliminar_cuenta" className="modal">
        <div className="modal-box rounded-2xl">
          <h3 className="font-black text-2xl text-error mb-4">¿Estás completamente seguro?</h3>
          <p className="text-base-content/70 mb-6">Esta acción <strong>no se puede deshacer</strong>. Se eliminarán permanentemente:</p>
          <ul className="list-disc ml-6 mb-6 text-sm text-base-content/60 space-y-1">
            <li>Tu cuenta de usuario</li>
            <li>Tu comercio y todos sus productos (si eres dueño)</li>
            <li>Tus pedidos y valoraciones</li>
            <li>Tus favoritos</li>
          </ul>

          <div className="flex flex-col gap-3">
            <input type="password" placeholder="Introduce tu contraseña para confirmar"
              className="input input-bordered w-full bg-base-200" id="clave_eliminar" />
            <div className="flex gap-3">
              <button type="button" onClick={() => document.getElementById("modal_eliminar_cuenta").close()}
                className="btn btn-ghost flex-1 rounded-xl">Cancelar</button>
              <button type="button" onClick={() => {
                  const clave = document.getElementById("clave_eliminar").value;
                  if (!clave) {
                    toast.warning("Debes introducir tu contraseña");
                    return;
                  }
                  handleDeleteAccount(clave);
                }}
                className="btn bg-error text-white border-none flex-1 rounded-xl">Sí, eliminar mi cuenta</button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};